using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("community_master")]
public class CommunityMaster
{
    [Key]
    [Column("community_id")]
    public int CommunityId { get; set; }

    [Column("community_name")]
    public string CommunityName { get; set; } = string.Empty;

    [Column("is_active")]
    public bool IsActive { get; set; }
}