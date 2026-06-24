namespace AttendanceAPI.DTOs;

public class AttendanceSignOutRequestDto
{
    public string Username { get; set; } = string.Empty;
    public double Latitude { get; set; }
    public double Longitude { get; set; }

    public DateTime CurrentTime { get; set; }
}