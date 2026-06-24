using AttendanceAPI.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Controllers;

[Authorize]
[ApiController]
[Route("api/test")]
public class TestController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TestController(ApplicationDbContext context)
    {
        _context = context;
    }

    [HttpGet("db")]
    public async Task<IActionResult> TestDb()
    {
        var employees = await _context.Employees
            .Take(5)
            .ToListAsync();

        return Ok(employees);
    }
}