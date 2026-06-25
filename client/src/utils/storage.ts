import * as Keychain from "react-native-keychain";

export const saveUser = async (user: any) => {
	await Keychain.setGenericPassword(
		"user",
		JSON.stringify(user)
	);
};

export const getUser = async () => {
	const credentials = await Keychain.getGenericPassword();

	if (!credentials) return null;

	return JSON.parse(credentials.password);
};

export const logoutUser = async () => {
	await Keychain.resetGenericPassword();
};