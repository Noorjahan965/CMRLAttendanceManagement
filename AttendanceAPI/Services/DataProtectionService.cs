using Microsoft.AspNetCore.DataProtection;
using System.Security.Cryptography;

namespace AttendanceAPI.Services;

public class DataProtectionService
{
    private readonly IDataProtector _protector;

    public DataProtectionService(
        IDataProtectionProvider provider)
    {
        _protector =
            provider.CreateProtector(
                "AttendanceAPI.EmployeeData");
    }

    public string Encrypt(string value)
    {
        return _protector.Protect(value);
    }

    public string? Decrypt(string value)
    {
        if (string.IsNullOrEmpty(value))
            return null;

        try
        {
            return _protector.Unprotect(value);
        }
        
        catch (Exception ex)
{
    Console.WriteLine("========== DECRYPT ERROR ==========");
    Console.WriteLine($"Value: {value}");
    Console.WriteLine($"Message: {ex.Message}");
    Console.WriteLine($"Type: {ex.GetType().Name}");
    Console.WriteLine("==================================");
    return value;
}
    }
}