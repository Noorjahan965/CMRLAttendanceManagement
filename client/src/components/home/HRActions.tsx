import { Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export function HRActions() {
  const navigation = useNavigation<any>();
  const today = new Date();
  const isLowAttendanceEnabled = today.getDate() >= 27;

  return (
    <>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#2563eb' }]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('EmployeeManagement')}
      >
        <Ionicons name="people-outline" size={22} color="#ffffff" />

        <Text style={styles.buttonText}>Employee Management</Text>

        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: isLowAttendanceEnabled ? '#e14747' : '#bdbdbd',
          },
        ]}
        disabled={!isLowAttendanceEnabled}
        onPress={() => {
          if (!isLowAttendanceEnabled) {
            Alert.alert(
              'Unavailable',
              'The Low Attendance List is available only from the 27th until the end of each month.',
            );
            return;
          }

          navigation.navigate('LowAttendance');
        }}
      >
        <Ionicons name="warning-outline" size={22} color="#ffffff" />

        <Text style={styles.buttonText}>Low Attendance List</Text>

        <Text style={styles.arrow}>→</Text>
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 14,
  },

  buttonText: {
    flex: 1,
    color: '#fff',
    fontWeight: '700',
    fontSize: 16,
    marginLeft: 12,
  },

  arrow: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
});
