import { useEffect, useState, useCallback } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert, RefreshControl
} from "react-native";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import { getUser } from "../../utils/storage";
import { getLowAttendance } from "../../services/attendanceService";

type LowAttendanceEmployee = {
    employeeId: number;
    employeeCode: string;
    employeeName: string;
    username: string;
    attendancePercentage: number;
};

function getPercentageColor(percentage: number): string {
    if (percentage < 50) return "#dc2626";
    if (percentage < 65) return "#f97316";
    return "#ca8a04";
}

export default function LowAttendanceScreen({ navigation }: any) {
    const [employees, setEmployees] = useState<LowAttendanceEmployee[]>([]);
    const [loading, setLoading] = useState(true);
    const [username, setUsername] = useState<string>("");

    const fetchLowAttendance = useCallback(async (uname: string) => {
        try {
            setLoading(true);
            const data = await getLowAttendance(uname);
            const sorted = (data as LowAttendanceEmployee[]).sort(
                (a, b) => a.attendancePercentage - b.attendancePercentage
            );
            setEmployees(sorted);
        } catch {
            Alert.alert("Error", "Failed to load low attendance data");
        } finally {
            setLoading(false);
        }
    }, []);

    const { refreshing, onRefresh } = usePullToRefresh(
        async () => { await fetchLowAttendance(username); }
    );

    useEffect(() => {
        const init = async () => {
            const user = await getUser();
            const uname = user?.username ?? "";
            setUsername(uname);
            await fetchLowAttendance(uname);
        };
        init();
    }, [fetchLowAttendance]);

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#dc2626" />
                <Text style={styles.loadingText}>Loading attendance data...</Text>
            </View>
        );
    }

    return (
        <View style={styles.screen}>
            <View style={styles.header}>
                <Text style={styles.headerSubtitle}>Employees below 80% attendance</Text>
            </View>

            <View style={styles.summaryRow}>
                <View style={styles.summaryPill}>
                    <Text style={styles.summaryCount}>{employees.length}</Text>
                    <Text style={styles.summaryLabel}> employees flagged</Text>
                </View>
            </View>

            {employees.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyIcon}>✅</Text>
                    <Text style={styles.emptyText}>All employees are above 80%</Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {employees.map((emp) => {
                        const color = getPercentageColor(emp.attendancePercentage);
                        return (
                            <TouchableOpacity
                                key={emp.employeeId}
                                style={styles.card}
                                activeOpacity={0.7}
                                onPress={() =>
                                    // ← React Navigation instead of expo-router
                                    navigation.navigate("AttendanceDetail", {
                                        employeeId: emp.employeeId,
                                        employeeName: emp.employeeName,
                                        employeeCode: emp.employeeCode,
                                        username: emp.username,
                                    })
                                }
                            >
                                <View style={styles.cardLeft}>
                                    <View style={[styles.avatar, { backgroundColor: color }]}>
                                        <Text style={styles.avatarText}>
                                            {emp.employeeName.charAt(0).toUpperCase()}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.employeeName}>{emp.employeeName}</Text>
                                        <Text style={styles.employeeId}>ID #{emp.employeeId}</Text>
                                    </View>
                                </View>

                                <View style={styles.cardRight}>
                                    <View style={[styles.badge, { backgroundColor: color }]}>
                                        <Text style={styles.badgeText}>
                                            {emp.attendancePercentage.toFixed(1)}%
                                        </Text>
                                    </View>
                                    <Text style={styles.viewDetail}>View →</Text>
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#f9fafb", paddingTop: 20, paddingHorizontal: 16 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, color: "#6b7280", fontSize: 14 },
    header: { marginBottom: 16 },
    headerSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
    summaryRow: {
        flexDirection: "row", alignItems: "center",
        justifyContent: "space-between", marginBottom: 16,
    },
    summaryPill: {
        flexDirection: "row", alignItems: "center",
        backgroundColor: "#fee2e2", borderRadius: 20,
        paddingHorizontal: 14, paddingVertical: 6,
    },
    summaryCount: { fontSize: 16, fontWeight: "bold", color: "#dc2626" },
    summaryLabel: { fontSize: 13, color: "#dc2626" },
    emptyIcon: { fontSize: 48, marginBottom: 12 },
    emptyText: { fontSize: 16, color: "#6b7280" },
    card: {
        backgroundColor: "#fff", borderRadius: 12, padding: 14,
        marginBottom: 10, elevation: 1,
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    },
    cardLeft: { flexDirection: "row", alignItems: "center", flex: 1 },
    avatar: {
        width: 44, height: 44, borderRadius: 22,
        justifyContent: "center", alignItems: "center", marginRight: 12,
    },
    avatarText: { color: "#fff", fontSize: 18, fontWeight: "bold" },
    employeeName: { fontSize: 15, fontWeight: "bold", color: "#111827" },
    employeeId: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
    cardRight: { alignItems: "flex-end" },
    badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
    viewDetail: { fontSize: 12, color: "#6b7280", marginTop: 4 },
});