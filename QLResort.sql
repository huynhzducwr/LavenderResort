	create database QLResort
go


use QLResort

-- UserRoles Table
CREATE TABLE UserRoles (
    RoleID INT PRIMARY KEY IDENTITY(1,1),
    RoleName NVARCHAR(50),
    IsActive BIT DEFAULT 1,
    Description NVARCHAR(255)
);
GO
-- User Information
CREATE TABLE Users (
    UserID INT PRIMARY KEY IDENTITY(1,1),
    RoleID INT,
    Email NVARCHAR(100) UNIQUE,
	Firstname nvarchar(50) not null,
    Lastname nvarchar(50) not null,
    PasswordHash NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    LastLogin DATETIME,
    IsActive BIT DEFAULT 1,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoleID) REFERENCES UserRoles(RoleID)
);
GO



-- Room Types Master Data
CREATE TABLE RoomTypes (
    RoomTypeID INT PRIMARY KEY IDENTITY(1,1),
    TypeName NVARCHAR(50),
    AccessibilityFeatures NVARCHAR(255),
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME DEFAULT GETDATE()
);
GO
-- Rooms of the Hotel
CREATE TABLE Rooms (
    RoomID INT PRIMARY KEY IDENTITY(1,1),
    RoomNumber NVARCHAR(10) UNIQUE,
    RoomTypeID INT,
    Price DECIMAL(10,2),
    BedType NVARCHAR(50),
    ViewType NVARCHAR(50),
	RoomSize nvarchar(50),
	People int,
    Status NVARCHAR(50) CHECK (Status IN ('Available', 'Under Maintenance', 'Occupied')),
    IsActive BIT DEFAULT 1,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (RoomTypeID) REFERENCES RoomTypes(RoomTypeID)
);
GO

alter table Rooms
add Wifi nvarchar(10),
Breakfast nvarchar(10),
CableTV nvarchar(10),
TransitCar nvarchar(10),
Bathtub nvarchar(10),
PetsAllowed nvarchar(10),
RoomService nvarchar(10),
Iron nvarchar(10)

go


-- Amenities Available in the hotel
CREATE TABLE Amenities (
    AmenityID INT PRIMARY KEY IDENTITY(1,1),
    AmenityName NVARCHAR(100),
    Description NVARCHAR(255),
    IsActive BIT DEFAULT 1,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME DEFAULT GETDATE(),

);
GO

-- Amenities Available in the hotel
CREATE TABLE ServicesA (
    ServicesID INT PRIMARY KEY IDENTITY(1,1),
    ServiceName NVARCHAR(100),
    Description1 NVARCHAR(max),
	Description2 NVARCHAR(max),
    Description3 NVARCHAR(max),
    IsActive BIT DEFAULT 1,
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME DEFAULT GETDATE(),

);
GO



-- Linking room types with amenities
CREATE TABLE RoomAmenities (
    RoomID INT,
    AmenityID INT,
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    FOREIGN KEY (AmenityID) REFERENCES Amenities(AmenityID),
    PRIMARY KEY (RoomID, AmenityID) -- Composite Primary Key to avoid duplicates
);
GO


CREATE TABLE Guests (
    GuestID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(100),
    Phone NVARCHAR(15),
    AgeGroup NVARCHAR(20) CHECK (AgeGroup IN ('Adult', 'Child', 'Infant')),
    Address NVARCHAR(255),   
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
);
GO
-- Table for Storing Refund Methods
CREATE TABLE RefundMethods (
    MethodID INT PRIMARY KEY IDENTITY(1,1),
    MethodName NVARCHAR(50),
    IsActive BIT DEFAULT 1,
);
GO



CREATE TABLE Reservations (

    ReservationID INT PRIMARY KEY IDENTITY(1,1),
    UserID INT,
    BookingDate DATE,
	TotalCost DECIMAL(10,2),
	Adult int,
	Child int,
	Infant int,
	NumberOfNights INT,
    CheckInDate DATE,
    CheckOutDate DATE,
    Status NVARCHAR(50) CHECK (Status IN ('Reserved', 'Checked-in', 'Checked-out', 'Cancelled')),
    CreatedDate DATETIME DEFAULT GETDATE(),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),

    CONSTRAINT CHK_CheckOutDate CHECK (CheckOutDate > CheckInDate)  
);
GO






go
CREATE TABLE ReservationRooms (
    ReservationRoomID INT PRIMARY KEY IDENTITY(1,1),
    ReservationID INT,
    RoomID INT,
    CheckInDate DATE,
    CheckOutDate DATE,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    FOREIGN KEY (RoomID) REFERENCES Rooms(RoomID),
    CONSTRAINT CHK_ResRoomDates CHECK (CheckOutDate > CheckInDate)
);

go
alter table Guests
add Room int
go

-- First, if the table already exists, delete it:
IF OBJECT_ID('ReservationGuests', 'U') IS NOT NULL
    DROP TABLE ReservationGuests;
GO

-- Create the ReservationGuests table
CREATE TABLE ReservationGuests (
    ReservationGuestID INT PRIMARY KEY IDENTITY(1,1),
    ReservationRoomID INT,  -- Linking directly to the ReservationRooms table
    GuestID INT,
    FOREIGN KEY (ReservationRoomID) REFERENCES ReservationRooms(ReservationRoomID),
    FOREIGN KEY (GuestID) REFERENCES Guests(GuestID)
);


go

	CREATE TABLE Payments (
    PaymentID INT PRIMARY KEY IDENTITY(1,1),
    ReservationID INT,
    Amount DECIMAL(10,2),
    GST DECIMAL(10,2),
    TotalAmount DECIMAL(10,2),
    PaymentDate DATETIME DEFAULT GETDATE(),
    PaymentMethod NVARCHAR(50),
    PaymentStatus NVARCHAR(50) DEFAULT 'Pending' CHECK (PaymentStatus IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    FailureReason NVARCHAR(MAX),
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID)
);
GO

-- Create the PaymentDetails table with the following structure. 
CREATE TABLE PaymentDetails (
    PaymentDetailID INT PRIMARY KEY IDENTITY(1,1),
    PaymentID INT,
    ReservationRoomID INT,
    Amount DECIMAL(10,2), -- Base Amount
    NumberOfNights INT, 
    GST DECIMAL(10,2), -- GST Based on the Base Amount
    TotalAmount DECIMAL(10,2), -- (Amount * NumberOfNights) + GST
    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID),
    FOREIGN KEY (ReservationRoomID) REFERENCES ReservationRooms(ReservationRoomID)
);
GO

SELECT 
    CONSTRAINT_NAME 
FROM 
    INFORMATION_SCHEMA.TABLE_CONSTRAINTS 
WHERE 
    TABLE_NAME = 'Reservations' AND 
    CONSTRAINT_TYPE = 'CHECK';

	ALTER TABLE Reservations DROP CONSTRAINT CK__Reservati__Statu__571DF1D5;

	ALTER TABLE Reservations
ADD CONSTRAINT CK_Reservations_Status CHECK (Status IN ('Reserved', 'Checked-in', 'Checked-out', 'Cancelled', 'Partially Cancelled'));


ALTER TABLE Reservations
DROP CONSTRAINT CK_Reservations_Status;

ALTER TABLE Reservations
ADD CONSTRAINT CHK_Status CHECK (Status IN ('Reserved', 'Checked-in', 'Checked-out', 'Cancelled', 'Paid'));




	CREATE TABLE Cancellations (
    CancellationID INT PRIMARY KEY IDENTITY(1,1),
    ReservationID INT,
    CancellationDate DATETIME,
    Reason NVARCHAR(255),
    CancellationFee DECIMAL(10,2),
    CancellationStatus NVARCHAR(50) CHECK (CancellationStatus IN ('Pending', 'Approved', 'Denied')),
    CreatedBy NVARCHAR(100),
    CreatedDate DATETIME DEFAULT GETDATE(),
    ModifiedBy NVARCHAR(100),
    ModifiedDate DATETIME,
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID)
);
GO
	-- CancellationRequests Table
CREATE TABLE CancellationRequests (
    CancellationRequestID INT PRIMARY KEY IDENTITY(1,1),
    ReservationID INT,
    UserID INT,
    CancellationType NVARCHAR(50),
    RequestedOn DATETIME DEFAULT GETDATE(),
    Status NVARCHAR(50),
    AdminReviewedByID INT,
    ReviewDate DATETIME,
    CancellationReason NVARCHAR(255),
    FOREIGN KEY (ReservationID) REFERENCES Reservations(ReservationID),
    FOREIGN KEY (UserID) REFERENCES Users(UserID),
    FOREIGN KEY (AdminReviewedByID) REFERENCES Users(UserID)
);
GO

-- CancellationPolicies Table
CREATE TABLE CancellationPolicies (
    PolicyID INT PRIMARY KEY IDENTITY(1,1),
    Description NVARCHAR(255),
    CancellationChargePercentage DECIMAL(5,2),
    MinimumCharge DECIMAL(10,2),
    EffectiveFromDate DATETIME,
    EffectiveToDate DATETIME
);
GO

-- CancellationDetails Table
CREATE TABLE CancellationDetails (
    CancellationDetailID INT PRIMARY KEY IDENTITY(1,1),
    CancellationRequestID INT,
    ReservationRoomID INT,
    FOREIGN KEY (CancellationRequestID) REFERENCES CancellationRequests(CancellationRequestID),
    FOREIGN KEY (ReservationRoomID) REFERENCES ReservationRooms(ReservationRoomID)
);
GO

CREATE TABLE CancellationCharges
(
    CancellationRequestID INT PRIMARY KEY,
    TotalCost DECIMAL(10,2),
    CancellationCharge DECIMAL(10,2),
    CancellationPercentage DECIMAL(10,2),
    MinimumCharge DECIMAL(10,2),
    PolicyDescription NVARCHAR(255),
    FOREIGN KEY (CancellationRequestID) REFERENCES CancellationRequests(CancellationRequestID)
);

CREATE TABLE Refunds (
    RefundID INT PRIMARY KEY IDENTITY(1,1),
    PaymentID INT,
    RefundAmount DECIMAL(10,2),
    RefundDate DATETIME DEFAULT GETDATE(),
    RefundReason NVARCHAR(255),
    RefundMethodID INT,
    ProcessedByUserID INT,
    RefundStatus NVARCHAR(50),
    CancellationCharge DECIMAL(10,2) DEFAULT 0,
    NetRefundAmount DECIMAL(10,2),
    CancellationRequestID INT,
    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID),
    FOREIGN KEY (RefundMethodID) REFERENCES RefundMethods(MethodID),
    FOREIGN KEY (ProcessedByUserID) REFERENCES Users(UserID),
    FOREIGN KEY (CancellationRequestID) REFERENCES CancellationRequests(CancellationRequestID)
);
GO
		

		create table Images(
ImageID int primary key identity(1,1),
RoomID int,
ImageURL nvarchar(max),
foreign key (RoomID) references Rooms(RoomID)
)

-- Assuming you have a table called Amenities with AmenityID
ALTER TABLE Images
ADD AmenityID int
ADD CONSTRAINT FK_Images_Amenities FOREIGN KEY (AmenityID) REFERENCES Amenities(AmenityID);




----
ALTER TABLE Images
DROP CONSTRAINT FK_Images_Amenities;

-- Step 2: Drop the AmenityID column
ALTER TABLE Images
DROP COLUMN AmenityID;

-- Step 3: Add the ServicesID column and create a new foreign key constraint
ALTER TABLE Images
ADD ServicesID int;

ALTER TABLE Images
ADD CONSTRAINT FK_Images_Services FOREIGN KEY (ServicesID) REFERENCES ServicesA(ServicesID);

GO

use QLResort

INSERT INTO UserRoles (RoleName, Description) VALUES
('Admin', 'Administrator with full access'),
('Guest', 'Guest user with limited access'), -- You can replace Guest with User also
('Manager', 'Hotel manager with extended privileges');






INSERT INTO RoomTypes (TypeName, AccessibilityFeatures, Description, CreatedBy) VALUES
('Superior', '1 DBL or 2 SGL,Room Services,Transit Car, Breaks', 'Superior rooms were harmoniously designed following modern, minimal style and fully set up with amenities along with a tropical garden view.', 'System'),
('Deluxe', 'Wheelchair accessible, Elevator access', 'Deluxe is well-designed in luxury together with Cham-pa vignette is cleverly arranged. However, it is still interwoven with modern features.', 'System'),
('Deluxe Twin', 'Wide door frames, Accessible bathroom', 'Deluxe Twin is elegantly designed with modern equipment set up promising to bring comfort, convenience as well as very private.', 'System'),
('Ocean Panorama', 'Child-friendly facilities, Safety features', 'One of the high-class rooms with a panorama view of the vast bay including the pool and the lush green landscape of the resort.', 'System'),
('Family Suite', 'With 2 bedrooms, Family Suite is elegantly designed with modern equipment t, Safety features', 'With 2 bedrooms, Family Suite is elegantly designed with modern equipment to bring comfort, convenience and a feel-like-home experience.', 'System'),
('Bungalow', 'Wide door frames, Accessible bathroom', 'Built amidst a quiet & calm garden, only with steps away from the sea. Every little detail in the bungalow is meticulously cared for', 'System')







INSERT INTO RefundMethods (MethodName) VALUES
('Cash'),
('Credit Card'),
('MOMO'),
('Check');

go


