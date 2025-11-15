using ChatGPTCodingChallenge2.Models;

namespace ChatGPTCodingChallenge2.Services;

public interface ITokenService
{
    string CreateToken(User user);
}
