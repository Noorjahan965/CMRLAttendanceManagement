namespace AttendanceAPI.Services.Interfaces;

public interface IAuditLogService
{
    Task LogAsync(
        int userId,
        string actionType,
        string tableName,
        int? recordId,
        string description);
}