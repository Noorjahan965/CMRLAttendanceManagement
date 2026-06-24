using AttendanceAPI.DTOs;
using AttendanceAPI.Helpers;
using AttendanceAPI.Repositories.Interfaces;
using AttendanceAPI.Services.Interfaces;
using AttendanceAPI.Models;

namespace AttendanceAPI.Services;

public class AttendanceService : IAttendanceService
{
    private readonly IAttendanceRepository _repository;
    private readonly IEmployeeRepository _employeeRepository;
    private readonly IAuditLogService _auditLogService;

    public AttendanceService(
        IAttendanceRepository repository, IEmployeeRepository employeeRepository, IAuditLogService auditLogService)
    {
        _repository = repository;
        _employeeRepository = employeeRepository;
        _auditLogService = auditLogService;
    }

    public async Task<AttendanceValidationResponseDto>
        ValidateAttendanceAsync(
            AttendanceValidationRequestDto request)
    {
        var employee =
            await _repository.GetEmployeeByUsernameAsync(
                request.Username);

        if (employee == null)
        {
            return new AttendanceValidationResponseDto
            {
                CanMarkAttendance = false,
                Message = "Employee not found"
            };
        }

        double distance =
            GeoLocationHelper.CalculateDistance(
                request.Latitude,
                request.Longitude,
                (double)employee.Location!.Latitude,
                (double)employee.Location.Longitude);

        bool isWithinRadius =
            distance <= employee.Location.Radius;

        var now = request.CurrentTime.TimeOfDay;

        var shiftStart = employee.Shift!.StartTime;
        var shiftEnd = employee.Shift.EndTime;

        var startWindow =
            shiftStart.Subtract(
                TimeSpan.FromMinutes(30));

        var endWindow =
            shiftStart.Add(
                TimeSpan.FromMinutes(30));

        bool isWithinTime =
            now >= startWindow &&
            now <= endWindow;

        return new AttendanceValidationResponseDto
        {
            CanMarkAttendance =
        isWithinRadius &&
        isWithinTime,

            IsWithinRadius =
        isWithinRadius,

            IsWithinTimeWindow =
        isWithinTime,

            DistanceInMeters =
        Math.Round(distance, 2),

            AllowedRadius =
        employee.Location.Radius,

            ShiftStartTime =
        shiftStart.ToString(@"hh\:mm\:ss"),

            ShiftEndTime =
        shiftEnd.ToString(@"hh\:mm\:ss"),

            TimeWindowStart =
        startWindow.ToString(@"hh\:mm\:ss"),

            TimeWindowEnd =
        endWindow.ToString(@"hh\:mm\:ss"),

            Message =
        isWithinRadius && isWithinTime
        ? "Attendance allowed"
        : !isWithinRadius
            ? "Outside allowed location"
            : "Outside allowed shift timing"
        };
    }

    public async Task<AttendanceSignInResponseDto>
    SignInAsync(
        AttendanceSignInRequestDto request)
    {
        var employee =
            await _repository.GetEmployeeByUsernameAsync(
                request.Username);

        if (employee == null)
        {
            return new AttendanceSignInResponseDto
            {
                Success = false,
                Message = "Employee not found"
            };
        }

        var existingAttendance =
            await _repository.GetTodayAttendanceAsync(
                employee.EmployeeId);

        if (existingAttendance != null)
        {
            return new AttendanceSignInResponseDto
            {
                Success = false,
                Message = "Already signed in today"
            };
        }

        var attendance = new AttendanceMaster
        {
            EmployeeId = employee.EmployeeId,

            AttendanceDate = DateTime.Today,

            SignInTime = request.CurrentTime,

            SignInLatitude =
                (decimal)request.Latitude,

            SignInLongitude =
                (decimal)request.Longitude,

            AttendanceStatus = "Half Day"
        };

        attendance =
            await _repository.CreateAttendanceAsync(
                attendance);
        await _auditLogService.LogAsync(
    employee.EmployeeId,
    "SIGN_IN",
    "attendance_master",
    attendance.AttendanceId,
    "Attendance marked");
        return new AttendanceSignInResponseDto
        {
            Success = true,
            AttendanceId = attendance.AttendanceId,
            HasSignedIn = true,
            HasSignedOut = false,
            Message = "Sign In successful"
        };
    }

