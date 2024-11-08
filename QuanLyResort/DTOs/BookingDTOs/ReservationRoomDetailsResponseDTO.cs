namespace QuanLyResort.DTOs.BookingDTOs
{
    public class ReservationRoomDetailsResponseDTO
    {
        public int ReservationRoomID { get; set; }
        public int ReservationID { get; set; }
        public int RoomID { get; set; }
        public string TypeName { get; set; }
        public string Firstname { get; set; }
        public string Lastname { get; set; }
        public string ImageURL { get; set; }
        public DateTime CheckInDate { get; set; }
        public DateTime CheckOutDate { get; set; }
    }
}
