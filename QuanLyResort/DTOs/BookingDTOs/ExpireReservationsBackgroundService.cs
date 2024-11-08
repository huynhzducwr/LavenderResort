
using Microsoft.Extensions.Hosting;
using QuanLyResort.Repository;
using System;
using System.Threading;
using System.Threading.Tasks;
namespace QuanLyResort.DTOs.BookingDTOs
{
    public class ExpireReservationsBackgroundService : BackgroundService
    {
        private readonly ReservationRepository _reservationRepository;

        public ExpireReservationsBackgroundService(ReservationRepository reservationRepository)
        {
            _reservationRepository = reservationRepository;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await RunExpireReservationsJob();
                }
                catch (Exception ex)
                {
                    Console.Error.WriteLine($"Lỗi khi hết hạn đặt phòng: {ex.Message}");
                }

                // Chờ 1 phút trước khi chạy lại
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken);
            }
        }

        private async Task RunExpireReservationsJob()
        {
            var response = await _reservationRepository.ExpireReservationsAsync();
            if (response.Success)
            {
                Console.WriteLine(response.Message);
            }
            else
            {
                Console.Error.WriteLine($"Không thể hết hạn đặt phòng: {response.Message}");
            }
        }
    }
}
