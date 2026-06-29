using AttendanceAPI.DTOs;
using AttendanceAPI.Models;

namespace AttendanceAPI.Repositories.Interfaces;

public interface IEmployeeRepository
{
    Task<EmployeeFormOptionsDto>
        GetFormOptionsAsync();

    Task<bool>
        EmployeeCodeExistsAsync(
            string employeeCode);

    Task<bool>
        UsernameExistsAsync(
            string username);

    Task<EmployeeMaster>
        CreateEmployeeAsync(
            EmployeeMaster employee);

    Task<UserLogin>
        CreateUserLoginAsync(
            UserLogin userLogin);

    Task<UserLogin?>
        GetUserLoginByEmployeeIdAsync(
            int employeeId);

    Task<EmployeeMaster?>
        GetEmployeeByIdAsync(
            int employeeId);

    Task<EmployeeMaster?>
        GetEmployeeByCodeAsync(
            string employeeCode);
    Task<int?> GetRoleIdByUsernameAsync(string username);
    Task<List<EmployeeMaster>>
        GetActiveEmployeesAsync(int requestRoleId);

    Task<List<EmployeeMaster>>
        SearchEmployeesAsync(
            string keyword);

    Task SaveAsync();
}