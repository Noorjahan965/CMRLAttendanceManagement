using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace AttendanceAPI.DTOs;

public class AttendanceSignInResponseDto
{
    public bool Success { get; set; }
    
    public int? AttendanceId { get; set; }

    public bool HasSignedIn { get; set; }

    public bool HasSignedOut { get; set; }

    public string Message { get; set; } = string.Empty;

}