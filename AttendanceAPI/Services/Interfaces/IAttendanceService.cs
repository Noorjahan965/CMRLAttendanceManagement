using AttendanceAPI.DTOs;

namespace AttendanceAPI.Services.Interfaces;

public interface IAttendanceService
{
    Task<AttendanceValidationResponseDto>
        ValidateAttendanceAsync(
            AttendanceValidationRequestDto request);

    Task<AttendanceSignInResponseDto>
        SignInAsync(
            AttendanceSignInRequestDto request);
    
    Task<AttendanceStatusResponseDto>
    GetAttendanceStatusAsync(
        string username);
    Task<object> SignOutAsync(AttendanceSignOutRequestDto request);
    Task<AttendanceCalendarResponseDto>
    GetAttendanceCalendarAsync(
        string username,
        int year,
        int month);
   Task<List<AttendanceHistoryDto>>GetAttendanceHistoryAsync();
   Task<object> UpdateAttendanceStatusAsync(AttendanceStatusUpdateRequestDto request);
   Task<List<LowAttendanceDto>> GetLowAttendanceEmployeesAsync(string username);
   Task<List<EmployeeAttendanceSummaryDto>>
    GetAttendanceSummaryAsync(
        int year,
        int month);
    Task<List<HrTeamAttendanceStatusDto>> GetTeamAttendanceStatusAsync(string hrUsername);
Task<object> HrSignInEmployeeAsync(HrSignInRequestDto request);
Task<object> HrSignOutEmployeeAsync(HrSignOutRequestDto request);
}