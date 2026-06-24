using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AttendanceAPI.DTOs;

public class AttendanceValidationResponseDto
{
    public bool CanMarkAttendance { get; set; }

    public bool IsWithinRadius { get; set; }

    public bool IsWithinTimeWindow { get; set; }

    public double DistanceInMeters { get; set; }

    public int AllowedRadius { get; set; }

    public string ShiftStartTime { get; set; } = string.Empty;

     public string ShiftEndTime { get; set; } = string.Empty;

    public string TimeWindowStart { get; set; } = string.Empty;

    public string TimeWindowEnd { get; set; } = string.Empty;

    public string Message { get; set; } = string.Empty;
   
}