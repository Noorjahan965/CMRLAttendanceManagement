import { useEffect, useState, useCallback } from "react";
import {
	View,
	Text,
	TouchableOpacity,
	StyleSheet,
	ActivityIndicator,
	Alert,
	ScrollView,
	RefreshControl,
} from "react-native";
import { usePullToRefresh } from "../hooks/usePullToRefresh.ts";
import { getUser } from "../utils/storage";
import { apiClient } from "../services/apiClient"; 

type DayStatus = "Present" | "Absent" | "HalfDay" | "Sunday" | "Future" | "";

type CalendarDay = {
	day: number;
	status: string; // raw value from API, normalized later
};

const STATUS_COLORS: Record<DayStatus, string> = {
	Present: "#16a34a",
	Absent: "#dc2626",
	HalfDay: "#f97316",
	Sunday: "#e5e7eb",

	Future: "#f3f4f6",
	"": "#f3f4f6",
};

const STATUS_LABELS = [
	{ status: "Present", color: "#16a34a" },
	{ status: "Absent", color: "#dc2626" },
	{ status: "HalfDay", color: "#f97316" },

	{ status: "Sunday", color: "#e5e7eb", textColor: "#6b7280" },
];

const MONTH_NAMES = [
	"January", "February", "March", "April", "May", "June",
	"July", "August", "September", "October", "November", "December",
];

const DAY_HEADERS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

// Normalize whatever casing the API sends ("present", "PRESENT", "Present")
// into the exact keys STATUS_COLORS expects.
function normalizeStatus(raw: string): DayStatus {
	const map: Record<string, DayStatus> = {
		present: "Present",
		absent: "Absent",
		halfday: "HalfDay",
		"half day": "HalfDay",
		sunday: "Sunday",

	};
	return map[raw.trim().toLowerCase()] ?? "";
}

