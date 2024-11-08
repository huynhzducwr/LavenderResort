
using Microsoft.Data.SqlClient;
using QuanLyResort.Connection;
using QuanLyResort.DTOs.BookingDTOs;
using System.Data;

namespace QuanLyResort.Repository
{
    public class ReservationRepository
    {
        private readonly SqlConnectionFactory _connectionFactory;

        public ReservationRepository(SqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<RoomCostsResponseDTO> CalculateRoomCostsAsync(RoomCostsDTO model)
        {
            RoomCostsResponseDTO roomCostsResponseDTO = new RoomCostsResponseDTO();
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var command = new SqlCommand("spCalculateRoomCosts", connection);
                command.CommandType = CommandType.StoredProcedure;

                command.Parameters.AddWithValue("@CheckInDate", model.CheckInDate);
                command.Parameters.AddWithValue("@CheckOutDate", model.CheckOutDate);

                // Setting up the RoomIDs parameter
                var table = new DataTable();
                table.Columns.Add("RoomID", typeof(int));
                model.RoomIDs.ForEach(id => table.Rows.Add(id));
                command.Parameters.AddWithValue("@RoomIDs", table).SqlDbType = SqlDbType.Structured;

                // Adding output parameters
                command.Parameters.Add("@Amount", SqlDbType.Decimal).Direction = ParameterDirection.Output;
                command.Parameters.Add("@GST", SqlDbType.Decimal).Direction = ParameterDirection.Output;
                command.Parameters.Add("@TotalAmount", SqlDbType.Decimal).Direction = ParameterDirection.Output;

                await connection.OpenAsync();
                using var reader = await command.ExecuteReaderAsync();

                // Populate room details
                while (reader.Read())
                {
                    roomCostsResponseDTO.RoomDetails.Add(new RoomCostDetailDTO
                    {
                        RoomID = reader.GetInt32(reader.GetOrdinal("RoomID")),
                        RoomNumber = reader.GetString(reader.GetOrdinal("RoomNumber")),
                        RoomPrice = reader.GetDecimal(reader.GetOrdinal("RoomPrice")),
                        TotalPrice = reader.GetDecimal(reader.GetOrdinal("TotalPrice")),
                        NumberOfNights = reader.GetInt32(reader.GetOrdinal("NumberOfNights"))
                    });
                }

                // Ensuring the reader is closed before accessing output parameters
                await reader.CloseAsync();

                // Access output parameters
                roomCostsResponseDTO.Amount = (decimal)command.Parameters["@Amount"].Value;
                roomCostsResponseDTO.GST = (decimal)command.Parameters["@GST"].Value;
                roomCostsResponseDTO.TotalAmount = (decimal)command.Parameters["@TotalAmount"].Value;
                roomCostsResponseDTO.Status = true;
                roomCostsResponseDTO.Message = "Sucess";
            }
            catch (Exception ex)
            {
                // Log exception here
                roomCostsResponseDTO.Status = false;
                roomCostsResponseDTO.Message = ex.Message;
            }
            return roomCostsResponseDTO;
        }

        public async Task<CreateReservationResponseDTO> CreateReservationAsync(CreateReservationDTO reservation)
        {
            CreateReservationResponseDTO createReservationResponseDTO = new CreateReservationResponseDTO();
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var command = new SqlCommand("spCreateReservation", connection);
                command.CommandType = CommandType.StoredProcedure;
                command.Parameters.AddWithValue("@UserID", reservation.UserID);
                command.Parameters.AddWithValue("@CheckInDate", reservation.CheckInDate);
                command.Parameters.AddWithValue("@CheckOutDate", reservation.CheckOutDate);
                command.Parameters.AddWithValue("@Adult", reservation.Adult);
                command.Parameters.AddWithValue("@Child", reservation.Child);
                command.Parameters.AddWithValue("@Infant", reservation.Infant);
                command.Parameters.AddWithValue("@SDT", reservation.SDT);


                var table = new DataTable();
                table.Columns.Add("RoomID", typeof(int));
                reservation.RoomIDs.ForEach(id => table.Rows.Add(id));
                command.Parameters.AddWithValue("@RoomIDs", table).SqlDbType = SqlDbType.Structured;

                command.Parameters.Add("@Message", SqlDbType.NVarChar, 255).Direction = ParameterDirection.Output;
                command.Parameters.Add("@Status", SqlDbType.Bit).Direction = ParameterDirection.Output;
                command.Parameters.Add("@ReservationID", SqlDbType.Int).Direction = ParameterDirection.Output;

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                createReservationResponseDTO.Message = command.Parameters["@Message"].Value.ToString();
                createReservationResponseDTO.Status = (bool)command.Parameters["@Status"].Value;
                createReservationResponseDTO.ReservationID = (int)command.Parameters["@ReservationID"].Value;
            }
            catch (Exception ex)
            {
                // Log exception here
                createReservationResponseDTO.Message = ex.Message;
                createReservationResponseDTO.Status = false;
            }
            return createReservationResponseDTO;
        }

