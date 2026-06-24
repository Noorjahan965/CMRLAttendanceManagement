namespace AttendanceAPI.DTOs;

public class AttendanceHistoryDto
{
    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public DateTime AttendanceDate { get; set; }

    public string AttendanceStatus { get; set; } = string.Empty;

    public DateTime? SignInTime { get; set; }

    public DateTime? SignOutTime { get; set; }
}