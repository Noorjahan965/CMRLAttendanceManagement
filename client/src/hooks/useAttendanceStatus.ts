import { useCallback, useEffect, useState } from "react";
import { Alert, PermissionsAndroid, Platform } from "react-native";
import Geolocation from "react-native-geolocation-service"; 
import { getUser } from "../utils/storage";
import { validateAttendance, getAttendanceStatus } from "@/services/attendanceService";

export type AttendanceStatus = {
    hasSignedIn: boolean;
    hasSignedOut: boolean;
    canSignIn: boolean;
    canSignOut: boolean;
    signOutWindowStart: string;
    message: string;
};

const EMPTY_STATUS: AttendanceStatus = {
    hasSignedIn: false,
    hasSignedOut: false,
    canSignIn: false,
    canSignOut: false,
    signOutWindowStart: "",
    message: "",
};

// CHANGED: expo-location's requestForegroundPermissionsAsync() doesn't exist in CLI.
// On Android we use PermissionsAndroid directly. On iOS, react-native-geolocation-service
// triggers the system prompt automatically on first getCurrentPosition() call,
// as long as Info.plist has NSLocationWhenInUseUsageDescription set.
async function requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission Required",
                message: "This app needs access to your location to mark attendance.",
                buttonPositive: "OK",
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    // iOS: permission is requested implicitly by getCurrentPosition below
    return true;
}

// CHANGED: wraps the callback-based Geolocation.getCurrentPosition in a Promise
// to match the old `await Location.getCurrentPositionAsync({})` usage.
function getCurrentPosition(): Promise<{ latitude: number; longitude: number }> {
    return new Promise((resolve, reject) => {
        Geolocation.getCurrentPosition(
            (position) => {
                resolve({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                });
            },
            (error) => reject(error),
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 10000 }
        );
    });
}

/**
 * Owns all the data-fetching for the Home screen:
 * - loads the logged-in user
 * - checks today's sign-in/out state
 * - requests location permission + GPS
 * - validates location/shift window
 *
 * UI components stay dumb; this hook is the only thing that talks
 * to storage, location, and the attendance API.
 */
export function useAttendanceStatus() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [status, setStatus] = useState<AttendanceStatus>(EMPTY_STATUS);

    const initialize = useCallback(async (showLoader = true) => {
        try {
            if (showLoader) setLoading(true);
            else setRefreshing(true);

            const data = await getUser();
            setUser(data);
            if (!data) return;

            const attendanceStatus = await getAttendanceStatus(data.username);

            const permissionGranted = await requestLocationPermission();

            if (!permissionGranted) {
                Alert.alert("Permission Required", "Please enable location permission");
                setStatus({
                    hasSignedIn: attendanceStatus.hasSignedIn,
                    hasSignedOut: attendanceStatus.hasSignedOut,
                    canSignIn: false,
                    canSignOut: false,
                    signOutWindowStart: attendanceStatus.signOutWindowStart ?? "",
                    message: "Location permission denied",
                });
                return;
            }

            const coords = await getCurrentPosition();

            const validation = await validateAttendance(
                data.username,
                coords.latitude,
                coords.longitude
            );

            // Sign In  → not yet signed in  AND within location + shift start window
            // Sign Out → already signed in  AND within location + sign-out time window
            setStatus({
                hasSignedIn: attendanceStatus.hasSignedIn,
                hasSignedOut: attendanceStatus.hasSignedOut,
                canSignIn: attendanceStatus.canSignIn && validation.canMarkAttendance,
                canSignOut: attendanceStatus.canSignOut && validation.isWithinRadius,
                signOutWindowStart: attendanceStatus.signOutWindowStart ?? "",
                message: validation.message ?? attendanceStatus.message,
            });
        } catch (error) {
            console.log("Initialize error:", error);
            Alert.alert("Error", "Failed to load attendance status");
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    }, []);

    useEffect(() => {
        initialize();
    }, [initialize]);

    return { user, loading, refreshing, status, refresh: initialize };
}