import { useState } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Alert,
    PermissionsAndroid,
    Platform,
} from "react-native";
import { useNavigation, useRoute, CommonActions } from "@react-navigation/native"; 
import Geolocation from "react-native-geolocation-service"; 
import { getUser } from "../utils/storage";
import { signIn, signOut } from "../services/attendanceService";
import React from "react";


async function requestLocationPermission(): Promise<boolean> {
    if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
                title: "Location Permission Required",
                message: "Location permission is required to mark attendance.",
                buttonPositive: "OK",
            }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
    }
    return true;
}


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
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 } 
        );
    });
}

export default function AttendanceScreen() {
    const navigation = useNavigation<any>(); 
    const route = useRoute<any>(); 
    const { mode } = route.params as { mode: "signin" | "signout" }; 
    const isSignOut = mode === "signout";

    const [loading, setLoading] = useState(false);

    const handleAttendance = async () => {
        try {
            setLoading(true);

            const user = await getUser();
            if (!user) {
                Alert.alert("Error", "User session not found. Please login again.");
                
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "Login" }],
                    })
                );
                return;
            }

            // Get fresh GPS at the moment of tapping
            const permissionGranted = await requestLocationPermission();
            if (!permissionGranted) {
                Alert.alert(
                    "Permission Required",
                    "Location permission is required to mark attendance."
                );
                return;
            }

            const coords = await getCurrentPosition();

            const result = isSignOut
                ? await signOut(user.username, coords.latitude, coords.longitude)
                : await signIn(user.username, coords.latitude, coords.longitude);

            if (result.success) {
                
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: "Home" }],
                    })
                );
            } else {
                Alert.alert("Failed", result.message || "Something went wrong.");
            }
        } catch (error: any) {
            console.log("Attendance error:", error);
            const serverMessage =
                error?.response?.data?.message || "Failed to record attendance.";
            Alert.alert("Error", serverMessage);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>{isSignOut ? "Sign Out" : "Sign In"}</Text>

            <Text style={styles.subtitle}>
                {isSignOut
                    ? "Tap below to record your sign-out time and location."
                    : "Tap below to record your sign-in time and location."}
            </Text>

            {loading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#2563eb" />
                    <Text style={styles.loadingText}>
                        {isSignOut ? "Recording sign out..." : "Recording sign in..."}
                    </Text>
                </View>
            ) : (
                <TouchableOpacity
                    style={[
                        styles.button,
                        { backgroundColor: isSignOut ? "#f97316" : "#2563eb" },
                    ]}
                    onPress={handleAttendance}
                >
                    <Text style={styles.buttonText}>
                        {isSignOut ? "Confirm Sign Out" : "Confirm Sign In"}
                    </Text>
                </TouchableOpacity>
            )}

            <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => navigation.goBack()} 
                disabled={loading}
            >
                <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: "center",
    },
    title: {
        fontSize: 28,
        fontWeight: "bold",
        textAlign: "center",
        marginBottom: 12,
    },
    subtitle: {
        fontSize: 15,
        color: "#6b7280",
        textAlign: "center",
        marginBottom: 40,
        lineHeight: 22,
    },
    loadingContainer: {
        alignItems: "center",
        gap: 12,
    },
    loadingText: {
        fontSize: 14,
        color: "#6b7280",
    },
    button: {
        padding: 18,
        borderRadius: 10,
        alignItems: "center",
        marginBottom: 16,
    },
    buttonText: {
        color: "#fff",
        fontSize: 17,
        fontWeight: "bold",
    },
    cancelButton: {
        padding: 14,
        alignItems: "center",
    },
    cancelText: {
        color: "#6b7280",
        fontSize: 15,
    },
});