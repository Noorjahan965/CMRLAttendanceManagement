using AttendanceAPI.Data;
using AttendanceAPI.DTOs;
using AttendanceAPI.Models;
using AttendanceAPI.Repositories.Interfaces;
using Dapper;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;

namespace AttendanceAPI.Repositories;

public class EmployeeRepository : IEmployeeRepository
{
    private readonly ApplicationDbContext _context;
    private readonly MySqlConnection _connection;

    public EmployeeRepository(
        ApplicationDbContext context,
        MySqlConnection connection)
    {
        _context = context;
        _connection = connection;
    }

    private async Task EnsureOpenAsync()
    {
        if (_connection.State != System.Data.ConnectionState.Open)
            await _connection.OpenAsync();
    }

    public async Task<EmployeeMaster?> GetEmployeeByIdAsync(int employeeId)
    {
        return await _context.Employees
            .FirstOrDefaultAsync(e => e.EmployeeId == employeeId);
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
        _context.UserLogins.Add(userLogin);
        await _context.SaveChangesAsync();
        return userLogin;
    }

    public async Task<UserLogin?> GetUserLoginByEmployeeIdAsync(int employeeId)
    {
        return await _context.UserLogins
            .FirstOrDefaultAsync(u => u.EmployeeId == employeeId);
    }

    public async Task<EmployeeMaster?> GetEmployeeByCodeAsync(string employeeCode)
    {
        return await _context.Employees
            .FirstOrDefaultAsync(e => e.EmployeeCode == employeeCode);
    }

    public async Task SaveAsync()
    {
        await _context.SaveChangesAsync();
    }

    public async Task<EmployeeFormOptionsDto> GetFormOptionsAsync()
    {
        const string sql = """
            SELECT gender_id AS Id, gender_name AS Name
            FROM gender_master WHERE is_active = 1;

            SELECT community_id AS Id, community_name AS Name
            FROM community_master WHERE is_active = 1;

            SELECT department_id AS Id, department_name AS Name
            FROM department_master WHERE is_active = 1;

            SELECT designation_id AS Id, designation_name AS Name
            FROM designation_master WHERE is_active = 1;

            SELECT location_id AS Id, location_name AS Name
            FROM location_master WHERE is_active = 1;

            SELECT shift_id AS Id, shift_name AS Name
            FROM shift_master WHERE is_active = 1;

            SELECT role_id AS Id, role_name AS Name
            FROM role_master WHERE is_active = 1;
            """;

        using var multi = await _connection.QueryMultipleAsync(sql);

        return new EmployeeFormOptionsDto
        {
            Genders      = (await multi.ReadAsync<DropdownItemDto>()).ToList(),
            Communities  = (await multi.ReadAsync<DropdownItemDto>()).ToList(),
            Departments  = (await multi.ReadAsync<DropdownItemDto>()).ToList(),
            Designations = (await multi.ReadAsync<DropdownItemDto>()).ToList(),
            Locations    = (await multi.ReadAsync<DropdownItemDto>()).ToList(),
            Shifts       = (await multi.ReadAsync<DropdownItemDto>()).ToList(),
            Roles        = (await multi.ReadAsync<DropdownItemDto>()).ToList()
        };
    }

    public async Task<int?> GetRoleIdByUsernameAsync(string username)
    {
        const string sql = """
            SELECT role_id AS RoleId
            FROM user_login
            WHERE username = @Username AND is_active = 1
            """;

        await EnsureOpenAsync();
        var result = await _connection.QueryFirstOrDefaultAsync<dynamic>(sql, new { Username = username });
        return result == null ? null : (int?)result.RoleId;
    }

    private static EmployeeMaster MapRow(dynamic row) => new EmployeeMaster
    {
        EmployeeId    = (int)row.EmployeeId,
        EmployeeCode  = (string?)row.EmployeeCode,
        EmployeeName  = (string?)row.EmployeeName,
        MobileNo      = (string?)row.MobileNo,
        Email         = (string?)row.Email,
        Address       = (string?)row.Address,
        JoiningDate   = row.JoiningDate == null ? null : DateOnly.FromDateTime((DateTime)row.JoiningDate),
        IsActive      = (bool)row.IsActive,
        GenderId      = row.GenderId == null ? null : (int?)row.GenderId,
        CommunityId   = row.CommunityId == null ? null : (int?)row.CommunityId,
        DesignationId = row.DesignationId == null ? null : (int?)row.DesignationId,
        DepartmentId  = row.DepartmentId == null ? null : (int?)row.DepartmentId,
        LocationId    = (int)row.LocationId,
        ShiftId       = (int)row.ShiftId,
        Gender        = row.GenderName == null ? null : new GenderMaster { GenderName = (string)row.GenderName },
        Community     = row.CommunityName == null ? null : new CommunityMaster { CommunityName = (string)row.CommunityName },
        Designation   = row.DesignationName == null ? null : new DesignationMaster { DesignationName = (string)row.DesignationName },
        Department    = row.DepartmentName == null ? null : new DepartmentMaster { DepartmentName = (string)row.DepartmentName },
        Location      = row.LocationName == null ? null : new LocationMaster { LocationName = (string)row.LocationName },
        Shift         = row.ShiftName == null ? null : new ShiftMaster { ShiftName = (string)row.ShiftName }
    };

