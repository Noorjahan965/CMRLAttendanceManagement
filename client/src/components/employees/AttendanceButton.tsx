import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { Employee } from "../../services/employeeService";
import { styles } from "./employeeStyles";

export type TeamAttendanceStatus = {
    employeeId: number;
    username: string;
    hasSignedIn: boolean;
    hasSignedOut: boolean;
    attendanceStatus: string;
};

export function AttendanceButton({
    emp,
    attendanceMap,
    signingId,
    onPress,
}: {
    emp: Employee;
    attendanceMap: Record<number, TeamAttendanceStatus>;
    signingId: number | null;
    onPress: (emp: Employee) => void;
}) {
    const s = attendanceMap[emp.employeeId];
    if (!s) return null;

    const isLoading = signingId === emp.employeeId;

    if (s.hasSignedIn && s.hasSignedOut) {
        return (
            <View style={styles.presentBadge}>
                <Text style={styles.presentBadgeText}>✓ Present</Text>
            </View>
        );
    }

    return (
        <TouchableOpacity
            style={[styles.attendanceBtn, s.hasSignedIn ? styles.signOutBtn : styles.signInBtn]}
            onPress={() => onPress(emp)}
            disabled={isLoading}
        >
            {isLoading
                ? <ActivityIndicator size="small" color="#fff" />
                : <Text style={styles.attendanceBtnText}>
                    {s.hasSignedIn ? "Sign Out" : "Sign In"}
                  </Text>
            }
        </TouchableOpacity>
    );
}