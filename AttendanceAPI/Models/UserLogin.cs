using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("user_login")]
public class UserLogin
{
    [Key]
    [Column("user_id")]
    public int UserId { get; set; }

    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("username")]
    public string Username { get; set; } = string.Empty;

    [Column("password_hash")]
    public string PasswordHash { get; set; } = string.Empty;

    [Column("role_id")]
    public int RoleId { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; }

    [Column("last_login")]
    public DateTime? LastLogin { get; set; }
}