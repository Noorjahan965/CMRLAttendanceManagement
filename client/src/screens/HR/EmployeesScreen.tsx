import { useEffect, useState, useCallback } from "react";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";

import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Alert,
    Modal,
    KeyboardAvoidingView,
    Platform,
    RefreshControl
} from "react-native";

import { usePullToRefresh } from "../../hooks/usePullToRefresh";

import {
    getFormOptions,
    getEmployees,
    searchEmployees,
    createEmployee,
    updateEmployee,
    Employee,
    EmployeeFormOptions,
    DropdownItem,
} from "../../services/employeeService";

// Date function
function toDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

// ─── Reusable Dropdown ───────────────────────────────────────────────────────

function Dropdown({
    label,
    options,
    selectedId,
    onSelect,
    placeholder = "Select",
}: {
    label: string;
    options: DropdownItem[];
    selectedId: number | null;
    onSelect: (id: number) => void;
    placeholder?: string;
}) {
    const [open, setOpen] = useState(false);
    const selected = options.find((o) => o.id === selectedId);

    return (
        <View style={styles.fieldGroup}>
            <Text style={styles.label}>{label}</Text>
            <TouchableOpacity style={styles.dropdownButton} onPress={() => setOpen(true)}>
                <Text style={selected ? styles.dropdownText : styles.dropdownPlaceholder}>
                    {selected ? selected.name : placeholder}
                </Text>
            </TouchableOpacity>

            <Modal visible={open} transparent animationType="fade">
                <TouchableOpacity
                    style={styles.modalOverlay}
                    activeOpacity={1}
                    onPress={() => setOpen(false)}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>{label}</Text>
                        <ScrollView style={{ maxHeight: 300 }}>
                            {options.map((option) => (
                                <TouchableOpacity
                                    key={option.id}
                                    style={styles.modalOption}
                                    onPress={() => {
                                        onSelect(option.id);
                                        setOpen(false);
                                    }}
                                >
                                    <Text style={styles.modalOptionText}>{option.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </TouchableOpacity>
            </Modal>
        </View>
    );
}

// ─── Edit Modal ───────────────────────────────────────────────────────────────

function EditEmployeeModal({
    employee,
    options,
    visible,
    onClose,
    onSaved,
}: {
    employee: Employee | null;
    options: EmployeeFormOptions;
    visible: boolean;
    onClose: () => void;
    onSaved: () => void;
}) {
    const [submitting, setSubmitting] = useState(false);

    // Editable fields only (Code / Name / Gender are locked)
    const [communityId, setCommunityId] = useState<number | null>(null);
    const [designationId, setDesignationId] = useState<number | null>(null);
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number | null>(null);
    const [shiftId, setShiftId] = useState<number | null>(null);
    const [mobileNo, setMobileNo] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [isActive, setIsActive] = useState(true);

    // Pre-fill form whenever the selected employee changes
    useEffect(() => {
        if (!employee) return;
        setCommunityId(employee.communityId);
        setDesignationId(employee.designationId);
        setDepartmentId(employee.departmentId);
        setLocationId(employee.locationId);
        setShiftId(employee.shiftId);
        setMobileNo(employee.mobileNo ?? "");
        setEmail(employee.email ?? "");
        setAddress(employee.address ?? "");
        setIsActive(employee.isActive);
    }, [employee]);

    const handleUpdate = async () => {
        if (!employee) return;
        if (!designationId) return Alert.alert("Missing Field", "Please select Designation");
        if (!departmentId) return Alert.alert("Missing Field", "Please select Department");
        if (!locationId) return Alert.alert("Missing Field", "Please select Location");
        if (!shiftId) return Alert.alert("Missing Field", "Please select Shift");

        if (mobileNo && (mobileNo.length !== 10 || !/^\d+$/.test(mobileNo))) {
            return Alert.alert("Invalid Mobile", "Mobile number must be exactly 10 digits");
        }

        try {
            setSubmitting(true);
            await updateEmployee(employee.employeeId, {
                communityId,
                designationId: designationId!,
                departmentId: departmentId!,
                locationId: locationId!,
                shiftId: shiftId!,
                mobileNo,
                email,
                address,
                joiningDate: employee.joiningDate,
                isActive,
            });
            Alert.alert("Success ✓", "Employee updated successfully");
            onSaved();
            onClose();
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to update employee";
            Alert.alert("Error", msg);
        } finally {
            setSubmitting(false);
        }
    };

    if (!employee) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.editModalOverlay}>
                <View style={styles.editModalSheet}>
                    {/* Sheet header */}
                    <View style={styles.editModalHeader}>
                        <View>
                            <Text style={styles.editModalTitle}>{employee.employeeName}</Text>
                            <Text style={styles.editModalSubtitle}>
                                {employee.employeeCode} · {employee.genderName}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                            <Text style={styles.closeBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <ScrollView
                        keyboardShouldPersistTaps="handled"
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={{
                            paddingBottom: 120,
                        }}
                    >
                        {/* Locked fields shown as read-only info */}
                        <View style={styles.lockedBanner}>
                            <Text style={styles.lockedBannerText}>
                                🔒 Code, Name and Gender cannot be changed after creation
                            </Text>
                        </View>

                        <Dropdown
                            label="Community"
                            options={options.communities}
                            selectedId={communityId}
                            onSelect={setCommunityId}
                            placeholder="Select (optional)"
                        />
                        <Dropdown
                            label="Designation *"
                            options={options.designations}
                            selectedId={designationId}
                            onSelect={setDesignationId}
                        />
                        <Dropdown
                            label="Department *"
                            options={options.departments}
                            selectedId={departmentId}
                            onSelect={setDepartmentId}
                        />
                        <Dropdown
                            label="Location *"
                            options={options.locations}
                            selectedId={locationId}
                            onSelect={setLocationId}
                        />
                        <Dropdown
                            label="Shift *"
                            options={options.shifts}
                            selectedId={shiftId}
                            onSelect={setShiftId}
                        />

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Mobile Number</Text>
                            <TextInput
                                style={styles.input}
                                value={mobileNo}
                                onChangeText={setMobileNo}
                                placeholder="10 digit number"
                                keyboardType="number-pad"
                                maxLength={10}
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                value={email}
                                onChangeText={setEmail}
                                placeholder="email@example.com"
                                keyboardType="email-address"
                                autoCapitalize="none"
                            />
                        </View>

                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={address}
                                onChangeText={setAddress}
                                placeholder="Communication address"
                                multiline
                                numberOfLines={3}
                            />
                        </View>

                        {/* Active toggle */}
                        <View style={styles.toggleRow}>
                            <Text style={styles.label}>Active Status</Text>
                            <TouchableOpacity
                                style={[
                                    styles.toggleButton,
                                    isActive ? styles.toggleOn : styles.toggleOff,
                                ]}
                                onPress={() => setIsActive(!isActive)}
                            >
                                <Text style={styles.toggleText}>
                                    {isActive ? "Active" : "Inactive"}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleUpdate}
                            disabled={submitting}
                        >
                            {submitting ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.submitButtonText}>Save Changes</Text>
                            )}
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}

// ─── Main Screen ──────────────────────────────────────────────────────────────

export default function EmployeesScreen() {
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const [employees, setEmployees] = useState<Employee[]>([]);
    const [filtered, setFiltered] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [searching, setSearching] = useState(false);

    const [options, setOptions] = useState<EmployeeFormOptions | null>(null);

    // Edit modal state
    const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);

    // Create form state
    const [employeeCode, setEmployeeCode] = useState("");
    const [employeeName, setEmployeeName] = useState("");
    const [genderId, setGenderId] = useState<number | null>(null);
    const [communityId, setCommunityId] = useState<number | null>(null);
    const [designationId, setDesignationId] = useState<number | null>(null);
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number | null>(null);
    const [shiftId, setShiftId] = useState<number | null>(null);
    const [mobileNo, setMobileNo] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [roleId, setRoleId] = useState<number | null>(null);
    const [joiningDate, setJoiningDate] = useState<Date | null>(null);
    const [showDatePicker, setShowDatePicker] = useState(false);

    const loadData = useCallback(async () => {
        try {
            setLoading(true);
            const [employeeList, formOptions] = await Promise.all([
                getEmployees(),
                getFormOptions(),
            ]);
            setEmployees(employeeList);
            setFiltered(employeeList);
            setOptions(formOptions);
        } catch (error) {
            console.log("Load error:", error);
            Alert.alert("Error", "Failed to load employee data");
        } finally {
            setLoading(false);
        }
    }, []);

    const { refreshing, onRefresh } = usePullToRefresh(loadData);

    useEffect(() => {
        loadData();
    }, [loadData]);

    // Search — calls API if keyword present, resets to full list if cleared
    const handleSearch = useCallback(async (text: string) => {
        setSearchQuery(text);
        if (!text.trim()) {
            setFiltered(employees);
            return;
        }
        try {
            setSearching(true);
            const results = await searchEmployees(text.trim());
            setFiltered(results);
        } catch {
            // Fall back to client-side filter if API fails
            const lower = text.toLowerCase();
            setFiltered(
                employees.filter(
                    (e) =>
                        e.employeeName.toLowerCase().includes(lower) ||
                        e.employeeCode.toLowerCase().includes(lower) ||
                        e.designationName?.toLowerCase().includes(lower) ||
                        e.departmentName?.toLowerCase().includes(lower)
                )
            );
        } finally {
            setSearching(false);
        }
    }, [employees]);

    const resetForm = () => {
        setEmployeeCode(""); setEmployeeName(""); setGenderId(null);
        setCommunityId(null); setDesignationId(null); setDepartmentId(null);
        setLocationId(null); setShiftId(null); setMobileNo("");
        setEmail(""); setAddress(""); setUsername(""); setPassword(""); setRoleId(null); setJoiningDate(null);
    };

    const handleCreate = async () => {
        if (!employeeCode.trim()) return Alert.alert("Missing Field", "Employee Code is required");
        if (!employeeName.trim()) return Alert.alert("Missing Field", "Employee Name is required");
        if (!genderId) return Alert.alert("Missing Field", "Please select Gender");
        if (!designationId) return Alert.alert("Missing Field", "Please select Designation");
        if (!departmentId) return Alert.alert("Missing Field", "Please select Department");
        if (!locationId) return Alert.alert("Missing Field", "Please select Location");
        if (!shiftId) return Alert.alert("Missing Field", "Please select Shift");
        if (!username.trim()) return Alert.alert("Missing Field", "Username is required");
        if (!password.trim()) return Alert.alert("Missing Field", "Password is required");
        if (password.trim().length < 8)
            return Alert.alert("Invalid Password", "Password must be at least 8 characters");
        if (!roleId) return Alert.alert("Missing Field", "Please select Role");
        if (mobileNo && (mobileNo.length !== 10 || !/^\d+$/.test(mobileNo)))
            return Alert.alert("Invalid Mobile", "Mobile number must be exactly 10 digits");

        try {
            setSubmitting(true);
            const result = await createEmployee({
                employeeCode: employeeCode.trim(),
                employeeName: employeeName.trim(),
                genderId: genderId!,
                communityId,
                designationId: designationId!,
                departmentId: departmentId!,
                locationId: locationId!,
                shiftId: shiftId!,
                mobileNo, email, address,
                joiningDate: joiningDate ? toDateOnly(joiningDate) : null,
                username: username.trim(),
                password,
                roleId: roleId!,
            });


            Alert.alert("Success ✓", result.message || "Employee created successfully");
            resetForm();
            setShowForm(false);
            loadData();
        } catch (error: any) {
            console.log("CREATE ERROR:", error);
            console.log("CREATE ERROR STATUS:", error?.response?.status);
            console.log("CREATE ERROR DATA:", error?.response?.data);
            console.log("CREATE ERROR MESSAGE:", error?.message);
            const msg = error?.response?.data?.message || "Failed to create employee";
            Alert.alert("Error", `${msg}\n\nDEBUG: ${error?.message}`);
        } finally {
            setSubmitting(false);
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
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
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
                        {searching && (
                            <ActivityIndicator
                                size="small"
                                color="#2563eb"
                                style={styles.searchSpinner}
                            />
                        )}
                    </View>

                )}

                {/* Add button */}
                <TouchableOpacity
                    style={styles.addButton}
                    onPress={() => setShowForm(!showForm)}
                >
                    <Text style={styles.addButtonText}>
                        {showForm ? "✕ Close Form" : "+ Add New Employee"}
                    </Text>
                </TouchableOpacity>

                <ScrollView contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                        />
                    }>
                    {/* ── Create Form ── */}
                    {showForm && options && (
                        <View style={styles.formCard}>
                            <Text style={styles.formTitle}>New Employee Details</Text>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Employee Code *</Text>
                                <TextInput style={styles.input} value={employeeCode}
                                    onChangeText={setEmployeeCode} placeholder="e.g. EMP011"
                                    autoCapitalize="characters" placeholderTextColor="#9ca3af" />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Employee Name *</Text>
                                <TextInput style={styles.input} value={employeeName}
                                    onChangeText={setEmployeeName} placeholder="Full name" placeholderTextColor="#9ca3af" />
                            </View>

                            <Dropdown label="Gender *" options={options.genders}
                                selectedId={genderId} onSelect={setGenderId} />
                            <Dropdown label="Community" options={options.communities}
                                selectedId={communityId} onSelect={setCommunityId}
                                placeholder="Select (optional)" />
                            <Dropdown label="Designation *" options={options.designations}
                                selectedId={designationId} onSelect={setDesignationId} />
                            <Dropdown label="Department *" options={options.departments}
                                selectedId={departmentId} onSelect={setDepartmentId} />
                            <Dropdown label="Location *" options={options.locations}
                                selectedId={locationId} onSelect={setLocationId} />
                            <Dropdown label="Shift *" options={options.shifts}
                                selectedId={shiftId} onSelect={setShiftId} />

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Mobile Number</Text>
                                <TextInput style={styles.input} value={mobileNo}
                                    onChangeText={setMobileNo} placeholder="10 digit number"
                                    keyboardType="number-pad" maxLength={10} placeholderTextColor="#9ca3af" />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Email</Text>
                                <TextInput style={styles.input} value={email}
                                    onChangeText={setEmail} placeholder="email@example.com"
                                    keyboardType="email-address" autoCapitalize="none" placeholderTextColor="#9ca3af" />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Address</Text>
                                <TextInput style={[styles.input, styles.textArea]} value={address}
                                    onChangeText={setAddress} placeholder="Communication address"
                                    multiline numberOfLines={3} placeholderTextColor="#9ca3af" />
                            </View>

                            {/* Joining Date */}
                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Joining Date</Text>
                                <TouchableOpacity
                                    style={styles.input}
                                    onPress={() => setShowDatePicker(true)}
                                >
                                    <Text style={{
                                        fontSize: 15,
                                        color: joiningDate ? "#111827" : "#9ca3af"
                                    }}>
                                        {joiningDate ? toDateOnly(joiningDate) : "Select joining date (optional)"}
                                    </Text>
                                </TouchableOpacity>
                                {showDatePicker && (
                                    <DateTimePicker
                                        value={joiningDate ?? new Date()}
                                        mode="date"
                                        display="default"
                                        maximumDate={new Date()}
                                        onChange={(event, selectedDate) => {
                                            setShowDatePicker(false);
                                            if (event.type === "set" && selectedDate) {
                                                setJoiningDate(selectedDate);
                                            }
                                        }}
                                    />
                                )}
                            </View>


                            <Text style={styles.sectionDivider}>Login Details</Text>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Username *</Text>
                                <TextInput style={styles.input} value={username}
                                    onChangeText={setUsername} placeholder="Login username"
                                    autoCapitalize="none" placeholderTextColor="#9ca3af" />
                            </View>

                            <View style={styles.fieldGroup}>
                                <Text style={styles.label}>Password *</Text>

                                <View style={styles.passwordContainer}>
                                    <TextInput
                                        style={styles.passwordInput}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Login password"
                                        secureTextEntry={!showPassword}
                                        placeholderTextColor="#9ca3af"
                                    />

                                    <TouchableOpacity
                                        onPress={() => setShowPassword(!showPassword)}
                                    >
                                        <Ionicons
                                            name={showPassword ? "eye-off-outline" : "eye-outline"}
                                            size={22}
                                            color="#6b7280"
                                        />
                                    </TouchableOpacity>
                                </View>
                            </View>

                            <Dropdown label="Role *" options={options.roles}
                                selectedId={roleId} onSelect={setRoleId} />

                            <TouchableOpacity style={styles.submitButton}
                                onPress={handleCreate} disabled={submitting}>
                                {submitting
                                    ? <ActivityIndicator color="#fff" />
                                    : <Text style={styles.submitButtonText}>Create Employee</Text>
                                }
                            </TouchableOpacity>
                        </View>
                    )}
                    {!showForm && (
                        <>
                            {/* ── Employee List ── */}
                            <Text style={styles.listTitle}>
                                {searchQuery
                                    ? `Results (${filtered.length})`
                                    : `Active Employees (${filtered.length})`}
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
                                            {/* Edit button */}
                                            <TouchableOpacity
                                                style={styles.editButton}
                                                onPress={() => {
                                                    setEditingEmployee(emp);
                                                    setShowEditModal(true);
                                                }}
                                            >
                                                <Ionicons name="pencil" size={26} color="#2563eb" />
                                            </TouchableOpacity>
                                        </View>

                                        <Text style={styles.employeeDetail}>
                                            {emp.designationName} · {emp.departmentName}
                                        </Text>
                                        <Text style={styles.employeeDetail}>
                                            <Ionicons name="location" size={15} color="#2563eb" /> {emp.locationName}  <Ionicons name="time-outline" size={15} color="#2563eb" /> {emp.shiftName}
                                        </Text>
                                        {emp.mobileNo && (
                                            <Text style={styles.employeeDetail}><Ionicons name="call" size={15} color="#2563eb" /> {emp.mobileNo}</Text>
                                        )}
                                        {!emp.isActive && (
                                            <Text style={styles.inactiveBadge}>Inactive</Text>
                                        )}
                                    </View>
                                ))
                            )}
                        </>
                    )}
                </ScrollView>

                {/* Edit Modal — rendered once, fed the selected employee */}
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

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    screen: { flex: 1, backgroundColor: "#f9fafb", paddingTop: 50, paddingHorizontal: 16 },
    centered: { flex: 1, justifyContent: "center", alignItems: "center" },
    loadingText: { marginTop: 12, color: "#6b7280" },

    header: { marginBottom: 12 },
    backButton: { color: "#2563eb", fontSize: 15, marginBottom: 8 },
    headerTitle: { fontSize: 22, fontWeight: "bold", color: "#111827" },

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
    searchInput: { flex: 1, fontSize: 15, color: "#111827" },
    searchSpinner: { marginLeft: 8 },

    addButton: { backgroundColor: "#2563eb", padding: 14, borderRadius: 8, marginBottom: 16 },
    addButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold", fontSize: 15 },

    formCard: { backgroundColor: "#fff", borderRadius: 10, padding: 16, marginBottom: 24, elevation: 2 },
    formTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 16, color: "#111827" },
    sectionDivider: {
        fontSize: 14, fontWeight: "600", color: "#2563eb",
        marginTop: 8, marginBottom: 8,
        borderTopWidth: 1, borderTopColor: "#e5e7eb", paddingTop: 16,
    },

    fieldGroup: { marginBottom: 14 },
    label: { fontSize: 13, color: "#374151", marginBottom: 6, fontWeight: "600" },
    input: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, fontSize: 15, backgroundColor: "#fff", color: "#111827" },
    textArea: { height: 70, textAlignVertical: "top" },

    dropdownButton: { borderWidth: 1, borderColor: "#d1d5db", borderRadius: 8, padding: 12, backgroundColor: "#fff" },
    dropdownText: { fontSize: 15, color: "#111827" },
    dropdownPlaceholder: { fontSize: 15, color: "#9ca3af" },

    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 },
    modalContent: { backgroundColor: "#fff", borderRadius: 12, padding: 16, maxHeight: "70%" },
    modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 12, color: "#111827" },
    modalOption: { paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
    modalOptionText: { fontSize: 15, color: "#374151" },

    submitButton: { backgroundColor: "#16a34a", padding: 16, borderRadius: 8, marginTop: 10, alignItems: "center" },
    submitButtonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

    listTitle: { fontSize: 16, fontWeight: "bold", color: "#374151", marginBottom: 12 },
    emptyText: { color: "#9ca3af", textAlign: "center", marginTop: 20 },

    employeeCard: { backgroundColor: "#fff", borderRadius: 10, padding: 14, marginBottom: 10, elevation: 1 },
    employeeCardHeader: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4 },
    employeeName: { fontSize: 16, fontWeight: "bold", color: "#111827" },
    employeeCode: { fontSize: 13, color: "#6b7280", fontWeight: "600", marginTop: 2 },
    employeeDetail: { fontSize: 13, color: "#6b7280", marginTop: 2 },
    inactiveBadge: {
        marginTop: 6, alignSelf: "flex-start",
        backgroundColor: "#fee2e2", color: "#dc2626",
        fontSize: 11, fontWeight: "600",
        paddingHorizontal: 8, paddingVertical: 2, borderRadius: 4,
    },

    editButton: {
        backgroundColor: "#ffffff", borderWidth: 1, borderColor: "#ffffff",
        borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5, marginLeft: 8,
    },
    editButtonText: { color: "#2563eb", fontSize: 13, fontWeight: "600" },

    // Edit modal sheet
    editModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
    editModalSheet: {
        backgroundColor: "#fff", borderTopLeftRadius: 20, borderTopRightRadius: 20,
        padding: 20, maxHeight: "90%",
    },
    editModalHeader: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "flex-start", marginBottom: 16,
    },
    editModalTitle: { fontSize: 18, fontWeight: "bold", color: "#111827" },
    editModalSubtitle: { fontSize: 13, color: "#6b7280", marginTop: 2 },
    closeBtn: { padding: 4 },
    closeBtnText: { fontSize: 18, color: "#6b7280" },

    lockedBanner: {
        backgroundColor: "#fef9c3", borderRadius: 8,
        padding: 10, marginBottom: 16,
    },
    lockedBannerText: { fontSize: 12, color: "#92400e" },

    toggleRow: {
        flexDirection: "row", justifyContent: "space-between",
        alignItems: "center", marginBottom: 14,
    },
    toggleButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
    toggleOn: { backgroundColor: "#16a34a" },
    toggleOff: { backgroundColor: "#9ca3af" },
    toggleText: { color: "#fff", fontWeight: "600", fontSize: 13 },
    passwordContainer: {
        flexDirection: "row",
        alignItems: "center",
        borderWidth: 1,
        borderColor: "#d1d5db",
        borderRadius: 8,
        backgroundColor: "#fff",
        paddingHorizontal: 12,
    },

    passwordInput: {
        flex: 1,
        fontSize: 15,
        paddingVertical: 12,
        color: "#111827",
    },
});