        public async Task<ExpireReservationsResponseDTO> ExpireReservationsAsync()
        {
            var response = new ExpireReservationsResponseDTO();
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var command = new SqlCommand("spExpireReservations", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };

                await connection.OpenAsync();
                int rowsAffected = await command.ExecuteNonQueryAsync();

                response.Success = true;
                response.Message = $"{rowsAffected} reservations expired successfully.";
                response.RowsAffected = rowsAffected;
            }
            catch (Exception ex)
            {
                // Log the exception as needed
                response.Success = false;
                response.Message = $"An error occurred: {ex.Message}";
            }

            return response;
        }

        public async Task<AddGuestsToReservationResponseDTO> AddGuestsToReservationAsync(AddGuestsToReservationDTO details)
        {
            AddGuestsToReservationResponseDTO addGuestsToReservationResponseDTO = new AddGuestsToReservationResponseDTO();
            try
            {
                using var connection    = _connectionFactory.CreateConnection();
                using var command = new SqlCommand("spAddGuestsToReservation", connection);
                command.CommandType = CommandType.StoredProcedure;

                command.Parameters.AddWithValue("@UserID", details.UserID);
                command.Parameters.AddWithValue("@ReservationID", details.ReservationID);

                var table = new DataTable();
                table.Columns.Add("FirstName", typeof(string));
                table.Columns.Add("LastName", typeof(string));
                table.Columns.Add("Email", typeof(string));
                table.Columns.Add("Phone", typeof(string));
                table.Columns.Add("AgeGroup ", typeof(string));
                table.Columns.Add("Address", typeof(string));
                table.Columns.Add("RoomID", typeof(int));

                details.GuestDetails.ForEach(guest =>
                {
                    table.Rows.Add(guest.FirstName, guest.LastName, guest.Email, guest.Phone,
                        guest.AgeGroup, guest.Address,   guest.RoomID);
                });
                command.Parameters.AddWithValue("@GuestDetails", table).SqlDbType = SqlDbType.Structured;

                command.Parameters.Add("@Status", SqlDbType.Bit).Direction = ParameterDirection.Output;
                command.Parameters.Add("@Message", SqlDbType.NVarChar, 255).Direction = ParameterDirection.Output;

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                addGuestsToReservationResponseDTO.Status = (bool)command.Parameters["@Status"].Value;
                addGuestsToReservationResponseDTO.Message = command.Parameters["@Message"].Value.ToString();
            }
            catch (Exception ex)
            {
                // Log exception here
                addGuestsToReservationResponseDTO.Message = ex.Message;
                addGuestsToReservationResponseDTO.Status = false;
            }
            return addGuestsToReservationResponseDTO;
        }

        public async Task<ProcessPaymentResponseDTO> ProcessPaymentAsync(ProcessPaymentDTO payment)
        {
            ProcessPaymentResponseDTO processPaymentResponseDTO = new ProcessPaymentResponseDTO();
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var command = new SqlCommand("spProcessPayment", connection);
                command.CommandType = CommandType.StoredProcedure;

                command.Parameters.AddWithValue("@ReservationID", payment.ReservationID);
                command.Parameters.AddWithValue("@TotalAmount", payment.TotalAmount);
                command.Parameters.AddWithValue("@PaymentMethod", payment.PaymentMethod);

                command.Parameters.Add("@PaymentID", SqlDbType.Int).Direction = ParameterDirection.Output;
                command.Parameters.Add("@Status", SqlDbType.Bit).Direction = ParameterDirection.Output;
                command.Parameters.Add("@Message", SqlDbType.NVarChar, 255).Direction = ParameterDirection.Output;

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                processPaymentResponseDTO.PaymentID = (int)command.Parameters["@PaymentID"].Value;
                processPaymentResponseDTO.Status = (bool)command.Parameters["@Status"].Value;
                processPaymentResponseDTO.Message = command.Parameters["@Message"].Value.ToString();
            }
            catch (Exception ex)
            {
                // Log exception here
                processPaymentResponseDTO.Message = ex.Message;
                processPaymentResponseDTO.Status = false;
            }
            return processPaymentResponseDTO;
        }

        public async Task<UpdatePaymentStatusResponseDTO> UpdatePaymentStatusAsync(UpdatePaymentStatusDTO statusUpdate)
        {
            UpdatePaymentStatusResponseDTO updatePaymentStatusResponseDTO = new UpdatePaymentStatusResponseDTO();
            try
            {
                using var connection = _connectionFactory.CreateConnection();
                using var command = new SqlCommand("spUpdatePaymentStatus", connection);
                command.CommandType = CommandType.StoredProcedure;

                command.Parameters.AddWithValue("@PaymentID", statusUpdate.PaymentID);
                command.Parameters.AddWithValue("@NewStatus", statusUpdate.NewStatus);
                command.Parameters.AddWithValue("@FailureReason", string.IsNullOrEmpty(statusUpdate.FailureReason) ? DBNull.Value : (object)statusUpdate.FailureReason);

                command.Parameters.Add("@Status", SqlDbType.Bit).Direction = ParameterDirection.Output;
                command.Parameters.Add("@Message", SqlDbType.NVarChar, 255).Direction = ParameterDirection.Output;

                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                updatePaymentStatusResponseDTO.Status = (bool)command.Parameters["@Status"].Value;
                updatePaymentStatusResponseDTO.Message = command.Parameters["@Message"].Value.ToString();
            }
            catch (Exception ex)
            {
                // Log exception here
                updatePaymentStatusResponseDTO.Message = ex.Message;
                updatePaymentStatusResponseDTO.Status = false;
            }
            return updatePaymentStatusResponseDTO;
        }
        public async Task<List<ReservationRoomDetailsResponseDTO>> GetAllReservationRoomsAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("GetAllReservationRooms", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            try
            {
                await connection.OpenAsync();
                var reservationRooms = new List<ReservationRoomDetailsResponseDTO>();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    reservationRooms.Add(new ReservationRoomDetailsResponseDTO
                    {
                        ReservationRoomID = reader.GetInt32(reader.GetOrdinal("ReservationRoomID")),
                        ReservationID = reader.GetInt32(reader.GetOrdinal("ReservationID")),
                        RoomID = reader.GetInt32(reader.GetOrdinal("RoomID")),
                        TypeName = reader.GetString(reader.GetOrdinal("TypeName")),
                        Firstname = reader.GetString(reader.GetOrdinal("Firstname")),
                        Lastname = reader.GetString(reader.GetOrdinal("Lastname")),
                        ImageURL = reader.GetString(reader.GetOrdinal("ImageURL")),
                        CheckInDate = reader.GetDateTime(reader.GetOrdinal("CheckInDate")),
                        CheckOutDate = reader.GetDateTime(reader.GetOrdinal("CheckOutDate"))
                    });
                }
                return reservationRooms;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving all reservation rooms: {ex.Message}", ex);
            }
        }
        public async Task<List<ReservationDetailsResponseDTO>> GetAllReservationsAsync()
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("GetAllReservations", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            try
            {
                await connection.OpenAsync();
                var reservations = new List<ReservationDetailsResponseDTO>();
                using var reader = await command.ExecuteReaderAsync();
                while (await reader.ReadAsync())
                {
                    reservations.Add(new ReservationDetailsResponseDTO
                    {
                        ReservationID = reader.GetInt32(reader.GetOrdinal("ReservationID")),
                        UserID = reader.GetInt32(reader.GetOrdinal("UserID")),
                        BookingDate = reader.GetDateTime(reader.GetOrdinal("BookingDate")),
                        TotalCost = reader.GetDecimal(reader.GetOrdinal("TotalCost")),
                        TypeName = reader.GetString(reader.GetOrdinal("TypeName")),
                        Adult = reader.GetInt32(reader.GetOrdinal("Adult")),
                        Firstname = reader.GetString(reader.GetOrdinal("Firstname")),
                        Lastname = reader.GetString(reader.GetOrdinal("Lastname")),
                        SDT = reader.GetString(reader.GetOrdinal("SDT")),
                        RoomNumber = reader.GetString(reader.GetOrdinal("RoomNumber")),
                        Child = reader.GetInt32(reader.GetOrdinal("Child")),
                        Infant = reader.GetInt32(reader.GetOrdinal("Infant")),
                        NumberOfNights = reader.GetInt32(reader.GetOrdinal("NumberOfNights")),
                        CheckInDate = reader.GetDateTime(reader.GetOrdinal("CheckInDate")),
                        CheckOutDate = reader.GetDateTime(reader.GetOrdinal("CheckOutDate")),
                        Status = reader.GetString(reader.GetOrdinal("Status")),
                        CreatedDate = reader.GetDateTime(reader.GetOrdinal("CreatedDate"))
                    });
                }
                return reservations;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error retrieving all reservations: {ex.Message}", ex);
            }
        }


        public async Task<string> UpdateReservationStatusAsync(int reservationId, string status)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spUpdateReservationStatus", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Thêm các tham số cho thủ tục
            command.Parameters.Add(new SqlParameter("@ReservationID", SqlDbType.Int) { Value = reservationId });
            command.Parameters.Add(new SqlParameter("@Status", SqlDbType.NVarChar, 50) { Value = status });
            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(errorMessageParam);

            try
            {
                await connection.OpenAsync();
                await command.ExecuteNonQueryAsync();

                // Trả về thông báo lỗi nếu có (có thể là thông báo lỗi từ thủ tục)
                var errorMessage = errorMessageParam.Value.ToString();
                if (!string.IsNullOrEmpty(errorMessage))
                {
                    return errorMessage;  // Trả về thông báo lỗi nếu có
                }

                return "Reservation status updated successfully.";
            }
            catch (Exception ex)
            {
                throw new Exception($"Error updating reservation status: {ex.Message}", ex);
            }
        }


    }


}