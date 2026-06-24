using AttendanceAPI.DTOs;
using AttendanceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;

namespace AttendanceAPI.Controllers;

[EnableRateLimiting("global")]
[Authorize(Roles = "HR")]
[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _service;

    public EmployeeController(IEmployeeService service)
    {
        _service = service;
    }

    [HttpGet("form-options")]
    public async Task<IActionResult> GetFormOptions()
    {
        var result = await _service.GetFormOptionsAsync();
        return Ok(result);
    }

    [HttpPut("{employeeId}")]
    public async Task<IActionResult> UpdateEmployee(int employeeId, EmployeeUpdateRequestDto request)
    {
        var updated = await _service.UpdateEmployeeAsync(employeeId, request);
        if (!updated)
            return NotFound("Employee not found");

        return Ok(new { success = true, message = "Employee updated successfully" });
    }

    [HttpGet]
    public async Task<IActionResult> GetEmployees()
    {
        var employees = await _service.GetActiveEmployeesAsync();
        return Ok(employees);
    }

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] EmployeeCreateRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.EmployeeCode) ||
            string.IsNullOrWhiteSpace(request.EmployeeName) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "EmployeeCode, EmployeeName, Username and Password are required" });

        var (success, message, employee) = await _service.CreateEmployeeAsync(request);
        if (!success)
            return Conflict(new { message });

        return Ok(new { message, employee });
    }

    [HttpGet("search")]
    public async Task<IActionResult> SearchEmployees([FromQuery] string keyword)
    {
        var employees = await _service.SearchEmployeesAsync(keyword);
        return Ok(employees);
    }
}