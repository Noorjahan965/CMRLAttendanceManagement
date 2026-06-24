import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import Ionicons from "react-native-vector-icons/Ionicons"; 

export function EmployeeActions() {
    const navigation = useNavigation<any>(); 

    return (
        <TouchableOpacity
            style={styles.button}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("History")} 
        >
            <Ionicons
                name="calendar-outline"
                size={22}
                color="#ffffff"
              />
            <Text style={styles.buttonText}>   Attendance History</Text>
            <Text style={styles.arrow}>→</Text>
        </TouchableOpacity>
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
    icon: {
        fontSize: 16,
        marginRight: 10,
    },
    buttonText: {
        flex: 1,
        color: "#fff",
        fontWeight: "700",
        fontSize: 16,
    },
    arrow: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "700",
    },
});