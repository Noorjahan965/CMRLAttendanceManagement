using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("attendance_master")]
public class AttendanceMaster
{
    [Key]
    [Column("attendance_id")]
    public int AttendanceId { get; set; }

    [Column("employee_id")]
    public int EmployeeId { get; set; }

    [Column("attendance_date")]
    public DateTime AttendanceDate { get; set; }

    [Column("sign_in_time")]
    public DateTime? SignInTime { get; set; }

    [Column("sign_out_time")]
    public DateTime? SignOutTime { get; set; }

    [Column("sign_in_latitude")]
    public decimal? SignInLatitude { get; set; }

    [Column("sign_in_longitude")]
    public decimal? SignInLongitude { get; set; }

    [Column("sign_out_latitude")]
    public decimal? SignOutLatitude { get; set; }

    [Column("sign_out_longitude")]
    public decimal? SignOutLongitude { get; set; }

    [Column("attendance_status")]
    public string AttendanceStatus { get; set; } = "Half Day";

    [Column("remarks")]
    public string? Remarks { get; set; }

    [ForeignKey("EmployeeId")]
    public EmployeeMaster? Employee { get; set; }

}