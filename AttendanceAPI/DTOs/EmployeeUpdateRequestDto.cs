using System.ComponentModel.DataAnnotations;

namespace AttendanceAPI.DTOs;

public class EmployeeUpdateRequestDto
{
    public int? CommunityId { get; set; }

    [Required]
    public int DesignationId { get; set; }

    [Required]
    public int DepartmentId { get; set; }

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

    public bool IsActive { get; set; }
}