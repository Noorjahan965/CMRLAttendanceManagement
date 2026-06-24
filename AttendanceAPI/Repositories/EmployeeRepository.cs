using AttendanceAPI.Data;
using AttendanceAPI.DTOs;
using AttendanceAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using AttendanceAPI.Models;

namespace AttendanceAPI.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;

    public EmployeeRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeeFormOptionsDto>
        GetFormOptionsAsync()
    {
        return new EmployeeFormOptionsDto
        {
            Genders = await _context.Genders
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.GenderId,
                    Name = x.GenderName
                })
                .ToListAsync(),

            Communities = await _context.Communities
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.CommunityId,
                    Name = x.CommunityName
                })
                .ToListAsync(),

            Departments = await _context.Departments
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.DepartmentId,
                    Name = x.DepartmentName
                })
                .ToListAsync(),

            Designations = await _context.Designations
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.DesignationId,
                    Name = x.DesignationName
                })
                .ToListAsync(),

            Locations = await _context.Locations
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.LocationId,
                    Name = x.LocationName
                })
                .ToListAsync(),

            Shifts = await _context.Shifts
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.ShiftId,
                    Name = x.ShiftName
                })
                .ToListAsync(),

            Roles = await _context.Roles
                .Where(x => x.IsActive)
                .Select(x => new DropdownItemDto
                {
                    Id = x.RoleId,
                    Name = x.RoleName
                })
                .ToListAsync()
        };
    }

    public async Task<EmployeeMaster?>
    GetEmployeeByIdAsync(
        int employeeId)
{
    return await _context.Employees
        .FirstOrDefaultAsync(
            e => e.EmployeeId == employeeId);
}
public async Task SaveAsync()
{
    await _context.SaveChangesAsync();
}

public async Task<List<EmployeeMaster>> GetActiveEmployeesAsync()
    {
        return await _context.Employees
            .Include(e => e.Gender)
            .Include(e => e.Community)
            .Include(e => e.Designation)
            .Include(e => e.Department)
            .Include(e => e.Location)
            .Include(e => e.Shift)
            .Where(e => e.IsActive)
            .ToListAsync();
    }

    public async Task<bool> EmployeeCodeExistsAsync(string employeeCode)
    {
        return await _context.Employees
            .AnyAsync(e => e.EmployeeCode == employeeCode);
    }

    public async Task<bool> UsernameExistsAsync(string username)
    {
        return await _context.UserLogins
            .AnyAsync(u => u.Username == username);
    }

    public async Task<EmployeeMaster> CreateEmployeeAsync(EmployeeMaster employee)
    {
        _context.Employees.Add(employee);
        await _context.SaveChangesAsync();
        return employee;
    }

    public async Task<UserLogin> CreateUserLoginAsync(UserLogin userLogin)
    {   
        Console.WriteLine(
        $"Before Save -> UserId = {userLogin.UserId}");

    _context.UserLogins.Add(userLogin);

    await _context.SaveChangesAsync();

    Console.WriteLine(
        $"After Save -> UserId = {userLogin.UserId}");

    return userLogin;
    }

    public async Task<UserLogin?> GetUserLoginByEmployeeIdAsync(int employeeId)
    {
        return await _context.UserLogins
            .FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
    }

    public async Task<List<EmployeeMaster>> SearchEmployeesAsync(string keyword)
{
    return await _context.Employees
        .Include(e => e.Gender)
        .Include(e => e.Community)
        .Include(e => e.Designation)
        .Include(e => e.Department)
        .Include(e => e.Location)
        .Include(e => e.Shift)
        .Where(e =>
    e.IsActive &&
    e.EmployeeName != null &&
    EF.Functions.Like(
        e.EmployeeName,
        $"%{keyword}%")).ToListAsync();
}
public async Task<EmployeeMaster?>
GetEmployeeByCodeAsync(
    string employeeCode)
{
    return await _context.Employees
        .FirstOrDefaultAsync(e =>
            e.EmployeeCode == employeeCode);
}


}