using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AttendanceAPI.DTOs
{
public class AttendanceValidationRequestDto
{
    public string Username { get; set; } = "";

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public DateTime CurrentTime { get; set; }
}
}