import { useEffect, useState, useCallback, useRef } from "react";
import {
    View, Text, TouchableOpacity, StyleSheet,
    ScrollView, ActivityIndicator, Alert,
    TextInput, Switch, KeyboardAvoidingView,
    Platform, RefreshControl
} from "react-native";
import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import { getHRAttendanceHistory, updateAttendanceStatus } from "../../services/attendanceService";

// ─── Types ────────────────────────────────────────────────────────────────────

type AttendanceHistory = {
    employeeId: number;
    employeeName: string;
    attendanceDate: string;
    attendanceStatus: string;
    signInTime: string | null;
    signOutTime: string | null;
};

type DayStatus = "Present" | "Absent" | "HalfDay" | "Holiday" | "Sunday" | "Future" | "";

type CalendarCell = {
    day: number | null;
    status: DayStatus;
    dateStr: string;
};

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<DayStatus, string> = {
    Present: "#16a34a",
    Absent:  "#dc2626",
    HalfDay: "#f97316",
    Holiday: "#a855f7",
    Sunday:  "#e5e7eb",
    Future:  "#f3f4f6",
    "":      "#f3f4f6",
};

const MONTH_NAMES = [
    "January","February","March","April","May","June",
    "July","August","September","October","November","December",
];

const DAY_HEADERS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function normalizeStatus(raw: string): DayStatus {
    const map: Record<string, DayStatus> = {
        present:    "Present",
        absent:     "Absent",
        halfday:    "HalfDay",
        "half day": "HalfDay",
        holiday:    "Holiday",
        sunday:     "Sunday",
    };
    return map[raw.trim().toLowerCase()] ?? "";
}