CREATE PROCEDURE spRegisterUser
    @Email NVARCHAR(100),
	@FirstName nvarchar(50),
	@LastName nvarchar(50),
    @PasswordHash NVARCHAR(255),
    @CreatedBy NVARCHAR(100),
    @UserID INT OUTPUT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check if email or password is null
        IF @Email IS NULL OR @PasswordHash IS NULL
        BEGIN
            SET @ErrorMessage = 'Email and Password cannot be null.';
            SET @UserID = -1;
            RETURN;
        END
        -- Check if email already exists in the system
        IF EXISTS (SELECT 1 FROM Users WHERE Email = @Email)
        BEGIN
            SET @ErrorMessage = 'A user with the given email already exists.';
            SET @UserID = -1;
            RETURN;
        END
        -- Default role ID for new users
        DECLARE @DefaultRoleID INT = 2; -- Assuming 'Guest' role ID is 2
        BEGIN TRANSACTION
            INSERT INTO Users (RoleID, Email, PasswordHash,Firstname,Lastname, CreatedBy, CreatedDate)
            VALUES (@DefaultRoleID, @Email, @PasswordHash,@FirstName,@LastName, @CreatedBy, GETDATE());
            SET @UserID = SCOPE_IDENTITY(); -- Retrieve the newly created UserID
            SET @ErrorMessage = NULL;
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        -- Handle exceptions
        ROLLBACK TRANSACTION
        SET @ErrorMessage = ERROR_MESSAGE();
        SET @UserID = -1;
    END CATCH
END;
GO




	CREATE PROCEDURE spGetUserRoles
	AS
	BEGIN
		SET NOCOUNT ON;

		SELECT RoleID, RoleName FROM UserRoles; -- Thay ??i tên b?ng n?u c?n
	END;
	GO


CREATE PROCEDURE spAssignUserRole
    @UserID INT,
    @RoleID INT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check if the user exists
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID)
        BEGIN
            SET @ErrorMessage = 'Khong tim thay user';
            RETURN;
        END
        -- Check if the role exists
        IF NOT EXISTS (SELECT 1 FROM UserRoles WHERE RoleID = @RoleID)
        BEGIN
            SET @ErrorMessage = 'Khong tim thay Role';
            RETURN;
        END
        -- Update user role
        BEGIN TRANSACTION
            UPDATE Users SET RoleID = @RoleID WHERE UserID = @UserID;
        COMMIT TRANSACTION
        SET @ErrorMessage = NULL;
    END TRY
    BEGIN CATCH
        -- Handle exceptions
        ROLLBACK TRANSACTION
        SET @ErrorMessage = ERROR_MESSAGE();
    END CATCH
END;
GO


-- List All Users
CREATE OR ALTER PROCEDURE spListAllUsers
    @IsActive BIT = NULL  -- Optional parameter to filter by IsActive status
AS
BEGIN
    SET NOCOUNT ON;

    IF @IsActive IS NULL
    BEGIN
        SELECT 
            u.UserID,
            u.Email,
            u.RoleID,
            u.Firstname,
            u.LastName,
            r.RoleName,  -- Added RoleName from the UserRoles table
            u.IsActive,
            u.LastLogin,
            u.CreatedBy,
            u.CreatedDate
        FROM 
            Users u
        INNER JOIN 
            UserRoles r ON u.RoleID = r.RoleID;
    END
    ELSE
    BEGIN
        SELECT 
            u.UserID,
            u.Email,
            u.RoleID,
            u.Firstname,
            u.LastName,
            r.RoleName,  -- Added RoleName from the UserRoles table
            u.IsActive,
            u.LastLogin,
            u.CreatedBy,
            u.CreatedDate
        FROM 
            Users u
        INNER JOIN 
            UserRoles r ON u.RoleID = r.RoleID
        WHERE 
            u.IsActive = @IsActive;
    END
END;
GO


-- Get User by ID
CREATE or alter PROCEDURE spGetUserByID
    @UserID INT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    -- Check if the user exists
    IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID)
    BEGIN
        SET @ErrorMessage = 'User not found.';
        RETURN;
    END
    -- Retrieve user details
    SELECT UserID, Email, Firstname,Lastname, RoleID, IsActive, LastLogin, CreatedBy, CreatedDate FROM Users WHERE UserID = @UserID;
    SET @ErrorMessage = NULL;
END;
GO


create procedure spUpdateUser
@UserID int,
@Email nvarchar(100)		,
@Firstname nvarchar(50),
@Lastname nvarchar(50),
@PasswordHash nvarchar(100),
@ErrorMessage nvarchar(255) output
as
begin
set nocount on;
begin try
if not exists( select 1 from Users where UserID = @UserID)
begin
set @ErrorMessage =N'User không tìm th?y';
return;
end
if exists (select 1 from Users where Email = @Email and userID <>@UserID)
begin
set @ErrorMessage=N'Email này dã du?c dùng b?i 1 ngu?i khác';
return;
end

begin transaction
update Users
set Email =@Email,Firstname = @Firstname,Lastname=@Lastname, PasswordHash = @PasswordHash
where userID = @UserID;
commit transaction
set @ErrorMessage =null;
end try
begin catch
rollback transaction 
set @ErrorMessage = ERROR_MESSAGE();
end catch
end;
go

CREATE PROCEDURE spUpdateReservationStatus
    @ReservationID INT,
    @Status NVARCHAR(50),
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;  -- Prevents extra result sets from interfering with SELECT statements

    BEGIN TRY
        -- Check if the reservation exists
        IF NOT EXISTS (SELECT 1 FROM Reservations WHERE ReservationID = @ReservationID)
        BEGIN
            SET @ErrorMessage = N'Dặt phòng không tìm thấy';  -- Change message to Vietnamese for clarity
            RETURN;  -- Exit the procedure if the reservation doesn't exist
        END

        -- Check if the new status is valid
        IF @Status NOT IN ('Reserved', 'Checked-in', 'Paid', 'Checked-out', 'Cancelled')
        BEGIN
            SET @ErrorMessage = N'Trạng thái không hợp lệ';  -- Invalid status
            RETURN;  -- Exit the procedure if the status is invalid
        END

        BEGIN TRANSACTION;  -- Start transaction

        -- Update the reservation status
        UPDATE Reservations 
        SET Status = @Status 
        WHERE ReservationID = @ReservationID;

        COMMIT TRANSACTION;  -- Commit the transaction

        SET @ErrorMessage = NULL;  -- Clear the error message if successful
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;  -- Rollback transaction on error
        SET @ErrorMessage = ERROR_MESSAGE();  -- Get the error message
    END CATCH
END;
GO


-- Activate/Deactivate User
-- This can also be used for deleting a User
CREATE PROCEDURE spToggleActive
    @isActive BIT,
    @UserID INT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;  -- Prevents extra result sets from interfering with SELECT statements

    BEGIN TRY
        -- Check if the user exists
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID)
        BEGIN
            SET @ErrorMessage = N'User không tìm th?y';  -- Change message to Vietnamese for clarity
            RETURN;  -- Exit the procedure if the user doesn't exist
        END

        BEGIN TRANSACTION;  -- Start transaction

        -- Update the user's active status
        UPDATE Users SET IsActive = @isActive WHERE UserID = @UserID;

        COMMIT TRANSACTION;  -- Commit the transaction

        SET @ErrorMessage = NULL;  -- Clear the error message if successful
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;  -- Rollback transaction on error
        SET @ErrorMessage = ERROR_MESSAGE();  -- Get the error message
    END CATCH
END;
GO

CREATE OR ALTER PROCEDURE spLoginUser
    @Email NVARCHAR(100),
    @PasswordHash NVARCHAR(255) OUTPUT,
    @UserID INT OUTPUT,
    @Firstname NVARCHAR(255) OUTPUT,
    @Lastname NVARCHAR(255) OUTPUT,
    @ErrorMessage NVARCHAR(255) OUTPUT
AS
BEGIN
    -- Lấy thông tin người dùng dựa trên email
    SELECT 
        @UserID = userID, 
        @PasswordHash = PasswordHash, 
        @Firstname = Firstname, 
        @Lastname = Lastname 
    FROM Users 
    WHERE Email = @Email;

    -- Kiểm tra UserID có tồn tại hay không
    IF @UserID IS NOT NULL
    BEGIN
        -- Kiểm tra tài khoản có hoạt động hay không
        IF EXISTS (SELECT 1 FROM Users WHERE userID = @UserID AND IsActive = 1)
        BEGIN
            -- Cập nhật thời gian đăng nhập cuối cùng
            UPDATE Users 
            SET LastLogin = GETDATE() 
            WHERE userID = @UserID;

            -- Xóa thông báo lỗi
            SET @ErrorMessage = NULL; 
        END
        ELSE
        BEGIN
            -- Thông báo tài khoản bị vô hiệu hóa
            SET @ErrorMessage = 'Tài khoản của bạn bị vô hiệu hóa';
            SET @UserID = NULL; -- Reset UserID vì đăng nhập không thành công
        END
    END
    ELSE
    BEGIN
        -- Nếu không tìm thấy email, trả về thông báo lỗi
        SET @ErrorMessage = 'Thông tin không hợp lệ';
    END
END;
GO


-- Create Room Type
CREATE PROCEDURE spCreateRoomType
    @TypeName NVARCHAR(50),
    @AccessibilityFeatures NVARCHAR(255),
    @Description NVARCHAR(255),
    @CreatedBy NVARCHAR(100),
    @NewRoomTypeID INT OUTPUT,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            IF NOT EXISTS (SELECT 1 FROM RoomTypes WHERE TypeName = @TypeName)
            BEGIN
                INSERT INTO RoomTypes (TypeName, AccessibilityFeatures, Description, CreatedBy, CreatedDate)
                VALUES (@TypeName, @AccessibilityFeatures, @Description, @CreatedBy, GETDATE())

                SET @NewRoomTypeID = SCOPE_IDENTITY()
                SET @StatusCode = 0 -- Success
                SET @Message = 'Room type created successfully.'
            END
            ELSE
            BEGIN
                SET @StatusCode = 1 -- Failure due to duplicate name
                SET @Message = 'Room type name da ton tai'
            END
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER() -- SQL Server error number
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO

-- Update Room Type
CREATE PROCEDURE spUpdateRoomType
    @RoomTypeID INT,
    @TypeName NVARCHAR(50),
    @AccessibilityFeatures NVARCHAR(255),
    @Description NVARCHAR(255),
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the updated type name already exists in another record
            IF NOT EXISTS (SELECT 1 FROM RoomTypes WHERE TypeName = @TypeName AND RoomTypeID <> @RoomTypeID)
            BEGIN
                IF EXISTS (SELECT 1 FROM RoomTypes WHERE RoomTypeID = @RoomTypeID)
                BEGIN
                    UPDATE RoomTypes
                    SET TypeName = @TypeName,
                        AccessibilityFeatures = @AccessibilityFeatures,
                        Description = @Description
                     
                    WHERE RoomTypeID = @RoomTypeID

                    SET @StatusCode = 0 -- Success
                    SET @Message = 'Room type updated successfully.'
                END
                ELSE
                BEGIN
                    SET @StatusCode = 2 -- Failure due to not found
                    SET @Message = 'Room type not found.'
                END
            END
            ELSE
            BEGIN
                SET @StatusCode = 1 -- Failure due to duplicate name
                SET @Message = 'Another room type with the same name already exists.'
            END
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER() -- SQL Server error number
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO

-- Delete Room Type By Id
CREATE PROCEDURE spDeleteRoomType
    @RoomTypeID INT,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
   
            -- Check for existing rooms linked to this room type
            IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomTypeID = @RoomTypeID)
            BEGIN
                IF EXISTS (SELECT 1 FROM RoomTypes WHERE RoomTypeID = @RoomTypeID)
                BEGIN
                    DELETE FROM RoomTypes WHERE RoomTypeID = @RoomTypeID
                    SET @StatusCode = 0 -- Success
                    SET @Message = 'Room type deleted successfully.'
                END
                ELSE
                BEGIN
                    SET @StatusCode = 2 -- Failure due to not found
                    SET @Message = 'Room type not found.'
                END
            END
            ELSE
            BEGIN
                SET @StatusCode = 1 -- Failure due to dependency
                SET @Message = 'Cannot delete room type as it is being referenced by one or more rooms.'
            END
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER() -- SQL Server error number
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO

-- Get Room Type By Id
CREATE PROCEDURE spGetRoomTypeById
    @RoomTypeID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT RoomTypeID, TypeName, AccessibilityFeatures, Description, IsActive FROM RoomTypes WHERE RoomTypeID = @RoomTypeID
END
GO

-- Get All Room Type
CREATE PROCEDURE spGetAllRoomTypes
 @IsActive BIT = NULL  -- Optional parameter to filter by IsActive status
AS
BEGIN
    SET NOCOUNT ON;
    -- Select users based on active status
    IF @IsActive IS NULL
    BEGIN
        SELECT RoomTypeID, TypeName, AccessibilityFeatures, Description, IsActive FROM RoomTypes
    END
    ELSE
    BEGIN
        SELECT RoomTypeID, TypeName, AccessibilityFeatures, Description, IsActive FROM RoomTypes WHERE IsActive = @IsActive;
    END
END
GO

-- Activate/Deactivate RoomType
CREATE PROCEDURE spToggleRoomTypeActive
    @RoomTypeID INT,
    @IsActive BIT,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check user existence
        IF NOT EXISTS (SELECT 1 FROM RoomTypes WHERE RoomTypeID = @RoomTypeID)
        BEGIN
             SET @StatusCode = 1 -- Failure due to not found
             SET @Message = 'Room type not found.'
        END

        -- Update IsActive status
        BEGIN TRANSACTION
             UPDATE RoomTypes SET IsActive = @IsActive WHERE RoomTypeID = @RoomTypeID;
                SET @StatusCode = 0 -- Success
             SET @Message = 'Room type activated/deactivated successfully.'
        COMMIT TRANSACTION

    END TRY
    -- Handle exceptions
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER() -- SQL Server error number
        SET @Message = ERROR_MESSAGE()
    END CATCH
END;
GO






