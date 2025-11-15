using ChatGPTCodingChallenge2.Models;
using System.Net.Http.Json;

namespace ChatGPTCodingChallenge2.Services;

public class GitHubApiService
{
    private readonly HttpClient _http;

    public GitHubApiService(HttpClient http)
    {
        _http = http;
    }

    public async Task<List<GitHubRepo>> GetReposAsync(string username)
    {
        return await _http.GetFromJsonAsync<List<GitHubRepo>>(
            $"https://api.github.com/users/{username}/repos"
        ) ?? new();
    }
}
