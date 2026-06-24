using AttendanceAPI.Data;
using AttendanceAPI.Models;
using AttendanceAPI.Repositories.Interfaces;
using Microsoft.EntityFrameworkCore;
using AttendanceAPI.DTOs;

namespace AttendanceAPI.Repositories;

public class AttendanceRepository : IAttendanceRepository
{
    private readonly ApplicationDbContext _context;

    public AttendanceRepository(
        ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<EmployeeMaster?>
    GetEmployeeByUsernameAsync(
        string username)
    {
        var user = await _context.UserLogins
            .FirstOrDefaultAsync(
                x => x.Username == username);

        if (user == null)
            return null;

        return await _context.Employees
            .Include(e => e.Location)
            .Include(e => e.Shift)
            .FirstOrDefaultAsync(
                e => e.EmployeeId ==
                     user.EmployeeId);
    }

    public async Task<AttendanceMaster?>
    GetTodayAttendanceAsync(
        int employeeId)
    {
        return await _context.Attendances
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employeeId &&
                a.AttendanceDate.Date ==
                DateTime.Today);
    }

    public async Task<AttendanceMaster>
    CreateAttendanceAsync(
        AttendanceMaster attendance)
    {
        _context.Attendances.Add(attendance);

        await _context.SaveChangesAsync();

        return attendance;
    }

    public async Task<List<AttendanceMaster>>
    GetPendingSignOutRecords()
    {
        return await _context.Attendances
            .Include(a => a.Employee)
                .ThenInclude(e => e.Shift)
            .Where(a =>
                a.SignInTime != null &&
                a.SignOutTime == null)
            .ToListAsync();
    }

    public async Task<List<AttendanceMaster>>
    GetMonthlyAttendanceAsync(
        int employeeId,
        int year,
        int month)
    {
        return await _context.Attendances
            .Where(a =>
                a.EmployeeId == employeeId &&
                a.AttendanceDate.Year == year &&
                a.AttendanceDate.Month == month)
            .ToListAsync();
    }



    public async Task<AttendanceMaster?>
    GetAttendanceByDateAsync(
        int employeeId,
        DateTime attendanceDate)
    {
        return await _context.Attendances
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employeeId &&
                a.AttendanceDate.Date ==
                attendanceDate.Date);
    }
    public async Task<List<AttendanceMaster>>
    GetAttendanceHistoryAsync(
        int year,
        int month)
{
    return await _context.Attendances
        .Include(a => a.Employee)
        .Where(a =>
            a.AttendanceDate.Year == year &&
            a.AttendanceDate.Month == month)
        .ToListAsync();
}
    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }
    public async Task<List<LowAttendanceDto>> GetLowAttendanceEmployeesAsync(string username)
{
    var today = DateTime.Today;

    int year = today.Year;
    int month = today.Month;

    var loggedInUser = await _context.UserLogins
    .FirstOrDefaultAsync(
        x => x.Username == username);

if (loggedInUser == null)
{
    return new List<LowAttendanceDto>();
}

    var employees = await (
    from e in _context.Employees
    join u in _context.UserLogins
        on e.EmployeeId equals u.EmployeeId
    join r in _context.Roles
        on u.RoleId equals r.RoleId
    where e.IsActive
          &&
          (
              loggedInUser.RoleId == 1
              ||
              (loggedInUser.RoleId == 2 &&
               (u.RoleId == 3 || u.RoleId == 4))
              ||
              (loggedInUser.RoleId == 3 &&
               u.RoleId == 4)
          )
    select new
    {
        e.EmployeeId,
        e.EmployeeCode,
        e.EmployeeName,
        u.Username,
        u.RoleId,
        RoleName = r.RoleName
    })
    .ToListAsync();

    var allAttendance = await _context.Attendances
        .Where(a =>
            a.AttendanceDate.Year == year &&
            a.AttendanceDate.Month == month)
        .ToListAsync();

    int daysInMonth =
        DateTime.DaysInMonth(year, month);

    int workingDays =
        Enumerable.Range(1, daysInMonth)
        .Select(day => new DateTime(year, month, day))
        .Count(d =>
            d.DayOfWeek != DayOfWeek.Saturday &&
            d.DayOfWeek != DayOfWeek.Sunday);

    var result = new List<LowAttendanceDto>();

    foreach (var emp in employees)
    {
        int presentDays = allAttendance.Count(a =>
            a.EmployeeId == emp.EmployeeId &&
            a.AttendanceStatus == "Present");

        int halfDays = allAttendance.Count(a =>
            a.EmployeeId == emp.EmployeeId &&
            a.AttendanceStatus == "Half Day");

        int absentDays =
            workingDays -
            presentDays -
            halfDays;

        if (absentDays < 0)
        {
            absentDays = 0;
        }

        int percentage =
            workingDays == 0
                ? 0
                : (int)Math.Round(
                    ((decimal)presentDays / workingDays) * 100);

        if (percentage < 80)
        {
            result.Add(new LowAttendanceDto
            {
                EmployeeId = emp.EmployeeId,
                EmployeeCode = emp.EmployeeCode ?? string.Empty,
                EmployeeName = emp.EmployeeName ?? string.Empty,
                Username = emp.Username,
                Role = emp.RoleName,
                AttendancePercentage = percentage,
                PresentDays = presentDays,
                HalfDays = halfDays,
                AbsentDays = absentDays
            });
        }
    }

    return result;
}
    public async Task<List<AttendanceMaster>>
    GetAttendanceHistoryAsync()
{
    return await _context.Attendances
        .Include(a => a.Employee)
        .OrderByDescending(a => a.AttendanceDate)
        .ToListAsync();
}
}