using AttendanceAPI.DTOs;
using AttendanceAPI.Repositories.Interfaces;
using AttendanceAPI.Services.Interfaces;
using AttendanceAPI.Models;
using Microsoft.AspNetCore.Identity;

namespace AttendanceAPI.Services;

public class EmployeeService : IEmployeeService
{
    private readonly IEmployeeRepository _repository;
    private readonly IAuditLogService _auditLogService;
    private readonly DataProtectionService _dataProtection;

    public EmployeeService(
        IEmployeeRepository repository,
        IAuditLogService auditLogService,
        DataProtectionService dataProtection)
    {
        _repository = repository;
        _auditLogService = auditLogService;
        _dataProtection = dataProtection;
    }

    public async Task<EmployeeFormOptionsDto> GetFormOptionsAsync()
    {
        return await _repository.GetFormOptionsAsync();
    }

    public async Task<bool> UpdateEmployeeAsync(int employeeId, EmployeeUpdateRequestDto request)
    {
        var employee = await _repository.GetEmployeeByIdAsync(employeeId);
        if (employee == null) return false;

        employee.CommunityId   = request.CommunityId;
        employee.DesignationId = request.DesignationId;
        employee.DepartmentId  = request.DepartmentId;
        employee.LocationId    = request.LocationId;
        employee.ShiftId       = request.ShiftId;
        employee.MobileNo      = string.IsNullOrWhiteSpace(request.MobileNo) ? null : _dataProtection.Encrypt(request.MobileNo);
        employee.Email         = string.IsNullOrWhiteSpace(request.Email) ? null : _dataProtection.Encrypt(request.Email);
        employee.Address       = string.IsNullOrWhiteSpace(request.Address) ? null : _dataProtection.Encrypt(request.Address);
        employee.JoiningDate   = request.JoiningDate;
        employee.IsActive      = request.IsActive;

        await _repository.SaveAsync();
        return true;
    }

    public async Task<List<EmployeeResponseDto>> GetActiveEmployeesAsync(string username)
    {
        var roleId = await _repository.GetRoleIdByUsernameAsync(username);
        var employees = await _repository.GetActiveEmployeesAsync(roleId ?? 4);
        return employees.Select(MapToDto).ToList();
    }

    public async Task<List<EmployeeResponseDto>> GetEmployeesByCodeAsync(string employeeCode)
    {
        var employees = await _repository.GetEmployeesByCodeAsync(employeeCode);
        return employees.Select(MapToDto).ToList();
    }

    public async Task<(bool Success, string Message, EmployeeResponseDto? Employee)>
        CreateEmployeeAsync(EmployeeCreateRequestDto request)
    {
        if (await _repository.EmployeeCodeExistsAsync(request.EmployeeCode))
            return (false, $"Employee code '{request.EmployeeCode}' already exists", null);

        if (await _repository.UsernameExistsAsync(request.Username))
            return (false, $"Username '{request.Username}' already exists", null);

        var employee = new EmployeeMaster
        {
            EmployeeCode  = request.EmployeeCode,
            EmployeeName  = request.EmployeeName,
            GenderId      = request.GenderId,
            CommunityId   = request.CommunityId,
            DesignationId = request.DesignationId,
            DepartmentId  = request.DepartmentId,
            LocationId    = request.LocationId,
            ShiftId       = request.ShiftId,
            MobileNo      = string.IsNullOrWhiteSpace(request.MobileNo) ? null : _dataProtection.Encrypt(request.MobileNo),
            Email         = string.IsNullOrWhiteSpace(request.Email) ? null : _dataProtection.Encrypt(request.Email),
            Address       = string.IsNullOrWhiteSpace(request.Address) ? null : _dataProtection.Encrypt(request.Address),
            JoiningDate   = request.JoiningDate,
            IsActive      = true,
            CreatedAt     = DateTime.Now,
            UpdatedAt     = DateTime.Now
        };

        var created = await _repository.CreateEmployeeAsync(employee);

        var passwordHasher = new PasswordHasher<UserLogin>();
        var login = new UserLogin
        {
            EmployeeId = created.EmployeeId,
            Username   = request.Username,
            RoleId     = request.RoleId,
            IsActive   = true
        };
        login.PasswordHash = passwordHasher.HashPassword(login, request.Password);

        await _repository.CreateUserLoginAsync(login);

        await _auditLogService.LogAsync(
            login.UserId,
            "INSERT",
            "employee_master",
            created.EmployeeId,
            $"Employee {created.EmployeeCode} created"
        );

        var dto = MapToDto(created);
        dto.Username = login.Username;
        return (true, "Employee created successfully", dto);
    }

    public async Task<List<EmployeeResponseDto>> SearchEmployeesAsync(string keyword)
    {
        var employees = await _repository.SearchEmployeesAsync(keyword);
        return employees.Select(MapToDto).ToList();
    }

    private EmployeeResponseDto MapToDto(EmployeeMaster e) => new()
    {
        EmployeeId      = e.EmployeeId,
        EmployeeCode    = e.EmployeeCode,
        EmployeeName    = e.EmployeeName,
        GenderName      = e.Gender?.GenderName,
        CommunityName   = e.Community?.CommunityName,
        DesignationName = e.Designation?.DesignationName,
        DepartmentName  = e.Department?.DepartmentName,
        LocationName    = e.Location?.LocationName,
        ShiftName       = e.Shift?.ShiftName,
        MobileNo        = string.IsNullOrEmpty(e.MobileNo) ? null : _dataProtection.Decrypt(e.MobileNo),
        Email           = string.IsNullOrEmpty(e.Email) ? null : _dataProtection.Decrypt(e.Email),
        Address         = string.IsNullOrEmpty(e.Address) ? null : _dataProtection.Decrypt(e.Address),
        JoiningDate     = e.JoiningDate,
        IsActive        = e.IsActive,
        Username        = e.Username,
        RoleName        = e.RoleName
    };
}