import { Text, TouchableOpacity, StyleSheet } from "react-native";

type Props = {
    refreshing: boolean;
    onPress: () => void;
};

/** "↻ Refresh Status" link — re-checks location + time without a full reload. */
export function RefreshStatusLink({ refreshing, onPress }: Props) {
    return (
        <TouchableOpacity style={styles.refreshButton} 
        onPress={onPress} 
        disabled={refreshing}
        activeOpacity={0.6}>
            <Text style={styles.refreshText}>
                {refreshing ? "Checking..." : "↻ Refresh Status"}
            </Text>
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
    refreshButton: {
        
        marginTop: 16,
        alignItems: "center",
    },
    refreshText: {
        color: "#2563eb",
        fontSize: 15,
        alignSelf:"center",
        fontWeight: "500",
    },
});