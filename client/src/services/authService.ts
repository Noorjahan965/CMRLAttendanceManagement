import axios from "axios";
import { BASE_URL } from "../constants/api";

export const loginUser = async (
	username: string,
	password: string
) => {
	const url = `${BASE_URL}/auth/login`;

	console.log("URL:", url);

	try {
		const response = await axios.post(url, {
			grantType: "password",
			username,
			password,
		});

		return response.data;
	} catch (error) {
		console.log("AXIOS ERROR:", error);
		throw error;
	}
};

export const forgotPassword = async (email: string) => {
	const url = `${BASE_URL}/auth/forgot-password`;

	console.log("URL:", url);

	try {
		const response = await axios.post(url, {
			email,
		});

		return response.data;
	} catch (error) {
		console.log("AXIOS ERROR:", error);
		throw error;
	}
};

export const verifyOtp = async (
	email: string,
	otp: string
) => {
	const url = `${BASE_URL}/auth/verify-otp`;

	console.log("URL:", url);

	try {
		const response = await axios.post(url, {
			email,
			otp,
		});

		return response.data;
	} catch (error) {
		console.log("AXIOS ERROR:", error);
		throw error;
	}
};


export const resetPassword = async (
  email: string,
  otp: string,
  newPassword: string
) => {
  const url = `${BASE_URL}/auth/reset-password`;

  console.log("URL:", url);

  try {
    const response = await axios.post(url, {
      email,
      otp,
      newPassword,
    });

    return response.data;
  } catch (error) {
    console.log("AXIOS ERROR:", error);
    throw error;
  }
};