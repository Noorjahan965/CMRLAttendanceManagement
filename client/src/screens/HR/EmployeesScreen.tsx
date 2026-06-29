import { useEffect, useState, useCallback } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert,
    KeyboardAvoidingView, Platform, RefreshControl
} from "react-native";

import { usePullToRefresh } from "../../hooks/usePullToRefresh";
import { getUser } from "../../utils/storage";
import { getEmployees, searchEmployees, getFormOptions, Employee, EmployeeFormOptions } from "../../services/employeeService";
import { getTeamAttendanceStatus, hrSignInEmployee, hrSignOutEmployee } from "../../services/attendanceService";

import { styles } from "../../components/employees/employeeStyles";
import { CreateEmployeeForm } from "../../components/employees/CreateEmployeeForm";
import { EditEmployeeModal } from "../../components/employees/EditEmployeeModal";
import { AttendanceButton, TeamAttendanceStatus } from "../../components/employees/AttendanceButton";
export default function EmployeesScreen() {
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filtered, setFiltered] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);

    const [options, setOptions] = useState<EmployeeFormOptions | null>(null);
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    const [attendanceMap, setAttendanceMap] = useState<Record<number, TeamAttendanceStatus>>({});
    const [hrUsername, setHrUsername] = useState<string>("");
    const [signingId, setSigningId] = useState<number | null>(null);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const user = await getUser();
            const uname = user?.username ?? "";
            setHrUsername(uname);

            const [employeeList, formOptions, teamStatus] = await Promise.all([
                getEmployees(uname),
                getFormOptions(),
                getTeamAttendanceStatus(uname),
            ]);

            console.log("TOTAL EMPLOYEES:", employeeList.length);
            console.log("TEAM STATUS COUNT:", (teamStatus as any[]).length); 
            console.log("TEAM STATUS IDs:", (teamStatus as any[]).map(s => s.employeeId));

            setEmployees(employeeList);
            setFiltered(employeeList);
            setOptions(formOptions);

            const map: Record<number, TeamAttendanceStatus> = {};
            (teamStatus as TeamAttendanceStatus[]).forEach((s) => { map[s.employeeId] = s; });
            setAttendanceMap(map);
        } catch (error) {
            Alert.alert("Error", "Failed to load employee data");
        } finally {
            setLoading(false);
        }
    }, []);

    const { refreshing, onRefresh } = usePullToRefresh(loadData);

    useEffect(() => { loadData(); }, [loadData]);

    const handleSearch = useCallback(async (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) { setFiltered(employees); return; }
        try {
            setSearching(true);
            const results = await searchEmployees(text.trim(), hrUsername);
            setFiltered(results);
        } catch {
            const lower = text.toLowerCase();
            setFiltered(employees.filter((e) =>
                e.employeeName.toLowerCase().includes(lower) ||
                e.employeeCode.toLowerCase().includes(lower) ||
                e.designationName?.toLowerCase().includes(lower) ||
                e.departmentName?.toLowerCase().includes(lower)
            ));
        } finally {
            setSearching(false);
        }
    }, [employees]);

    const handleAttendance = async (emp: Employee) => {
        const status = attendanceMap[emp.employeeId];
        if (!status) return;
        try {
            setSigningId(emp.employeeId);
            if (!status.hasSignedIn) {
                await hrSignInEmployee(hrUsername, status.username);
            } else if (!status.hasSignedOut) {
                await hrSignOutEmployee(hrUsername, status.username);
            }
            await loadData();
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Action failed");
        } finally {
            setSigningId(null);
        }
    };

    if (loading) {
        return (
            <View style={styles.centered}>
                <ActivityIndicator size="large" color="#2563eb" />
                <Text style={styles.loadingText}>Loading employees...</Text>
            </View>
        );
    }

    return (
        <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : "height"}>
            <View style={styles.screen}>

                {/* Search bar */}
                {!showForm && (
                    <View style={styles.searchRow}>
                        <Ionicons name="search" size={20} color="#9ca3af" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search by name, code, department..."
                            placeholderTextColor="#9ca3af"
                            value={searchQuery}
                            onChangeText={handleSearch}
                            clearButtonMode="while-editing"
                        />
                        {searching && <ActivityIndicator size="small" color="#2563eb" style={styles.searchSpinner} />}
                    </View>
                )}

                {/* Add button */}
                <TouchableOpacity style={styles.addButton} onPress={() => setShowForm(!showForm)}>
                    <Text style={styles.addButtonText}>
                        {showForm ? "✕ Close Form" : "+ Add New Employee"}
                    </Text>
                </TouchableOpacity>

                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>

                    {/* Create Form */}
                    {showForm && options && (
                        <CreateEmployeeForm
                            options={options}
                            onCreated={loadData}
                            onClose={() => setShowForm(false)}
                        />
                    )}

                    {/* Employee List */}
                    {!showForm && (
                        <>
                            <Text style={styles.listTitle}>
                                {searchQuery ? `Results (${filtered.length})` : `Active Employees (${filtered.length})`}
                            </Text>

                            {filtered.length === 0 ? (
                                <Text style={styles.emptyText}>
                                    {searchQuery ? "No employees match your search." : "No employees found."}
                                </Text>
                            ) : (
                                filtered.map((emp) => (
                                    <View key={emp.employeeId} style={styles.employeeCard}>
                                        <View style={styles.employeeCardHeader}>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.employeeName}>{emp.employeeName}</Text>
                                                <Text style={styles.employeeCode}>{emp.employeeCode}</Text>
                                            </View>
                                            <View style={styles.cardActions}>
                                                <TouchableOpacity
                                                    style={styles.editButton}
                                                    onPress={() => { setEditingEmployee(emp); setShowEditModal(true); }}
                                                >
                                                    <Ionicons name="pencil" size={22} color="#2563eb" />
                                                </TouchableOpacity>
                                                <AttendanceButton
                                                    emp={emp}
                                                    attendanceMap={attendanceMap}
                                                    signingId={signingId}
                                                    onPress={handleAttendance}
                                                />
                                            </View>
                                        </View>
                                        <Text style={styles.employeeDetail}>
                                            {emp.designationName} · {emp.departmentName}
                                        </Text>
                                        <Text style={styles.employeeDetail}>
                                            <Ionicons name="location" size={15} color="#2563eb" /> {emp.locationName}{"  "}
                                            <Ionicons name="time-outline" size={15} color="#2563eb" /> {emp.shiftName}
                                        </Text>
                                        {emp.mobileNo && (
                                            <Text style={styles.employeeDetail}>
                                                <Ionicons name="call" size={15} color="#2563eb" /> {emp.mobileNo}
                                            </Text>
                                        )}
                                        {!emp.isActive && <Text style={styles.inactiveBadge}>Inactive</Text>}
                                    </View>
                                ))
                            )}
                        </>
                    )}
                </ScrollView>

                {options && (
                    <EditEmployeeModal
                        employee={editingEmployee}
                        options={options}
                        visible={showEditModal}
                        onClose={() => setShowEditModal(false)}
                        onSaved={loadData}
                    />
                )}
            </View>
        </KeyboardAvoidingView>
    );
}