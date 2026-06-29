import { TouchableOpacity, Text, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native";

export default function ForgotPassword() {
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      onPress={() => navigation.navigate("ForgotPassword")}
    >
      <Text style={styles.text}>Forgot Password?</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    color: "#3266CC",
    fontSize: 15,
    fontWeight: "600",
    marginTop:15,
    alignItems:"center",
  },
});