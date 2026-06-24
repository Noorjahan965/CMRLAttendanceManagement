using AttendanceAPI.Repositories.Interfaces;

namespace AttendanceAPI.Services;

public class AttendanceBackgroundService : BackgroundService
{
    private readonly IServiceScopeFactory _scopeFactory;

    public AttendanceBackgroundService(
        IServiceScopeFactory scopeFactory)
    {
        _scopeFactory = scopeFactory;
    }

    protected override async Task ExecuteAsync(
        CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            using var scope =
                _scopeFactory.CreateScope();

            var repo =
                scope.ServiceProvider
                    .GetRequiredService<IAttendanceRepository>();

            var pendingRecords =
                await repo.GetPendingSignOutRecords();

            foreach (var record in pendingRecords)
            {
                if (record.Employee?.Shift == null)
                    continue;

                var finalCutoff =
                    record.Employee.Shift.EndTime
                        .Add(TimeSpan.FromHours(2));

                if (DateTime.Now.TimeOfDay > finalCutoff &&
                    record.AttendanceStatus != "Half Day")
                {
                    record.AttendanceStatus = "Half Day";
                }
            }

            await repo.SaveAsync();

            await Task.Delay(
                TimeSpan.FromHours(1),
                stoppingToken);
        }
    }
}