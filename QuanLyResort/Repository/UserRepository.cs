using QuanLyResort.Connection;
using QuanLyResort.DTOs.UserDTOs;
using QuanLyResort.Extensions;
using Microsoft.Data.SqlClient;

using System.Data;

namespace QuanLyResort.Repository
{
    public class UserRepository
    {
        private readonly SqlConnectionFactory _connectionFactory;
        public UserRepository(SqlConnectionFactory connectionFactory)
        {
            _connectionFactory = connectionFactory;
        }

        public async Task<CreateUserResponseDTO> RegisterUserAsync(CreateUserDTO user)
        {
            CreateUserResponseDTO createUserResponseDTO = new CreateUserResponseDTO();
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spRegisterUser", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@Email", user.Email);
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
            command.Parameters.AddWithValue("@PasswordHash", hashedPassword);
            command.Parameters.AddWithValue("@CreatedBy", "System");
            command.Parameters.AddWithValue("@firstname", user.FirstName);
            command.Parameters.AddWithValue("@lastname", user.LastName);

            var userIdParam = new SqlParameter("@UserID", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(userIdParam);
            command.Parameters.Add(errorMessageParam);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            var UserID = (int)userIdParam.Value;
            if (UserID != -1)
            {
                createUserResponseDTO.UserId = UserID;
                createUserResponseDTO.IsCreated = true;
                createUserResponseDTO.Message = "Dang ki tai khoan thanh cong";
                return createUserResponseDTO;
            }

            var message = errorMessageParam.Value?.ToString();
            createUserResponseDTO.IsCreated = false;
            createUserResponseDTO.Message = message ?? "Da xay ra loi khi tao tai khoan";
            return createUserResponseDTO;

        }


        public async Task<UserRoleResponseDTO> AssignRoleToUserAsync(UserRoleDTO userRole)
        {
            UserRoleResponseDTO userRoleResponseDTO = new UserRoleResponseDTO();
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spAssignUserRole", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("@UserID", userRole.UserID);
            command.Parameters.AddWithValue("@RoleID", userRole.RoleID);

            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(errorMessageParam);

            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            var message = errorMessageParam.Value?.ToString();
            if (!string.IsNullOrEmpty(message))
            {
                userRoleResponseDTO.Message = message;
                userRoleResponseDTO.IsAssigned = false;
            }
            else
            {
                userRoleResponseDTO.Message = "Phan quuyen thanh cong";
                userRoleResponseDTO.IsAssigned = true;
            }
            return userRoleResponseDTO;
        }


        public async Task<List<UserResponseDTO>> ListAllUserAsync(bool? isActive)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spListAllUsers", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("@IsActive", (object)isActive ?? DBNull.Value);
            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            var users = new List<UserResponseDTO>();
            while (reader.Read())
            {
                users.Add(new UserResponseDTO
                {
                    UserID = reader.GetInt32("UserID"),
                    Email = reader.GetString("Email"),
                    FirstName = reader.GetString("Firstname"),
                    LastName = reader.GetString("Lastname"),
                    IsActive = reader.GetBoolean("IsActive"),
                    RoleName = reader.GetString("RoleName"),
                    LastLogin = reader.GetValueByColumn<DateTime?>("LastLogin"),
                });
            }
            return users;
        }

        public async Task<UserResponseDTO> GetUserByIDAsync(int userID)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spGetUserByID", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("@UserID", userID);
            var errorMessageParam = new SqlParameter("@ErrorMessage",
                SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(errorMessageParam);
            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            if (!reader.Read())
            {
                return null;
            }

            var user = new UserResponseDTO
            {
                UserID = reader.GetInt32("UserID"),
                Email = reader.GetString("Email"),
                FirstName = reader.GetString("Firstname"),
                LastName = reader.GetString("Lastname"),
                IsActive = reader.GetBoolean("IsActive"),
                RoleName = reader.GetString("RoleName"),
                LastLogin = reader.GetValueByColumn<DateTime?>("LastLogin"),

            };
            return user;

        }


        public async Task<UpdateUserResponseDTO> UpdateUserAsync(UpdateUserDTO user)
        {
            UpdateUserResponseDTO updateUserResponseDTO = new UpdateUserResponseDTO()
            {
                UserId = user.UserID
            };

            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spUpdateUser", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@UserID", user.UserID);
            command.Parameters.AddWithValue("@Email", user.Email);
            command.Parameters.AddWithValue("@Firstname", user.FirstName);
            command.Parameters.AddWithValue("@Lastname", user.LastName);

            // Hash the password before updating
            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(user.Password);
            command.Parameters.AddWithValue("@PasswordHash", hashedPassword);

            // Output parameter for error message
            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(errorMessageParam);

