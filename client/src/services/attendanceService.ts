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



export const getLowAttendance = async (username: string) => {
    const response = await apiClient.get(`/attendance/low-attendance`, {
        params: { username }
    });
    return response.data;
};

export const getHRAttendanceHistory = async () => {
    const response = await apiClient.get(`/attendance/hr/history`);
    return response.data;
};

export const updateAttendanceStatus = async (
    employeeCode: string,
    username: string,
    attendanceDate: string,
    newStatus: string,
    remarks: string | null
) => {
    const response = await apiClient.put(`/attendance/hr/attendance-status`, {
        employeeCode,
        username,
        attendanceDate,
        newStatus,
        remarks,
    });
    return response.data;
};

export const getTeamAttendanceStatus = async (hrUsername: string) => {
    const response = await apiClient.get(`/Attendance/hr/team-attendance-status`, {
        params: { hrUsername }
    });
    return response.data;
};

export const hrSignInEmployee = async (hrUsername: string, employeeUsername: string) => {
    const response = await apiClient.post(`/Attendance/hr/sign-in-employee`, {
        hrUsername,
        employeeUsername,
    });
    return response.data;
};

export const hrSignOutEmployee = async (hrUsername: string, employeeUsername: string) => {
    const response = await apiClient.post(`/Attendance/hr/sign-out-employee`, {
        hrUsername,
        employeeUsername,
    });
    return response.data;
};