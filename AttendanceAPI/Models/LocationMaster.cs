using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace AttendanceAPI.Models;

[Table("location_master")]
public class LocationMaster
{
    [Key]
    [Column("location_id")]
    public int LocationId { get; set; }

    [Column("location_name")]
    public string? LocationName { get; set; }

    [Column("latitude")]
    public decimal Latitude { get; set; }

    [Column("longitude")]
    public decimal Longitude { get; set; }

    [Column("radius")]
    public int Radius { get; set; }

    [Column("is_active")]
public bool IsActive { get; set; }
}