using AttendanceAPI.Models;
using AttendanceAPI.Repositories.Interfaces;
using AttendanceAPI.Services.Interfaces;


namespace AttendanceAPI.Services;

public class AuditLogService : IAuditLogService
{
    private readonly IAuditRepository _repository;

    public AuditLogService(
        IAuditRepository repository)
    {
        _repository = repository;
    }

    public async Task LogAsync(
    int userId,
    string actionType,
    string tableName,
    int? recordId,
    string description)
{
    try
    {
        await _repository.CreateAuditAsync(
            new AuditLogMaster
            {
                UserId = userId,
                ActionType = actionType,
                TableName = tableName,
                RecordId = recordId,
                ActionDescription = description,
                ActionTime = DateTime.Now
            });
    }
    catch (Exception ex)
    {
        Console.WriteLine(
            $"AUDIT ERROR: {ex.Message}");
    }
}}