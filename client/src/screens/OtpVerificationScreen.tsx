import { verifyOtp } from "../services/authService";
import { useState, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Keyboard,
  TouchableWithoutFeedback,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";


export default function OtpVerificationScreen({ route, navigation }: any) {
  const { email } = route.params;
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const handleChange = (text: string, index: number) => {
    if (!/^\d?$/.test(text)) return;

    const newOtp = [...otp];
    newOtp[index] = text;
    setOtp(newOtp);

    if (text && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (
      e.nativeEvent.key === "Backspace" &&
      otp[index] === "" &&
      index > 0
    ) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleConfirm = async () => {
  if (loading) return;
	const enteredOtp = otp.join("");

	if (enteredOtp.length !== 6) {
		Alert.alert("Error", "Please enter the complete OTP.");
		return;
	}

  setLoading(true);

	try {
		const data = await verifyOtp(email, enteredOtp);

		Alert.alert(
			"Success",
			data.message,
			[
				{
					text: "OK",
					onPress: () => {
						navigation.navigate("ResetPassword", {
							email,
							otp: enteredOtp,
						});
					},
				},
			],
			{ cancelable: false }
		);
	} catch (error: any) {
		console.log("VERIFY OTP ERROR:", error);
		console.log("VERIFY OTP RESPONSE:", error?.response);

		if (error?.response?.status === 400) {
			Alert.alert(
				"Error",
				error.response.data.message
			);
		} else {
			Alert.alert(
				"Error",
				error?.response?.data?.message ||
				error?.message ||
				"Something went wrong. Please try again."
			);
		}
	}
  finally
  {
    setLoading(false);
  }
};
  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <ImageBackground
        source={require("../assets/login-bg.png")}
        style={styles.background}
        imageStyle={{ opacity: 0.9 }}
      >
        
        
        <View style={styles.container}>
          <View style={styles.card}>
            <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={28}
            color="#3266CC"
          />
        </TouchableOpacity>

        <Text style={styles.title}>Verify Your Email</Text>

        <View style={{ width: 28 }} />
      </View>

      

            <Text style={styles.description}>
              Please enter the verification code sent to
            </Text>

            <Text style={styles.email}>{email}</Text>

            <View style={styles.otpContainer}>
              {otp.map((digit, index) => (
                <TextInput
                  key={index}
                  ref={(ref) => {
  inputRefs.current[index] = ref;
}}
                  style={styles.otpInput}
                  keyboardType="number-pad"
                  maxLength={1}
                  value={digit}
                  onChangeText={(text) => handleChange(text, index)}
                  onKeyPress={(e) => handleKeyPress(e, index)}
                />
              ))}
            </View>

            <TouchableOpacity
  style={[
    styles.button,
    loading && { opacity: 0.6 },
  ]}
  onPress={handleConfirm}
  disabled={loading}
>
  <Text style={styles.buttonText}>
    {loading ? "Verifying..." : "Confirm"}
  </Text>
</TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
  },

  header: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  marginBottom: 25,
},

title: {
  flex: 1,
  textAlign: "center",
  fontSize: 25,
  fontWeight: "600",
  color: "#3266CC",
},

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
    paddingVertical: 40,
    elevation: 6,
  },


  description: {
    marginTop: 20,
    fontSize: 17,
    color: "#44546A",
    textAlign: "center",
  },

  email: {
    marginTop: 8,
    marginBottom: 35,
    textAlign: "center",
    color: "#3266CC",
    fontSize: 18,
    fontWeight: "600",
  },

  otpContainer: {
  flexDirection: "row",
  justifyContent: "center",
  alignItems: "center",
  gap: 10,
  marginBottom: 35,
},

  otpInput: {
  width: 42,
  height: 52,
  borderWidth: 2,
  borderColor: "#3266CC",
  borderRadius: 12,
  textAlign: "center",
  fontSize: 22,
  color: "#000",
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

  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "500",
  },
});