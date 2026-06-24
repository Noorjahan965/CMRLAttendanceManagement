using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.DTOs;

public class LoginRequestDto
{
    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    public string Password { get; set; } = string.Empty;
}