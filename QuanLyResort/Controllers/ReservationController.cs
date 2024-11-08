
using Microsoft.AspNetCore.Connections;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Data.SqlClient;
using QuanLyResort.DTOs.BookingDTOs;
using QuanLyResort.Models;
using QuanLyResort.Repository;
using System.Data;
using System.Net;

namespace QuanLyResort.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ReservationController : ControllerBase
    {
        private readonly ReservationRepository _reservationRepository;
        private readonly ILogger<ReservationController> _logger;

        public ReservationController(ReservationRepository reservationRepository, ILogger<ReservationController> logger)
        {
            _reservationRepository = reservationRepository;
            _logger = logger;
        }
        [HttpPost("expire")]
        public async Task<IActionResult> ExpireReservations()
        {
            var response = await _reservationRepository.ExpireReservationsAsync();
            if (response.Success)
            {
                return Ok(new { message = response.Message, rowsAffected = response.RowsAffected });
            }
            else
            {
                return BadRequest(new { message = response.Message });
            }
        }

        [HttpGet("All")]
        public async Task<APIResponse<List<ReservationDetailsResponseDTO>>> GetAllReservations()
        {
            _logger.LogInformation("Request Received for GetAllReservations");
            try
            {
                // Gọi Repository để lấy danh sách đặt phòng
                var reservations = await _reservationRepository.GetAllReservationsAsync();

                // Trả về APIResponse với dữ liệu danh sách đặt phòng
                return new APIResponse<List<ReservationDetailsResponseDTO>>(reservations, "Retrieved all Reservations Successfully.");
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                _logger.LogError(ex, "Error Retrieving all Reservations");

                // Trả về lỗi với mã lỗi HTTP
                return new APIResponse<List<ReservationDetailsResponseDTO>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
            }
        }
        [HttpGet("AllReservationRooom")]
        public async Task<APIResponse<List<ReservationRoomDetailsResponseDTO>>> GetAllReservationRooms()
        {
            _logger.LogInformation("Request Received for GetAllReservationRooms");
            try
            {
                var reservationRooms = await _reservationRepository.GetAllReservationRoomsAsync();

                return new APIResponse<List<ReservationRoomDetailsResponseDTO>>(reservationRooms, "Retrieved all Reservation Rooms Successfully.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error Retrieving all Reservation Rooms");
                return new APIResponse<List<ReservationRoomDetailsResponseDTO>>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
            }
        }

        [HttpPost("ToggleReservationStatus")]
        public async Task<APIResponse<string>> ToggleReservationStatusAsync([FromBody] ToggleReservationStatusRequest request)
        {
            _logger.LogInformation("Request Received for ToggleReservationStatusAsync");

            try
            {
                // Kiểm tra thông tin request hợp lệ
                if (request == null || request.ReservationID <= 0 || string.IsNullOrEmpty(request.Status))
                {
                    return new APIResponse<string>(HttpStatusCode.BadRequest, "Invalid request parameters.");
                }

                // Gọi repository để cập nhật trạng thái đặt phòng
                var errorMessage = await _reservationRepository.UpdateReservationStatusAsync(request.ReservationID, request.Status);

                // Nếu có thông báo lỗi từ repository, trả về lỗi
                if (!string.IsNullOrEmpty(errorMessage))
                {
                    return new APIResponse<string>(HttpStatusCode.BadRequest, errorMessage);
                }

                // Trả về thông báo thành công
                return new APIResponse<string>("Reservation status updated successfully.");
            }
            catch (Exception ex)
            {
                // Ghi log lỗi
                _logger.LogError(ex, "Error toggling reservation status");

                // Trả về lỗi với mã lỗi HTTP
                return new APIResponse<string>(HttpStatusCode.InternalServerError, "Internal server error: " + ex.Message);
            }
        }



        [HttpPost("CalculateRoomCosts")]
        public async Task<APIResponse<RoomCostsResponseDTO>> CalculateRoomCosts([FromBody] RoomCostsDTO model)
        {
            _logger.LogInformation("Request Received for CalculateRoomCosts: {@RoomCostsDTO}", model);

            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid Data in the Request Body");
                return new APIResponse<RoomCostsResponseDTO>(HttpStatusCode.BadRequest, "Invalid Data in the Request Body");
            }

            try
            {
                var result = await _reservationRepository.CalculateRoomCostsAsync(model);

                if (result.Status)
                {
                    return new APIResponse<RoomCostsResponseDTO>(result, "Success");
                }
                return new APIResponse<RoomCostsResponseDTO>(HttpStatusCode.BadRequest, "Failed");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to calculate room costs");
                return new APIResponse<RoomCostsResponseDTO>(HttpStatusCode.InternalServerError, "Failed to calculate room costs", ex.Message);
            }
        }

        [HttpPost("CreateReservation")]
        public async Task<APIResponse<CreateReservationResponseDTO>> CreateReservation([FromBody] CreateReservationDTO reservation)
        {
            _logger.LogInformation("Request Received for CreateReservation: {@CreateReservationDTO}", reservation);

            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid Data in the Request Body");
                return new APIResponse<CreateReservationResponseDTO>(HttpStatusCode.BadRequest, "Invalid Data in the Request Body");
            }

            try
            {
                var result = await _reservationRepository.CreateReservationAsync(reservation);
                if (result.Status)
                {
                    return new APIResponse<CreateReservationResponseDTO>(result, result.Message);
                }
                return new APIResponse<CreateReservationResponseDTO>(HttpStatusCode.BadRequest, result.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create reservation");
                return new APIResponse<CreateReservationResponseDTO>(HttpStatusCode.InternalServerError, "Failed to create reservation", ex.Message);
            }
        }

        [HttpPost("AddGuestsToReservation")]
        public async Task<APIResponse<AddGuestsToReservationResponseDTO>> AddGuestsToReservation([FromBody] AddGuestsToReservationDTO details)
        {
            _logger.LogInformation("Request Received for AddGuestsToReservation: {@AddGuestsToReservationDTO}", details);

            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid Data in the Request Body");
                return new APIResponse<AddGuestsToReservationResponseDTO>(HttpStatusCode.BadRequest, "Invalid Data in the Request Body");
            }

            try
            {
                var result = await _reservationRepository.AddGuestsToReservationAsync(details);
                if (result.Status)
                {
                    return new APIResponse<AddGuestsToReservationResponseDTO>(result, result.Message);
                }
                return new APIResponse<AddGuestsToReservationResponseDTO>(HttpStatusCode.BadRequest, result.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to add guests to reservation");
                return new APIResponse<AddGuestsToReservationResponseDTO>(HttpStatusCode.InternalServerError, "Failed to add guests to reservation", ex.Message);
            }
        }

        [HttpPost("ProcessPayment")]
        public async Task<APIResponse<ProcessPaymentResponseDTO>> ProcessPayment([FromBody] ProcessPaymentDTO payment)
        {
            _logger.LogInformation("Request Received for ProcessPayment: {@ProcessPaymentDTO}", payment);

            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid Data in the Request Body");
                return new APIResponse<ProcessPaymentResponseDTO>(HttpStatusCode.BadRequest, "Invalid Data in the Request Body");
            }

            try
            {
                var result = await _reservationRepository.ProcessPaymentAsync(payment);
                if (result.Status)
                {
                    return new APIResponse<ProcessPaymentResponseDTO>(result, result.Message);
                }
                return new APIResponse<ProcessPaymentResponseDTO>(HttpStatusCode.BadRequest, result.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to Process Payment");
                return new APIResponse<ProcessPaymentResponseDTO>(HttpStatusCode.InternalServerError, "Failed to Process Payment", ex.Message);
            }
        }

        [HttpPost("UpdatePaymentStatus")]
        public async Task<APIResponse<UpdatePaymentStatusResponseDTO>> UpdatePaymentStatus([FromBody] UpdatePaymentStatusDTO statusUpdate)
        {
            _logger.LogInformation("Request Received for UpdatePaymentStatus: {@UpdatePaymentStatusDTO}", statusUpdate);

            if (!ModelState.IsValid)
            {
                _logger.LogInformation("Invalid Data in the Request Body");
                return new APIResponse<UpdatePaymentStatusResponseDTO>(HttpStatusCode.BadRequest, "Invalid Data in the Request Body");
            }

            try
            {
                var result = await _reservationRepository.UpdatePaymentStatusAsync(statusUpdate);
                if (result.Status)
                {
                    return new APIResponse<UpdatePaymentStatusResponseDTO>(result, result.Message);
                }
                return new APIResponse<UpdatePaymentStatusResponseDTO>(HttpStatusCode.BadRequest, result.Message);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to update payment status");
                return new APIResponse<UpdatePaymentStatusResponseDTO>(HttpStatusCode.InternalServerError, "Failed to update payment status", ex.Message);
            }
        }
    }
}