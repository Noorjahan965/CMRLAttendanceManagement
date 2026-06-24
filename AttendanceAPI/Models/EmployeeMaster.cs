using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("employee_master")]
public class EmployeeMaster
{
    [Key]
    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("employee_code")]
    public string? EmployeeCode { get; set; }

    [Column("employee_name")]
    public string? EmployeeName { get; set; }

    [Column("gender_id")]
    public int? GenderId { get; set; }

    [Column("community_id")]
    public int? CommunityId { get; set; }

    [Column("designation_id")]
    public int? DesignationId { get; set; }

    [Column("department_id")]
    public int? DepartmentId { get; set; }

    [Column("location_id")]
    public int LocationId { get; set; }

    [Column("shift_id")]
    public int ShiftId { get; set; }

    [Column("mobile_no")]
    public string? MobileNo { get; set; }

    [Column("email")]
    public string? Email { get; set; }

    [Column("address")]
    public string? Address { get; set; }

    [Column("joining_date")]
    public DateOnly? JoiningDate { get; set; }

    [Column("is_active")]
    public bool IsActive { get; set; } = true;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.Now;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.Now;

    [ForeignKey(nameof(GenderId))]
    public GenderMaster? Gender { get; set; }

    [ForeignKey(nameof(CommunityId))]
    public CommunityMaster? Community { get; set; }

    [ForeignKey(nameof(DesignationId))]
    public DesignationMaster? Designation { get; set; }

    [ForeignKey(nameof(DepartmentId))]
    public DepartmentMaster? Department { get; set; }

    [ForeignKey(nameof(LocationId))]
    public LocationMaster? Location { get; set; }

    [ForeignKey(nameof(ShiftId))]
    public ShiftMaster? Shift { get; set; }
}