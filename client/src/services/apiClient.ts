import axios from "axios";
import { getUser } from "../utils/storage";
import { BASE_URL } from "@/constants/api";

export const apiClient = axios.create({
    baseURL: BASE_URL,
});

apiClient.interceptors.request.use(
    async (config) => {
        const user = await getUser();
        if (user?.token) {
            config.headers.Authorization = `Bearer ${user.token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error?.response?.status === 401) {
            console.log("401 Unauthorized - Token missing, invalid or expired");
        }
        return Promise.reject(error);
    }
);