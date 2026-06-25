using AttendanceAPI.DTOs;
using AttendanceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;

namespace AttendanceAPI.Controllers;
[EnableRateLimiting("global")]
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;
    private readonly ILogger<AttendanceController> _logger;

    public AttendanceController(
        IAttendanceService service,
        ILogger<AttendanceController> logger)
    {
        _service = service;
        _logger = logger;
    }

    [HttpPost("validate")]
    public async Task<ActionResult>
        ValidateAttendance(
            AttendanceValidationRequestDto request)
    {
        _logger.LogInformation(
            "Attendance validation requested for {Username}",
            request.Username);

        var result =
            await _service.ValidateAttendanceAsync(
                request);

        _logger.LogInformation(
            "Attendance validation completed for {Username}",
            request.Username);

        return Ok(result);
    }

    [HttpPost("signin")]
    public async Task<ActionResult>
        SignIn(
            AttendanceSignInRequestDto request)
    {
        _logger.LogInformation(
            "Sign in requested for {Username}",
            request.Username);

        var result =
            await _service.SignInAsync(request);

        _logger.LogInformation(
            "Sign in completed for {Username}",
            request.Username);

        return Ok(result);
    }

    [HttpGet("status")]
    public async Task<ActionResult>
        GetAttendanceStatus(
            string username)
    {
        _logger.LogInformation(
            "Attendance status requested for {Username}",
            username);

        var result =
            await _service
                .GetAttendanceStatusAsync(
                    username);

        return Ok(result);
    }

    [HttpPost("signout")]
    public async Task<IActionResult> SignOut(
        [FromBody] AttendanceSignOutRequestDto request)
    {
        _logger.LogInformation(
            "Sign out requested for {Username}",
            request.Username);

        var result =
            await _service.SignOutAsync(request);

        _logger.LogInformation(
            "Sign out completed for {Username}",
            request.Username);

        return Ok(result);
    }

    [HttpGet("calendar")]
    public async Task<ActionResult>
        GetAttendanceCalendar(
            string username,
            int year,
            int month)
    {
        _logger.LogInformation(
            "Attendance calendar requested for {Username} Year:{Year} Month:{Month}",
            username,
            year,
            month);

        var result =
            await _service.GetAttendanceCalendarAsync(
                username,
                year,
                month);

        return Ok(result);
    }
    
    [Authorize(Roles = "HR")]
    [HttpGet("hr/history")]
    public async Task<ActionResult>
        GetAttendanceHistory()
    {
        _logger.LogInformation(
            "HR requested attendance history");

        var result =
            await _service
                .GetAttendanceHistoryAsync();

        return Ok(result);
    }
    
    [Authorize(Roles = "HR")]
    [HttpPut("hr/attendance-status")]
    public async Task<IActionResult>
        UpdateAttendanceStatus(
            AttendanceStatusUpdateRequestDto request)
    {
        _logger.LogInformation(
            "Attendance status update requested for EmployeeCode:{EmployeeCode}",
            request.EmployeeCode);

        var result =
            await _service
                .UpdateAttendanceStatusAsync(
                    request);

        _logger.LogInformation(
            "Attendance status update completed for EmployeeCode:{EmployeeCode}",
            request.EmployeeCode);

        return Ok(result);
    }
    
    [Authorize(Roles = "HR")]
    [HttpGet("low-attendance")]
    public async Task<IActionResult>
        GetLowAttendanceEmployees(
            string username)
    {
        _logger.LogInformation(
            "Low attendance report requested by {Username}",
            username);

        var result =
            await _service
                .GetLowAttendanceEmployeesAsync(
                    username);

        return Ok(result);
    }
    
    [Authorize(Roles = "HR")]
    [HttpGet("hr/attendance-summary")]
    public async Task<IActionResult>
        GetAttendanceSummary(
            int year,
            int month)
    {
        _logger.LogInformation(
            "Attendance summary requested for Year:{Year} Month:{Month}",
            year,
            month);

        var result =
            await _service
                .GetAttendanceSummaryAsync(
                    year,
                    month);

        return Ok(result);
    }
    [Authorize(Roles = "HR")]
[HttpGet("hr/team-attendance-status")]
public async Task<IActionResult>
GetTeamAttendanceStatus([FromQuery] string hrUsername)
{
    _logger.LogInformation(
        "HR {HrUsername} requested team attendance status list",
        hrUsername);

    var result = await _service
        .GetTeamAttendanceStatusAsync(hrUsername);

    return Ok(result);
}

[Authorize(Roles = "HR")]
[HttpPost("hr/sign-in-employee")]
public async Task<IActionResult>
HrSignInEmployee([FromBody] HrSignInRequestDto request)
{
    _logger.LogInformation(
        "HR {HrUsername} signing in employee {EmployeeUsername}",
        request.HrUsername,
        request.EmployeeUsername);

    var result = await _service
        .HrSignInEmployeeAsync(request);

    return Ok(result);
}

[Authorize(Roles = "HR")]
[HttpPost("hr/sign-out-employee")]
public async Task<IActionResult>
HrSignOutEmployee([FromBody] HrSignOutRequestDto request)
{
    _logger.LogInformation(
        "HR {HrUsername} signing out employee {EmployeeUsername}",
        request.HrUsername,
        request.EmployeeUsername);

    var result = await _service
        .HrSignOutEmployeeAsync(request);

    return Ok(result);
}
}