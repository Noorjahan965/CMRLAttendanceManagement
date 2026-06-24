import axios from "axios";
import { BASE_URL } from "@/constants/api";

// Sends local wall-clock time (not UTC) so it matches shift windows
// defined in local time (e.g. "09:00:00" IST) on the backend.
function getLocalTimeString(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offsetMs);
    return local.toISOString().slice(0, -1); // strip trailing 'Z'
}

export const validateAttendance = async (
    username: string,
    latitude: number,
    longitude: number
) => {
    const response = await axios.post(
        `${BASE_URL}/attendance/validate`,
        {
            username,
            latitude,
            longitude,
            currentTime: getLocalTimeString(),
        }
    );
    return response.data;
};

export const getAttendanceStatus = async (username: string) => {
    const response = await axios.get(
        `${BASE_URL}/attendance/status`,
        { params: { username } }
    );
    return response.data;
};

export const signIn = async (
    username: string,
    latitude: number,
    longitude: number
) => {
    const response = await axios.post(
        `${BASE_URL}/attendance/signin`,
        {
            username,
            latitude,
            longitude,
            currentTime: getLocalTimeString(),
        }
    );
    return response.data;
};

export const signOut = async (
    username: string,
    latitude: number,
    longitude: number
) => {
    const response = await axios.post(
        `${BASE_URL}/attendance/signout`,
        {
            username,
            latitude,
            longitude,
            currentTime: getLocalTimeString(),
        }
    );
    return response.data;
};