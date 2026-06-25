import { useState } from "react";
import {
	View,
	Text,
	TextInput,
	TouchableOpacity,
	StyleSheet,
	Alert,
	Image,
	ImageBackground,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";

import { saveUser } from "../utils/storage";

import { loginUser } from "../services/authService";

export default function LoginScreen({ navigation }: any) {
	const [username, setUsername] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);

	const handleLogin = async () => {
		try {
			const trimmedUsername = username.trim();
			const trimmedPassword = password.trim();

			const data = await loginUser(trimmedUsername, trimmedPassword);

			await saveUser(data);

			navigation.replace("Home");
		} catch (error: any) {
			console.log("LOGIN ERROR:", error);
			console.log("LOGIN ERROR RESPONSE:", error?.response);
			console.log("LOGIN ERROR MESSAGE:", error?.message);

			Alert.alert(
				"Error",
				error?.response?.data?.message || error?.message || "Login Failed"
			);
		}
	};

	return (
		<ImageBackground
			source={require("../assets/login-bg.png")}
			style={styles.background}
			imageStyle={{ opacity: 0.9 }}
			resizeMode="cover"
		>
			<View style={styles.container}>
				<View style={styles.card}>
					{/* Header */}
					<View style={styles.header}>
						<View>
							<Text style={styles.title}>Login</Text>
							<Text style={styles.subtitle}>Welcome to CMRL</Text>
						</View>
						<Image
							source={require("../assets/logo.png")}
							style={styles.logo}
						/>
					</View>

					{/* Username */}
					<TextInput
						placeholder="Username"
						placeholderTextColor="#808080"
						style={styles.input}
						value={username}
						onChangeText={setUsername}
						autoCapitalize="none"
					/>

					{/* Password */}
					<View style={styles.passwordContainer}>
						<TextInput
							placeholder="Password"
							placeholderTextColor="#808080"
							secureTextEntry={!showPassword}
							style={styles.passwordInput}
							value={password}
							onChangeText={setPassword}
						/>
						<TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
							<Ionicons
								name={showPassword ? "eye-off" : "eye"}
								size={26}
								color="#3266CC"
							/>
						</TouchableOpacity>
					</View>

					{/* Login Button */}
					<TouchableOpacity style={styles.button} onPress={handleLogin}>
						<Text style={styles.buttonText}>Login</Text>
					</TouchableOpacity>
				</View>
			</View>
		</ImageBackground>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 25,
	},
	card: {
		width: "100%",
		backgroundColor: "#fff",
		borderRadius: 40,
		paddingHorizontal: 35,
		paddingVertical: 35,
	},
	header: {
		flexDirection: "row",
		justifyContent: "space-between",
		alignItems: "center",
		marginBottom: 35,
	},
	title: {
		fontSize: 38,
		color: "#3266CC",
		fontWeight: "500",
	},
	subtitle: {
		fontSize: 20,
		color: "#3266CC",
		marginTop: 8,
	},
	logo: {
		width: 60,
		height: 60,
		resizeMode: "contain",
		position: "relative",
		top: -15,

	},
	input: {
		height: 50,
		borderWidth: 2,
		borderColor: "#3266CC",
		borderRadius: 30,
		paddingHorizontal: 22,
		fontSize: 18,
		marginBottom: 18,
	},
	passwordContainer: {
		height: 50,
		borderWidth: 2,
		borderColor: "#3266CC",
		borderRadius: 30,
		flexDirection: "row",
		alignItems: "center",
		paddingHorizontal: 20,
	},
	passwordInput: {
		flex: 1,
		fontSize: 18,
	},
	button: {
		width: 180,
		height: 52,
		backgroundColor: "#3266CC",
		borderRadius: 30,
		alignSelf: "center",
		justifyContent: "center",
		alignItems: "center",
		marginTop: 40,
	},
	buttonText: {
		color: "#fff",
		fontSize: 22,
		fontWeight: "500",
	},
	background: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		padding: 25,
	},
});