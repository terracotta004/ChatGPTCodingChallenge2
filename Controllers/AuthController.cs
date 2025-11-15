using ChatGPTCodingChallenge2.Data;
using ChatGPTCodingChallenge2.Models;
using ChatGPTCodingChallenge2.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;

namespace ChatGPTCodingChallenge2.Controllers;

[ApiController]
[Route("auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ITokenService _tokenService;

    public AuthController(AppDbContext db, ITokenService tokenService)
    {
        _db = db;
        _tokenService = tokenService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register(RegisterRequest request)
    {
        var exists = await _db.Users.AnyAsync(u => u.Username == request.Username);
        if (exists) return BadRequest("User already exists.");

        var passwordHash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(request.Password))
        );

        var user = new User
        {
            Username = request.Username,
            PasswordHash = passwordHash
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return Ok("User registered.");
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Username == request.Username);
        if (user == null) return Unauthorized();

        var hash = Convert.ToHexString(
            SHA256.HashData(Encoding.UTF8.GetBytes(request.Password))
        );

        if (hash != user.PasswordHash) return Unauthorized();

        var token = _tokenService.CreateToken(user);
        return Ok(new { token });
    }
}