-- Create Room
CREATE OR ALTER PROCEDURE spCreateRoom
    @RoomNumber NVARCHAR(10),
    @RoomTypeID INT,
    @Price DECIMAL(10,2),
    @BedType NVARCHAR(50),
    @ViewType NVARCHAR(50),
	@RoomSize nvarchar(50),
	@Wifi nvarchar(10),
	@Breakfast nvarchar(10),
	@CableTV nvarchar(10),
	@TransitCar nvarchar(10),
	@Bathtub nvarchar(10),
	@PetsAllowed nvarchar(10),
	@RoomService nvarchar(10),
	@Iron nvarchar(10),
    @Status NVARCHAR(50),
    @IsActive BIT,
	@People int,
    @CreatedBy NVARCHAR(100),
    @NewRoomID INT OUTPUT,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the provided RoomTypeID exists in the RoomTypes table
            IF EXISTS (SELECT 1 FROM RoomTypes WHERE RoomTypeID = @RoomTypeID)
            BEGIN
                -- Ensure the room number is unique
                IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomNumber = @RoomNumber)
                BEGIN
                    INSERT INTO Rooms (RoomNumber, RoomTypeID, Price, BedType,RoomSize, ViewType,Wifi,Breakfast,CableTV,TransitCar,Bathtub,PetsAllowed,RoomService,Iron, Status,People, IsActive, CreatedBy, CreatedDate)
                    VALUES (@RoomNumber, @RoomTypeID, @Price, @BedType,@RoomSize, @ViewType,@Wifi,@Breakfast,@CableTV,@TransitCar,@Bathtub,@PetsAllowed,@RoomService,@Iron ,@Status,@People, @IsActive, @CreatedBy, GETDATE())

                    SET @NewRoomID = SCOPE_IDENTITY()
                    SET @StatusCode = 0 -- Success
                    SET @Message = 'Room tao thanh cong.'
                END
                ELSE
                BEGIN
                    SET @StatusCode = 1 -- Failure due to duplicate room number
                    SET @Message = 'Room number da ton tai'
                END
            END
            ELSE
            BEGIN
                SET @StatusCode = 3 -- Failure due to invalid RoomTypeID
                SET @Message = 'Cung cap id khong hop le'
            END
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER()
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO


-- Update Room
CREATE OR ALTER PROCEDURE spUpdateRoom
    @RoomID INT,
    @RoomNumber NVARCHAR(10),
    @RoomTypeID INT,
    @Price DECIMAL(10,2),
    @BedType NVARCHAR(50),
	@RoomSize nvarchar(50),
    @ViewType NVARCHAR(50),
	@Wifi nvarchar(10),
	@Breakfast nvarchar(10),
	@CableTV nvarchar(10),
	@TransitCar nvarchar(10),
	@Bathtub nvarchar(10),
	@PetsAllowed nvarchar(10),
	@RoomService nvarchar(10),
	@Iron nvarchar(10),
    @Status NVARCHAR(50),
    @IsActive BIT,
	@People int,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the RoomTypeID is valid and room number is unique for other rooms
            IF EXISTS (SELECT 1 FROM RoomTypes WHERE RoomTypeID = @RoomTypeID) AND
               NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomNumber = @RoomNumber AND RoomID <> @RoomID)
            BEGIN
                -- Verify the room exists before updating
                IF EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
                BEGIN
                    UPDATE Rooms
                     SET 
					RoomNumber = @RoomNumber,
                        RoomTypeID = @RoomTypeID,
                        Price = @Price,
                        BedType = @BedType,
                        ViewType = @ViewType,
						RoomSize = @RoomSize,
						Wifi = @Wifi,
						Breakfast = @Breakfast,
						CableTV = @CableTV,
						TransitCar = @TransitCar,
						Bathtub = @Bathtub,
						PetsAllowed =@PetsAllowed,
						RoomService = @RoomService,
						Iron = @Iron,
                        Status = @Status,
						People = @People,
                        IsActive = @IsActive              
                    WHERE RoomID = @RoomID

                    SET @StatusCode = 0 -- Success
                    SET @Message = 'Room updated thanh cong'
                END
                ELSE
                BEGIN
                    SET @StatusCode = 2 -- Failure due to room not found
                    SET @Message = 'Room khong tim thay'
                END
            END
            ELSE
            BEGIN
                SET @StatusCode = 1 -- Failure due to invalid RoomTypeID or duplicate room number
                SET @Message = 'ID khong hop le hoac duplicate ID'
            END
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER()
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO




	CREATE OR ALTER PROCEDURE spDeleteRoom
		@RoomID INT,
		@StatusCode INT OUTPUT,
		@Message NVARCHAR(255) OUTPUT
	AS
	BEGIN
		SET NOCOUNT ON;
		BEGIN TRY
			BEGIN TRANSACTION
				-- Ensure no active reservations exist for the room
				IF NOT EXISTS (SELECT 1 FROM ReservationRooms WHERE RoomID = @RoomID)
				BEGIN
					-- Verify the room exists before deleting
					IF EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
					BEGIN
						-- Perform hard delete
						DELETE FROM Rooms
						WHERE RoomID = @RoomID;

						SET @StatusCode = 0; -- Success
						SET @Message = 'Room deleted successfully.';
					END
					ELSE
					BEGIN
						SET @StatusCode = 2; -- Failure due to room not found
						SET @Message = 'Room not found.';
					END
				END
				ELSE
				BEGIN
					SET @StatusCode = 1; -- Failure due to active reservations
					SET @Message = 'Room cannot be deleted, there are active reservations.';
				END
			COMMIT TRANSACTION
		END TRY
		BEGIN CATCH
			ROLLBACK TRANSACTION;
			SET @StatusCode = ERROR_NUMBER();
			SET @Message = ERROR_MESSAGE();
		END CATCH
	END
	GO


-- Get Room by Id
CREATE OR ALTER PROCEDURE spGetRoomById
    @RoomID INT
AS
BEGIN
    SELECT RoomID, RoomNumber, RoomTypeID, Price, BedType,RoomSize, ViewType,Wifi,Breakfast,CableTV,TransitCar,Bathtub,PetsAllowed,RoomService,Iron, Status, People, IsActive FROM Rooms WHERE RoomID = @RoomID
END
GO

-- Get All Rooms with Optional Filtering
CREATE OR ALTER PROCEDURE spGetAllRoom
    @RoomTypeID INT = NULL,     -- Optional filter by Room Type
    @Status NVARCHAR(50) = NULL -- Optional filter by Status
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @SQL NVARCHAR(MAX)

    -- Start building the dynamic SQL query
    SET @SQL = 'SELECT RoomID, RoomNumber, RoomTypeID, Price, BedType,RoomSize, ViewType,Wifi,Breakfast,CableTV,TransitCar,Bathtub,PetsAllowed,RoomService,Iron, Status,People, IsActive FROM Rooms WHERE 1=1'

    -- Append conditions based on the presence of optional parameters
    IF @RoomTypeID IS NOT NULL
        SET @SQL = @SQL + ' AND RoomTypeID = @RoomTypeID'
    
    IF @Status IS NOT NULL
        SET @SQL = @SQL + ' AND Status = @Status'

    -- Execute the dynamic SQL statement
    EXEC sp_executesql @SQL, 
                       N'@RoomTypeID INT, @Status NVARCHAR(50)', 
                       @RoomTypeID, 
                       @Status
END
GO







-- Description: Fetches amenities based on their active status.
-- If @IsActive is provided, it returns amenities filtered by the active status.
CREATE OR ALTER PROCEDURE spFetchAmenities
    @IsActive BIT = NULL,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY

        -- Retrieve all amenities or filter by active status based on the input parameter.
        IF @IsActive IS NULL
            SELECT * FROM Amenities;
        ELSE
            SELECT * FROM Amenities WHERE IsActive = @IsActive;

        -- Return success status and message.
        SET @Status = 1; -- Success
        SET @Message = 'Data retrieved successfully.';

    END TRY
    BEGIN CATCH
        -- Handle errors and return failure status.
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Description: Fetches a specific amenity based on its ID.
-- Returns the details of the amenity if it exists.
CREATE OR ALTER PROCEDURE spFetchAmenityByID
    @AmenityID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT AmenityID, AmenityName, Description, IsActive FROM Amenities 
    WHERE AmenityID = @AmenityID;
END;
GO

-- Description: Inserts a new amenity into the Amenities table.
-- Prevents duplicates based on the amenity name.
CREATE OR ALTER PROCEDURE spAddAmenity
    @AmenityName NVARCHAR(100),
    @Description NVARCHAR(255),
    @CreatedBy NVARCHAR(100),
    @AmenityID INT OUTPUT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if an amenity with the same name already exists to avoid duplication.
            IF EXISTS (SELECT 1 FROM Amenities WHERE AmenityName = @AmenityName)
            BEGIN
                SET @Status = 0;
                SET @Message = 'Amenity already exists.';
            END
            ELSE
            BEGIN
                -- Insert the new amenity record.
                INSERT INTO Amenities (AmenityName, Description, CreatedBy, CreatedDate, IsActive)
                VALUES (@AmenityName, @Description, @CreatedBy, GETDATE(), 1);

                -- Retrieve the ID of the newly inserted amenity.
                SET @AmenityID = SCOPE_IDENTITY();
                SET @Status = 1;
                SET @Message = 'Amenity added successfully.';
            END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Status = 0;
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Description: Updates an existing amenity's details in the Amenities table.
-- Checks if the amenity exists before attempting an update.
CREATE OR ALTER PROCEDURE spUpdateAmenity
    @AmenityID INT,
    @AmenityName NVARCHAR(100),
    @Description NVARCHAR(255),
    @IsActive BIT,
   
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the amenity exists before updating.
            IF NOT EXISTS (SELECT 1 FROM Amenities WHERE AmenityID = @AmenityID)
            BEGIN
                SET @Status = 0;
                SET @Message = 'Amenity does not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Check for name uniqueness excluding the current amenity.
            IF EXISTS (SELECT 1 FROM Amenities WHERE AmenityName = @AmenityName AND AmenityID <> @AmenityID)
            BEGIN
                SET @Status = 0;
                SET @Message = 'The name already exists for another amenity.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Update the amenity details.
            UPDATE Amenities
            SET AmenityName = @AmenityName, Description = @Description, IsActive = @IsActive 
            WHERE AmenityID = @AmenityID;

            -- Check if the update was successful
            IF @@ROWCOUNT = 0
            BEGIN
                SET @Status = 0;
                SET @Message = 'No records updated.';
                ROLLBACK TRANSACTION;
            END
            ELSE
            BEGIN
                SET @Status = 1;
                SET @Message = 'Amenity updated successfully.';
                COMMIT TRANSACTION;
            END
    END TRY
    BEGIN CATCH
        -- Handle exceptions and roll back the transaction if an error occurs.
        ROLLBACK TRANSACTION;
        SET @Status = 0;
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Description: Soft deletes an amenity by setting its IsActive flag to 0.
-- Checks if the amenity exists before marking it as inactive.
CREATE OR ALTER PROCEDURE spDeleteAmenity
    @AmenityID INT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the amenity exists before attempting to delete.
            IF NOT EXISTS (SELECT 1 FROM Amenities WHERE AmenityID = @AmenityID)
            BEGIN
                SET @Status = 0;
                SET @Message = 'Amenity does not exist.';
            END
            ELSE
            BEGIN
                -- Update the IsActive flag to 0 to soft delete the amenity.
                UPDATE Amenities
                SET IsActive = 0
                WHERE AmenityID = @AmenityID;

                SET @Status = 1;
                SET @Message = 'Amenity deleted successfully.';
            END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Roll back the transaction if an error occurs.
        ROLLBACK TRANSACTION;
        SET @Status = 0;
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Creating a User-Defined Table Type for Bulk Insert
CREATE TYPE AmenityInsertType AS TABLE (
    AmenityName NVARCHAR(100),
    Description NVARCHAR(255),
    CreatedBy NVARCHAR(100)
);
GO

-- Description: Performs a bulk insert of amenities into the Amenities table.
-- Ensures that no duplicate names are inserted.
CREATE OR ALTER PROCEDURE spBulkInsertAmenities
    @Amenities AmenityInsertType READONLY,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check for duplicate names within the insert dataset.
            IF EXISTS (
                SELECT 1
                FROM @Amenities
                GROUP BY AmenityName
                HAVING COUNT(*) > 1
            )
            BEGIN
                SET @Status = 0;
                SET @Message = 'Duplicate names found within the new data.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Check for existing names in the Amenities table that might conflict with the new data.
            IF EXISTS (
                SELECT 1
                FROM @Amenities a
                WHERE EXISTS (
                    SELECT 1 FROM Amenities WHERE AmenityName = a.AmenityName
                )
            )
            BEGIN
                SET @Status = 0;
                SET @Message = 'One or more names conflict with existing records.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Insert new amenities ensuring there are no duplicates by name.
            INSERT INTO Amenities (AmenityName, Description, CreatedBy, CreatedDate, IsActive)
            SELECT AmenityName, Description, CreatedBy, GETDATE(), 1
            FROM @Amenities;

            -- Check if any records were actually inserted.
            IF @@ROWCOUNT = 0
            BEGIN
                SET @Status = 0;
                SET @Message = 'No records inserted. Please check the input data.';
                ROLLBACK TRANSACTION;
            END
            ELSE
            BEGIN
                SET @Status = 1;
                SET @Message = 'Bulk insert completed successfully.';
                COMMIT TRANSACTION;
            END
    END TRY
    BEGIN CATCH
        -- Handle any errors that occur during the transaction.
        ROLLBACK TRANSACTION;
        SET @Status = 0;
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Creating User-Defined Table Type for Bulk Update
CREATE TYPE AmenityUpdateType AS TABLE (
    AmenityID INT,
    AmenityName NVARCHAR(100),
    Description NVARCHAR(255),
    IsActive BIT
);
GO