    public async Task<AttendanceStatusResponseDto> GetAttendanceStatusAsync(string username)
    {
        var employee = await _repository.GetEmployeeByUsernameAsync(username);

        if (employee == null)
        {
            return new AttendanceStatusResponseDto
            {
                Message = "Employee not found"
            };
        }

        var attendance = await _repository.GetTodayAttendanceAsync(employee.EmployeeId);

        bool hasSignedIn = attendance?.SignInTime != null;
        bool hasSignedOut = attendance?.SignOutTime != null;

        var now = DateTime.Now.TimeOfDay;

        var shiftStart = employee.Shift!.StartTime;
        var shiftEnd = employee.Shift.EndTime;

        var signOutWindowStart = shiftEnd.Subtract(TimeSpan.FromMinutes(30));
        var signOutWindowEnd =
    shiftEnd.Add(TimeSpan.FromHours(2));


        bool canSignIn = !hasSignedIn;

        bool canSignOut =
            hasSignedIn &&
            !hasSignedOut &&
            now >= signOutWindowStart &&
            now <= signOutWindowEnd;



        return new AttendanceStatusResponseDto
        {
            HasSignedIn = hasSignedIn,
            HasSignedOut = hasSignedOut,
            CanSignIn = canSignIn,
            CanSignOut = canSignOut,
            ShiftStartTime = shiftStart.ToString(@"hh\:mm\:ss"),
            ShiftEndTime = shiftEnd.ToString(@"hh\:mm\:ss"),
            SignOutWindowStart = signOutWindowStart.ToString(@"hh\:mm\:ss"),
            AttendanceId = attendance?.AttendanceId,
            Message = hasSignedOut
                ? "Attendance completed"
                : hasSignedIn
                    ? "Signed in"
                    : "Not signed in"
        };
    }

