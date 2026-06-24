namespace AttendanceAPI.DTOs;

public class EmployeeAttendanceSummaryDto
{
    public int EmployeeId { get; set; }

    public string EmployeeName { get; set; } = string.Empty;

    public int Month { get; set; }

    public int Year { get; set; }

    public decimal AttendancePercentage { get; set; }

    public int PresentDays { get; set; }

    public int HalfDays { get; set; }

    public int AbsentDays { get; set; }

    public List<string> AbsentDates { get; set; } = new();

    public List<string> HalfDayDates { get; set; } = new();
}