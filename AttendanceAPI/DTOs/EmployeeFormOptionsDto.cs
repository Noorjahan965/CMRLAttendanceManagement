namespace AttendanceAPI.DTOs;

public class EmployeeFormOptionsDto
{
    public List<DropdownItemDto> Genders { get; set; } = [];

    public List<DropdownItemDto> Communities { get; set; } = [];

    public List<DropdownItemDto> Departments { get; set; } = [];

    public List<DropdownItemDto> Designations { get; set; } = [];

    public List<DropdownItemDto> Locations { get; set; } = [];

    public List<DropdownItemDto> Shifts { get; set; } = [];

    public List<DropdownItemDto> Roles { get; set; } = [];
}