namespace AttendanceAPI.DTOs;

public class HrTeamAttendanceStatusDto
{
    public int EmployeeId { get; set; }
    public string EmployeeCode { get; set; } = string.Empty;
    public string EmployeeName { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;
    public string ShiftStartTime { get; set; } = string.Empty;
    public string ShiftEndTime { get; set; } = string.Empty;
    public bool HasSignedIn { get; set; }
    public bool HasSignedOut { get; set; }
    public DateTime? SignInTime { get; set; }
    public DateTime? SignOutTime { get; set; }
    public string AttendanceStatus { get; set; } = string.Empty;
    public int? AttendanceId { get; set; }
}

public class HrSignInRequestDto
{
    public string HrUsername { get; set; } = string.Empty;
    public string EmployeeUsername { get; set; } = string.Empty;
}

public class HrSignOutRequestDto
{
    public string HrUsername { get; set; } = string.Empty;
    public string EmployeeUsername { get; set; } = string.Empty;
}