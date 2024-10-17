﻿using System.ComponentModel.DataAnnotations;

namespace QuanLyResort.DTOs.UserDTOs
{
    public class CreateUserDTO
    {
        [Required(ErrorMessage = "Email is Required")]
        [EmailAddress(ErrorMessage = "Invalid Email Address")]
        public string Email { get; set; }
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }

        [Required(ErrorMessage = "Password is Required")]
        public string Password { get; set; } // This should be converted to a hash before being sent to the database.
    }
}