-- Description: Updates multiple amenities in the Amenities table using a provided list.
-- Applies updates to the Name, Description, and IsActive status.
CREATE OR ALTER PROCEDURE spBulkUpdateAmenities
    @AmenityUpdates AmenityUpdateType READONLY,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Check for duplicate names within the update dataset.
            IF EXISTS (
                SELECT 1
                FROM @AmenityUpdates u
                GROUP BY u.AmenityName
                HAVING COUNT(*) > 1
            )
            BEGIN
                SET @Status = 0;
                SET @Message = 'Duplicate names found within the update data.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Check for duplicate names in existing data.
            IF EXISTS (
                SELECT 1
                FROM @AmenityUpdates u
                JOIN Amenities a ON u.AmenityName = a.AmenityName AND u.AmenityID != a.AmenityID
            )
            BEGIN
                SET @Status = 0;
                SET @Message = 'One or more names conflict with existing records.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Update amenities based on the provided data.
            UPDATE a
            SET a.AmenityName = u.AmenityName,
                a.Description = u.Description,
                a.IsActive = u.IsActive
            FROM Amenities a
            INNER JOIN @AmenityUpdates u ON a.AmenityID = u.AmenityID;

            -- Check if any records were actually updated.
            IF @@ROWCOUNT = 0
            BEGIN
                SET @Status = 0;
                SET @Message = 'No records updated. Please check the input data.';
            END
            ELSE
            BEGIN
                SET @Status = 1;
                SET @Message = 'Bulk update completed successfully.';
            END
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Roll back the transaction and handle the error.
        ROLLBACK TRANSACTION;
        SET @Status = 0;
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Creating a User-Defined Table Type for Bulk Active and InActive
CREATE TYPE AmenityStatusType AS TABLE (
    AmenityID INT,
    IsActive BIT
);
GO

-- Description: Updates the active status of multiple amenities in the Amenities table.
-- Takes a list of amenity IDs and their new IsActive status.
CREATE OR ALTER PROCEDURE spBulkUpdateAmenityStatus
    @AmenityStatuses AmenityStatusType READONLY,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
            -- Update the IsActive status for amenities based on the provided AmenityID.
            UPDATE a
            SET a.IsActive = s.IsActive
            FROM Amenities a
            INNER JOIN @AmenityStatuses s ON a.AmenityID = s.AmenityID;

            -- Check if any records were actually updated.
            SET @Status = 1; -- Success
            SET @Message = 'Bulk status update completed successfully.';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        -- Roll back the transaction if an error occurs.
        ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

	


	use QLResort

	go
	-------------------eqeq

	-- Stored Procedure for Fetching All RoomAmenities by RoomTypeID
CREATE OR ALTER PROCEDURE spFetchRoomAmenitiesByRoomID
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT a.AmenityID, a.AmenityName, a.Description, a.IsActive
 FROM RoomAmenities ra
 JOIN Amenities a ON ra.AmenityID = a.AmenityID
 WHERE ra.RoomID = @RoomID;
END;
GO

-- Stored Procedure for Fetching All RoomTypes by AmenityID
CREATE OR ALTER PROCEDURE spFetchRoomsByAmenityID
    @AmenityID INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT rt.RoomID, rt.RoomNumber, rt.IsActive
 FROM RoomAmenities ra
 JOIN Rooms rt ON ra.RoomID = rt.RoomID
 WHERE ra.AmenityID = @AmenityID;
END;
GO

-- Insert Procedure for RoomAmenities
CREATE OR ALTER PROCEDURE spAddRoomAmenity
    @RoomID INT,
    @AmenityID INT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomTypeID = @RoomID) OR
               NOT EXISTS (SELECT 1 FROM Amenities WHERE AmenityID = @AmenityID)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Room type or amenity does not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            IF EXISTS (SELECT 1 FROM RoomAmenities WHERE RoomID = @RoomID AND AmenityID = @AmenityID)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'This room amenity link already exists.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            INSERT INTO RoomAmenities (RoomID, AmenityID)
            VALUES (@RoomID, @AmenityID);

            SET @Status = 1; -- Success
            SET @Message = 'Room amenity added successfully.';
            COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Deleting a Single RoomAmenities based on RoomTypeID and AmenityID
CREATE OR ALTER PROCEDURE spDeleteSingleRoomAmenity
    @RoomID INT,
    @AmenityID INT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            DECLARE @Exists BIT;
            SELECT @Exists = COUNT(*) FROM RoomAmenities WHERE RoomID = @RoomID AND AmenityID = @AmenityID;

            IF @Exists = 0
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'The specified RoomTypeID and AmenityID combination does not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Delete the specified room amenity
            DELETE FROM RoomAmenities
            WHERE RoomID = @RoomID AND AmenityID = @AmenityID;

            SET @Status = 1; -- Success
            SET @Message = 'Room amenity deleted successfully.';
            COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Create a User-Defined Table Type
-- This type will be used to pass multiple Amenity IDs as a single parameter to the stored procedures.
CREATE TYPE AmenityIDTableType AS TABLE (AmenityID INT);
GO

-- Stored Procedure for Bulk Insert into RoomAmenities for a Single RoomTypeID
CREATE OR ALTER PROCEDURE spBulkInsertRoomAmenities
    @RoomID INT,
    @AmenityIDs AmenityIDTableType READONLY,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            -- Check if the RoomTypeID exists
            IF NOT EXISTS (SELECT 1 FROM RoomTypes WHERE RoomTypeID = @RoomID)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Room type does not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Check if all AmenityIDs exist
            IF EXISTS (SELECT 1 FROM @AmenityIDs WHERE AmenityID NOT IN (SELECT AmenityID FROM Amenities))
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'One or more amenities do not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Insert AmenityIDs that do not already exist for the given RoomTypeID
            INSERT INTO RoomAmenities (RoomID, AmenityID)
            SELECT @RoomID, a.AmenityID 
            FROM @AmenityIDs a
            WHERE NOT EXISTS (
                SELECT 1 
                FROM RoomAmenities ra
                WHERE ra.RoomID = @RoomID AND ra.AmenityID = a.AmenityID
            );

            SET @Status = 1; -- Success
            SET @Message = 'Room amenities added successfully.';
            COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Stored Procedure for Bulk Update in RoomAmenities of a single @RoomTypeID
CREATE OR ALTER PROCEDURE spBulkUpdateRoomAmenities
    @RoomID INT,
    @AmenityIDs AmenityIDTableType READONLY,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            IF NOT EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Room type does not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            DECLARE @Count INT;
            SELECT @Count = COUNT(*) FROM Amenities WHERE AmenityID IN (SELECT AmenityID FROM @AmenityIDs);
            IF @Count <> (SELECT COUNT(*) FROM @AmenityIDs)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'One or more amenities do not exist.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            DELETE FROM RoomAmenities WHERE RoomID = @RoomID;

            INSERT INTO RoomAmenities (RoomID, AmenityID)
            SELECT @RoomID, AmenityID FROM @AmenityIDs;

            SET @Status = 1; -- Success
            SET @Message = 'Room amenities updated successfully.';
            COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Deleting All RoomAmenities of a Single RoomTypeID
CREATE OR ALTER PROCEDURE spDeleteAllRoomAmenitiesByRoomID
    @RoomID INT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            -- Delete all amenities for the specified room type
            DELETE FROM RoomAmenities WHERE RoomID = @RoomID;

            SET @Status = 1; -- Success
            SET @Message = 'All amenities for the room type have been deleted successfully.';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO

-- Deleting All RoomAmenities of a Single AmenityID
CREATE OR ALTER PROCEDURE spDeleteAllRoomAmenitiesByAmenityID
    @AmenityID INT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION;
            -- Delete all amenities for the specified Amenity ID
            DELETE FROM RoomAmenities WHERE AmenityID = @AmenityID;

            SET @Status = 1; -- Success
            SET @Message = 'All amenities for the Amenity ID have been deleted successfully.';
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH;
END;
GO



-----------------------dasdasd-------------qeqeqw


-- Search by Availability Dates
-- Searches rooms that are available between specified check-in and check-out dates.
-- Inputs: @CheckInDate - Desired check-in date, @CheckOutDate - Desired check-out date
-- Returns: List of rooms that are available along with their type details
-- Search by Availability Dates
-- Searches rooms that are available between specified check-in and check-out dates.
-- Inputs: @CheckInDate - Desired check-in date, @CheckOutDate - Desired check-out date
-- Returns: List of rooms that are available along with their type details
CREATE OR ALTER PROCEDURE spSearchByAvailability
    @CheckInDate DATE,
    @CheckOutDate DATE
AS
BEGIN
    SET NOCOUNT ON; -- Suppresses the 'rows affected' message

    -- Select rooms that are not currently booked for the given date range and not under maintenance
    SELECT r.RoomID, r.RoomNumber, r.RoomTypeID, r.Price, r.BedType, r.ViewType, r.Status,
           rt.TypeName, rt.AccessibilityFeatures, rt.Description
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    LEFT JOIN ReservationRooms rr ON rr.RoomID = r.RoomID
    LEFT JOIN Reservations res ON rr.ReservationID = res.ReservationID 
        AND res.Status NOT IN ('Cancelled')
        AND (
            (res.CheckInDate <= @CheckOutDate AND res.CheckOutDate >= @CheckInDate)
        )
    WHERE res.ReservationID IS NULL AND r.Status = 'Available' AND r.IsActive = 1
END;
GO
-- Search by Price Range
-- Searches rooms within a specified price range.
-- Inputs: @MinPrice - Minimum room price, @MaxPrice - Maximum room price
-- Returns: List of rooms within the price range along with their type details
CREATE OR ALTER PROCEDURE spSearchByPriceRange
    @MinPrice DECIMAL(10,2),
    @MaxPrice DECIMAL(10,2)
AS
BEGIN
    SET NOCOUNT ON; -- Avoids sending row count information
    SELECT r.RoomID, r.RoomNumber, r.Price, r.BedType, r.ViewType, r.Status,
           rt.RoomTypeID, rt.TypeName, rt.AccessibilityFeatures, rt.Description
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE r.Price BETWEEN @MinPrice AND @MaxPrice
    AND r.IsActive = 1 AND rt.IsActive = 1
END
GO

-- Search by Room Type
-- Searches rooms based on room type name.
-- Inputs: @RoomTypeName - Name of the room type
-- Returns: List of rooms matching the room type name along with type details
CREATE OR ALTER PROCEDURE spSearchByRoomType
    @RoomTypeName NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.RoomID, r.RoomNumber, r.Price, r.BedType, r.ViewType, r.Status,
           rt.RoomTypeID, rt.TypeName, rt.AccessibilityFeatures, rt.Description
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE rt.TypeName = @RoomTypeName
    AND r.IsActive = 1
END
GO

-- Search by View Type
-- Searches rooms by specific view type.
-- Inputs: @ViewType - Type of view from the room (e.g., sea, city)
-- Returns: List of rooms with the specified view along with their type details
CREATE OR ALTER PROCEDURE spSearchByViewType
    @ViewType NVARCHAR(50)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.RoomID, r.RoomNumber, r.RoomTypeID, r.Price, r.BedType, r.Status, r.ViewType,
           rt.TypeName, rt.AccessibilityFeatures, rt.Description
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE r.ViewType = @ViewType
    AND r.IsActive = 1
END
GO

-- Search by Amenities
-- Searches rooms offering a specific amenity.
-- Inputs: @AmenityName - Name of the amenity
-- Returns: List of rooms offering the specified amenity along with their type details
CREATE OR ALTER PROCEDURE spSearchByAmenities
    @AmenityName NVARCHAR(100)
AS
BEGIN
    SET NOCOUNT ON;
    SELECT DISTINCT r.RoomID, r.RoomNumber, r.RoomTypeID, r.Price, r.BedType, r.ViewType, r.Status,
                    rt.TypeName, rt.AccessibilityFeatures, rt.Description
    FROM Rooms r
 JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    JOIN RoomAmenities ra ON rt.RoomTypeID = ra.RoomID
    JOIN Amenities a ON ra.AmenityID = a.AmenityID
    
    WHERE a.AmenityName = @AmenityName
    AND r.IsActive = 1
END
GO

-- Search All Rooms by RoomTypeID
-- Searches all rooms based on a specific RoomTypeID.
-- Inputs: @RoomTypeID - The ID of the room type
-- Returns: List of all rooms associated with the specified RoomTypeID along with type details
CREATE OR ALTER PROCEDURE spSearchRoomsByRoomTypeName
    @TypeName INT
AS
BEGIN
    SET NOCOUNT ON;
    SELECT r.RoomID, r.RoomNumber, r.Price, r.BedType, r.ViewType, r.Status,
           rt.RoomTypeID, rt.TypeName, rt.AccessibilityFeatures, rt.Description
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE rt.TypeName = @TypeName
    AND r.IsActive = 1
END
GO

-- Stored Procedure to Fetch Room, Room Type, and Amenities Details
-- Retrieves details of a room by its RoomID, including room type and amenities.
-- Inputs: @RoomID - The ID of the room
-- Returns: Details of the room, its room type, and associated amenities
CREATE OR ALTER PROCEDURE spGetRoomDetailsWithAmenitiesByRoomNumber
    @RoomNumber nvarchar(10)
AS
BEGIN
    SET NOCOUNT ON; -- Suppresses the 'rows affected' message

    -- First, retrieve the basic details of the room along with its room type information
    SELECT 
        r.RoomID, 
        r.RoomNumber, 
        r.Price, 
        r.BedType, 
        r.ViewType, 
        r.Status,
        rt.RoomTypeID, 
        rt.TypeName, 
        rt.AccessibilityFeatures, 
        rt.Description
    FROM Rooms r
    JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
    WHERE r.RoomNumber = @RoomNumber
    AND r.IsActive = 1;

    -- Next, retrieve the amenities associated with the room type of the specified room
    SELECT 
        a.AmenityID, 
        a.AmenityName, 
        a.Description
    FROM RoomAmenities ra
    JOIN Amenities a ON ra.AmenityID = a.AmenityID
    WHERE ra.RoomID IN (SELECT RoomTypeID FROM Rooms WHERE RoomNumber = @RoomNumber)
    AND a.IsActive = 1;
