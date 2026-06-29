import { useState } from "react";
import { View, Text, TouchableOpacity, Modal, ScrollView } from "react-native";
import { DropdownItem } from "../../services/employeeService";
import { styles } from "./employeeStyles";

export function EmployeeDropdown({
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
                                    onPress={() => { onSelect(option.id); setOpen(false); }}
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