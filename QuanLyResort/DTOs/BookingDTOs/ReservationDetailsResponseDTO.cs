namespace QuanLyResort.DTOs.BookingDTOs
{
    public class ReservationDetailsResponseDTO
    {
        public int ReservationID { get; set; }
        public int UserID { get; set; }
        public DateTime BookingDate { get; set; }
        public decimal TotalCost { get; set; }
        public int Adult { get; set; }
        public int Child { get; set; }
        public int Infant { get; set; }
        public string SDT { get; set; }
        public string TypeName { get; set; }
        public string Firstname { get; set; }
        public string RoomNumber { get;set; }
        public string Lastname { get; set; }
        public int NumberOfNights { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
        public string Status { get; set; }
        public DateTime CreatedDate { get; set; }
    }

}
