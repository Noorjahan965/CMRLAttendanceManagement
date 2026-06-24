using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.DTOs;

public class EmployeeCreateRequestDto
{
    [Required]
    [MaxLength(20)]
    public string EmployeeCode { get; set; } = string.Empty;

    [Required]
    [MaxLength(100)]
    public string EmployeeName { get; set; } = string.Empty;

    [Required]
    public int GenderId { get; set; }

    public int? CommunityId { get; set; }
    public int? DesignationId { get; set; }
    public int? DepartmentId { get; set; }

    [Required]
    public int LocationId { get; set; }

    [Required]
    public int ShiftId { get; set; }

    [RegularExpression(@"^\d{10}$", ErrorMessage = "Mobile number must be exactly 10 digits")]
    public string? MobileNo { get; set; }

    [RegularExpression(@"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$",
        ErrorMessage = "Invalid email format")]
    [MaxLength(100)]
    public string? Email { get; set; }

    [MaxLength(255)]
    public string? Address { get; set; }

    public DateOnly? JoiningDate { get; set; }

    [Required]
    [MaxLength(50)]
    public string Username { get; set; } = string.Empty;

    [Required]
    [MinLength(8, ErrorMessage = "Password must be at least 8 characters")]
    public string Password { get; set; } = string.Empty;

    public int RoleId { get; set; } = 4;
}

public class EmployeeResponseDto
{
    public int EmployeeId { get; set; }
    public string? EmployeeCode { get; set; }
    public string? EmployeeName { get; set; }
    public string? GenderName { get; set; }
    public string? CommunityName { get; set; }
    public string? DesignationName { get; set; }
    public string? DepartmentName { get; set; }
    public string? LocationName { get; set; }
    public string? ShiftName { get; set; }
    public string? MobileNo { get; set; }
    public string? Email { get; set; }
    public string? Address { get; set; }
    public DateOnly? JoiningDate { get; set; }
    public bool IsActive { get; set; }
    public string? Username { get; set; }
}