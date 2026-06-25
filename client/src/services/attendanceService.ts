import { apiClient } from "./apiClient"; 


function getLocalTimeString(): string {
    const now = new Date();
    const offsetMs = now.getTimezoneOffset() * 60000;
    const local = new Date(now.getTime() - offsetMs);
    return local.toISOString().slice(0, -1);
}

export const validateAttendance = async (
    username: string,
    latitude: number,
    longitude: number
) => {
    const response = await apiClient.post( 
        `/attendance/validate`,
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
    const response = await apiClient.get( 
        `/attendance/status`,
        { params: { username } }
    );
    return response.data;
};

export const signIn = async (
    username: string,
    latitude: number,
    longitude: number
) => {
    const response = await apiClient.post( 
        `/attendance/signin`,
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
    const response = await apiClient.post( 
        `/attendance/signout`,
        {
            username,
            latitude,
            longitude,
            currentTime: getLocalTimeString(),
        }
    );
    return response.data;
};