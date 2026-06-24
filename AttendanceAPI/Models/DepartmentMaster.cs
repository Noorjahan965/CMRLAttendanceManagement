using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("department_master")]
public class DepartmentMaster
{
    [Key]
    [Column("department_id")]
    public int DepartmentId { get; set; }

    [Column("department_name")]
    public string DepartmentName { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; }
}