using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using QuanLyResort.DTOs.BookingDTOs;
using QuanLyResort.Repository;
using System.Net;

namespace QuanLyResort.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentController : ControllerBase
    {
        private readonly ReservationRepository _reservationRepository;
        private readonly ILogger<PaymentController> _logger;

        public PaymentController(ReservationRepository reservationRepository, ILogger<PaymentController> logger)
        {
            _reservationRepository = reservationRepository;
            _logger = logger;
        }


        [HttpPost("ProcessPayment")]
        public async Task<IActionResult> ProcessPayment([FromBody] ProcessPaymentDTO paymentRequest)
        {
            _logger.LogInformation("Yêu cầu ProcessPayment nhận được: {@ProcessPaymentDTO}", paymentRequest);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Dữ liệu trong yêu cầu không hợp lệ");
                return BadRequest(new { message = "Dữ liệu trong yêu cầu không hợp lệ" });
            }

            try
            {
                // Gọi hàm ProcessPayment của ReservationRepository
                var paymentResponse = await _reservationRepository.ProcessPaymentAsync(paymentRequest);

                if (paymentResponse.Status)  // Sử dụng thuộc tính Status thay vì success
                {
                    _logger.LogInformation("Thanh toán thành công cho ReservationID: {ReservationID}", paymentRequest.ReservationID);

                    // Sau khi thanh toán thành công, cập nhật trạng thái thanh toán
                    var statusUpdateRequest = new UpdatePaymentStatusDTO
                    {
                        PaymentID = paymentResponse.PaymentID,
                        NewStatus = "Thanh toán thành công",
                        FailureReason = null
                    };
                    await UpdatePaymentStatus(statusUpdateRequest);

                    return Ok(paymentResponse);
                }
                else
                {
                    _logger.LogWarning("Thanh toán thất bại cho ReservationID: {ReservationID}", paymentRequest.ReservationID);

                    // Nếu thanh toán thất bại, cập nhật trạng thái thất bại
                    var statusUpdateRequest = new UpdatePaymentStatusDTO
                    {
                        PaymentID = paymentResponse.PaymentID,
                        NewStatus = "Thanh toán thất bại",
                        FailureReason = paymentResponse.Message
                    };
                    await UpdatePaymentStatus(statusUpdateRequest);

                    return BadRequest(new { message = "Thanh toán thất bại", error = paymentResponse.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi thực hiện thanh toán");
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = "Lỗi khi thực hiện thanh toán", error = ex.Message });
            }
        }

        /// <summary>
        /// Phương thức riêng để cập nhật trạng thái thanh toán của đơn hàng
        /// </summary>
        private async Task<IActionResult> UpdatePaymentStatus(UpdatePaymentStatusDTO statusUpdate)
        {
            _logger.LogInformation("Yêu cầu UpdatePaymentStatus nhận được: {@UpdatePaymentStatusDTO}", statusUpdate);

            if (!ModelState.IsValid)
            {
                _logger.LogWarning("Dữ liệu trong yêu cầu không hợp lệ");
                return BadRequest(new { message = "Dữ liệu trong yêu cầu không hợp lệ" });
            }

            try
            {
                // Gọi hàm UpdatePaymentStatus của ReservationRepository
                var result = await _reservationRepository.UpdatePaymentStatusAsync(statusUpdate);

                if (result.Status)  // Kiểm tra thuộc tính Status
                {
                    _logger.LogInformation("Trạng thái thanh toán đã được cập nhật thành công cho PaymentID: {PaymentID}", statusUpdate.PaymentID);
                    return Ok(new { message = "Cập nhật trạng thái thành công", data = result.Message });
                }
                else
                {
                    _logger.LogWarning("Cập nhật trạng thái thanh toán thất bại cho PaymentID: {PaymentID}", statusUpdate.PaymentID);
                    return BadRequest(new { message = "Cập nhật trạng thái thất bại", error = result.Message });
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Lỗi khi cập nhật trạng thái thanh toán");
                return StatusCode((int)HttpStatusCode.InternalServerError, new { message = "Lỗi khi cập nhật trạng thái thanh toán", error = ex.Message });
            }
        }

        }
}
