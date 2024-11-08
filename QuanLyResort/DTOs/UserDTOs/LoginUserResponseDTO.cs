using System.Runtime.CompilerServices;

namespace QuanLyResort.DTOs.UserDTOs
{
    public class LoginUserResponseDTO
    {
        public int UserId { get; set; }
   
        public string Message { get; set; }
        public bool IsLogin { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string Email { get; set; }
    }
}