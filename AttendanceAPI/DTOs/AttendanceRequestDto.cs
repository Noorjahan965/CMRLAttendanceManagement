using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AttendanceAPI.DTOs;

public class AttendanceSignInRequestDto
{
    public string Username { get; set; } = string.Empty;

    public double Latitude { get; set; }

    public double Longitude { get; set; }

    public DateTime CurrentTime { get; set; }
}