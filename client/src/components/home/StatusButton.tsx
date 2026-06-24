import { Text, TouchableOpacity, StyleSheet } from "react-native";
import { useNavigation } from "@react-navigation/native"; 
import type { AttendanceStatus } from "../../hooks/useAttendanceStatus";

type Props = {
    status: AttendanceStatus;
};

type ButtonConfig = {
    label: string;
    enabled: boolean;
    color: string;
};

function getButtonConfig(status: AttendanceStatus): ButtonConfig {
    if (status.hasSignedOut) {
        return { label: "Attendance Done ✓", enabled: false, color: "#16a34a" };
    }
    if (status.hasSignedIn) {
        return {
            label: "Sign Out",
            enabled: status.canSignOut,
            color: status.canSignOut ? "#f97316" : "#9ca3af",
        };
    }
    return {
        label: "Sign In",
        enabled: status.canSignIn,
        color: status.canSignIn ? "#2563eb" : "#9ca3af",
    };
}

function getDisabledReason(status: AttendanceStatus): string | null {
    if (status.hasSignedOut) return null;
    if (status.hasSignedIn && !status.canSignOut)
        return `Sign-out opens at ${status.signOutWindowStart}`;
    if (!status.hasSignedIn && !status.canSignIn)
        return status.message || "Outside location or shift timing";
    return null;
}

/**
 * The single sign-in / sign-out / done button, plus the reason text
 * shown underneath when it's disabled. Pure presentation — all the
 * state logic lives in useAttendanceStatus.
 */
export function StatusButton({ status }: Props) {
    const config = getButtonConfig(status);
    const disabledReason = getDisabledReason(status);
    const navigation = useNavigation<any>(); 

    return (
        <>
            <TouchableOpacity
                style={[
                    styles.button,
                    { backgroundColor: config.color },
                    !config.enabled && styles.buttonDisabledShadow,
                ]}
                activeOpacity={0.85}
                disabled={!config.enabled}
                onPress={() =>
                    
                    navigation.navigate("Attendance", {
                        mode: status.hasSignedIn ? "signout" : "signin",
                    })
                }
            >
                <Text style={styles.buttonText}>{config.label}</Text>
            </TouchableOpacity>

            {disabledReason && (
                <Text style={styles.disabledReason}>{disabledReason}</Text>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    button: {
        paddingVertical: 18,
        borderRadius: 30,
        alignSelf: "center",
        justifyContent: "center",
        shadowColor: "#2563eb",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        width: 200,
        elevation: 3,
    },
    buttonDisabledShadow: {
        shadowOpacity: 0,
        elevation: 0,
    },
    buttonText: {
        color: "#fff",
        textAlign: "center",
        fontWeight: "700",
        fontSize: 20,
    },
    disabledReason: {
        color: "#dc2626",
        fontSize: 15,
        fontWeight: "700",
        textAlign: "center",
    },
});