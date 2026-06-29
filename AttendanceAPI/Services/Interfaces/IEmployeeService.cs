using AttendanceAPI.DTOs;

namespace AttendanceAPI.Services.Interfaces;

public interface IEmployeeService
{
    Task<EmployeeFormOptionsDto>GetFormOptionsAsync();
    Task<bool> UpdateEmployeeAsync(int employeeId,EmployeeUpdateRequestDto request);
     Task<List<EmployeeResponseDto>> GetActiveEmployeesAsync(string username);
    Task<(bool Success, string Message, EmployeeResponseDto? Employee)> CreateEmployeeAsync(EmployeeCreateRequestDto request);
    Task<List<EmployeeResponseDto>>
    SearchEmployeesAsync(string keyword);
}