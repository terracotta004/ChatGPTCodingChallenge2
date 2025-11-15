using ChatGPTCodingChallenge2.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ChatGPTCodingChallenge2.Controllers;

[ApiController]
[Route("weather")]
public class WeatherController : ControllerBase
{
    private readonly GitHubApiService _github;

    public WeatherController(GitHubApiService github)
    {
        _github = github;
    }

    [Authorize]
    [HttpGet("repos/{username}")]
    public async Task<IActionResult> GetRepos(string username)
    {
        var repos = await _github.GetReposAsync(username);
        return Ok(repos);
    }
}
