import { useEffect, useState, useCallback } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert,
    RefreshControl, TextInput
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
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
    const [filtered, setFiltered] = useState<LowAttendanceEmployee[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
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
            setFiltered(sorted);
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

    const handleSearch = (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFiltered(employees);
            return;
        }
        const lower = text.toLowerCase();
        setFiltered(
            employees.filter(
                (e) =>
                    e.employeeName.toLowerCase().includes(lower) ||
                    e.employeeCode.toLowerCase().includes(lower) ||
                    e.username.toLowerCase().includes(lower)
            )
        );
    };

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
            <Text style={styles.headerSubtitle}>Employees below 80% attendance</Text>

            {/* Search bar */}
            <View style={styles.searchRow}>
                <Ionicons name="search" size={20} color="#9ca3af" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by name, code, username..."
                    placeholderTextColor="#9ca3af"
                    value={searchQuery}
                    onChangeText={handleSearch}
                />
                {searchQuery.length > 0 && (
                    <TouchableOpacity onPress={() => handleSearch("")}>
                        <Ionicons name="close-circle" size={20} color="#9ca3af" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Summary pill */}
            <View style={styles.summaryRow}>
                <View style={styles.summaryPill}>
                    <Text style={styles.summaryCount}>{filtered.length}</Text>
                    <Text style={styles.summaryLabel}>
                        {searchQuery ? " results found" : " employees flagged"}
                    </Text>
                </View>
            </View>

            {filtered.length === 0 ? (
                <View style={styles.centered}>
                    <Text style={styles.emptyIcon}>
                        {searchQuery ? "🔍" : "✅"}
                    </Text>
                    <Text style={styles.emptyText}>
                        {searchQuery
                            ? "No employees match your search"
                            : "All employees are above 80%"}
                    </Text>
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                    }
                >
                    {filtered.map((emp) => {
                        const color = getPercentageColor(emp.attendancePercentage);
                        return (
                            <TouchableOpacity
                                key={emp.employeeId}
                                style={styles.card}
                                activeOpacity={0.7}
                                onPress={() =>
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
                                        <Text style={styles.employeeCode}>{emp.employeeCode}</Text>
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
    headerSubtitle: { fontSize: 13, color: "#6b7280", marginBottom: 12 },
    searchRow: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#e5e7eb",
        paddingHorizontal: 14,
        marginBottom: 12,
        height: 46,
    },
    searchInput: { flex: 1, fontSize: 15, color: "#111827", marginLeft: 8 },
    summaryRow: { flexDirection: "row", marginBottom: 16 },
    summaryPill: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fee2e2",
        borderRadius: 20,
        paddingHorizontal: 14,
        paddingVertical: 6,
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
    employeeCode: { fontSize: 12, color: "#9ca3af", marginTop: 2 },
    cardRight: { alignItems: "flex-end" },
    badge: { borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
    badgeText: { color: "#fff", fontSize: 13, fontWeight: "bold" },
    viewDetail: { fontSize: 12, color: "#6b7280", marginTop: 4 },
});