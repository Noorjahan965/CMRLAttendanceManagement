using AttendanceAPI.DTOs;
using AttendanceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AttendanceAPI.Controllers;

[EnableRateLimiting("global")]
[Authorize]
[ApiController]
[Route("api/[controller]")]
public class AttendanceController : ControllerBase
{
    private readonly IAttendanceService _service;

    public AttendanceController(IAttendanceService service)
    {
        _service = service;
    }

    [HttpPost("validate")]
    public async Task<ActionResult> ValidateAttendance(AttendanceValidationRequestDto request)
    {
        var result = await _service.ValidateAttendanceAsync(request);
        return Ok(result);
    }

    [HttpPost("signin")]
    public async Task<ActionResult> SignIn(AttendanceSignInRequestDto request)
    {
        var result = await _service.SignInAsync(request);
        return Ok(result);
    }

    [HttpGet("status")]
    public async Task<ActionResult> GetAttendanceStatus(string username)
    {
        var result = await _service.GetAttendanceStatusAsync(username);
        return Ok(result);
    }

    [HttpPost("signout")]
    public async Task<IActionResult> SignOut([FromBody] AttendanceSignOutRequestDto request)
    {
        var result = await _service.SignOutAsync(request);
        return Ok(result);
    }

    [HttpGet("calendar")]
    public async Task<ActionResult> GetAttendanceCalendar(string username, int year, int month)
    {
        var result = await _service.GetAttendanceCalendarAsync(username, year, month);
        return Ok(result);
    }

    [Authorize(Roles = "HR")]
    [HttpGet("hr/history")]
    public async Task<ActionResult> GetAttendanceHistory()
    {
        var result = await _service.GetAttendanceHistoryAsync();
        return Ok(result);
    }

    [Authorize(Roles = "HR")]
    [HttpPut("hr/attendance-status")]
    public async Task<IActionResult> UpdateAttendanceStatus(AttendanceStatusUpdateRequestDto request)
    {
        var result = await _service.UpdateAttendanceStatusAsync(request);
        return Ok(result);
    }

    [Authorize(Roles = "HR")]
    [HttpGet("low-attendance")]
    public async Task<IActionResult> GetLowAttendanceEmployees(string username)
    {
        var result = await _service.GetLowAttendanceEmployeesAsync(username);
        return Ok(result);
    }

    [Authorize(Roles = "HR")]
    [HttpGet("hr/attendance-summary")]
    public async Task<IActionResult> GetAttendanceSummary(int year, int month)
    {
        var result = await _service.GetAttendanceSummaryAsync(year, month);
        return Ok(result);
    }
}