namespace QuanLyResort.DTOs.BookingDTOs
{
    public class ToggleReservationStatusRequest
    {
        public int ReservationID { get; set; }
        public string Status { get; set; }
    }
}