END
GO

-- Fetch Amenities for a Specific Room
-- Retrieves all amenities associated with a specific room by its RoomID.
-- Inputs: @RoomID - The ID of the room
-- Returns: List of amenities associated with the room type of the specified room
CREATE OR ALTER PROCEDURE spGetRoomAmenitiesByRoomNumber
    @RoomID INT
AS
BEGIN
    SET NOCOUNT ON; -- Suppresses the 'rows affected' message

    SELECT 
        a.AmenityID, 
        a.AmenityName, 
        a.Description
    FROM RoomAmenities ra
    JOIN Amenities a ON ra.AmenityID = a.AmenityID
    JOIN Rooms r ON ra.RoomID = r.RoomID
    WHERE r.RoomID = @RoomID
    AND a.IsActive = 1;
END
GO



-- Custom Combination Searches with Dynamic SQL
-- Searches for rooms based on a combination of criteria including price range, room type, and amenities.
-- Inputs:
-- @MinPrice DECIMAL(10,2) = NULL: Minimum price filter (optional)
-- @MaxPrice DECIMAL(10,2) = NULL: Maximum price filter (optional)
-- @RoomTypeName NVARCHAR(50) = NULL: Room type Name filter (optional)
-- @AmenityName NVARCHAR(100) = NULL: Amenity Name filter (optional)
-- @@ViewType NVARCHAR(50) = NULL: View Type filter (optional)
-- Returns: List of rooms matching the combination of specified criteria along with their type details
-- Note: Based on the Requirements you can use AND or OR Conditions
CREATE OR ALTER PROCEDURE [dbo].[spSearchCustomCombination]
    @MinPrice DECIMAL(10,2) = NULL,
    @MaxPrice DECIMAL(10,2) = NULL,
    @RoomTypeName NVARCHAR(50) = NULL,
    @ViewType NVARCHAR(50) = NULL
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @SQL NVARCHAR(MAX)
    SET @SQL = 'SELECT DISTINCT r.RoomID, r.RoomNumber, r.Price, r.BedType, r.ViewType, r.Status, 
                               rt.RoomTypeID, rt.TypeName, rt.AccessibilityFeatures, rt.Description 
                FROM Rooms r
                JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
                WHERE r.IsActive = 1 '

    DECLARE @Conditions NVARCHAR(MAX) = ''

    IF @MinPrice IS NOT NULL
        SET @Conditions = @Conditions + 'AND r.Price >= @MinPrice '
    IF @MaxPrice IS NOT NULL
        SET @Conditions = @Conditions + 'AND r.Price <= @MaxPrice '
    IF @RoomTypeName IS NOT NULL
        SET @Conditions = @Conditions + 'AND rt.TypeName LIKE ''%' + @RoomTypeName + '%'' '
    IF @ViewType IS NOT NULL
        SET @Conditions = @Conditions + 'AND r.ViewType = @ViewType '

    IF LEN(@Conditions) > 0
        SET @SQL = @SQL + ' AND (' + STUFF(@Conditions, 1, 3, '') + ')'

    -- Print the generated SQL for debugging
    PRINT @SQL;

    EXEC sp_executesql @SQL,
                       N'@MinPrice DECIMAL(10,2), @MaxPrice DECIMAL(10,2), @RoomTypeName NVARCHAR(50), @ViewType NVARCHAR(50)',
                       @MinPrice, @MaxPrice, @RoomTypeName, @ViewType
END
GO




	

	-- First, we need to create a user-defined table type that can be used as a parameter for our stored procedure. This will take multiple Room IDs 
CREATE TYPE RoomIDTableType AS TABLE (RoomID INT);
GO

use QLResort

-- This stored procedure will calculate and return the Total Cost and Room wise Cost Breakup
CREATE OR ALTER PROCEDURE spCalculateRoomCosts
    @RoomIDs RoomIDTableType READONLY,
    @CheckInDate DATETIME,
    @CheckOutDate DATETIME,
    @Amount DECIMAL(10, 2) OUTPUT,        -- Base total cost before tax
    @GST DECIMAL(10, 2) OUTPUT,           -- GST amount based on 18%
    @TotalAmount DECIMAL(10, 2) OUTPUT    -- Total cost including GST
AS
BEGIN
    SET NOCOUNT ON;

    -- Calculate the number of nights based on CheckInDate and CheckOutDate
    DECLARE @NumberOfNights INT = DATEDIFF(DAY, @CheckInDate, @CheckOutDate);

    -- Handle partial day cases
    IF CAST(@CheckOutDate AS DATE) = CAST(@CheckInDate AS DATE) 
        OR DATEPART(HOUR, @CheckOutDate) > DATEPART(HOUR, @CheckInDate)
    BEGIN
        SET @NumberOfNights = @NumberOfNights + 1;
    END
    
    IF @NumberOfNights <= 0
    BEGIN
        SET @Amount = 0;
        SET @GST = 0;
        SET @TotalAmount = 0;
        RETURN; -- Exit if the number of nights is zero or negative, which shouldn't happen
    END

    -- Select Individual Rooms Price details
    SELECT 
        r.RoomID,
        r.RoomNumber,
        r.Price AS RoomPrice,
        @NumberOfNights AS NumberOfNights,
        r.Price * @NumberOfNights AS TotalPrice
    FROM 
        Rooms r
    INNER JOIN 
        @RoomIDs ri ON r.RoomID = ri.RoomID;

    -- Calculate total cost (base amount) from the rooms identified by RoomIDs multiplied by NumberOfNights
    SELECT @Amount = SUM(Price * @NumberOfNights) FROM Rooms
    WHERE RoomID IN (SELECT RoomID FROM @RoomIDs);

    -- Calculate GST as 18% of the Amount
    SET @GST = @Amount * 0.027;

    -- Calculate Total Amount as Amount plus GST
    SET @TotalAmount = @Amount + @GST;
END;
GO



ALTER TABLE Reservations
ADD TypeName NVARCHAR(255) NULL;
go

ALTER TABLE ReservationRooms
ADD TypeName NVARCHAR(255) NULL;
go

ALTER TABLE ReservationRooms
ADD ImageURL NVARCHAR(max) NULL;
go

ALTER TABLE Reservations
ADD Firstname NVARCHAR(255) NULL,
    Lastname NVARCHAR(255) NULL;

	alter table Reservations
	add SDT nvarchar(20) null

	alter table Reservations
	add RoomNumber nvarchar(10)

ALTER TABLE ReservationRooms
ADD Firstname NVARCHAR(255) NULL,
    Lastname NVARCHAR(255) NULL;

	SELECT 
    name AS ConstraintName,
    type_desc AS ConstraintType
FROM 
    sys.objects
WHERE 
    OBJECT_NAME(parent_object_id) = 'Reservations'
    AND type IN ('C', 'D', 'F', 'PK', 'UQ'); -- Types: Check (C), Default (D), Foreign Key (F), Primary Key (PK), Unique (UQ)

	ALTER TABLE Reservations
DROP CONSTRAINT CHK_CheckOutDate;


	ALTER TABLE Reservations
ALTER COLUMN CheckInDate DATETIME NULL;

ALTER TABLE Reservations
ALTER COLUMN CheckOutDate DATETIME NULL;

ALTER TABLE Reservations
ADD CONSTRAINT CHK_CheckOutDate
CHECK (CheckOutDate > CheckInDate);

CREATE OR ALTER PROCEDURE spCreateReservation
    @UserID INT,
    @RoomIDs RoomIDTableType READONLY,
    @CheckInDate DATETIME,
    @CheckOutDate DATETIME,
    @Adult INT,
    @Child INT,
    @Infant INT,
    @SDT NVARCHAR(20),
    @Message NVARCHAR(255) OUTPUT,
    @Status BIT OUTPUT,
    @ReservationID INT OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Check if the user exists and get Firstname, Lastname
        DECLARE @Firstname NVARCHAR(255), @Lastname NVARCHAR(255);
        SELECT @Firstname = Firstname, @Lastname = Lastname
        FROM Users
        WHERE UserID = @UserID AND IsActive = 1;

        IF @Firstname IS NULL OR @Lastname IS NULL
        BEGIN
            SET @Message = N'User does not exist or is disabled.';
            SET @Status = 0;
            RETURN;
        END;

        -- Expire previous reservations if needed
        UPDATE Reservations
        SET Status = 'Cancelled'
        WHERE Status = 'Reserved'
          AND DATEDIFF(MINUTE, BookingDate, GETDATE()) > 5;

        -- Check room availability for the specific date and time range
        IF EXISTS (
            SELECT 1 FROM ReservationRooms rr
            JOIN Reservations r ON rr.ReservationID = r.ReservationID
            WHERE rr.RoomID IN (SELECT RoomID FROM @RoomIDs)
            AND r.Status IN ('Reserved', 'Checked-in')
            AND (
                (@CheckInDate BETWEEN rr.CheckInDate AND rr.CheckOutDate) OR
                (@CheckOutDate BETWEEN rr.CheckInDate AND rr.CheckOutDate) OR
                (rr.CheckInDate BETWEEN @CheckInDate AND @CheckOutDate)
            )
        )
        BEGIN
            SET @Message = N'One or more rooms are not available for the selected dates.';
            SET @Status = 0;
            RETURN;
        END;

        -- Calculate the number of nights and total cost
        DECLARE @NumberOfNights INT = DATEDIFF(DAY, @CheckInDate, @CheckOutDate);
        IF @NumberOfNights <= 0
        BEGIN
            SET @Message = N'Check-out date must be later than check-in date.';
            SET @Status = 0;
            RETURN;
        END;

        DECLARE @BaseCost DECIMAL(10, 2);
        SELECT @BaseCost = SUM(Price * @NumberOfNights) FROM Rooms
        WHERE RoomID IN (SELECT RoomID FROM @RoomIDs);
        DECLARE @TotalAmount DECIMAL(10, 2) = @BaseCost;

        DECLARE @TypeName NVARCHAR(255);
        SELECT TOP 1 @TypeName = rt.TypeName
        FROM Rooms r
        JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
        WHERE r.RoomID IN (SELECT RoomID FROM @RoomIDs);

        -- Concatenate room numbers for all selected rooms
        DECLARE @RoomNumbers NVARCHAR(MAX);
        SELECT @RoomNumbers = STRING_AGG(CAST(r.RoomNumber AS NVARCHAR(10)), ', ')
        FROM Rooms r
        WHERE r.RoomID IN (SELECT RoomID FROM @RoomIDs);

        -- Create the Reservation with Status = 'Paid'
        INSERT INTO Reservations (UserID, BookingDate, CheckInDate, CheckOutDate, Adult, Child, Infant, SDT, NumberOfNights, TotalCost, Status, CreatedDate, TypeName, Firstname, Lastname, RoomNumber)
        VALUES (@UserID, GETDATE(), @CheckInDate, @CheckOutDate, @Adult, @Child, @Infant, @SDT, @NumberOfNights, @TotalAmount, 'Paid', GETDATE(), @TypeName, @Firstname, @Lastname, @RoomNumbers);

        SET @ReservationID = SCOPE_IDENTITY();

        -- Assign rooms to the reservation
        INSERT INTO ReservationRooms (ReservationID, RoomID, CheckInDate, CheckOutDate, TypeName, Firstname, Lastname, ImageURL)
        SELECT @ReservationID, r.RoomID, @CheckInDate, @CheckOutDate, rt.TypeName, @Firstname, @Lastname, img.ImageURL
        FROM @RoomIDs rid
        JOIN Rooms r ON rid.RoomID = r.RoomID
        JOIN RoomTypes rt ON r.RoomTypeID = rt.RoomTypeID
        LEFT JOIN Images img ON r.RoomID = img.RoomID AND img.ServicesID IS NULL
        WHERE img.ImageID = (SELECT TOP 1 ImageID FROM Images WHERE RoomID = r.RoomID ORDER BY ImageID);

        SET @Message = 'Reservation created successfully and marked as Paid.';
        SET @Status = 1;
        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;

        SET @Message = ERROR_MESSAGE();
        SET @Status = 0;
    END CATCH
END;
GO




CREATE OR ALTER PROCEDURE spExpireReservations
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE Reservations
    SET Status = 'Cancelled'
    WHERE Status = 'Reserved'
      AND DATEDIFF(MINUTE, BookingDate, GETDATE()) > 5;
END;





-- Designing the GuestDetailsTableType
CREATE TYPE GuestDetailsTableType AS TABLE (
    FirstName NVARCHAR(50),
    LastName NVARCHAR(50),
    Email NVARCHAR(100),
    Phone NVARCHAR(15),
    AgeGroup NVARCHAR(50),
    Address NVARCHAR(500),
    RoomID INT -- This will link the guest to a specific room in a reservation
);
GO

