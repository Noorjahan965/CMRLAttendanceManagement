using AttendanceAPI.Models;

namespace AttendanceAPI.Repositories.Interfaces;

public interface IAuditRepository
{
    Task CreateAuditAsync(AuditLogMaster auditLog);
}