    public async Task<AttendanceCalendarResponseDto>
    GetAttendanceCalendarAsync(
        string username,
        int year,
        int month)
    {
        var employee =
            await _repository.GetEmployeeByUsernameAsync(
                username);

        if (employee == null)
        {
            return new AttendanceCalendarResponseDto
            {
                Username = username,
                Year = year,
                Month = month
            };
        }

        var records =
            await _repository.GetMonthlyAttendanceAsync(
                employee.EmployeeId,
                year,
                month);

        var response =
            new AttendanceCalendarResponseDto
            {
                Username = username,
                Year = year,
                Month = month
            };

        int daysInMonth =
            DateTime.DaysInMonth(year, month);

        for (int day = 1; day <= daysInMonth; day++)
        {
            var currentDate =
                new DateTime(year, month, day);

            var attendance =
                records.FirstOrDefault(x =>
                    x.AttendanceDate.Date ==
                    currentDate.Date);

            string status;

            if (attendance != null)
            {
                status = attendance.AttendanceStatus;
            }
            else if (
        currentDate.DayOfWeek == DayOfWeek.Saturday ||
        currentDate.DayOfWeek == DayOfWeek.Sunday)
            {
                status = "Holiday";
            }
            else if (currentDate.Date < DateTime.Today)
            {
                status = "Absent";
            }
            else
            {
                status = "NotMarked";
            }

            response.Days.Add(
                new AttendanceCalendarDayDto
                {
                    Day = day,
                    Status = status
                });
        }

        return response;
    }
    public async Task<object> SignOutAsync(AttendanceSignOutRequestDto request)
    {
        var employee = await _repository.GetEmployeeByUsernameAsync(request.Username);

        if (employee == null)
        {
            return new { success = false, message = "Employee not found" };
        }

        var attendance = await _repository.GetTodayAttendanceAsync(employee.EmployeeId);

        if (attendance == null || attendance.SignInTime == null)
        {
            return new { success = false, message = "Sign in required first" };
        }

        if (attendance.SignOutTime != null)
        {
            return new { success = false, message = "Already signed out" };
        }

        var now = DateTime.Now.TimeOfDay;
        var signOutWindowStart =
     employee.Shift!.EndTime
         .Subtract(TimeSpan.FromMinutes(30));

        var signOutWindowEnd =
            employee.Shift.EndTime
                .Add(TimeSpan.FromHours(2));

        Console.WriteLine("========== SIGN OUT DEBUG ==========");
        Console.WriteLine($"Current Time  : {now}");
        Console.WriteLine($"Shift End     : {employee.Shift.EndTime}");
        Console.WriteLine($"Window Start  : {signOutWindowStart}");
        Console.WriteLine($"Window End    : {signOutWindowEnd}");
        Console.WriteLine("===================================");

        if (now < signOutWindowStart)
        {
            return new
            {
                success = false,
                message = "Too early to sign out"
            };
        }

        if (now > signOutWindowEnd)
        {
            return new
            {
                success = false,
                message = "Sign out window expired"
            };
        }

        attendance.SignOutTime = DateTime.Now;
        attendance.SignOutLatitude = (decimal)request.Latitude;
        attendance.SignOutLongitude = (decimal)request.Longitude;
        attendance.AttendanceStatus = "Present";

        await _repository.SaveAsync();
        await _auditLogService.LogAsync(
    employee.EmployeeId,
    "SIGN_OUT",
    "attendance_master",
    attendance.AttendanceId,
    "Employee signed out");

        return new
        {
            success = true,
            message = "Sign out successful",
            attendanceId = attendance.AttendanceId
        };
    }
    public async Task<List<EmployeeAttendanceSummaryDto>>
    GetAttendanceSummaryAsync(
        int year,
        int month)
    {
        var records =
            await _repository
                .GetAttendanceHistoryAsync(
                    year,
                    month);

        var result =
            records
            .GroupBy(x => new
            {
                x.EmployeeId,
                EmployeeName = x.Employee!.EmployeeName
            })
            .Select(g =>
            {
                int presentDays =
                    g.Count(x =>
                        x.AttendanceStatus == "Present");

                int halfDays =
                    g.Count(x =>
                        x.AttendanceStatus == "Half Day");

                int daysInMonth =
                    DateTime.DaysInMonth(
                        year,
                        month);

                int workingDays = Enumerable
                    .Range(1, daysInMonth)
                    .Select(d =>
                        new DateTime(
                            year,
                            month,
                            d))
                    .Count(d =>
                        d.DayOfWeek != DayOfWeek.Saturday &&
                        d.DayOfWeek != DayOfWeek.Sunday);

                int absentDays =
                    workingDays -
                    presentDays -
                    halfDays;

               
                int percentage =
    (int)Math.Round(
        ((presentDays + (halfDays * 0.5))
         / workingDays) * 100);
                var workingDates = Enumerable
        .Range(1, daysInMonth)
        .Select(day => new DateTime(year, month, day))
        .Where(d =>
            d.DayOfWeek != DayOfWeek.Saturday &&
            d.DayOfWeek != DayOfWeek.Sunday)
        .ToList();

                var attendanceDates = g
                .Select(x => x.AttendanceDate.Date)
                .ToHashSet();

                var absentDates = workingDates
                .Where(d => !attendanceDates.Contains(d.Date))
                .Select(d => d.ToString("yyyy-MM-dd"))
                .ToList();

                return new EmployeeAttendanceSummaryDto
                {
                    EmployeeId =
                        g.Key.EmployeeId,

                    EmployeeName =
                        g.Key.EmployeeName ?? "",

                    Month = month,

                    Year = year,

                    AttendancePercentage =
                        percentage,

                    PresentDays =
                        presentDays,

                    HalfDays =
                        halfDays,

                    AbsentDays =
                        absentDays,

                    AbsentDates = absentDates,

                    HalfDayDates =
        g.Where(x =>
            x.AttendanceStatus ==
            "Half Day")
         .Select(x =>
            x.AttendanceDate
             .ToString("yyyy-MM-dd"))
         .ToList()
                };
            })
            .ToList();

        return result;
    }
    public async Task<object>
    UpdateAttendanceStatusAsync(
        AttendanceStatusUpdateRequestDto request)
    {
        var employee =
            await _employeeRepository
                .GetEmployeeByCodeAsync(
                    request.EmployeeCode);

        if (employee == null)
        {
            return new
            {
                success = false,
                message = "Employee not found"
            };
        }

        var usernameEmployee =
            await _repository
                .GetEmployeeByUsernameAsync(
                    request.Username);

        if (usernameEmployee == null)
        {
            return new
            {
                success = false,
                message = "Username not found"
            };
        }

        if (employee.EmployeeId !=
            usernameEmployee.EmployeeId)
        {
            return new
            {
                success = false,
                message =
                    "Employee code and username do not match"
            };
        }

        var attendance =
            await _repository
                .GetAttendanceByDateAsync(
                    employee.EmployeeId,
                    request.AttendanceDate);

        if (attendance == null)
{
    attendance = new AttendanceMaster
    {
        EmployeeId = employee.EmployeeId,
        AttendanceDate = request.AttendanceDate.Date,
        AttendanceStatus = request.NewStatus,
        Remarks = request.Remarks
    };

    await _repository.CreateAttendanceAsync(attendance);

    return new
    {
        success = true,
        message = "Absent day converted successfully"
    };
}

        var oldStatus =
            attendance.AttendanceStatus;

        attendance.AttendanceStatus =
            request.NewStatus;

        attendance.Remarks =
            request.Remarks;

        await _repository.SaveAsync();
        await _auditLogService.LogAsync(
    employee.EmployeeId,
    "UPDATE",
    "attendance_master",
    attendance.AttendanceId,
    $"Attendance status changed from {oldStatus} to {request.NewStatus}");


        return new
        {
            success = true,
            employeeCode =
                request.EmployeeCode,

            username =
                request.Username,

            attendanceDate =
                request.AttendanceDate,

            oldStatus,

            newStatus =
                request.NewStatus,

            remarks =
                request.Remarks,

            message =
                "Attendance updated successfully"
        };
    }
    public async Task<List<LowAttendanceDto>> GetLowAttendanceEmployeesAsync(string username)
    {
        return await _repository.GetLowAttendanceEmployeesAsync(username);
    }

    public async Task<List<AttendanceHistoryDto>>
GetAttendanceHistoryAsync()
    {
        var records =
            await _repository.GetAttendanceHistoryAsync();

        return records.Select(a =>
            new AttendanceHistoryDto
            {
                EmployeeId = a.EmployeeId,
                EmployeeName = a.Employee?.EmployeeName ?? "",
                AttendanceDate = a.AttendanceDate,
                AttendanceStatus = a.AttendanceStatus,
                SignInTime = a.SignInTime,
                SignOutTime = a.SignOutTime
            })
            .ToList();
    }
}