CREATE OR ALTER PROCEDURE spAddGuestsToReservation
    @UserID INT,
    @ReservationID INT,
    @GuestDetails GuestDetailsTableType READONLY,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Automatically roll-back the transaction on error.

    BEGIN TRY
        BEGIN TRANSACTION
            -- Validate the existence of the user
            IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @UserID AND IsActive = 1)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'User does not exist or inactive.';
                RETURN;
            END

            -- Validate that all RoomIDs are part of the reservation
            IF EXISTS (
                SELECT 1 FROM @GuestDetails gd
                WHERE NOT EXISTS (
                    SELECT 1 FROM ReservationRooms rr
                    WHERE rr.ReservationID = @ReservationID AND rr.RoomID = gd.RoomID
                )
            )
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'One or more RoomIDs are not valid for this reservation.';
                RETURN;
            END

            -- Create a temporary table to store Guest IDs with ReservationRoomID
            CREATE TABLE #TempGuests
            (
                TempID INT IDENTITY(1,1),
                GuestID INT,
                ReservationRoomID INT
            );

            -- Insert guests into Guests table and retrieve IDs
            INSERT INTO Guests (UserID, FirstName, LastName, Email, Phone, AgeGroup, Address,Room) 
            SELECT @UserID, gd.FirstName, gd.LastName, gd.Email, gd.Phone, gd.AgeGroup, gd.Address,gd.RoomID
            FROM @GuestDetails gd;

            -- Capture the Guest IDs and the corresponding ReservationRoomID
            INSERT INTO #TempGuests (GuestID, ReservationRoomID)
            SELECT SCOPE_IDENTITY(), rr.ReservationRoomID
            FROM @GuestDetails gd
            JOIN ReservationRooms rr ON gd.RoomID = rr.RoomID AND rr.ReservationID = @ReservationID;

            -- Link each new guest to a room in the reservation
            INSERT INTO ReservationGuests (ReservationRoomID, GuestID)
            SELECT ReservationRoomID, GuestID
            FROM #TempGuests;

            SET @Status = 1; -- Success
            SET @Message = 'All guests added successfully.';
            COMMIT TRANSACTION;

            -- Cleanup the temporary table
            DROP TABLE #TempGuests;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();

        -- Cleanup the temporary table in case of failure
        IF OBJECT_ID('tempdb..#TempGuests') IS NOT NULL
            DROP TABLE #TempGuests;
    END CATCH
END;
GO







-- Stored Procedure for Processing the Payment
CREATE OR ALTER PROCEDURE spProcessPayment
    @ReservationID INT,
    @TotalAmount DECIMAL(10,2),
    @PaymentMethod NVARCHAR(50),
    @PaymentID INT OUTPUT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Ensures that if an error occurs, all changes are rolled back

    BEGIN TRY
        BEGIN TRANSACTION

            -- Validate that the reservation exists and the total cost matches
            DECLARE @TotalCost DECIMAL(10,2);
            DECLARE @NumberOfNights INT;
            SELECT @TotalCost = TotalCost, @NumberOfNights = NumberOfNights
            FROM Reservations 
            WHERE ReservationID = @ReservationID;
            
            IF @TotalCost IS NULL
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Reservation does not exist.';
                RETURN;
            END

            IF @TotalAmount <> @TotalCost
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Input total amount does not match the reservation total cost.';
                RETURN;
            END

            -- Calculate Base Amount and GST, assuming GST as 18% for the Payments table
            DECLARE @BaseAmount DECIMAL(10,2) = @TotalCost / 1.18; 
            DECLARE @GST DECIMAL(10,2) = @TotalCost - @BaseAmount;

            -- Insert into Payments Table
            INSERT INTO Payments (ReservationID, Amount, GST, TotalAmount, PaymentDate, PaymentMethod, PaymentStatus)
            VALUES (@ReservationID, @BaseAmount, @GST, @TotalCost, GETDATE(), @PaymentMethod, 'Pending');

            SET @PaymentID = SCOPE_IDENTITY(); -- Capture the new Payment ID

            -- Insert into PaymentDetails table for each room with number of nights and calculated amounts
            INSERT INTO PaymentDetails (PaymentID, ReservationRoomID, Amount, NumberOfNights, GST, TotalAmount)
            SELECT @PaymentID, rr.ReservationRoomID, r.Price, @NumberOfNights, (r.Price * @NumberOfNights) * 0.18, r.Price * @NumberOfNights + (r.Price * @NumberOfNights) * 0.18
            FROM ReservationRooms rr
            JOIN Rooms r ON rr.RoomID = r.RoomID
            WHERE rr.ReservationID = @ReservationID;

            SET @Status = 1; -- Success
            SET @Message = 'Payment Processed Successfully.';
            COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO



-- Stored Procedure for Updating the Payment Status
CREATE OR ALTER PROCEDURE spUpdatePaymentStatus
    @PaymentID INT,
    @NewStatus NVARCHAR(50), -- 'Completed' or 'Failed'
    @FailureReason NVARCHAR(255) = NULL, -- Optional reason for failure
    @Status BIT OUTPUT, -- Output to indicate success/failure of the procedure
    @Message NVARCHAR(255) OUTPUT -- Output message detailing the result
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Ensure that if an error occurs, all changes are rolled back

    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the payment exists and is in a 'Pending' status
            DECLARE @CurrentStatus NVARCHAR(50);
            SELECT @CurrentStatus = PaymentStatus FROM Payments WHERE PaymentID = @PaymentID;
            
            IF @CurrentStatus IS NULL
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Payment record does not exist.';
                RETURN;
            END

            IF @CurrentStatus <> 'Pending'
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Payment status is not Pending. Cannot update.';
                RETURN;
            END

            -- Validate the new status
            IF @NewStatus NOT IN ('Completed', 'Failed')
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Invalid status value. Only "Completed" or "Failed" are acceptable.';
                RETURN;
            END

            -- Update the Payment Status
            UPDATE Payments
            SET PaymentStatus = @NewStatus,
                FailureReason = CASE WHEN @NewStatus = 'Failed' THEN @FailureReason ELSE NULL END
            WHERE PaymentID = @PaymentID;

            -- If Payment Fails, update corresponding reservation and room statuses
            IF @NewStatus = 'Failed'
            BEGIN
                DECLARE @ReservationID INT;
                SELECT @ReservationID = ReservationID FROM Payments WHERE PaymentID = @PaymentID;

                -- Update Reservation Status
                UPDATE Reservations
                SET Status = 'Cancelled'
                WHERE ReservationID = @ReservationID;

                -- Update Room Status
                UPDATE Rooms
                SET Status = 'Available'
                FROM Rooms
                JOIN ReservationRooms ON Rooms.RoomID = ReservationRooms.RoomID
                WHERE ReservationRooms.ReservationID = @ReservationID;
            END

            SET @Status = 1; -- Success
            SET @Message = 'Payment Status Updated Successfully.';
            COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO

-- CancellationPolicies Table
CREATE TABLE CancellationPolicies (
    PolicyID INT PRIMARY KEY IDENTITY(1,1),
    Description NVARCHAR(255),
    CancellationChargePercentage DECIMAL(5,2),
    MinimumCharge DECIMAL(10,2),
    EffectiveFromDate DATETIME,
    EffectiveToDate DATETIME
);
GO






-- Insert Early Cancellation Policy
INSERT INTO CancellationPolicies (Description, CancellationChargePercentage, MinimumCharge, EffectiveFromDate, EffectiveToDate)
VALUES ('No charge if cancelled more than 30 days before check-in', 0, 0, '2024-01-01', '2024-12-31');

-- Insert Moderate Cancellation Policy
INSERT INTO CancellationPolicies (Description, CancellationChargePercentage, MinimumCharge, EffectiveFromDate, EffectiveToDate)
VALUES ('10% charge if cancelled between 15 and 30 days before check-in', 10, 0, '2024-01-01', '2024-12-31');

-- Insert Late Cancellation Policy
INSERT INTO CancellationPolicies (Description, CancellationChargePercentage, MinimumCharge, EffectiveFromDate, EffectiveToDate)
VALUES ('25% charge if cancelled between 7 and 14 days before check-in', 25, 0, '2024-01-01', '2024-12-31');

-- Insert Last-Minute Cancellation Policy
INSERT INTO CancellationPolicies (Description, CancellationChargePercentage, MinimumCharge, EffectiveFromDate, EffectiveToDate)
VALUES ('50% charge if cancelled less than 7 days before check-in', 50, 0, '2024-01-01', '2024-12-31');

-- Insert Special High Season Policy
INSERT INTO CancellationPolicies (Description, CancellationChargePercentage, MinimumCharge, EffectiveFromDate, EffectiveToDate)
VALUES ('100% charge for any cancellation during high season', 100, 0, '2024-08-01', '2024-08-31');

go


use QLResort

-- Get Cancellation Policies
-- This stored procedure retrieves active cancellation policies for display purposes.
CREATE OR ALTER PROCEDURE spGetCancellationPolicies
    @Status BIT OUTPUT,    -- Output parameter for status (1 = Success, 0 = Failure)
    @Message NVARCHAR(255) OUTPUT  -- Output parameter for messages
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        SELECT PolicyID, Description, CancellationChargePercentage, MinimumCharge, EffectiveFromDate, EffectiveToDate 
        FROM CancellationPolicies
        WHERE EffectiveFromDate <= GETDATE() AND EffectiveToDate >= GETDATE();

        SET @Status = 1;  -- Success
        SET @Message = 'Policies retrieved successfully.';
    END TRY
    BEGIN CATCH
        SET @Status = 0;  -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO


-- First, we need to create a user-defined table type that can be used as a parameter for our stored procedure. This will take multiple Room IDs 
CREATE TYPE RoomIDTableType AS TABLE (RoomID INT);
GO

-- Calculate Cancellation Charges
-- Calculates the cancellation charges based on the policies.
CREATE OR ALTER PROCEDURE spCalculateCancellationCharges
    @ReservationID INT,
    @RoomsCancelled RoomIDTableType READONLY,
    @TotalCost DECIMAL(10,2) OUTPUT,
    @CancellationCharge DECIMAL(10,2) OUTPUT,
    @CancellationPercentage DECIMAL(10,2) OUTPUT,
    @PolicyDescription NVARCHAR(255) OUTPUT,
    @Status BIT OUTPUT,
    @Message NVARCHAR(MAX) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    DECLARE @CheckInDate DATE;
    DECLARE @TotalRoomsCount INT, @CancelledRoomsCount INT;

    BEGIN TRY
        -- Fetch check-in date
        SELECT @CheckInDate = CheckInDate FROM Reservations WHERE ReservationID = @ReservationID;
        IF @CheckInDate IS NULL
        BEGIN
            SET @Status = 0; -- Failure
            SET @Message = 'No reservation found with the given ID.';
            RETURN;
        END

        -- Determine if the cancellation is full or partial
        SELECT @TotalRoomsCount = COUNT(*) FROM ReservationRooms WHERE ReservationID = @ReservationID;
        SELECT @CancelledRoomsCount = COUNT(*) FROM @RoomsCancelled;

        IF @CancelledRoomsCount = @TotalRoomsCount
        BEGIN
            -- Full cancellation: Calculate based on total reservation cost
            SELECT @TotalCost = SUM(TotalAmount)
            FROM Payments 
            WHERE ReservationID = @ReservationID;
        END
        ELSE
        BEGIN
            -- Partial cancellation: Calculate based on specific rooms' costs from PaymentDetails
            SELECT @TotalCost = SUM(pd.Amount)
            FROM PaymentDetails pd
            INNER JOIN ReservationRooms rr ON pd.ReservationRoomID = rr.ReservationRoomID
            INNER JOIN @RoomsCancelled rc ON rr.RoomID = rc.RoomID
            WHERE rr.ReservationID = @ReservationID;
        END

        -- Check if total cost was calculated
        IF @TotalCost IS NULL
        BEGIN
            SET @Status = 0; -- Failure
            SET @Message = 'Failed to calculate total costs.';
            RETURN;
        END

        -- Fetch the appropriate cancellation policy based on the check-in date
        SELECT TOP 1 @CancellationPercentage = CancellationChargePercentage, 
                     @PolicyDescription = Description
        FROM CancellationPolicies
        WHERE EffectiveFromDate <= @CheckInDate AND EffectiveToDate >= @CheckInDate
        ORDER BY EffectiveFromDate DESC; -- In case of overlapping policies, the most recent one is used

        -- Calculate the cancellation charge
        SET @CancellationCharge = @TotalCost * (@CancellationPercentage / 100);

        SET @Status = 1; -- Success
        SET @Message = 'Calculation successful';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO




