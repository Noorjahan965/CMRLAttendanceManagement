using AttendanceAPI.Data;
using AttendanceAPI.DTOs;
using AttendanceAPI.Models;
using AttendanceAPI.Repositories.Interfaces;
using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace AttendanceAPI.Repositories;

public class AttendanceRepository : IAttendanceRepository
{
    private readonly ApplicationDbContext _context;
    private readonly MySqlConnection _connection;

    public AttendanceRepository(
        ApplicationDbContext context,
        MySqlConnection connection)
    {
        _context = context;
        _connection = connection;
    }

    // ── EF Core (writes + simple reads) ─────────────────────────

    public async Task<EmployeeMaster?>
    GetEmployeeByUsernameAsync(string username)
    {
        var user = await _context.UserLogins
            .FirstOrDefaultAsync(x => x.Username == username);

        if (user == null) return null;

        return await _context.Employees
            .Include(e => e.Location)
            .Include(e => e.Shift)
            .FirstOrDefaultAsync(
                e => e.EmployeeId == user.EmployeeId);
    }

    public async Task<AttendanceMaster?>
    GetTodayAttendanceAsync(int employeeId)
    {
        return await _context.Attendances
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employeeId &&
                a.AttendanceDate.Date == DateTime.Today);
    }

    public async Task<AttendanceMaster>
    CreateAttendanceAsync(AttendanceMaster attendance)
    {
        _context.Attendances.Add(attendance);
        await _context.SaveChangesAsync();
        return attendance;
    }

    public async Task<AttendanceMaster?>
    GetAttendanceByDateAsync(
        int employeeId,
        DateTime attendanceDate)
    {
        return await _context.Attendances
            .FirstOrDefaultAsync(a =>
                a.EmployeeId == employeeId &&
                a.AttendanceDate.Date == attendanceDate.Date);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    // ── Dapper (complex reads) ───────────────────────────────────

    public async Task<List<AttendanceMaster>>
    GetPendingSignOutRecords()
    {
        const string sql = """
            SELECT 
                a.attendance_id   AS AttendanceId,
                a.employee_id     AS EmployeeId,
                a.attendance_date AS AttendanceDate,
                a.sign_in_time    AS SignInTime,
                a.sign_out_time   AS SignOutTime,
                a.attendance_status AS AttendanceStatus
            FROM attendance_master a
            WHERE a.sign_in_time IS NOT NULL
              AND a.sign_out_time IS NULL
            """;

        var result = await _connection
            .QueryAsync<AttendanceMaster>(sql);

        return result.ToList();
    }

    public async Task<List<AttendanceMaster>>
    GetMonthlyAttendanceAsync(
        int employeeId,
        int year,
        int month)
    {
        const string sql = """
            SELECT
                attendance_id     AS AttendanceId,
                employee_id       AS EmployeeId,
                attendance_date   AS AttendanceDate,
                attendance_status AS AttendanceStatus,
                sign_in_time      AS SignInTime,
                sign_out_time     AS SignOutTime
            FROM attendance_master
            WHERE employee_id = @EmployeeId
              AND YEAR(attendance_date)  = @Year
              AND MONTH(attendance_date) = @Month
            """;

        var result = await _connection
            .QueryAsync<AttendanceMaster>(sql,
                new { EmployeeId = employeeId, Year = year, Month = month });

        return result.ToList();
    }

    public async Task<List<AttendanceMaster>>
    GetAttendanceHistoryAsync(int year, int month)
    {
        const string sql = """
            SELECT
                a.attendance_id     AS AttendanceId,
                a.employee_id       AS EmployeeId,
                a.attendance_date   AS AttendanceDate,
                a.attendance_status AS AttendanceStatus,
                a.sign_in_time      AS SignInTime,
                a.sign_out_time     AS SignOutTime,
                e.employee_name     AS EmployeeName
            FROM attendance_master a
            INNER JOIN employee_master e
                ON a.employee_id = e.employee_id
            WHERE YEAR(a.attendance_date)  = @Year
              AND MONTH(a.attendance_date) = @Month
            """;

        var result = await _connection
            .QueryAsync<AttendanceMaster, EmployeeMaster, AttendanceMaster>(
                sql,
                (attendance, employee) =>
                {
                    attendance.Employee = employee;
                    return attendance;
                },
                new { Year = year, Month = month },
                splitOn: "EmployeeName");

        return result.ToList();
    }

    public async Task<List<AttendanceMaster>>
    GetAttendanceHistoryAsync()
    {
        const string sql = """
            SELECT
                a.attendance_id     AS AttendanceId,
                a.employee_id       AS EmployeeId,
                a.attendance_date   AS AttendanceDate,
                a.attendance_status AS AttendanceStatus,
                a.sign_in_time      AS SignInTime,
                a.sign_out_time     AS SignOutTime,
                e.employee_name     AS EmployeeName
            FROM attendance_master a
            INNER JOIN employee_master e
                ON a.employee_id = e.employee_id
            ORDER BY a.attendance_date DESC
            """;

        var result = await _connection
            .QueryAsync<AttendanceMaster, EmployeeMaster, AttendanceMaster>(
                sql,
                (attendance, employee) =>
                {
                    attendance.Employee = employee;
                    return attendance;
                },
                splitOn: "EmployeeName");

        return result.ToList();
    }

    public async Task<List<LowAttendanceDto>>
    GetLowAttendanceEmployeesAsync(string username)
    {
        var today = DateTime.Today;
        int year  = today.Year;
        int month = today.Month;

        const string userSql = """
            SELECT role_id AS RoleId
            FROM user_login
            WHERE username = @Username
            """;

        var loggedInUser = await _connection
            .QueryFirstOrDefaultAsync<dynamic>(
                userSql, new { Username = username });

        if (loggedInUser == null)
            return new List<LowAttendanceDto>();

        int loggedInRoleId = (int)loggedInUser.RoleId;

        const string sql = """
            SELECT
                e.employee_id   AS EmployeeId,
                e.employee_code AS EmployeeCode,
                e.employee_name AS EmployeeName,
                u.username      AS Username,
                u.role_id       AS RoleId,
                r.role_name     AS Role,
                COALESCE(SUM(CASE WHEN a.attendance_status = 'Present'  THEN 1 ELSE 0 END), 0) AS PresentDays,
                COALESCE(SUM(CASE WHEN a.attendance_status = 'Half Day' THEN 1 ELSE 0 END), 0) AS HalfDays
            FROM employee_master e
            INNER JOIN user_login u ON e.employee_id = u.employee_id
            INNER JOIN role_master r ON u.role_id = r.role_id
            LEFT JOIN attendance_master a
                ON e.employee_id = a.employee_id
               AND YEAR(a.attendance_date)  = @Year
               AND MONTH(a.attendance_date) = @Month
            WHERE e.is_active = 1
              AND (
                    @LoggedInRoleId = 1
                    OR (@LoggedInRoleId = 2 AND (u.role_id = 3 OR u.role_id = 4))
                    OR (@LoggedInRoleId = 3 AND u.role_id = 4)
                  )
            GROUP BY
                e.employee_id,
                e.employee_code,
                e.employee_name,
                u.username,
                u.role_id,
                r.role_name
            """;

        var rows = await _connection.QueryAsync<dynamic>(
            sql, new { Year = year, Month = month,
                       LoggedInRoleId = loggedInRoleId });

        int daysInMonth = DateTime.DaysInMonth(year, month);
        int workingDays = Enumerable.Range(1, daysInMonth)
            .Select(d => new DateTime(year, month, d))
            .Count(d =>
                d.DayOfWeek != DayOfWeek.Saturday &&
                d.DayOfWeek != DayOfWeek.Sunday);

        var result = new List<LowAttendanceDto>();

        foreach (var row in rows)
        {
            int presentDays = (int)row.PresentDays;
            int halfDays    = (int)row.HalfDays;
            int absentDays  = Math.Max(
                0, workingDays - presentDays - halfDays);

            int percentage = workingDays == 0
                ? 0
                : (int)Math.Round(
                    ((decimal)presentDays / workingDays) * 100);

            if (percentage < 80)
            {
                result.Add(new LowAttendanceDto
                {
                    EmployeeId          = (int)row.EmployeeId,
                    EmployeeCode        = (string)row.EmployeeCode ?? "",
                    EmployeeName        = (string)row.EmployeeName ?? "",
                    Username            = (string)row.Username,
                    Role                = (string)row.Role,
                    AttendancePercentage = percentage,
                    PresentDays         = presentDays,
                    HalfDays            = halfDays,
                    AbsentDays          = absentDays
                });
            }
        }

        return result;
    }
}