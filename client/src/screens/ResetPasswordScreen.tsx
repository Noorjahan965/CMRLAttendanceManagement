import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  TouchableWithoutFeedback,
  Keyboard,
  Alert,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { resetPassword } from "../services/authService";

export default function ResetPasswordScreen({
  route,
  navigation,
}: any) {
  const { email, otp } = route.params;
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const handleResetPassword = async () => {
    if (loading) return;
    
  if (!newPassword.trim() || !confirmPassword.trim()) {
    Alert.alert("Error", "Please fill in all fields.");
    return;
  }

  if (newPassword !== confirmPassword) {
    Alert.alert("Error", "Passwords do not match.");
    return;
  }
  if (newPassword.length < 8) {
  Alert.alert(
    "Error",
    "Password must contain at least 8 characters."
  );
  return;
}
  setLoading(true);
  try {
    const data = await resetPassword(
      email,
      otp,
      newPassword.trim()
    );

    Alert.alert(
      "Success",
      data.message,
      [
        {
          text: "OK",
          onPress: () => {
            navigation.reset({
              index: 0,
              routes: [{ name: "Login" }],
            });
          },
        },
      ],
      { cancelable: false }
    );
  } catch (error: any) {
    console.log("RESET PASSWORD ERROR:", error);

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
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.passwordHint}>Password should contain at least 8 characters</Text>
            <View style={styles.passwordContainer}>
  <TextInput
    placeholder="New Password"
    placeholderTextColor="#808080"
    autoCapitalize="none"
  autoCorrect={false}
  editable={!loading}
    secureTextEntry={!showNewPassword}
    style={styles.passwordInput}
    value={newPassword}
    onChangeText={setNewPassword}
  />

  <TouchableOpacity
    onPress={() => setShowNewPassword(!showNewPassword)}
  >
    <Ionicons
      name={showNewPassword ? "eye-off" : "eye"}
      size={24}
      color="#3266CC"
    />
  </TouchableOpacity>
</View>

            <View style={styles.passwordContainer}>
  <TextInput
    placeholder="Re-enter Password"
    placeholderTextColor="#808080"
    autoCapitalize="none"
  autoCorrect={false}
  editable={!loading}
    secureTextEntry={!showConfirmPassword}
    style={styles.passwordInput}
    value={confirmPassword}
    onChangeText={setConfirmPassword}
  />

  <TouchableOpacity
    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
  >
    <Ionicons
      name={showConfirmPassword ? "eye-off" : "eye"}
      size={24}
      color="#3266CC"
    />
  </TouchableOpacity>
</View>

            <TouchableOpacity
              style={[
                styles.button,
                loading && { opacity: 0.6 },
              ]}
              onPress={handleResetPassword}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? "Resetting..." : "Confirm"}
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

  title: {
    fontSize: 30,
    fontWeight: "600",
    color: "#3266CC",
    textAlign: "center",
    marginBottom: 35,
  },

  input: {
    height: 50,
    borderWidth: 2,
    borderColor: "#3266CC",
    borderRadius: 30,
    paddingHorizontal: 22,
    fontSize: 18,
    color: "#000",
    marginBottom: 20,
  },

  button: {
    width: 180,
    height: 52,
    backgroundColor: "#3266CC",
    borderRadius: 30,
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
  },

  buttonText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "500",
  },
  passwordContainer: {
  height: 50,
  borderWidth: 2,
  borderColor: "#3266CC",
  borderRadius: 30,
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 20,
  marginBottom: 20,
},

passwordInput: {
  flex: 1,
  fontSize: 18,
  color: "#000000",
},

passwordHint: {
  fontSize: 13,
  color: "#9CA3AF", // Light gray
  marginTop: -10,
  marginBottom: 20,
  marginLeft: 5,
  textAlign: "center",
},
});