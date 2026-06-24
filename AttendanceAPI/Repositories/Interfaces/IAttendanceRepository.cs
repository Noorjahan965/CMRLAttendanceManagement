using AttendanceAPI.Models;
using AttendanceAPI.DTOs;

namespace AttendanceAPI.Repositories.Interfaces;

public interface IAttendanceRepository
{
    Task<EmployeeMaster?> GetEmployeeByUsernameAsync(
        string username);

    Task<AttendanceMaster?> GetTodayAttendanceAsync(
        int employeeId);

    Task<AttendanceMaster> CreateAttendanceAsync(
        AttendanceMaster attendance);

    Task<List<AttendanceMaster>>
        GetPendingSignOutRecords();

    Task<List<AttendanceMaster>>
        GetMonthlyAttendanceAsync(
            int employeeId,
            int year,
            int month);

  

    Task<AttendanceMaster?>
        GetAttendanceByDateAsync(
            int employeeId,
            DateTime attendanceDate);

    Task SaveAsync();
    Task<List<LowAttendanceDto>> GetLowAttendanceEmployeesAsync(string username);
    Task<List<AttendanceMaster>>GetAttendanceHistoryAsync();
    Task<List<AttendanceMaster>>
    GetAttendanceHistoryAsync(
        int year,
        int month);
}