    private const string BaseSelectSql = """
        SELECT
            e.employee_id       AS EmployeeId,
            e.employee_code     AS EmployeeCode,
            e.employee_name     AS EmployeeName,
            e.mobile_no         AS MobileNo,
            e.email             AS Email,
            e.address           AS Address,
            e.joining_date      AS JoiningDate,
            e.is_active         AS IsActive,
            e.gender_id         AS GenderId,
            e.community_id      AS CommunityId,
            e.designation_id    AS DesignationId,
            e.department_id     AS DepartmentId,
            e.location_id       AS LocationId,
            e.shift_id          AS ShiftId,
            g.gender_name       AS GenderName,
            c.community_name    AS CommunityName,
            d.designation_name  AS DesignationName,
            dep.department_name AS DepartmentName,
            l.location_name     AS LocationName,
            s.shift_name        AS ShiftName
        FROM employee_master e
        LEFT JOIN gender_master      g   ON e.gender_id      = g.gender_id
        LEFT JOIN community_master   c   ON e.community_id   = c.community_id
        LEFT JOIN designation_master d   ON e.designation_id = d.designation_id
        LEFT JOIN department_master  dep ON e.department_id  = dep.department_id
        LEFT JOIN location_master    l   ON e.location_id    = l.location_id
        LEFT JOIN shift_master       s   ON e.shift_id       = s.shift_id
        """;

    public async Task<List<EmployeeMaster>> GetActiveEmployeesAsync(int requesterRoleId)
    {
        const string sql = """
            SELECT
                e.employee_id       AS EmployeeId,
                e.employee_code     AS EmployeeCode,
                e.employee_name     AS EmployeeName,
                e.mobile_no         AS MobileNo,
                e.email             AS Email,
                e.address           AS Address,
                e.joining_date      AS JoiningDate,
                e.is_active         AS IsActive,
                e.gender_id         AS GenderId,
                e.community_id      AS CommunityId,
                e.designation_id    AS DesignationId,
                e.department_id     AS DepartmentId,
                e.location_id       AS LocationId,
                e.shift_id          AS ShiftId,
                u.username          AS Username,
                r.role_name         AS RoleName,
                g.gender_name       AS GenderName,
                c.community_name    AS CommunityName,
                d.designation_name  AS DesignationName,
                dep.department_name AS DepartmentName,
                l.location_name     AS LocationName,
                s.shift_name        AS ShiftName
            FROM employee_master e
            INNER JOIN user_login u  ON e.employee_id = u.employee_id
            INNER JOIN role_master r ON u.role_id     = r.role_id
            LEFT JOIN gender_master      g   ON e.gender_id      = g.gender_id
            LEFT JOIN community_master   c   ON e.community_id   = c.community_id
            LEFT JOIN designation_master d   ON e.designation_id = d.designation_id
            LEFT JOIN department_master  dep ON e.department_id  = dep.department_id
            LEFT JOIN location_master    l   ON e.location_id    = l.location_id
            LEFT JOIN shift_master       s   ON e.shift_id       = s.shift_id
            WHERE e.is_active = 1
              AND (
                    (@RequesterRoleId = 1)
                    OR (@RequesterRoleId = 2 AND (u.role_id = 3 OR u.role_id = 4))
                    OR (@RequesterRoleId = 3 AND u.role_id = 4)
                  )
            ORDER BY e.employee_name
            """;

        var rows = await _connection.QueryAsync<dynamic>(sql, new { RequesterRoleId = requesterRoleId });

        return rows.Select(row => new EmployeeMaster
        {
            EmployeeId    = (int)row.EmployeeId,
            EmployeeCode  = (string?)row.EmployeeCode,
            EmployeeName  = (string?)row.EmployeeName,
            MobileNo      = (string?)row.MobileNo,
            Email         = (string?)row.Email,
            Address       = (string?)row.Address,
            JoiningDate   = row.JoiningDate == null ? null : DateOnly.FromDateTime((DateTime)row.JoiningDate),
            IsActive      = (bool)row.IsActive,
            GenderId      = row.GenderId == null ? null : (int?)row.GenderId,
            CommunityId   = row.CommunityId == null ? null : (int?)row.CommunityId,
            DesignationId = row.DesignationId == null ? null : (int?)row.DesignationId,
            DepartmentId  = row.DepartmentId == null ? null : (int?)row.DepartmentId,
            LocationId    = (int)row.LocationId,
            ShiftId       = (int)row.ShiftId,
            Username      = (string?)row.Username,
            RoleName      = (string?)row.RoleName,
            Gender        = row.GenderName == null ? null : new GenderMaster { GenderName = (string)row.GenderName },
            Community     = row.CommunityName == null ? null : new CommunityMaster { CommunityName = (string)row.CommunityName },
            Designation   = row.DesignationName == null ? null : new DesignationMaster { DesignationName = (string)row.DesignationName },
            Department    = row.DepartmentName == null ? null : new DepartmentMaster { DepartmentName = (string)row.DepartmentName },
            Location      = row.LocationName == null ? null : new LocationMaster { LocationName = (string)row.LocationName },
            Shift         = row.ShiftName == null ? null : new ShiftMaster { ShiftName = (string)row.ShiftName }
        }).ToList();
    }

    public async Task<List<EmployeeMaster>> GetEmployeesByCodeAsync(string employeeCode)
    {
        var sql = BaseSelectSql + " WHERE e.employee_code = @EmployeeCode";
        var rows = await _connection.QueryAsync<dynamic>(sql, new { EmployeeCode = employeeCode });
        return rows.Select(MapRow).ToList();
    }

    public async Task<List<EmployeeMaster>> SearchEmployeesAsync(string keyword)
    {
        var sql = BaseSelectSql + " WHERE e.is_active = 1 AND e.employee_name LIKE @Keyword";
        var rows = await _connection.QueryAsync<dynamic>(sql, new { Keyword = $"%{keyword}%" });
        return rows.Select(MapRow).ToList();
    }
}