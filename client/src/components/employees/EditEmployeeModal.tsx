import { useEffect, useState } from "react";
import {
    View, Text, TextInput, TouchableOpacity,
    Modal, ScrollView, ActivityIndicator, Alert
} from "react-native";
import { Employee, EmployeeFormOptions, updateEmployee } from "../../services/employeeService";
import { EmployeeDropdown } from "./EmployeeDropdown";
import { styles } from "./employeeStyles";

export function EditEmployeeModal({
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
    const [communityId, setCommunityId] = useState<number | null>(null);
    const [designationId, setDesignationId] = useState<number | null>(null);
    const [departmentId, setDepartmentId] = useState<number | null>(null);
    const [locationId, setLocationId] = useState<number | null>(null);
    const [shiftId, setShiftId] = useState<number | null>(null);
    const [mobileNo, setMobileNo] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [isActive, setIsActive] = useState(true);

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
        if (mobileNo && (mobileNo.length !== 10 || !/^\d+$/.test(mobileNo)))
            return Alert.alert("Invalid Mobile", "Mobile number must be exactly 10 digits");

        try {
            setSubmitting(true);
            await updateEmployee(employee.employeeId, {
                communityId, designationId: designationId!, departmentId: departmentId!,
                locationId: locationId!, shiftId: shiftId!,
                mobileNo, email, address,
                joiningDate: employee.joiningDate, isActive,
            });
            Alert.alert("Success ✓", "Employee updated successfully");
            onSaved();
            onClose();
        } catch (error: any) {
            Alert.alert("Error", error?.response?.data?.message || "Failed to update employee");
        } finally {
            setSubmitting(false);
        }
    };

    if (!employee) return null;

    return (
        <Modal visible={visible} animationType="slide" transparent>
            <View style={styles.editModalOverlay}>
                <View style={styles.editModalSheet}>
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

                    <ScrollView keyboardShouldPersistTaps="handled" showsVerticalScrollIndicator={false}
                        contentContainerStyle={{ paddingBottom: 120 }}>
                        <View style={styles.lockedBanner}>
                            <Text style={styles.lockedBannerText}>
                                🔒 Code, Name and Gender cannot be changed after creation
                            </Text>
                        </View>

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
                            <TextInput style={styles.input} value={mobileNo} onChangeText={setMobileNo}
                                placeholder="10 digit number" keyboardType="number-pad"
                                maxLength={10} placeholderTextColor="#9ca3af" />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput style={styles.input} value={email} onChangeText={setEmail}
                                placeholder="email@example.com" keyboardType="email-address"
                                autoCapitalize="none" placeholderTextColor="#9ca3af" />
                        </View>
                        <View style={styles.fieldGroup}>
                            <Text style={styles.label}>Address</Text>
                            <TextInput style={[styles.input, styles.textArea]} value={address}
                                onChangeText={setAddress} placeholder="Communication address"
                                multiline numberOfLines={3} placeholderTextColor="#9ca3af" />
                        </View>

                        <View style={styles.toggleRow}>
                            <Text style={styles.label}>Active Status</Text>
                            <TouchableOpacity
                                style={[styles.toggleButton, isActive ? styles.toggleOn : styles.toggleOff]}
                                onPress={() => setIsActive(!isActive)}
                            >
                                <Text style={styles.toggleText}>{isActive ? "Active" : "Inactive"}</Text>
                            </TouchableOpacity>
                        </View>

                        <TouchableOpacity style={styles.submitButton} onPress={handleUpdate} disabled={submitting}>
                            {submitting
                                ? <ActivityIndicator color="#fff" />
                                : <Text style={styles.submitButtonText}>Save Changes</Text>
                            }
                        </TouchableOpacity>
                    </ScrollView>
                </View>
            </View>
        </Modal>
    );
}