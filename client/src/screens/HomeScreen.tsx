import { View, Text, ActivityIndicator, StyleSheet, TouchableOpacity, Image, ScrollView, RefreshControl } from "react-native";
import { useAttendanceStatus } from "../hooks/useAttendanceStatus";
import { StatusButton } from "../components/home/StatusButton";
import { RefreshStatusLink } from "../components/home/RefreshStatusLink";
import { EmployeeActions } from "../components/home/EmployeeActions";
import { HRActions } from "../components/home/HRActions";
import { useState, useEffect } from "react";
import { LogoutButton } from "../components/home/LogoutButton";
import { ROLE_IDS } from "../constants/roles";
import Ionicons from "react-native-vector-icons/Ionicons"; 

function formatDate(d: Date) {
	const dd = String(d.getDate()).padStart(2, "0");
	const mm = String(d.getMonth() + 1).padStart(2, "0");
	const yyyy = d.getFullYear();
	return `${dd}/${mm}/${yyyy}`;
}

function formatTime(d: Date) {
	const hh = String(d.getHours()).padStart(2, "0");
	const mi = String(d.getMinutes()).padStart(2, "0");
	const ss = String(d.getSeconds()).padStart(2, "0");
	return `${hh}:${mi}:${ss}`;
}

export default function HomeScreen() {
	const [showProfile, setShowProfile] = useState(false);
	const { user, loading, refreshing, status, refresh } = useAttendanceStatus();
	const isHR = String(user?.role) === ROLE_IDS.HR;
	const onRefresh = async () => { await refresh(false); };
	const [now, setNow] = useState(new Date());

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);


	if (loading) {
		return (
			<View style={styles.centered}>
				<ActivityIndicator size="large" color="#2563eb" />
				<Text style={styles.loadingText}>Loading...</Text>
			</View>
		);
	}
	const initial = user?.employeeName ? user.employeeName.charAt(0).toUpperCase() : "?";

	return (
		<ScrollView
			style={styles.screen}
			contentContainerStyle={{
				flexGrow: 1,
				minHeight: "100%",
				paddingBottom: 30,
			}}
			refreshControl={
				<RefreshControl
					refreshing={refreshing}
					onRefresh={onRefresh}
				/>
			}
		>
			{/* Blue top shape */}
			<View style={styles.topBlueShape}>
				<View style={styles.header}>
					<View style={styles.logoCircle}>
						<Image source={require("../assets/logo.png")}
							style={styles.logo} />
					</View>
					<Text style={styles.headerTitle}>Home</Text>


					<View style={styles.rightSection}>

						<View style={styles.profileContainer}>

							<TouchableOpacity
								style={styles.avatarCircle}
								onPress={() => setShowProfile(!showProfile)}
							>
								<Text style={styles.avatarText}>
									{initial}
								</Text>
							</TouchableOpacity>

							{showProfile && (
								<View style={styles.profileDropdown}>
									<Text style={styles.usernameText}>
										{user?.employeeName ?? ""}
									</Text>
								</View>
							)}

						</View>

						<LogoutButton />

					</View>

				</View>
			</View>

			<View style={styles.body}>
				{/* White card, overlaps header */}
				<View style={styles.card}>
					<View style={styles.dateTimeRow}>
						<View style={styles.dateTimeItem}>
							<Ionicons
								name="calendar-outline"
								size={22}
								color="#3567CB"
							/>
							<Text style={styles.dateTimeText}>{formatDate(now)}</Text>
						</View>
						<View style={styles.dateTimeItem}>
							<Ionicons
								name="time-outline"
								size={22}
								color="#3567CB"
							/>
							<Text style={styles.dateTimeText}>{formatTime(now)}</Text>
						</View>
					</View>

					<StatusButton status={status} />
					<RefreshStatusLink refreshing={refreshing} onPress={() => refresh(false)} />
				</View>

				<EmployeeActions />
				{isHR && <HRActions />}

			</View>
		</ScrollView>
	);
}

const styles = StyleSheet.create({
	screen: {
		flex: 1,
		backgroundColor: "#EAEAEA",
	},

	rightSection: {
		flexDirection: "row",
		alignItems: "center",
		gap: 12,
	},

	logo: {
		width: 40,
		height: 40,
		borderRadius: 30,
		resizeMode: "contain",
		position: "relative",
	},
	centered: {
		flex: 1,
		justifyContent: "center",
		alignItems: "center",
		backgroundColor: "#fff",
	},
	loadingText: {
		marginTop: 12,
		color: "#6b7280",
		fontSize: 14,
	},

	// Header
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingTop: 55,
		paddingHorizontal: 25,
	},
	logoCircle: {
		width: 40,
		height: 40,
		borderRadius: 20,
		backgroundColor: "#1d4ed8",
		alignItems: "center",
		justifyContent: "center",
	},

	topBlueShape: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		height: 390,
		backgroundColor: "#3567CB",
		borderBottomLeftRadius: 90,
		borderBottomRightRadius: 90,
	},
	headerTitle: {
		flex: 1,
		color: "#fff",
		fontSize: 20,
		fontWeight: "700",
		marginLeft: 12,
	},
	avatarCircle: {
		width: 36,
		height: 36,
		borderRadius: 18,
		backgroundColor: "#ffffff",
		alignItems: "center",
		justifyContent: "center",
	},
	avatarText: {
		color: "#3568d4",
		fontWeight: "700",
		fontSize: 15,
	},

	profileContainer: {
		position: "relative",
	},

	profileDropdown: {
		position: "absolute",
		top: 45,
		right: 0,
		backgroundColor: "#fff",
		minWidth: 150,
		paddingVertical: 12,
		paddingHorizontal: 16,
		borderRadius: 12,
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 4,
		},
		shadowOpacity: 0.15,
		shadowRadius: 8,
		elevation: 8,
		zIndex: 100,
	},

	usernameText: {
		fontSize: 15,
		fontWeight: "600",
		color: "#1f2937",
	},

	// Body sits on the blue background; card overlaps the header curve
	body: {
		minHeight: 700,
		paddingHorizontal: 30,
		marginTop: 150,
	},

	// White card
	card: {
		backgroundColor: "#fff",
		width: "90%",
		height: 300,
		alignSelf: "center",
		borderRadius: 28,
		paddingVertical: 25,
		paddingHorizontal: 20,
		justifyContent: "space-between",
		shadowColor: "#000",
		shadowOffset: {
			width: 0,
			height: 6,
		},
		shadowOpacity: 0.15,
		shadowRadius: 12,
		elevation: 8,
		marginTop: 30,
		marginBottom: 25,
	},
	dateTimeRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginBottom: 40,
	},
	dateTimeItem: {
		flexDirection: "row",
		alignItems: "center",
		gap: 6,
	},
	dateTimeIcon: {
		fontSize: 14,
		marginRight: 4,
	},
	dateTimeText: {
		fontSize: 14,
		color: "#1f2937",
		fontWeight: "700",
	},
});