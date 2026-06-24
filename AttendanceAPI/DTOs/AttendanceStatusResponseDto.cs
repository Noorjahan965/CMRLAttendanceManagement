namespace AttendanceAPI.DTOs;

public class AttendanceStatusResponseDto
{
    public bool HasSignedIn { get; set; }
    public bool HasSignedOut { get; set; }

    public bool CanSignIn { get; set; }
    public bool CanSignOut { get; set; }

    public string ShiftStartTime { get; set; } = string.Empty;
    public string ShiftEndTime { get; set; } = string.Empty;

    public string SignOutWindowStart { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;

    public int? AttendanceId { get; set; }
}