import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import HistoryScreen from "../screens/HistoryScreen";
import EmployeesScreen from "../screens/HR/EmployeesScreen";
import LowAttendanceScreen from "../screens/HR/LowAttendanceScreen";
import AttendanceDetailScreen from "../screens/HR/AttendanceDetailScreen"; 
import ForgotPasswordScreen from "@/screens/ForgotPasswordScreen";
import OtpVerificationScreen from "@/screens/OtpVerificationScreen";
import ResetPasswordScreen from "@/screens/ResetPasswordScreen";


const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }} />
                <Stack.Screen
                    name="ForgotPassword"
                    component={ForgotPasswordScreen}
                    options={{ headerShown: false }}
                    />
                <Stack.Screen
                    name="OtpVerification"
                    component={OtpVerificationScreen}
                    options={{ headerShown: false }}
                    />
                    <Stack.Screen
                        name="ResetPassword"
                        component={ResetPasswordScreen}
                        options={{ headerShown: false }}
                        />
                <Stack.Screen name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }} />
                <Stack.Screen name="Attendance"
                    component={AttendanceScreen}
                    options={{ headerShown: true }} />
                <Stack.Screen name="History"
                    component={HistoryScreen}
                    options={{ headerShown: true }} />
                <Stack.Screen name="EmployeeManagement"
                    component={EmployeesScreen}
                    options={{ headerShown: true }} />
                <Stack.Screen name="LowAttendance"
                    component={LowAttendanceScreen}
                    options={{ headerShown: true, title: "Low Attendance" }} />
                <Stack.Screen name="AttendanceDetail"
                    component={AttendanceDetailScreen}
                    options={{ headerShown: true, title: "Attendance Detail" }} />

            </Stack.Navigator>
        </NavigationContainer>
    );
}