using AttendanceAPI.Data;
using AttendanceAPI.DTOs;
using AttendanceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AttendanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly ILogger<AuthController> _logger;

    public AuthController(
        ApplicationDbContext context,
        IConfiguration configuration,
        ILogger<AuthController> logger)
    {
        _context = context;
        _configuration = configuration;
        _logger = logger;
    }

    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Username and Password are required" });

        _logger.LogInformation("Login attempt for {Username}", request.Username);

        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.Username == request.Username && x.IsActive);

        if (user == null)
        {
            _logger.LogWarning("Login failed. User not found: {Username}", request.Username);
            return Unauthorized(new { message = "Invalid Username or Password" });
        }

        var passwordHasher = new PasswordHasher<UserLogin>();
        var verificationResult = passwordHasher.VerifyHashedPassword(
            user, user.PasswordHash, request.Password);

        bool validPassword = verificationResult != PasswordVerificationResult.Failed;
        if (!validPassword)
        {
            _logger.LogWarning("Login failed. Invalid password for {Username}", request.Username);
            return Unauthorized(new { message = "Invalid Username or Password" });
        }

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e => e.EmployeeId == user.EmployeeId);
        if (employee == null)
            return Unauthorized(new { message = "Employee not found" });

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleId == user.RoleId);
        if (role == null)
            return Unauthorized(new { message = "Role not found" });

        user.LastLogin = DateTime.Now;

        var refreshToken = Guid.NewGuid().ToString();
        user.RefreshToken = refreshToken;
        user.RefreshTokenExpiry = DateTime.Now.AddDays(7);

        await _context.SaveChangesAsync();

        _logger.LogInformation("User {Username} logged in successfully", request.Username);

        string token = GenerateToken(user.Username, role.RoleName);

        return Ok(new LoginResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            EmployeeId = employee.EmployeeId,
            EmployeeName = employee.EmployeeName!,
            Username = user.Username,
            Role = user.RoleId.ToString()
        });
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenRequestDto request)
    {
        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.RefreshToken == request.RefreshToken && x.IsActive);

        if (user == null || user.RefreshTokenExpiry < DateTime.Now)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleId == user.RoleId);
        if (role == null)
            return Unauthorized(new { message = "Role not found" });

        var newRefreshToken = Guid.NewGuid().ToString();
        user.RefreshToken = newRefreshToken;
        user.RefreshTokenExpiry = DateTime.Now.AddDays(7);
        await _context.SaveChangesAsync();

        string newToken = GenerateToken(user.Username, role.RoleName);

        return Ok(new
        {
            token = newToken,
            refreshToken = newRefreshToken
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.Identity?.Name;
        if (username == null)
            return Unauthorized();

        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.Username == username);

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _context.SaveChangesAsync();
        }

        return Ok(new { message = "Logged out successfully" });
    }

    private string GenerateToken(string username, string role)
    {
        var claims = new[]
        {
            new Claim(ClaimTypes.Name, username),
            new Claim(ClaimTypes.Role, role)
        };

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));

        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddHours(1),
            signingCredentials: credentials);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }
}