using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace AttendanceAPI.Models
{
    [Table("shift_master")]
public class ShiftMaster
{
    [Key]
    [Column("shift_id")]
    public int ShiftId { get; set; }

    [Column("shift_code")]
    public string? ShiftCode { get; set; }

    [Column("shift_name")]
    public string? ShiftName { get; set; }

    [Column("start_time")]
    public TimeSpan StartTime { get; set; }

    [Column("end_time")]
    public TimeSpan EndTime { get; set; }
    [Column("is_active")]
public bool IsActive { get; set; }
}
}