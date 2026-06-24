public class AttendanceStatusUpdateRequestDto
{
    public string EmployeeCode { get; set; } = string.Empty;
    public string Username { get; set; } = string.Empty;

    public DateTime AttendanceDate { get; set; }

    public string NewStatus { get; set; } = string.Empty;

    public string? Remarks { get; set; }
}