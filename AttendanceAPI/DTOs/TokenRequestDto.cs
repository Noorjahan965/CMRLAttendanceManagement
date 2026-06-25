namespace AttendanceAPI.DTOs;

public class TokenRequestDto
{
    // "password" for login, "refresh_token" for refresh
    public string GrantType { get; set; } = string.Empty;

    // Required when GrantType = "password"
    public string? Username { get; set; }
    public string? Password { get; set; }

    // Required when GrantType = "refresh_token"
    public string? RefreshToken { get; set; }
}