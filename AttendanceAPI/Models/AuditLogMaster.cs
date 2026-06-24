using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("audit_log")]
public class AuditLogMaster
{
    [Key]
    [Column("audit_id")]
    public int AuditId { get; set; }

    [Column("user_id")]
    public int UserId { get; set; }

    [Column("action_type")]
    public string ActionType { get; set; } = string.Empty;

    [Column("table_name")]
    public string TableName { get; set; } = string.Empty;

    [Column("record_id")]
    public int? RecordId { get; set; }

    [Column("action_description")]
    public string? ActionDescription { get; set; }

    [Column("action_time")]
    public DateTime ActionTime { get; set; }
}