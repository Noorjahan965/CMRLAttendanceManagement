using AttendanceAPI.Data;
using AttendanceAPI.Models;
using AttendanceAPI.Repositories.Interfaces;

namespace AttendanceAPI.Repositories;

public class AuditRepository : IAuditRepository
{
    private readonly ApplicationDbContext _context;

    public AuditRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task CreateAuditAsync(AuditLogMaster auditLog)
    {
        _context.AuditLogs.Add(auditLog);
        await _context.SaveChangesAsync();
    }
}