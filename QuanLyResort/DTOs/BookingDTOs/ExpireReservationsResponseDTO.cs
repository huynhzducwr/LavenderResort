namespace QuanLyResort.DTOs.BookingDTOs
{
    public class ExpireReservationsResponseDTO
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public int RowsAffected { get; set; } // Optional: Number of reservations expired
    }

}
