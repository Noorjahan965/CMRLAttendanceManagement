using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("gender_master")]
public class GenderMaster
{
    [Key]
    [Column("gender_id")]
    public int GenderId { get; set; }

    [Column("gender_name")]
    public string GenderName { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; }
}