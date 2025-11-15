using Microsoft.EntityFrameworkCore;
using ChatGPTCodingChallenge2.Models;

namespace ChatGPTCodingChallenge2.Data;

public class AppDbContext : DbContext
{
    public DbSet<User> Users => Set<User>();

    public AppDbContext(DbContextOptions<AppDbContext> options)
        : base(options) { }
}
