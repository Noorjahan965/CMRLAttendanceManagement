using AttendanceAPI.Data;
using AttendanceAPI.DTOs;
using AttendanceAPI.Models;
using AttendanceAPI.Services;
using AttendanceAPI.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITokenService _tokenService;
    private readonly ILogger<AuthController> _logger;
    private readonly DataProtectionService _dataProtection;
    private readonly EmailService _emailService;

    public AuthController(
        ApplicationDbContext context,
        ITokenService tokenService,
        ILogger<AuthController> logger,
        DataProtectionService dataProtection,
        EmailService emailService)
    {
        _context = context;
        _tokenService = tokenService;
        _logger = logger;
        _dataProtection = dataProtection;
        _emailService = emailService;
    }

    [EnableRateLimiting("login")]
    [HttpPost("login")]
    public async Task<IActionResult> Token([FromBody] TokenRequestDto request)
    {
        return request.GrantType switch
        {
            "password"      => await HandleLogin(request),
            "refresh_token" => await HandleRefresh(request),
            _               => BadRequest(new { message = "Invalid grant_type. Use 'password' or 'refresh_token'" })
        };
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout()
    {
        var username = User.Identity?.Name;
        if (username == null) return Unauthorized();

        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.Username == username);

        if (user != null)
        {
            user.RefreshToken = null;
            user.RefreshTokenExpiry = null;
            await _context.SaveChangesAsync();
        }

        _logger.LogInformation("User {Username} logged out", username);
        return Ok(new { message = "Logged out successfully" });
    }

    [EnableRateLimiting("login")]
    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email))
            return BadRequest(new { message = "Email is required" });

        var employees = await _context.Employees.ToListAsync();
        EmployeeMaster? matchedEmployee = null;

        foreach (var emp in employees)
        {
            if (string.IsNullOrEmpty(emp.Email)) continue;
            var decrypted = _dataProtection.Decrypt(emp.Email);
            if (decrypted.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
            {
                matchedEmployee = emp;
                break;
            }
        }

        if (matchedEmployee == null)
            return NotFound(new { message = "No account found with this email" });

        var userLogin = await _context.UserLogins
            .FirstOrDefaultAsync(u => u.EmployeeId == matchedEmployee.EmployeeId && u.IsActive);

        if (userLogin == null)
            return NotFound(new { message = "No active account found with this email" });

        var otp = new Random().Next(100000, 999999).ToString();
        userLogin.OtpCode = otp;
        userLogin.OtpExpiry = DateTime.Now.AddMinutes(10);
        await _context.SaveChangesAsync();

        await _emailService.SendOtpAsync(request.Email, otp);

        _logger.LogInformation("OTP sent to {Email}", request.Email);
        return Ok(new { message = "OTP sent to your email" });
    }

    [EnableRateLimiting("login")]
    [HttpPost("verify-otp")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Otp))
            return BadRequest(new { message = "Email and OTP are required" });

        var employees = await _context.Employees.ToListAsync();
        EmployeeMaster? matchedEmployee = null;

        foreach (var emp in employees)
        {
            if (string.IsNullOrEmpty(emp.Email)) continue;
            var decrypted = _dataProtection.Decrypt(emp.Email);
            if (decrypted.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
            {
                matchedEmployee = emp;
                break;
            }
        }

        if (matchedEmployee == null)
            return NotFound(new { message = "No account found with this email" });

        var userLogin = await _context.UserLogins
            .FirstOrDefaultAsync(u => u.EmployeeId == matchedEmployee.EmployeeId && u.IsActive);

        if (userLogin == null || userLogin.OtpCode != request.Otp || userLogin.OtpExpiry < DateTime.Now)
            return BadRequest(new { message = "Invalid or expired OTP" });

        return Ok(new { message = "OTP verified" });
    }

    [EnableRateLimiting("login")]
    [HttpPost("reset-password")]
    public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) ||
            string.IsNullOrWhiteSpace(request.Otp) ||
            string.IsNullOrWhiteSpace(request.NewPassword))
            return BadRequest(new { message = "Email, OTP and NewPassword are required" });

        var employees = await _context.Employees.ToListAsync();
        EmployeeMaster? matchedEmployee = null;

        foreach (var emp in employees)
        {
            if (string.IsNullOrEmpty(emp.Email)) continue;
            var decrypted = _dataProtection.Decrypt(emp.Email);
            if (decrypted.Equals(request.Email, StringComparison.OrdinalIgnoreCase))
            {
                matchedEmployee = emp;
                break;
            }
        }

        if (matchedEmployee == null)
            return NotFound(new { message = "No account found with this email" });

        var userLogin = await _context.UserLogins
            .FirstOrDefaultAsync(u => u.EmployeeId == matchedEmployee.EmployeeId && u.IsActive);

        if (userLogin == null || userLogin.OtpCode != request.Otp || userLogin.OtpExpiry < DateTime.Now)
            return BadRequest(new { message = "Invalid or expired OTP" });

        var hasher = new PasswordHasher<UserLogin>();
        userLogin.PasswordHash = hasher.HashPassword(userLogin, request.NewPassword);
        userLogin.OtpCode = null;
        userLogin.OtpExpiry = null;
        await _context.SaveChangesAsync();

        _logger.LogInformation("Password reset for {Email}", request.Email);
        return Ok(new { message = "Password reset successfully" });
    }

    private async Task<IActionResult> HandleLogin(TokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Username) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Username and Password are required" });

        _logger.LogInformation("Login attempt for {Username}", request.Username);

        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.Username == request.Username && x.IsActive);

        if (user == null)
        {
            _logger.LogWarning("Login failed. User not found: {Username}", request.Username);
            return Unauthorized(new { message = "Invalid Username or Password" });
        }

        var hasher = new PasswordHasher<UserLogin>();
        var result = hasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);

        if (result == PasswordVerificationResult.Failed)
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
        user.RefreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.Now.AddDays(7);
        await _context.SaveChangesAsync();

        _logger.LogInformation("User {Username} logged in successfully", request.Username);

        return Ok(new LoginResponseDto
        {
            Token        = _tokenService.GenerateAccessToken(user.Username, role.RoleName),
            RefreshToken = user.RefreshToken,
            EmployeeId   = employee.EmployeeId,
            EmployeeName = employee.EmployeeName!,
            Username     = user.Username,
            Role         = role.RoleName
        });
    }

    private async Task<IActionResult> HandleRefresh(TokenRequestDto request)
    {
        if (string.IsNullOrWhiteSpace(request.RefreshToken))
            return BadRequest(new { message = "RefreshToken is required" });

        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.RefreshToken == request.RefreshToken && x.IsActive);

        if (user == null || user.RefreshTokenExpiry < DateTime.Now)
            return Unauthorized(new { message = "Invalid or expired refresh token" });

        var role = await _context.Roles
            .FirstOrDefaultAsync(r => r.RoleId == user.RoleId);
        if (role == null)
            return Unauthorized(new { message = "Role not found" });

        user.RefreshToken = _tokenService.GenerateRefreshToken();
        user.RefreshTokenExpiry = DateTime.Now.AddDays(7);
        await _context.SaveChangesAsync();

        _logger.LogInformation("Token refreshed for {Username}", user.Username);

        return Ok(new LoginResponseDto
        {
            Token        = _tokenService.GenerateAccessToken(user.Username, role.RoleName),
            RefreshToken = user.RefreshToken,
            EmployeeId   = user.EmployeeId,
            EmployeeName = "",
            Username     = user.Username,
            Role         = role.RoleName
        });
    }
}