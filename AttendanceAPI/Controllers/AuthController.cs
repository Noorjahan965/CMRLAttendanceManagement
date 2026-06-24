using AttendanceAPI.Data;
using AttendanceAPI.DTOs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using AttendanceAPI.Models;

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

    [HttpPost("login")]
    public async Task<IActionResult> Login(
        [FromBody] LoginRequestDto request)
    {
        _logger.LogInformation(
            "Login request received for {Username}",
            request.Username);

        if (string.IsNullOrWhiteSpace(request.Username) ||
            string.IsNullOrWhiteSpace(request.Password))
        {
            _logger.LogWarning(
                "Login rejected due to missing username or password");

            return BadRequest(new
            {
                message = "Username and Password are required"
            });
        }

        _logger.LogInformation(
            "Login attempt for {Username}",
            request.Username);

        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x =>
                x.Username == request.Username &&
                x.IsActive);

        if (user == null)
        {
            _logger.LogWarning(
                "Login failed. User not found: {Username}",
                request.Username);

            return Unauthorized(new
            {
                message = "Invalid Username or Password"
            });
        }

        _logger.LogInformation(
            "User record found for {Username}",
            request.Username);

        var passwordHasher =
            new PasswordHasher<UserLogin>();

        var verificationResult =
            passwordHasher.VerifyHashedPassword(
                user,
                user.PasswordHash,
                request.Password);

        bool validPassword =
            verificationResult !=
            PasswordVerificationResult.Failed;

        if (!validPassword)
        {
            _logger.LogWarning(
                "Login failed. Invalid password for {Username}",
                request.Username);

            return Unauthorized(new
            {
                message = "Invalid Username or Password"
            });
        }

        _logger.LogInformation(
            "Password verification successful for {Username}",
            request.Username);

        var employee = await _context.Employees
            .FirstOrDefaultAsync(e =>
                e.EmployeeId == user.EmployeeId);

        if (employee == null)
        {
            _logger.LogWarning(
                "Employee record not found for {Username}",
                request.Username);

            return Unauthorized(new
            {
                message = "Employee not found"
            });
        }

        _logger.LogInformation(
            "Employee {EmployeeId} found for {Username}",
            employee.EmployeeId,
            request.Username);

        user.LastLogin = DateTime.Now;

        await _context.SaveChangesAsync();

        _logger.LogInformation(
            "Last login updated for {Username}",
            request.Username);

        string token =
            GenerateToken(user.Username);

        _logger.LogInformation(
            "JWT token generated for {Username}",
            request.Username);

        _logger.LogInformation(
            "User {Username} logged in successfully",
            request.Username);

        return Ok(new LoginResponseDto
        {
            Token = token,
            EmployeeId = employee.EmployeeId,
            EmployeeName = employee.EmployeeName,
            Username = user.Username,
            Role = user.RoleId.ToString()
        });
    }

    private string GenerateToken(string username)
    {
        _logger.LogInformation(
            "Generating JWT token for {Username}",
            username);

        var claims = new[]
        {
            new Claim(
                ClaimTypes.Name,
                username)
        };

        var key =
            new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(
                    _configuration["Jwt:Key"]!));

        var credentials =
            new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);

        var token =
            new JwtSecurityToken(
                issuer:
                    _configuration["Jwt:Issuer"],
                audience:
                    _configuration["Jwt:Audience"],
                claims: claims,
                expires:
                    DateTime.Now.AddMinutes(30),
                signingCredentials:
                    credentials);

        return new JwtSecurityTokenHandler()
            .WriteToken(token);
    }
}