-- Create Cancellation Request
-- This Stored Procedure creates a cancellation request after validating the provided information.
CREATE OR ALTER PROCEDURE spCreateCancellationRequest
    @UserID INT,
    @ReservationID INT,
    @RoomsCancelled RoomIDTableType READONLY, -- Table-valued parameter
    @CancellationReason NVARCHAR(MAX),
    @Status BIT OUTPUT, -- Output parameter for operation status
    @Message NVARCHAR(255) OUTPUT, -- Output parameter for operation message
    @CancellationRequestID INT OUTPUT -- Output parameter to store the newly created CancellationRequestID
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Automatically roll-back the transaction on error.
    DECLARE @CancellationType NVARCHAR(50);
    DECLARE @TotalRooms INT, @CancelledRoomsCount INT, @RemainingRoomsCount INT;
    DECLARE @ExistingStatus NVARCHAR(50);
    DECLARE @CheckInDate DATE, @CheckOutDate DATE;

    -- Retrieve reservation details
    SELECT @ExistingStatus = Status, @CheckInDate = CheckInDate, @CheckOutDate = CheckOutDate
    FROM Reservations
    WHERE ReservationID = @ReservationID;

    -- Validation for reservation status and dates
    IF @ExistingStatus = 'Cancelled' OR GETDATE() >= @CheckInDate
    BEGIN
        SET @Status = 0; -- Failure
        SET @Message = 'Cancellation not allowed. Reservation already fully cancelled or past check-in date.';
        RETURN;
    END

    -- Prevent cancellation of already cancelled or pending cancellation rooms
    IF EXISTS (
        SELECT 1 
        FROM CancellationDetails cd
        JOIN CancellationRequests cr ON cd.CancellationRequestID = cr.CancellationRequestID
        JOIN ReservationRooms rr ON cd.ReservationRoomID = rr.ReservationRoomID
        JOIN @RoomsCancelled rc ON rr.RoomID = rc.RoomID
        WHERE cr.ReservationID = @ReservationID AND cr.Status IN ('Approved', 'Pending')
    )
    BEGIN
        SET @Status = 0; -- Failure
        SET @Message = 'One or more rooms have already been cancelled or cancellation is pending.';
        RETURN;
    END

    SELECT @TotalRooms = COUNT(*) FROM ReservationRooms WHERE ReservationID = @ReservationID;
    SELECT @CancelledRoomsCount = COUNT(*) FROM CancellationDetails cd
           JOIN CancellationRequests cr ON cd.CancellationRequestID = cr.CancellationRequestID
           WHERE cr.ReservationID = @ReservationID AND cr.Status IN ('Approved');

    -- Calculate remaining rooms that are not yet cancelled
    SET @RemainingRoomsCount = @TotalRooms - @CancelledRoomsCount;

    -- Determine the type of cancellation based on remaining rooms to be cancelled
    IF (@RemainingRoomsCount = (SELECT COUNT(*) FROM @RoomsCancelled))
        SET @CancellationType = 'Full'
    ELSE
        SET @CancellationType = 'Partial';

    BEGIN TRY
        BEGIN TRANSACTION
            -- Insert into CancellationRequests
            INSERT INTO CancellationRequests (ReservationID, UserID, CancellationType, RequestedOn, Status, CancellationReason)
            VALUES (@ReservationID, @UserID, @CancellationType, GETDATE(), 'Pending', @CancellationReason);

            SET @CancellationRequestID = SCOPE_IDENTITY();

            -- Insert into CancellationDetails for rooms not yet cancelled
            INSERT INTO CancellationDetails (CancellationRequestID, ReservationRoomID)
            SELECT @CancellationRequestID, rr.ReservationRoomID 
            FROM ReservationRooms rr 
            JOIN @RoomsCancelled rc ON rr.RoomID = rc.RoomID
            WHERE rr.ReservationID = @ReservationID;

        COMMIT TRANSACTION;
        SET @Status = 1; -- Success
        SET @Message = 'Cancellation request created successfully.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO




-- Get All Cancellations
-- This procedure fetches all cancellations based on the optional status filter.
CREATE OR ALTER PROCEDURE spGetAllCancellations
    @Status NVARCHAR(50) = NULL,
    @DateFrom DATETIME = NULL,
    @DateTo DATETIME = NULL,
    @StatusOut BIT OUTPUT, -- Output parameter for operation status
    @MessageOut NVARCHAR(255) OUTPUT -- Output parameter for operation message
AS
BEGIN
    SET NOCOUNT ON;
    DECLARE @SQL NVARCHAR(MAX), @Params NVARCHAR(MAX);

    -- Initialize dynamic SQL query
    SET @SQL = N'SELECT CancellationRequestID, ReservationID, UserID, CancellationType, RequestedOn, Status FROM CancellationRequests WHERE 1=1';

    -- Append conditions dynamically based on the input parameters
    IF @Status IS NOT NULL
        SET @SQL += N' AND Status = @Status';
    IF @DateFrom IS NOT NULL
        SET @SQL += N' AND RequestedOn >= @DateFrom';
    IF @DateTo IS NOT NULL
        SET @SQL += N' AND RequestedOn <= @DateTo';

    -- Define parameters for dynamic SQL
    SET @Params = N'@Status NVARCHAR(50), @DateFrom DATETIME, @DateTo DATETIME';

    BEGIN TRY
        -- Execute dynamic SQL
        EXEC sp_executesql @SQL, @Params, @Status = @Status, @DateFrom = @DateFrom, @DateTo = @DateTo;

        -- If successful, set output parameters
        SET @StatusOut = 1; -- Success
        SET @MessageOut = 'Cancellations retrieved successfully.';
    END TRY
    BEGIN CATCH
        -- If an error occurs, set output parameters to indicate failure
        SET @StatusOut = 0; -- Failure
        SET @MessageOut = ERROR_MESSAGE();
    END CATCH
END;
GO




-- Review Cancellation Request
-- This procedure is used by an admin to review and either approve or reject a cancellation request.
CREATE OR ALTER PROCEDURE spReviewCancellationRequest
    @CancellationRequestID INT,
    @AdminUserID INT,
    @ApprovalStatus NVARCHAR(50),  -- 'Approved' or 'Rejected'
    @Status BIT OUTPUT,  -- Output parameter for operation status
    @Message NVARCHAR(255) OUTPUT  -- Output parameter for operation message
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Automatically roll-back the transaction on error.
    DECLARE @ReservationID INT, @CalcStatus BIT, @CalcMessage NVARCHAR(MAX);
    DECLARE @RoomsCancelled AS RoomIDTableType;
    DECLARE @CalcTotalCost DECIMAL(10,2), @CalcCancellationCharge DECIMAL(10,2),
            @CalcCancellationPercentage DECIMAL(10,2), @CalcPolicyDescription NVARCHAR(255);

    BEGIN TRY
        -- Validate the existence of the Cancellation Request
        IF NOT EXISTS (SELECT 1 FROM CancellationRequests WHERE CancellationRequestID = @CancellationRequestID)
        BEGIN
            SET @Status = 0;  -- Failure
            SET @Message = 'Cancellation request does not exist.';
            RETURN;
        END

        -- Validate the Admin User exists and is active
        IF NOT EXISTS (SELECT 1 FROM Users WHERE UserID = @AdminUserID AND IsActive = 1)
        BEGIN
            SET @Status = 0;  -- Failure
            SET @Message = 'Admin user does not exist or is not active.';
            RETURN;
        END

        -- Validate the Approval Status
        IF @ApprovalStatus NOT IN ('Approved', 'Rejected')
        BEGIN
            SET @Status = 0;  -- Failure
            SET @Message = 'Invalid approval status.';
            RETURN;
        END

        BEGIN TRANSACTION
            -- Update the Cancellation Requests
            UPDATE CancellationRequests
            SET Status = @ApprovalStatus, AdminReviewedByID = @AdminUserID, ReviewDate = GETDATE()
            WHERE CancellationRequestID = @CancellationRequestID;

            SELECT @ReservationID = ReservationID FROM CancellationRequests WHERE CancellationRequestID = @CancellationRequestID;

            IF @ApprovalStatus = 'Approved'
            BEGIN
                -- Fetch all rooms associated with the cancellation request
                INSERT INTO @RoomsCancelled (RoomID)
                SELECT rr.RoomID
                FROM CancellationDetails cd
                JOIN ReservationRooms rr ON cd.ReservationRoomID = rr.ReservationRoomID
                WHERE cd.CancellationRequestID = @CancellationRequestID;

                -- Call the calculation procedure
                EXEC spCalculateCancellationCharges 
                    @ReservationID = @ReservationID,
                    @RoomsCancelled = @RoomsCancelled,
                    @TotalCost = @CalcTotalCost OUTPUT,
                    @CancellationCharge = @CalcCancellationCharge OUTPUT,
                    @CancellationPercentage = @CalcCancellationPercentage OUTPUT,
                    @PolicyDescription = @CalcPolicyDescription OUTPUT,
                    @Status = @CalcStatus OUTPUT,
                    @Message = @CalcMessage OUTPUT;

                IF @CalcStatus = 0  -- Check if the charge calculation was unsuccessful
                BEGIN
                    SET @Status = 0;  -- Failure
                    SET @Message = 'Failed to calculate cancellation charges: ' + @CalcMessage;
                    ROLLBACK TRANSACTION;
                    RETURN;
                END

                -- Insert into CancellationCharges table
                INSERT INTO CancellationCharges (CancellationRequestID, TotalCost, CancellationCharge, CancellationPercentage, PolicyDescription)
                VALUES (@CancellationRequestID, @CalcTotalCost, @CalcCancellationCharge, @CalcCancellationPercentage, @CalcPolicyDescription);

                UPDATE Rooms
                SET Status = 'Available'
                WHERE RoomID IN (SELECT RoomID FROM @RoomsCancelled);

                UPDATE Reservations
                SET Status = CASE 
                                 WHEN (SELECT COUNT(*) FROM ReservationRooms WHERE ReservationID = @ReservationID) = 
                                      (SELECT COUNT(*) FROM @RoomsCancelled)
                                 THEN 'Cancelled'
                                 ELSE 'Partially Cancelled'
                             END
                WHERE ReservationID = @ReservationID;
            END

        COMMIT TRANSACTION;
        SET @Status = 1;  -- Success
        SET @Message = 'Cancellation request handled successfully.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0;  -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO






-- Get Cancellations for Refund
-- This procedure is used by an admin to fetch cancellations that are approved and either have no refund record 
-- or need refund action (Pending or Failed, excluding Completed)
CREATE OR ALTER PROCEDURE spGetCancellationsForRefund
AS
BEGIN
    SET NOCOUNT ON;

    SELECT 
        cr.CancellationRequestID, 
        cr.ReservationID,
        cr.UserID,
        cr.CancellationType,
        cr.RequestedOn,
        cr.Status,
        ISNULL(r.RefundID, 0) AS RefundID,  -- Use 0 or another appropriate default value to indicate no refund has been initiated
        ISNULL(r.RefundStatus, 'Not Initiated') AS RefundStatus  -- Use 'Not Initiated' or another appropriate status
    FROM 
        CancellationRequests cr
    LEFT JOIN 
        Refunds r ON cr.CancellationRequestID = r.CancellationRequestID
    WHERE 
        cr.Status = 'Approved' 
        AND (r.RefundStatus IS NULL OR r.RefundStatus IN ('Pending', 'Failed'));
END;
GO





-- Process Refund
-- Processes refunds for approved cancellations.
CREATE OR ALTER PROCEDURE spProcessRefund
    @CancellationRequestID INT,
    @ProcessedByUserID INT,
    @RefundMethodID INT,
    @RefundID INT OUTPUT,  -- Output parameter for the newly created Refund ID
    @Status BIT OUTPUT,   -- Output parameter for operation status
    @Message NVARCHAR(255) OUTPUT  -- Output parameter for operation message
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Automatically roll-back the transaction on error.
    DECLARE @PaymentID INT, @RefundAmount DECIMAL(10,2), @CancellationCharge DECIMAL(10,2), @NetRefundAmount DECIMAL(10,2);

    BEGIN TRY
        BEGIN TRANSACTION

            -- Validate the existence of the CancellationRequestID and its approval status
            IF NOT EXISTS (SELECT 1 FROM CancellationRequests 
                           WHERE CancellationRequestID = @CancellationRequestID AND Status = 'Approved')
            BEGIN
                SET @Status = 0;  -- Failure
                SET @Message = 'Invalid CancellationRequestID or the request has not been approved.';
                RETURN;
            END

            -- Retrieve the total amount and cancellation charge from the CancellationCharges table
            SELECT 
                @PaymentID = p.PaymentID,
                @RefundAmount = cc.TotalCost,
                @CancellationCharge = cc.CancellationCharge
            FROM CancellationCharges cc
            JOIN Payments p ON p.ReservationID = (SELECT ReservationID FROM CancellationRequests WHERE CancellationRequestID = @CancellationRequestID)
            WHERE cc.CancellationRequestID = @CancellationRequestID;

            -- Calculate the net refund amount after deducting the cancellation charge
            SET @NetRefundAmount = @RefundAmount - @CancellationCharge;

            -- Insert into Refunds table, mark the Refund Status as Pending
            INSERT INTO Refunds (PaymentID, RefundAmount, RefundDate, RefundReason, RefundMethodID, ProcessedByUserID, RefundStatus, CancellationCharge, NetRefundAmount, CancellationRequestID)
            VALUES (@PaymentID, @NetRefundAmount, GETDATE(), 'Cancellation Approved', @RefundMethodID, @ProcessedByUserID, 'Pending', @CancellationCharge, @NetRefundAmount, @CancellationRequestID);

            -- Capture the newly created Refund ID
            SET @RefundID = SCOPE_IDENTITY();

        COMMIT TRANSACTION;
        SET @Status = 1;  -- Success
        SET @Message = 'Refund processed successfully.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0;  -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO





-- Update Refund Status
CREATE OR ALTER PROCEDURE spUpdateRefundStatus
    @RefundID INT,
    @NewRefundStatus NVARCHAR(50),
    @Status BIT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    SET XACT_ABORT ON; -- Automatically roll-back the transaction on error.

    -- Define valid statuses, adjust these as necessary for your application
    DECLARE @ValidStatuses TABLE (Status NVARCHAR(50));
    INSERT INTO @ValidStatuses VALUES ('Pending'), ('Processed'), ('Completed'), ('Failed');

    BEGIN TRY
        BEGIN TRANSACTION
            -- Check current status of the refund to avoid updating final states like 'Completed'
            DECLARE @CurrentStatus NVARCHAR(50);
            SELECT @CurrentStatus = RefundStatus FROM Refunds WHERE RefundID = @RefundID;

            IF @CurrentStatus IS NULL
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Refund not found.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            IF @CurrentStatus = 'Completed'
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Refund is already completed and cannot be updated.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Validate the new refund status
            IF NOT EXISTS (SELECT 1 FROM @ValidStatuses WHERE Status = @NewRefundStatus)
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'Invalid new refund status provided.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

            -- Update the Refund Status if validations pass
            UPDATE Refunds
            SET RefundStatus = @NewRefundStatus
            WHERE RefundID = @RefundID;

            IF @@ROWCOUNT = 0
            BEGIN
                SET @Status = 0; -- Failure
                SET @Message = 'No refund found with the provided RefundID.';
                ROLLBACK TRANSACTION;
                RETURN;
            END

        COMMIT TRANSACTION;
        SET @Status = 1; -- Success
        SET @Message = 'Refund status updated successfully.';
    END TRY
    BEGIN CATCH
        IF @@TRANCOUNT > 0
            ROLLBACK TRANSACTION;
        SET @Status = 0; -- Failure
        SET @Message = ERROR_MESSAGE();
    END CATCH
