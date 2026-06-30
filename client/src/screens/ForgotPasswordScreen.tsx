import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  TouchableWithoutFeedback,
  ImageBackground,
  Keyboard,
} from "react-native";

import { forgotPassword } from "../services/authService";

export default function ForgotPasswordScreen({ navigation }: any) {
  const [email, setEmail] = useState("");
  const [loading , setLoading ] = useState(false);

  const handleResetLink = async () => {
	if (!email.trim()) {
		Alert.alert("Error", "Please enter your email address.");
		return;
	}

	// Prevent multiple taps
	if (loading) return;

	setLoading(true);

	try {
	const data = await forgotPassword(email.trim());

	Alert.alert(
		"Success",
		data.message,
		[
			{
				text: "OK",
				onPress: () => {
					navigation.navigate("OtpVerification", {
						email: email.trim(),
					});
				},
			},
		],
		{ cancelable: false }
	);
} catch (error: any) {
	console.log("FORGOT PASSWORD ERROR:", error);

	if (error?.response?.status === 404) {
		Alert.alert("Error", error.response.data.message);
	} else {
		Alert.alert(
			"Error",
			error?.response?.data?.message ||
			error?.message ||
			"Something went wrong."
		);
	}
} finally {
	setLoading(false);
}
};

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <ImageBackground
  source={require("../assets/login-bg.png")}
  style={styles.background}
  imageStyle={{ opacity: 0.9 }}
  resizeMode="cover"
>
    <View style={styles.container}>
      <View style={styles.card}>
        {/* Logo */}
        <View style={styles.header}>
        

        {/* Title */}
        <Text style={styles.title}>Forgot your password</Text>
        <Image
          source={require("../assets/logo.png")}
          style={styles.logo}
        />
    </View>
        <Text style={styles.description}>
          Please enter the work email address 
        </Text>

        <TextInput
          placeholder="Enter your email"
          placeholderTextColor="#808080"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          style={styles.input}
        />

        {/* Button */}
        <TouchableOpacity
	style={[
		styles.button,
		loading && { opacity: 0.6 },
	]}
	onPress={handleResetLink}
	disabled={loading}
>
	<Text style={styles.buttonText}>
		{loading ? "Sending..." : "Send OTP"}
	</Text>
</TouchableOpacity>

        {/* Back */}
        <TouchableOpacity
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backText}>
            Back To Login
          </Text>
        </TouchableOpacity>
      </View>
    </View>
    </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },

  card: {
    width: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 35,
    padding: 25,
    elevation: 6,
  },

  logo: {
    width: 60,
	height: 60,
	resizeMode: "contain",
	position: "relative",
    
  },

  title: {
    fontSize: 30,
    flex:1,
    fontWeight: "700",
    color: "#3266CC",
  },

  description: {
    marginTop: 10,
    fontSize: 17,
    color: "#44546A",
    lineHeight: 26,
    marginBottom: 18,
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    color: "#5C677D",
    marginBottom: 8,
  },
  header: {
  flexDirection: "row",
  alignItems: "center",

  marginTop:15,
  justifyContent: "space-between",
  marginBottom: 25,
    },
  input: {
    height: 55,
    borderWidth: 2,
    borderColor: "#3266CC",
    borderRadius: 12,
    paddingHorizontal: 18,
    fontSize: 17,
    color: "#000",
    marginBottom: 30,
  },

  button: {
    width: 180,
		height: 52,
		backgroundColor: "#3266CC",
		borderRadius: 30,
		alignSelf: "center",
		justifyContent: "center",
		alignItems: "center",
		
  },
    background: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    },

  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
  },

  backText: {
    marginTop: 28,
    textAlign: "center",
    color: "#3266CC",
    fontSize: 17,
    fontWeight: "600",
  },
});