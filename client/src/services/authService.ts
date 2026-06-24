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
      username,
      password,
    });

    return response.data;
  } catch (error) {
    console.log("AXIOS ERROR:", error);
    throw error;
  }
};