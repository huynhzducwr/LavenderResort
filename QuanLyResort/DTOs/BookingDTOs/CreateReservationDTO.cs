using QuanLyResort.CustomValidator;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace QuanLyResort.DTOs.BookingDTOs
{
    public class CreateReservationDTO
    {
        [Required]
        public int UserID { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one room ID must be provided.")]
        public List<int> RoomIDs { get; set; }  // Room IDs for the reservation

        [Required]
        [DataType(DataType.DateTime)]
        [FutureDateValidation(ErrorMessage = "Check-in date and time must be in the future.")]
        public DateTime CheckInDate { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        [FutureDateValidation(ErrorMessage = "Check-out date and time must be in the future.")]
        [DateGreaterThanValidation("CheckInDate", ErrorMessage = "Check-out date and time must be after check-in date and time.")]
        public DateTime CheckOutDate { get; set; }

        [Required]
        public int Adult { get; set; }

        [Required]
        public int Child { get; set; }

        [Required]
        public int Infant { get; set; }
        [Required]
        public string SDT { get; set; }
    }
}