            // Execute the stored procedure
            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            // Retrieve and check the error message
            var message = errorMessageParam.Value?.ToString();
            if (string.IsNullOrEmpty(message))
            {
                updateUserResponseDTO.Message = "User information updated successfully.";
                updateUserResponseDTO.IsUpdated = true;
            }
            else
            {
                updateUserResponseDTO.Message = message;
                updateUserResponseDTO.IsUpdated = false;
            }

            return updateUserResponseDTO;
        }


        public async Task<DeleteUserResponseDTO> DeleteUserAsync(int userID)
        {
            DeleteUserResponseDTO deleteUserResponseDTO = new DeleteUserResponseDTO();
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spToggleActive", connection)
            {
                CommandType = CommandType.StoredProcedure
            };
            command.Parameters.AddWithValue("@UserID", userID);
            command.Parameters.AddWithValue("@isActive", false);

            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            command.Parameters.Add(errorMessageParam);
            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            var message = errorMessageParam.Value?.ToString();
            if (!string.IsNullOrEmpty(message))
            {
                deleteUserResponseDTO.Message = message;
                deleteUserResponseDTO.IsDeleted = false;
            }
            else
            {
                deleteUserResponseDTO.Message = "Xoa tai khoan thanh cong";
                deleteUserResponseDTO.IsDeleted = true;
            }
            return deleteUserResponseDTO;
        }

        public async Task<LoginUserResponseDTO> LoginUserAsync(LoginUserDTO login)
        {
            LoginUserResponseDTO userLoginResponseDTO = new LoginUserResponseDTO();

            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spLoginUser", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            // Input parameter
            command.Parameters.AddWithValue("@Email", login.Email);

            // Output parameters
            var passwordHashParam = new SqlParameter("@PasswordHash", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            var userIdParam = new SqlParameter("@UserID", SqlDbType.Int)
            {
                Direction = ParameterDirection.Output
            };
            var errorMessage = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            var firstnameParam = new SqlParameter("@Firstname", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };
            var lastnameParam = new SqlParameter("@Lastname", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };

            // Add parameters to command
            command.Parameters.Add(passwordHashParam);
            command.Parameters.Add(userIdParam);
            command.Parameters.Add(errorMessage);
            command.Parameters.Add(firstnameParam);
            command.Parameters.Add(lastnameParam);

            // Execute stored procedure
            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            var success = userIdParam.Value != DBNull.Value && (int)userIdParam.Value > 0;
            if (success)
            {
                string hashedPasswordFromDb = passwordHashParam.Value.ToString();
                bool isPasswordCorrect = BCrypt.Net.BCrypt.Verify(login.Password, hashedPasswordFromDb);

                if (isPasswordCorrect)
                {
                    var userID = Convert.ToInt32(userIdParam.Value);
                    userLoginResponseDTO.UserId = userID;
                    userLoginResponseDTO.Firstname = firstnameParam.Value.ToString(); // Get Firstname
                    userLoginResponseDTO.Lastname = lastnameParam.Value.ToString();   // Get Lastname
                    userLoginResponseDTO.Email = login.Email;                        // Return the input email
                    userLoginResponseDTO.IsLogin = true;
                    userLoginResponseDTO.Message = "Login Successful";
                    return userLoginResponseDTO;
                }
                else
                {
                    userLoginResponseDTO.IsLogin = false;
                    userLoginResponseDTO.Message = "Thông tin không hợp lệ";
                    return userLoginResponseDTO;
                }
            }

            var message = errorMessage.Value?.ToString();
            userLoginResponseDTO.IsLogin = false;
            userLoginResponseDTO.Message = message;
            return userLoginResponseDTO;
        }


        public async Task<(bool Success, string Message)> ToggleUserActiveAsync(int userId, bool isActive)
        {
            using var connection = _connectionFactory.CreateConnection();
            using var command = new SqlCommand("spToggleActive", connection)
            {
                CommandType = CommandType.StoredProcedure
            };

            command.Parameters.AddWithValue("@UserID", userId);
            command.Parameters.AddWithValue("@isActive", isActive);

            var errorMessageParam = new SqlParameter("@ErrorMessage", SqlDbType.NVarChar, 255)
            {
                Direction = ParameterDirection.Output
            };

            command.Parameters.Add(errorMessageParam);
            await connection.OpenAsync();
            await command.ExecuteNonQueryAsync();

            var message = errorMessageParam.Value?.ToString();
            var success = string.IsNullOrEmpty(message);

            return (success, message);
        }

        public async Task<IEnumerable<RoleDTO>> GetRolesAsync()
        {
            var roles = new List<RoleDTO>();

            using var connection = _connectionFactory.CreateConnection();
            var command = new SqlCommand("spGetUserRoles", connection); // Thay đổi tên bảng nếu cần

            await connection.OpenAsync();
            using var reader = await command.ExecuteReaderAsync();
            while (await reader.ReadAsync())
            {
                roles.Add(new RoleDTO
                {
                    RoleID = reader.GetInt32(0),
                    RoleName = reader.GetString(1)
                });
            }

            return roles;
        }

    }
}