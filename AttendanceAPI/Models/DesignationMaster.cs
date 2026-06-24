using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("designation_master")]
public class DesignationMaster
{
    [Key]
    [Column("designation_id")]
    public int DesignationId { get; set; }

    [Column("designation_name")]
    public string DesignationName { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; }
}