using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using LogisticsWebAPI.Models;
using LogisticsWebAPI.Controllers;

var builder = WebApplication.CreateBuilder(args);

builder.Configuration.AddUserSecrets<Program>();

var connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
builder.Services.AddDbContext<UserContext>(options =>
    options.UseMySql(connectionString, ServerVersion.AutoDetect(connectionString)));

var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var KEY = jwtSettings["Key"];
var ISSUER = jwtSettings["Issuer"];
var AUDIENCE = jwtSettings["Audience"];

var googleAuth = builder.Configuration.GetSection("GoogleAuth");
var ClientId = googleAuth["ClientID"];
var ClientSecret = googleAuth["ClientSecret"];

if (string.IsNullOrEmpty(KEY) || string.IsNullOrEmpty(ISSUER) || string.IsNullOrEmpty(AUDIENCE))
{
    throw new InvalidOperationException("JWT settings not configured. Check user-secrets.");
}
builder.Services.AddAuthentication().AddCookie("ExternalCookie").AddGoogle(googleOptions =>
{
    googleOptions.ClientId = ClientId!;
    googleOptions.ClientSecret = ClientSecret!;
    googleOptions.CallbackPath = "/signin-google";
    googleOptions.SignInScheme = "ExternalCookie";
});

builder.Services.AddControllers();
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});
builder.Services.AddAuthorization();
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme).AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidIssuer = ISSUER,
        ValidateAudience = true,
        ValidAudience = AUDIENCE,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(KEY))
    };
});

var app = builder.Build();

app.UseCors("AllowFrontend");
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new Microsoft.Extensions.FileProviders.PhysicalFileProvider(
        Path.Combine(app.Environment.ContentRootPath, "..", "Frontend")),
    ServeUnknownFileTypes = true
});
app.UseRouting();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();