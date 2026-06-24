import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import Ionicons from "react-native-vector-icons/Ionicons"; 

export function HRActions() {
	const navigation = useNavigation<any>(); 

	return (
		<>
			<TouchableOpacity
				style={[styles.button, { backgroundColor: "#2563eb" }]}
				activeOpacity={0.85}
				onPress={() => navigation.navigate("EmployeeManagement")} 
			>
				<Ionicons
					name="people-outline"
					size={22}
					color="#ffffff"
				/>

				<Text style={styles.buttonText}>Employee Management</Text>

				<Text style={styles.arrow}>→</Text>
			</TouchableOpacity>

			<TouchableOpacity
				style={[styles.button, { backgroundColor: "#e14747" }]}
				activeOpacity={0.85}
				onPress={() => navigation.navigate("LowAttendance")} 
			>
				<Ionicons
					name="warning-outline"
					size={22}
					color="#ffffff"
				/>

				<Text style={styles.buttonText}>Low Attendance List</Text>

				<Text style={styles.arrow}>→</Text>
			</TouchableOpacity>
		</>
	);
}

const styles = StyleSheet.create({
	button: {
		flexDirection: "row",
		alignItems: "center",
		backgroundColor: "#2563eb",
		paddingHorizontal: 20,
		paddingVertical: 16,
		borderRadius: 14,
		marginTop: 14,
	},

	buttonText: {
		flex: 1,
		color: "#fff",
		fontWeight: "700",
		fontSize: 16,
		marginLeft: 12,
	},

	arrow: {
		color: "#fff",
		fontSize: 18,
		fontWeight: "700",
	},
});