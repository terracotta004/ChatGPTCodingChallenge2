using ChatGPTCodingChallenge2.Data;
using ChatGPTCodingChallenge2.Services;
using ChatGPTCodingChallenge2.Models;

using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.Options;

using System.Text;

var builder = WebApplication.CreateBuilder(args);

// ------------------------------------------------------
// Database
// ------------------------------------------------------
builder.Services.AddDbContext<AppDbContext>(opts =>
    opts.UseSqlite("Data Source=chatgptcodingchallenge2.db")
);

// ------------------------------------------------------
// Configure strongly-typed JWT options
// ------------------------------------------------------
builder.Services.Configure<JwtOptions>(
    builder.Configuration.GetSection("Jwt")
);

var jwtOptions = builder.Configuration
    .GetSection("Jwt")
    .Get<JwtOptions>()!; // Guaranteed non-null because of `required`

var keyBytes = Encoding.UTF8.GetBytes(jwtOptions.Key);

// ------------------------------------------------------
// Dependency Injection
// ------------------------------------------------------
builder.Services.AddScoped<ITokenService, TokenService>();
builder.Services.AddHttpClient<GitHubApiService>(client =>
{
    client.DefaultRequestHeaders.UserAgent.ParseAdd("ChatGPTCodingChallenge2");
});

// ------------------------------------------------------
// Authentication
// ------------------------------------------------------
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtOptions.Issuer,

            ValidateAudience = true,
            ValidAudience = jwtOptions.Audience,

            ValidateLifetime = true,

            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(keyBytes)
        };
    });

// ------------------------------------------------------
// MVC & Swagger
// ------------------------------------------------------
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "ChatGPTCodingChallenge2 API", Version = "v1" });

    // Add JWT Authentication to Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Description = "Enter JWT token like this: Bearer {your token}",
        Name = "Authorization",
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});


// ------------------------------------------------------
// Build and configure HTTP pipeline
// ------------------------------------------------------
var app = builder.Build();

app.UseSwagger();
app.UseSwaggerUI();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
