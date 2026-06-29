using AttendanceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Mvc;
using AttendanceAPI.DTOs;
using Microsoft.AspNetCore.RateLimiting;
namespace AttendanceAPI.Controllers;
using Microsoft.AspNetCore.Authorization;

[EnableRateLimiting("global")]
[Authorize(Roles = "HR")]
[ApiController]
[Route("api/[controller]")]
public class EmployeeController : ControllerBase
{
    private readonly IEmployeeService _service;
    private readonly ILogger<EmployeeController> _logger;
    public EmployeeController(
    IEmployeeService service,
    ILogger<EmployeeController> logger)
{
    _service = service;
    _logger = logger;
}

    [HttpGet("form-options")]
    public async Task<IActionResult>
        GetFormOptions()
    {   _logger.LogInformation(
        "Employee form options requested");
        var result =
            await _service.GetFormOptionsAsync();

        return Ok(result);
    }

    [HttpPut("{employeeId}")]
public async Task<IActionResult>
    UpdateEmployee(
        int employeeId,
        EmployeeUpdateRequestDto request)
{    _logger.LogInformation(
        "Update employee request received for EmployeeId {EmployeeId}",employeeId);
    var updated =
        await _service.UpdateEmployeeAsync(
            employeeId,
            request);

    if (!updated)
    {   _logger.LogWarning(
            "Employee update failed. EmployeeId {EmployeeId} not found",
            employeeId);

        return NotFound(
            "Employee not found");
    }
     _logger.LogInformation(
        "Employee {EmployeeId} updated successfully",
        employeeId);
    return Ok(
        new
        {
            success = true,
            message = "Employee updated successfully"
        });
}

   [HttpGet]
public async Task<IActionResult> GetEmployees(
    [FromQuery] string username)
{
    _logger.LogInformation(
        "Employee list requested by {Username}",
        username);

    var employees = await _service
        .GetActiveEmployeesAsync(username);

    _logger.LogInformation(
        "{Count} employees returned for {Username}",
        employees.Count,
        username);

    return Ok(employees);
}

    [HttpPost]
    public async Task<IActionResult> CreateEmployee([FromBody] EmployeeCreateRequestDto request)
    {   _logger.LogInformation(
        "Employee creation request received for EmployeeCode {EmployeeCode}",
        request.EmployeeCode);
        if (string.IsNullOrWhiteSpace(request.EmployeeCode) ||
            string.IsNullOrWhiteSpace(request.EmployeeName) ||
            string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {    _logger.LogWarning(
            "Employee creation rejected due to missing required fields");
            {
            return BadRequest(new { message = "EmployeeCode, EmployeeName, Username and Password are required" });
            }
        }


        var (success, message, employee) = await _service.CreateEmployeeAsync(request);

        if (!success)
        {
            _logger.LogWarning(
            "Employee creation failed for EmployeeCode {EmployeeCode}. Reason: {Message}",
            request.EmployeeCode,
            message);
            return Conflict(new { message });
        }
            
         _logger.LogInformation(
        "Employee {EmployeeCode} created successfully",
        request.EmployeeCode);
        return Ok(new { message, employee });
    }

    [HttpGet("search")]
public async Task<IActionResult>
    SearchEmployees(
        [FromQuery] string keyword)
{
    _logger.LogInformation(
        "Employee search requested with keyword '{Keyword}'",
        keyword);

    var employees =
        await _service.SearchEmployeesAsync(
            keyword);

    _logger.LogInformation(
        "Employee search returned {Count} records",
        employees.Count);

    return Ok(employees);
}
}



