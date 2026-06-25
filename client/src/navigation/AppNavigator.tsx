import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";

import LoginScreen from "../screens/LoginScreen";
import HomeScreen from "../screens/HomeScreen";
import AttendanceScreen from "../screens/AttendanceScreen";
import HistoryScreen from "../screens/HistoryScreen";
import EmployeesScreen from "../screens/HR/EmployeesScreen"; 

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
    return (
        <NavigationContainer>
            <Stack.Navigator initialRouteName="Login">
                <Stack.Screen name="Login"
                component={LoginScreen}
                options= {{ headerShown: false}} />
                <Stack.Screen name="Home"
                component={HomeScreen}
                options= {{ headerShown: false}} />
                <Stack.Screen name="Attendance"
                component={AttendanceScreen}
                options= {{ headerShown: true}} />
                <Stack.Screen name="History"
                component={HistoryScreen}
                options= {{ headerShown: true}} />
                <Stack.Screen name="EmployeeManagement"
                component={EmployeesScreen}
                options= {{ headerShown: true}} />
            </Stack.Navigator>
        </NavigationContainer>
    )
}