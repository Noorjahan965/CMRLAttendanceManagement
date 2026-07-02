using System.Net;
using System.Net.Mail;

namespace AttendanceAPI.Services;

public class EmailService
{
    private readonly IConfiguration _config;

    public EmailService(IConfiguration config)
    {
        _config = config;
    }

    public async Task SendOtpAsync(string toEmail, string otp)
    {
        var smtp = new SmtpClient(_config["Smtp:Host"])
        {
            Port = int.Parse(_config["Smtp:Port"]!),
            Credentials = new NetworkCredential(
                _config["Smtp:Username"],
                _config["Smtp:Password"]),
            EnableSsl = true
        };

        var mail = new MailMessage
        {
            From = new MailAddress(
                _config["Smtp:Username"]!,
                _config["Smtp:FromName"]),
            Subject = "CMRL Attendance - Password Reset OTP",
            Body = $"""
                Your OTP for password reset is: {otp}
                
                This OTP is valid for 10 minutes.
                Do not share this with anyone.
                """,
            IsBodyHtml = false
        };

        mail.To.Add(toEmail);
        await smtp.SendMailAsync(mail);
    }
}