function toDateStr(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function AttendanceDetailScreen({ route }: any) {
    // ← route.params instead of useLocalSearchParams
    const { employeeId, employeeName, employeeCode, username } = route.params;

    const today = new Date();
    const [year, setYear]   = useState(today.getFullYear());
    const [month, setMonth] = useState(today.getMonth() + 1);

    const [history, setHistory]         = useState<AttendanceHistory[]>([]);
    const [loading, setLoading]         = useState(true);
    const [selectedDay, setSelectedDay] = useState<CalendarCell | null>(null);

    const [markPresent, setMarkPresent] = useState(false);
    const [remarks, setRemarks]         = useState("");
    const [submitting, setSubmitting]   = useState(false);

    const scrollRef = useRef<ScrollView>(null);

    const fetchHistory = useCallback(async () => {
        try {
            setLoading(true);
            const all: AttendanceHistory[] = await getHRAttendanceHistory();
            setHistory(all.filter((h) => h.employeeId === Number(employeeId)));
        } catch (e: any) {
            Alert.alert("Error", "Failed to load attendance history");
        } finally {
            setLoading(false);
        }
    }, [employeeId]);

    const { refreshing, onRefresh } = usePullToRefresh(fetchHistory);

    useEffect(() => { fetchHistory(); }, [fetchHistory]);

    // ── Status map ────────────────────────────────────────────────────────────
    const statusMap: Record<string, DayStatus> = {};
    history.forEach((h) => {
        const dateStr = h.attendanceDate.split("T")[0];
        statusMap[dateStr] = normalizeStatus(h.attendanceStatus);
    });

    // ── Build calendar grid ───────────────────────────────────────────────────
    const firstDay    = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const todayMid    = new Date(today.getFullYear(), today.getMonth(), today.getDate());

    const gridCells: CalendarCell[] = [];
    for (let i = 0; i < firstDay; i++) {
        gridCells.push({ day: null, status: "", dateStr: "" });
    }
    for (let d = 1; d <= daysInMonth; d++) {
        const cellDate = new Date(year, month - 1, d);
        const dateStr  = toDateStr(cellDate);
        const weekday  = cellDate.getDay();

        let status: DayStatus;
        if (cellDate > todayMid)              status = "Future";
        else if (weekday === 0 || weekday === 6) status = "Sunday";
        else                                  status = statusMap[dateStr] ?? "Absent";

        gridCells.push({ day: d, status, dateStr });
    }

    // ── Summary counts ────────────────────────────────────────────────────────
    const counts = { Present: 0, Absent: 0, HalfDay: 0, Holiday: 0 };
    gridCells.forEach((c) => {
        if (c.status in counts) counts[c.status as keyof typeof counts]++;
    });

    // ── Month navigation ──────────────────────────────────────────────────────
    const changeMonth = (delta: number) => {
        let m = month + delta, y = year;
        if (m > 12) { m = 1; y++; }
        if (m < 1)  { m = 12; y--; }
        setMonth(m); setYear(y);
        setSelectedDay(null);
    };

    // ── Day tap ───────────────────────────────────────────────────────────────
    const handleDayPress = (cell: CalendarCell) => {
        if (!cell.day) return;
        if (cell.status === "Future" || cell.status === "Sunday") return;
        if (cell.status === "Present") {
            Alert.alert("Already Present", "This day is already marked as Present.");
            return;
        }
        setSelectedDay(cell);
        setMarkPresent(false);
        setRemarks("");
        requestAnimationFrame(() => {
            scrollRef.current?.scrollToEnd({ animated: true });
        });
    };

    // ── Submit regularization ─────────────────────────────────────────────────
    const handleConfirm = async () => {
        if (!selectedDay) return;
        if (!markPresent) {
            Alert.alert("No Change", "Toggle the switch to mark as Present.");
            return;
        }
        try {
            setSubmitting(true);
            await updateAttendanceStatus(
                employeeCode,
                username,
                `${selectedDay.dateStr}T00:00:00`,
                "Present",
                remarks.trim() || null
            );
            Alert.alert("Success ✓", "Attendance updated to Present.");
            setSelectedDay(null);
            setRemarks("");
            fetchHistory();
        } catch (e: any) {
            const msg = e?.response?.data?.message || "Failed to update attendance";
            Alert.alert("Error", msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading attendance...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView
            style={styles.screen}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
            <ScrollView
                ref={scrollRef}
                style={{ flex: 1 }}
                contentContainerStyle={{ paddingBottom: 40 }}
                keyboardShouldPersistTaps="handled"
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
            >
                <View style={styles.empCard}>
                    <Text style={styles.empName}>{employeeName}</Text>
                    <Text style={styles.empCode}>{employeeCode}</Text>
                </View>

                <View style={styles.navigator}>
                    <TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
                        <Text style={styles.navArrow}>‹</Text>
                    </TouchableOpacity>
                    <Text style={styles.monthLabel}>{MONTH_NAMES[month - 1]} {year}</Text>
                    <TouchableOpacity
                        onPress={() => changeMonth(1)}
                        style={styles.navBtn}
                        disabled={year === today.getFullYear() && month === today.getMonth() + 1}
                    >
                        <Text style={[
                            styles.navArrow,
                            year === today.getFullYear() && month === today.getMonth() + 1
                                && styles.navArrowDisabled,
                        ]}>›</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.dayHeaders}>
                    {DAY_HEADERS.map((d) => (
                        <Text key={d} style={styles.dayHeader}>{d}</Text>
                    ))}
                </View>

                <View style={styles.grid}>
                    {gridCells.map((cell, i) => {
                        const isSelected = selectedDay?.dateStr === cell.dateStr;
                        const tappable   = cell.day &&
                            cell.status !== "Future" &&
                            cell.status !== "Sunday" &&
                            cell.status !== "Present";

                        return (
                            <TouchableOpacity
                                key={i}
                                activeOpacity={tappable ? 0.7 : 1}
                                onPress={() => cell.day && handleDayPress(cell)}
                                style={[
                                    styles.cell,
                                    cell.day
                                        ? { backgroundColor: STATUS_COLORS[cell.status] }
                                        : styles.emptyCell,
                                    isSelected && styles.selectedCell,
                                ]}
                            >
                                {cell.day && (
                                    <Text style={[
                                        styles.cellText,
                                        (cell.status === "Present" || cell.status === "Absent" ||
                                            cell.status === "HalfDay" || cell.status === "Holiday")
                                            && { color: "#fff" },
                                        (cell.status === "Sunday" || cell.status === "Future" || cell.status === "")
                                            && { color: "#9ca3af" },
                                    ]}>
                                        {cell.day}
                                    </Text>
                                )}
                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={styles.legend}>
                    {(["Present","Absent","HalfDay","Holiday","Sunday"] as DayStatus[]).map((s) => (
                        <View key={s} style={styles.legendItem}>
                            <View style={[styles.legendDot, { backgroundColor: STATUS_COLORS[s] }]} />
                            <Text style={styles.legendText}>{s}</Text>
                        </View>
                    ))}
                </View>

                <View style={styles.summary}>
                    {Object.entries(counts).map(([status, count]) => (
                        <View key={status} style={styles.summaryItem}>
                            <Text style={[styles.summaryCount, { color: STATUS_COLORS[status as DayStatus] }]}>
                                {count}
                            </Text>
                            <Text style={styles.summaryLabel}>{status}</Text>
                        </View>
                    ))}
                </View>

                {selectedDay && (
                    <View style={styles.editCard}>
                        <View style={styles.editCardRow}>
                            <View>
                                <Text style={styles.editDate}>
                                    {new Date(selectedDay.dateStr + "T00:00:00").toLocaleDateString("en-GB", {
                                        day: "2-digit", month: "long", year: "numeric",
                                    })}
                                </Text>
                                <Text style={[styles.editCurrentStatus, { color: STATUS_COLORS[selectedDay.status] }]}>
                                    {selectedDay.status}
                                </Text>
                            </View>
                            <View style={styles.toggleSection}>
                                <Switch
                                    value={markPresent}
                                    onValueChange={setMarkPresent}
                                    trackColor={{ false: "#d1d5db", true: "#16a34a" }}
                                    thumbColor="#fff"
                                />
                                <Text style={styles.toggleLabel}>
                                    {markPresent ? "Present" : "No change"}
                                </Text>
                            </View>
                        </View>

                        <TextInput
                            style={styles.remarksInput}
                            placeholder="Remarks (optional)"
                            placeholderTextColor="#9ca3af"
                            value={remarks}
                            onChangeText={setRemarks}
                            multiline
                            numberOfLines={3}
                            onFocus={() => {
                                requestAnimationFrame(() => {
                                    scrollRef.current?.scrollToEnd({ animated: true });
                                });
                            }}
                        />

                        <TouchableOpacity
                            style={[styles.confirmBtn, (!markPresent || submitting) && styles.confirmBtnDisabled]}
                            onPress={handleConfirm}
                            disabled={!markPresent || submitting}
                        >
                            {submitting
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.confirmBtnText}>Confirm</Text>
                            }
                        </TouchableOpacity>
                    </View>
                )}

                {!selectedDay && (
                    <Text style={styles.hint}>
                        Tap an Absent or HalfDay date to regularize attendance
                    </Text>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    screen:             { flex: 1, backgroundColor: "#f9fafb", paddingHorizontal: 16 },
    centered:           { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText:        { marginTop: 12, color: "#6b7280", fontSize: 14 },
    empCard:            { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 16, elevation: 1 },
    empName:            { fontSize: 17, fontWeight: "bold", color: "#111827" },
    empCode:            { fontSize: 13, color: "#6b7280", marginTop: 2 },
    navigator:          { flexDirection: "row", alignItems: "center", justifyContent: "space-between", backgroundColor: "#fff", borderRadius: 10, padding: 12, marginBottom: 12, elevation: 1 },
    navBtn:             { padding: 4 },
    navArrow:           { fontSize: 28, color: "#2563eb", fontWeight: "bold" },
    navArrowDisabled:   { color: "#d1d5db" },
    monthLabel:         { fontSize: 18, fontWeight: "700", color: "#111827" },
    dayHeaders:         { flexDirection: "row", marginBottom: 4 },
    dayHeader:          { width: `${100 / 7}%`, textAlign: "center", fontSize: 12, fontWeight: "600", color: "#6b7280" },
    grid:               { flexDirection: "row", flexWrap: "wrap" },
    cell:               { width: `${100 / 7}%`, aspectRatio: 1, justifyContent: "center", alignItems: "center", borderRadius: 6, marginVertical: 2 },
    emptyCell:          { backgroundColor: "transparent" },
    selectedCell:       { borderWidth: 2.5, borderColor: "#111827" },
    cellText:           { fontSize: 13, fontWeight: "600", color: "#111827" },
    legend:             { flexDirection: "row", flexWrap: "wrap", justifyContent: "center", marginTop: 16, gap: 10 },
    legendItem:         { flexDirection: "row", alignItems: "center", gap: 4 },
    legendDot:          { width: 10, height: 10, borderRadius: 5 },
    legendText:         { fontSize: 11, color: "#374151" },
    summary:            { flexDirection: "row", justifyContent: "space-around", backgroundColor: "#fff", borderRadius: 10, padding: 16, marginTop: 16, elevation: 1 },
    summaryItem:        { alignItems: "center" },
    summaryCount:       { fontSize: 22, fontWeight: "bold" },
    summaryLabel:       { fontSize: 11, color: "#6b7280", marginTop: 2 },
    editCard:           { backgroundColor: "#fff", borderRadius: 12, padding: 16, marginTop: 20, elevation: 2 },
    editCardRow:        { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
    editDate:           { fontSize: 15, fontWeight: "bold", color: "#111827" },
    editCurrentStatus:  { fontSize: 13, fontWeight: "600", marginTop: 2 },
    toggleSection:      { alignItems: "center" },
    toggleLabel:        { fontSize: 12, color: "#374151", marginTop: 4, fontWeight: "600" },
    remarksInput:       { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 14, color: "#111827", textAlignVertical: "top", minHeight: 80, marginBottom: 14 },
    confirmBtn:         { backgroundColor: "#16a34a", padding: 16, borderRadius: 10, alignItems: "center" },
    confirmBtnDisabled: { backgroundColor: "#9ca3af" },
    confirmBtnText:     { color: "#fff", fontWeight: "bold", fontSize: 16 },
    hint:               { textAlign: "center", color: "#9ca3af", fontSize: 13, marginTop: 20 },
});