export default function HistoryScreen() {
	const today = new Date();
	const [year, setYear] = useState(today.getFullYear());
	const [month, setMonth] = useState(today.getMonth() + 1); // 1-based
	const [days, setDays] = useState<CalendarDay[]>([]);
	const [loading, setLoading] = useState(true);
	const [username, setUsername] = useState<string>("");
	const { refreshing, onRefresh } = usePullToRefresh(
		async () => {
			if (username) {
				await fetchCalendar(year, month, username);
			}
		}
	);

	const fetchCalendar = useCallback(async (y: number, m: number, uname: string) => {
		try {
			setLoading(true);
			// CHANGED: was axios.get(`${BASE_URL}/attendance/calendar`, ...)
			const res = await apiClient.get(`/attendance/calendar`, {
				params: { username: uname, year: y, month: m },
			});
			setDays(res.data.days ?? []);
		} catch (e) {
			Alert.alert("Error", "Failed to load attendance history");
		} finally {
			setLoading(false);
		}
	}, []);

	useEffect(() => {
		getUser().then((user) => {
			if (user?.username) {
				setUsername(user.username);
				fetchCalendar(year, month, user.username);
			}
		});
	}, []);

	const changeMonth = (delta: number) => {
		let newMonth = month + delta;
		let newYear = year;
		if (newMonth > 12) { newMonth = 1; newYear++; }
		if (newMonth < 1) { newMonth = 12; newYear--; }
		setMonth(newMonth);
		setYear(newYear);
		fetchCalendar(newYear, newMonth, username);
	};

	// Build grid: find what weekday the 1st falls on
	const firstDayOfMonth = new Date(year, month - 1, 1).getDay(); // 0=Sun
	const daysInMonth = new Date(year, month, 0).getDate();

	// Map API days to a lookup, normalizing status casing
	const statusMap: Record<number, DayStatus> = {};
	days.forEach((d) => {
		statusMap[d.day] = normalizeStatus(d.status);
	});

	// Is this calendar date strictly after today? (don't color future dates)
	const isFutureDate = (day: number) => {
		const cellDate = new Date(year, month - 1, day);
		const todayMidnight = new Date(today.getFullYear(), today.getMonth(), today.getDate());
		return cellDate > todayMidnight;
	};

	// Build grid cells: leading blanks + day cells
	const gridCells: { day: number | null; status: DayStatus }[] = [];
	for (let i = 0; i < firstDayOfMonth; i++) {
		gridCells.push({ day: null, status: "" });
	}
	for (let d = 1; d <= daysInMonth; d++) {
		const weekday = new Date(year, month - 1, d).getDay(); // 0 = Sunday

		let status: DayStatus;
		if (isFutureDate(d)) {
			// Future dates never get colored, regardless of what API says
			status = "Future";
		} else if (weekday === 0) {
			// Always treat Sundays as Sunday client-side, API doesn't need to say so
			status = "Sunday";
		} else {
			status = statusMap[d] ?? "";
		}

		gridCells.push({ day: d, status });
	}

	// Summary counts (only count real attendance statuses)
	const counts = { Present: 0, Absent: 0, HalfDay: 0, Holiday: 0 };
	gridCells.forEach((c) => {
		if (c.status in counts) counts[c.status as keyof typeof counts]++;
	});

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={{
				flexGrow: 1,
				paddingBottom: 30,
			}}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			}
		>


			{/* Month Navigator */}
			<View style={styles.navigator}>
				<TouchableOpacity onPress={() => changeMonth(-1)} style={styles.navBtn}>
					<Text style={styles.navArrow}>‹</Text>
				</TouchableOpacity>
				<Text style={styles.monthLabel}>
					{MONTH_NAMES[month - 1]} {year}
				</Text>
				<TouchableOpacity
					onPress={() => changeMonth(1)}
					style={styles.navBtn}
					disabled={year === today.getFullYear() && month === today.getMonth() + 1}
				>
					<Text style={[
						styles.navArrow,
						year === today.getFullYear() && month === today.getMonth() + 1
						&& styles.navArrowDisabled
					]}>›</Text>
				</TouchableOpacity>
			</View>

			{loading ? (
				<View style={styles.centered}>
					<ActivityIndicator size="large" color="#2563eb" />
				</View>
			) : (
				<>
					{/* Day headers */}
					<View style={styles.dayHeaders}>
						{DAY_HEADERS.map((d) => (
							<Text key={d} style={styles.dayHeader}>{d}</Text>
						))}
					</View>

					{/* Calendar grid */}
					<View style={styles.grid}>
						{gridCells.map((cell, i) => (
							<View
								key={i}
								style={[
									styles.cell,
									cell.day
										? { backgroundColor: STATUS_COLORS[cell.status] ?? STATUS_COLORS[""] }
										: styles.emptyCell,
								]}
							>
								{cell.day && (
									<Text style={[
										styles.cellText,
										(cell.status === "Sunday" || cell.status === "Future" || cell.status === "")
										&& { color: "#6b7280" },
										(cell.status === "Present" || cell.status === "Absent" ||
											cell.status === "HalfDay")
										&& { color: "#fff" },
									]}>
										{cell.day}
									</Text>
								)}
							</View>
						))}
					</View>

					{/* Legend */}
					<View style={styles.legend}>
						{STATUS_LABELS.map(({ status, color }) => (
							<View key={status} style={styles.legendItem}>
								<View style={[styles.legendDot, { backgroundColor: color }]} />
								<Text style={styles.legendText}>{status}</Text>
							</View>
						))}
					</View>

					{/* Summary */}
					<View style={styles.summary}>
						{Object.entries(counts).map(([status, count]) => (
							<View key={status} style={styles.summaryItem}>
								<Text style={[styles.summaryCount,
								{ color: STATUS_COLORS[status as DayStatus] }]}>
									{count}
								</Text>
								<Text style={styles.summaryLabel}>{status}</Text>
							</View>
						))}
					</View>
				</>
			)}
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#f9fafb",
		paddingTop: 50,
		paddingHorizontal: 16,
	},
	header: {
		marginBottom: 16,
	},
	backBtn: {
		color: "#2563eb",
		fontSize: 15,
		marginBottom: 6,
	},
	headerTitle: {
		fontSize: 22,
		fontWeight: "bold",
		color: "#111827",
	},
	navigator: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		marginBottom: 16,
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 12,
		elevation: 1,
	},
	navBtn: {
		padding: 4,
	},
	navArrow: {
		fontSize: 28,
		color: "#2563eb",
		fontWeight: "bold",
	},
	navArrowDisabled: {
		color: "#d1d5db",
	},
	monthLabel: {
		fontSize: 18,
		fontWeight: "700",
		color: "#111827",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
	},
	dayHeaders: {
		flexDirection: "row",
		marginBottom: 4,
	},
	dayHeader: {
		width: `${100 / 7}%`,
		textAlign: "center",
		fontSize: 12,
		fontWeight: "600",
		color: "#6b7280",
	},
	grid: {
		flexDirection: "row",
		flexWrap: "wrap",
	},
	cell: {
		width: `${100 / 7}%`,
		aspectRatio: 1,
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 6,
		marginVertical: 2,
	},
	emptyCell: {
		backgroundColor: "transparent",
	},
	cellText: {
		fontSize: 13,
		fontWeight: "600",
		color: "#111827",
	},
	legend: {
		flexDirection: "row",
		flexWrap: "wrap",
		justifyContent: "center",
		marginTop: 16,
		gap: 12,
	},
	legendItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 4,
	},
	legendDot: {
		width: 10,
		height: 10,
		borderRadius: 5,
	},
	legendText: {
		fontSize: 12,
		color: "#374151",
	},
	summary: {
		flexDirection: "row",
		justifyContent: "space-around",
		marginTop: 16,
		backgroundColor: "#fff",
		borderRadius: 10,
		padding: 16,
		elevation: 1,
	},
	summaryItem: {
		alignItems: "center",
	},
	summaryCount: {
		fontSize: 22,
		fontWeight: "bold",
	},
	summaryLabel: {
		fontSize: 11,
		color: "#6b7280",
		marginTop: 2,
	},
});