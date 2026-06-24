namespace AttendanceAPI.DTOs;

public class AttendanceCalendarResponseDto
{
    public string Username { get; set; } = string.Empty;

    public int Year { get; set; }

    public int Month { get; set; }

    public List<AttendanceCalendarDayDto> Days { get; set; }
        = new();
}