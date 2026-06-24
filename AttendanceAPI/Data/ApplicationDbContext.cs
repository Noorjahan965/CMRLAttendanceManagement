using AttendanceAPI.Models;
using Microsoft.EntityFrameworkCore;

namespace AttendanceAPI.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(
        DbContextOptions<ApplicationDbContext> options
    ) : base(options)
    {
    }

    public DbSet<EmployeeMaster> Employees { get; set; }
    public DbSet<UserLogin> UserLogins { get; set; }
    public DbSet<LocationMaster> Locations { get; set; }

public DbSet<ShiftMaster> Shifts { get; set; }
public DbSet<AttendanceMaster> Attendances { get; set; }
public DbSet<GenderMaster> Genders { get; set; }

public DbSet<CommunityMaster> Communities { get; set; }

public DbSet<DepartmentMaster> Departments { get; set; }

public DbSet<DesignationMaster> Designations { get; set; }

public DbSet<RoleMaster> Roles { get; set; }
    public DbSet<AuditLogMaster> AuditLogs { get; set; }
}