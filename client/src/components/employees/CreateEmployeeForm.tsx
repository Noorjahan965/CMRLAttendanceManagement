import { useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    ScrollView, ActivityIndicator, Alert
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePicker from "@react-native-community/datetimepicker";
import { EmployeeFormOptions, createEmployee } from "../../services/employeeService";
import { EmployeeDropdown } from "./EmployeeDropdown";
import { styles } from "./employeeStyles";

function toDateOnly(date: Date): string {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
}

export function CreateEmployeeForm({
    options,
    onCreated,
    onClose,
}: {
    options: EmployeeFormOptions;
    onCreated: () => void;
    onClose: () => void;
}) {
    const [submitting, setSubmitting] = useState(false);
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

    const resetForm = () => {
        setEmployeeCode(""); setEmployeeName(""); setGenderId(null);
        setCommunityId(null); setDesignationId(null); setDepartmentId(null);
        setLocationId(null); setShiftId(null); setMobileNo("");
        setEmail(""); setAddress(""); setUsername("");
        setPassword(""); setRoleId(null); setJoiningDate(null);
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
                communityId, designationId: designationId!,
                departmentId: departmentId!, locationId: locationId!,
                shiftId: shiftId!, mobileNo, email, address,
                joiningDate: joiningDate ? toDateOnly(joiningDate) : null,
                username: username.trim(), password, roleId: roleId!,
            });
            Alert.alert("Success ✓", result.message || "Employee created successfully");
            resetForm();
            onCreated();
            onClose();
        } catch (error: any) {
            const msg = error?.response?.data?.message || "Failed to create employee";
            Alert.alert("Error", msg);
        } finally {
            setSubmitting(false);
        }
    };

    return (
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
                    onChangeText={setEmployeeName} placeholder="Full name"
                    placeholderTextColor="#9ca3af" />
            </View>

            <EmployeeDropdown label="Gender *" options={options.genders}
                selectedId={genderId} onSelect={setGenderId} />
            <EmployeeDropdown label="Community" options={options.communities}
                selectedId={communityId} onSelect={setCommunityId} placeholder="Select (optional)" />
            <EmployeeDropdown label="Designation *" options={options.designations}
                selectedId={designationId} onSelect={setDesignationId} />
            <EmployeeDropdown label="Department *" options={options.departments}
                selectedId={departmentId} onSelect={setDepartmentId} />
            <EmployeeDropdown label="Location *" options={options.locations}
                selectedId={locationId} onSelect={setLocationId} />
            <EmployeeDropdown label="Shift *" options={options.shifts}
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
                    keyboardType="email-address" autoCapitalize="none"
                    placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Address</Text>
                <TextInput style={[styles.input, styles.textArea]} value={address}
                    onChangeText={setAddress} placeholder="Communication address"
                    multiline numberOfLines={3} placeholderTextColor="#9ca3af" />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Joining Date</Text>
                <TouchableOpacity style={styles.input} onPress={() => setShowDatePicker(true)}>
                    <Text style={{ fontSize: 15, color: joiningDate ? "#111827" : "#9ca3af" }}>
                        {joiningDate ? toDateOnly(joiningDate) : "Select joining date (optional)"}
                    </Text>
                </TouchableOpacity>
                {showDatePicker && (
                    <DateTimePicker
                        value={joiningDate ?? new Date()}
                        mode="date" display="default"
                        maximumDate={new Date()}
                        onChange={(event, selectedDate) => {
                            setShowDatePicker(false);
                            if (event.type === "set" && selectedDate) setJoiningDate(selectedDate);
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
                    <TextInput style={styles.passwordInput} value={password}
                        onChangeText={setPassword} placeholder="Login password"
                        secureTextEntry={!showPassword} placeholderTextColor="#9ca3af" />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                        <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"}
                            size={22} color="#6b7280" />
                    </TouchableOpacity>
                </View>
            </View>

            <EmployeeDropdown label="Role *" options={options.roles}
                selectedId={roleId} onSelect={setRoleId} />

            <TouchableOpacity style={styles.submitButton} onPress={handleCreate} disabled={submitting}>
                {submitting
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={styles.submitButtonText}>Create Employee</Text>
                }
            </TouchableOpacity>
        </View>
    );
}