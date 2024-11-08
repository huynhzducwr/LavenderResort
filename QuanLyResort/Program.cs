using QuanLyResort.Repository;
using Microsoft.Extensions.Options;
using QuanLyResort.Connection; 
using Serilog;
using QuanLyResort.DTOs.BookingDTOs;

namespace QuanLyResort
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Thêm các dịch vụ vào container
            builder.Services.AddControllers();
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddTransient<SqlConnectionFactory>();
            builder.Services.AddScoped<UserRepository>();
            builder.Services.AddScoped<RoomTypeRepository>();
            builder.Services.AddScoped<RoomRepository>();
            builder.Services.AddScoped<AmenityRepository>();
            builder.Services.AddScoped<RoomAmenityRepository>();
            builder.Services.AddScoped<HotelSearchRepository>();
            builder.Services.AddScoped<ReservationRepository>();
            builder.Services.AddScoped<CancellationRepository>();
            builder.Services.AddScoped<ImageRepository>();
            builder.Services.AddScoped<ImageServicesRepository>();
            builder.Services.AddScoped<ServicesRepository>();
            builder.Services.AddSingleton<ReservationRepository, ReservationRepository>(); // Đảm bảo repository đã được đăng ký
            builder.Services.AddHostedService<ExpireReservationsBackgroundService>();


            // Cấu hình CORS
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAllOrigins",
                    builder =>
                    {
                        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
                    });
            });

            // Thiết lập Serilog
            builder.Host.UseSerilog((context, services, configuration) => configuration
                .ReadFrom.Configuration(context.Configuration)
                .ReadFrom.Services(services));

            var app = builder.Build();

            // Cấu hình pipeline HTTP
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseHttpsRedirection();
            app.UseCors("AllowAllOrigins"); // Sử dụng CORS
            app.UseAuthorization();
            app.MapControllers();
            app.UseStaticFiles();
            app.UseRouting();
            app.Run();
        }
    }
}
