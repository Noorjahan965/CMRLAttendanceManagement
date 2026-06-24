import { Text, TouchableOpacity, StyleSheet, Alert } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native"; 
import { logoutUser } from "../../utils/storage";
import Ionicons from "react-native-vector-icons/Ionicons"; 

export function LogoutButton() {
    const navigation = useNavigation<any>(); 

    const handleLogout = () => {
        Alert.alert(
            "Logout",
            "Are you sure you want to logout?",
            [
                {
                    text: "Cancel",
                    style: "cancel",
                },
                {
                    text: "Logout",

                    style: "destructive",

                    onPress: async () => {
                        await logoutUser();

                        // CHANGED: was router.replace("/login")
                        // Using reset (not navigate/replace) so the entire stack history
                        // is wiped — user can't hit back and return to authenticated screens.
                        navigation.dispatch(
                            CommonActions.reset({
                                index: 0,
                                routes: [{ name: "Login" }],
                            })
                        );
                    },
                },
            ]
        );
    };

    return (
        <TouchableOpacity style={styles.button}
        activeOpacity={0.7}
        onPress={handleLogout}>
            <Ionicons
            name="log-out-outline"
            size={20}
            color="#ff0000"
          />
            
        </TouchableOpacity>
    );
}

const styles = StyleSheet.create({
   button: {
    width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#ffffff",
        alignItems: "center",
        justifyContent: "center",
},
    icon: {
        fontSize: 16,
        fontWeight: "700",
        color: "#eb2525",
        marginRight: 8,
    },

    
    
});