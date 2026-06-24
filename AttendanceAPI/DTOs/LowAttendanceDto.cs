public class LowAttendanceDto
{
    public int EmployeeId { get; set; }

    public string EmployeeCode { get; set; } = string.Empty;

    public string EmployeeName { get; set; } = string.Empty;

    public string Username { get; set; } = string.Empty;
    public string Role { get; set; } = string.Empty;

    public decimal AttendancePercentage { get; set; }

    public int PresentDays { get; set; }

    public int HalfDays { get; set; }

    public int AbsentDays { get; set; }
}