END;
GO

 
 

 use QLResort
 go




	CREATE or alter PROCEDURE spUploadImageForRoom
    @RoomID INT,
    @ImageURL NVARCHAR(MAX)
AS
BEGIN
    -- Check if the Product exists before inserting
    IF EXISTS (SELECT 1 FROM Rooms WHERE RoomID = @RoomID)
    BEGIN
        INSERT INTO Images (RoomID, ImageURL)
        VALUES (@RoomID,@ImageURL);

        SELECT 'Image uploaded successfully.' AS Message;
    END
    ELSE
    BEGIN
        -- If the ProductID doesn't exist, return a message
        SELECT 'Error: RoomID does not exist.' AS Message;
    END
END;

GO





	CREATE or alter PROCEDURE spUploadImageForServices
    @ServicesID INT,

    @ImageURL NVARCHAR(MAX)
AS
BEGIN
    -- Check if the Product exists before inserting
    IF EXISTS (SELECT 1 FROM ServicesA WHERE ServicesID = @ServicesID)
    BEGIN
        INSERT INTO Images (ServicesID, ImageURL)
        VALUES (@ServicesID,@ImageURL);

        SELECT 'Image uploaded successfully.' AS Message;
    END
    ELSE
    BEGIN
        -- If the ProductID doesn't exist, return a message
        SELECT 'Error: ServicesID does not exist.' AS Message;
    END
END;

GO

CREATE PROCEDURE spGetAllImages
AS
BEGIN
    SET NOCOUNT ON; -- Prevents extra result sets from interfering with SELECT statements.

    SELECT 
        i.ImageID,        -- ID of the image
        i.RoomID,      -- ID of the associated product
		
        i.ImageURL,       -- URL of the image
        p.RoomNumber     -- Name of the associated product
    FROM 
        Images i
    JOIN 
        Rooms p ON i.RoomID = p.RoomID; -- Join to get product names
END;
GO



CREATE PROCEDURE spDeleteImage
    @ImageID INT
AS
BEGIN
    SET NOCOUNT ON; -- Prevents extra result sets from interfering with SELECT statements.

    -- Check if the image exists before attempting to delete
    IF EXISTS (SELECT 1 FROM Images WHERE ImageID = @ImageID)
    BEGIN
        DELETE FROM Images 
        WHERE ImageID = @ImageID;

        -- You can return a message or a status indicating success
        SELECT 'Image deleted successfully.' AS Message;
    END
    ELSE
    BEGIN
        -- Return a message if the image does not exist
        SELECT 'Image not found.' AS Message;
    END
END;
GO





CREATE PROCEDURE spGetAllImagesServices
AS
BEGIN
    SET NOCOUNT ON; -- Prevents extra result sets from interfering with SELECT statements.

    SELECT 
        i.ImageID,        -- ID of the image
        i.ServicesID,      -- ID of the associated product
		
        i.ImageURL,       -- URL of the image
        p.ServiceName     -- Name of the associated product
    FROM 
        Images i
    JOIN 
        ServicesA p ON i.ServicesID = p.ServicesID; -- Join to get product names
END;
GO



CREATE PROCEDURE spDeleteImage
    @ImageID INT
AS
BEGIN
    SET NOCOUNT ON; -- Prevents extra result sets from interfering with SELECT statements.

    -- Check if the image exists before attempting to delete
    IF EXISTS (SELECT 1 FROM Images WHERE ImageID = @ImageID)
    BEGIN
        DELETE FROM Images 
        WHERE ImageID = @ImageID;

        -- You can return a message or a status indicating success
        SELECT 'Image deleted successfully.' AS Message;
    END
    ELSE
    BEGIN
        -- Return a message if the image does not exist
        SELECT 'Image not found.' AS Message;
    END
END;
GO








-------
-- Create Services
CREATE or alter PROCEDURE spCreateServices
    @ServicesID int output,
    @ServiceName NVARCHAR(50),
    @Description1 NVARCHAR(MAX),
    @Description2 NVARCHAR(MAX),
    @Description3 NVARCHAR(MAX),
    @CreatedBy NVARCHAR(100),
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION

            -- Check if the service already exists
            IF NOT EXISTS (SELECT 1 FROM ServicesA WHERE ServiceName = @ServiceName)
            BEGIN
                -- Insert into Services table
                INSERT INTO ServicesA (ServiceName, Description1, Description2, Description3, CreatedBy, CreatedDate)
                VALUES (@ServiceName, @Description1, @Description2, @Description3, @CreatedBy, GETDATE());
				  SET @ServicesID = SCOPE_IDENTITY()
                SET @StatusCode = 0 -- Success
                SET @Message = 'Service created successfully.'
            END
            ELSE
            BEGIN
                -- If the service name already exists, return an error message
                SET @StatusCode = 1 -- Failure due to duplicate name
                SET @Message = 'Service name already exists.'
            END

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        -- Rollback transaction in case of error
        ROLLBACK TRANSACTION

        -- Return the SQL error number and message
        SET @StatusCode = ERROR_NUMBER()
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO

--- Update Services
CREATE PROCEDURE spUpdateServices
    @ServicesID INT,
    @ServiceName NVARCHAR(50),
    @Description1 NVARCHAR(MAX),
    @Description2 NVARCHAR(MAX),
    @Description3 NVARCHAR(MAX),
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION
            -- Check if the updated service name already exists in another record
            IF NOT EXISTS (SELECT 1 FROM ServicesA WHERE ServiceName = @ServiceName AND ServicesID <> @ServicesID)
            BEGIN
                -- Check if the service with the given ID exists
                IF EXISTS (SELECT 1 FROM ServicesA WHERE ServicesID = @ServicesID)
                BEGIN
                    -- Update the service details
                    UPDATE ServicesA
                    SET ServiceName = @ServiceName,
                        Description1 = @Description1,
                        Description2 = @Description2,
                        Description3 = @Description3
                    WHERE ServicesID = @ServicesID

                    SET @StatusCode = 0 -- Success
                    SET @Message = 'Service updated successfully.'
                END
                ELSE
                BEGIN
                    SET @StatusCode = 2 -- Failure due to not found
                    SET @Message = 'Service not found.'
                END
            END
            ELSE
            BEGIN
                SET @StatusCode = 1 -- Failure due to duplicate name
                SET @Message = 'Another service with the same name already exists.'
            END

        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        -- Rollback transaction in case of error
        ROLLBACK TRANSACTION

        -- Return the SQL error number and message
        SET @StatusCode = ERROR_NUMBER()
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO

-- Delete Service By Id
CREATE PROCEDURE spDeleteService
    @ServicesID INT,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        BEGIN TRANSACTION
        
            -- Check for existing links to this service
            IF NOT EXISTS (SELECT 1 FROM ServicesA WHERE ServicesID = @ServicesID) -- Assuming a table that references Services
            BEGIN
                IF EXISTS (SELECT 1 FROM ServicesA WHERE ServicesID = @ServicesID)
                BEGIN
                    DELETE FROM ServicesA WHERE ServicesID = @ServicesID
                    SET @StatusCode = 0 -- Success
                    SET @Message = 'Service deleted successfully.'
                END
                ELSE
                BEGIN
                    SET @StatusCode = 2 -- Failure due to not found
                    SET @Message = 'Service not found.'
                END
            END
            ELSE
            BEGIN
                SET @StatusCode = 1 -- Failure due to dependency
                SET @Message = 'Cannot delete service as it is being referenced by one or more records.'
            END
            
        COMMIT TRANSACTION
    END TRY
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER() -- SQL Server error number
        SET @Message = ERROR_MESSAGE()
    END CATCH
END
GO


-- Get Service By Id
CREATE PROCEDURE spGetServiceById
    @ServicesID INT
AS
BEGIN
    SET NOCOUNT ON;
    
    SELECT 
        ServicesID, 
        ServiceName, 
        Description1, 
        Description2, 
        Description3, 
        IsActive 
    FROM 
        ServicesA 
    WHERE 
        ServicesID = @ServicesID;
END
GO

-- Get All Services
CREATE PROCEDURE spGetAllServices
    @IsActive BIT = NULL  -- Optional parameter to filter by IsActive status
AS
BEGIN
    SET NOCOUNT ON;
    
    -- Select services based on active status
    IF @IsActive IS NULL
    BEGIN
        SELECT 
            ServicesID, 
            ServiceName, 
            Description1, 
            Description2, 
            Description3, 
            IsActive 
        FROM 
            ServicesA;
    END
    ELSE
    BEGIN
        SELECT 
            ServicesID, 
            ServiceName, 
            Description1, 
            Description2, 
            Description3, 
            IsActive 
        FROM 
            ServicesA 
        WHERE 
            IsActive = @IsActive;
    END
END
GO

-- Activate/Deactivate Service
CREATE PROCEDURE spToggleServicesActive
    @ServicesID INT,
    @IsActive BIT,
    @StatusCode INT OUTPUT,
    @Message NVARCHAR(255) OUTPUT
AS
BEGIN
    SET NOCOUNT ON;
    BEGIN TRY
        -- Check service existence
        IF NOT EXISTS (SELECT 1 FROM ServicesA WHERE ServicesID = @ServicesID)
        BEGIN
            SET @StatusCode = 1 -- Failure due to not found
            SET @Message = 'Service not found.'
            RETURN; -- Exit the procedure
        END

        -- Update IsActive status
        BEGIN TRANSACTION
            UPDATE ServicesA 
            SET IsActive = @IsActive 
            WHERE ServicesID = @ServicesID;
        
            SET @StatusCode = 0 -- Success
            SET @Message = 'Service activated/deactivated successfully.'
        COMMIT TRANSACTION

    END TRY
    -- Handle exceptions
    BEGIN CATCH
        ROLLBACK TRANSACTION
        SET @StatusCode = ERROR_NUMBER() -- SQL Server error number
        SET @Message = ERROR_MESSAGE()
    END CATCH
END;
GO





CREATE or alter PROCEDURE GetAllReservations
AS
BEGIN
    -- Chọn tất cả các cột từ bảng Reservations
    SELECT 
        ReservationID,
        UserID,
        BookingDate,
        TotalCost,
		TypeName,
		Firstname,
		Lastname,
		RoomNumber,
        Adult,
        Child,
        Infant,
		SDT,
        NumberOfNights,
        CheckInDate,
        CheckOutDate,
        Status,
        CreatedDate
    FROM 
        Reservations
    ORDER BY 
        CreatedDate DESC; -- Sắp xếp theo ngày tạo mới nhất
END;
GO



CREATE or alter PROCEDURE GetAllReservationRooms
AS
BEGIN
    -- Truy vấn tất cả thông tin từ bảng ReservationRooms
    SELECT 
        ReservationRoomID,
        ReservationID,
        RoomID,
		TypeName,
		Firstname,
		Lastname,
		ImageURL,
        CheckInDate,
        CheckOutDate
    FROM 
        ReservationRooms
    ORDER BY 
        CheckInDate DESC; -- Sắp xếp theo ngày nhận phòng giảm dần
END;
GO

use QLResort




INSERT INTO Users (RoleID, Email, Firstname, Lastname, PasswordHash, CreatedAt, LastLogin, IsActive, CreatedBy, CreatedDate)
VALUES (1, 'testuser1@example.com', 'Test', 'User1', '$2a$11$example1', '2024-10-17', NULL, 1, 'System', '2024-10-17'),
       (2, 'testuser2@example.com', 'Test', 'User2', '$2a$11$example2', '2024-10-18', '2024-11-10', 0, 'System', '2024-10-18'),
       (1, 'testuser3@example.com', 'Alice', 'Smith', '$2a$11$example3', '2024-10-19', '2024-11-11', 1, 'System', '2024-10-19'),
       (2, 'testuser4@example.com', 'Bob', 'Jones', '$2a$11$example4', '2024-10-20', NULL, 0, 'System', '2024-10-20'),
       (1, 'testuser5@example.com', 'Charlie', 'Brown', '$2a$11$example5', '2024-10-21', '2024-11-12', 1, 'System', '2024-10-21'),
       (2, 'testuser6@example.com', 'David', 'Johnson', '$2a$11$example6', '2024-10-22', NULL, 0, 'System', '2024-10-22'),
       (1, 'testuser7@example.com', 'Eve', 'Davis', '$2a$11$example7', '2024-10-23', '2024-11-13', 1, 'System', '2024-10-23'),
       (2, 'testuser8@example.com', 'Frank', 'Wilson', '$2a$11$example8', '2024-10-24', NULL, 0, 'System', '2024-10-24'),
       (1, 'testuser9@example.com', 'Grace', 'Taylor', '$2a$11$example9', '2024-10-25', '2024-11-14', 1, 'System', '2024-10-25'),
       (2, 'testuser10@example.com', 'Hank', 'Anderson', '$2a$11$example10', '2024-10-26', NULL, 0, 'System', '2024-10-26'),
       (1, 'testuser11@example.com', 'Ivy', 'Thomas', '$2a$11$example11', '2024-10-27', '2024-11-15', 1, 'System', '2024-10-27'),
       (2, 'testuser12@example.com', 'Jack', 'Moore', '$2a$11$example12', '2024-10-28', NULL, 0, 'System', '2024-10-28'),
       (1, 'testuser13@example.com', 'Kara', 'Jackson', '$2a$11$example13', '2024-10-29', '2024-11-16', 1, 'System', '2024-10-29'),
       (2, 'testuser14@example.com', 'Leo', 'Martin', '$2a$11$example14', '2024-10-30', NULL, 0, 'System', '2024-10-30'),
       (1, 'testuser15@example.com', 'Mia', 'Lee', '$2a$11$example15', '2024-10-31', '2024-11-17', 1, 'System', '2024-10-31');

















