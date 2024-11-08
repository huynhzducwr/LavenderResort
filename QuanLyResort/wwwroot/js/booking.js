let bookedDates = [];
const style = document.createElement('style');
style.textContent = `
    .booked-date {
        background-color: rgba(255, 0, 0, 0.4) !important; /* Slightly red background */
        color: #ffffff !important; /* White text color */
        pointer-events: none; /* Prevent clicking on booked dates */
        border-radius: 50%; /* Circular background */
        font-weight: bold; /* Bold text */
    }
`;
document.head.appendChild(style); // Append the style to the head

window.addEventListener('load', () => {
    const storedCheckin = localStorage.getItem('checkin');
    const storedCheckout = localStorage.getItem('checkout');
    const defaultAdults = 1; // Giá trị mặc định cho adults
    const defaultChildren = 0; // Giá trị mặc định cho children
    const defaultInfants = 0; // Giá trị mặc định cho infants

    // Xóa dữ liệu từ localStorage
    localStorage.removeItem('adults');
    localStorage.removeItem('children');
    localStorage.removeItem('infants');

    // Thiết lập lại các trường input
    document.getElementById('adults').value = defaultAdults;
    document.getElementById('children').value = defaultChildren;
    document.getElementById('infants').value = defaultInfants;
    if (storedCheckin) {
        document.getElementById('checkin').value = storedCheckin;
    }
    if (storedCheckout) {
        document.getElementById('checkout').value = storedCheckout;
    }

    updateStayDates();
});

function isValidCheckinTime(checkinDate) {
    const date = new Date(checkinDate);
    const hours = date.getHours();
    return hours >= 12; // Giờ nhận phòng phải là 14:00 hoặc sau đó
}

function isValidCheckoutTime(checkoutDate) {
    const date = new Date(checkoutDate);
    const hours = date.getHours();
    return hours <=12; // Giờ trả phòng phải trước 12:00
}

function isValidStayDuration(checkinDate, checkoutDate) {
    const checkin = new Date(checkinDate);
    const checkout = new Date(checkoutDate);
    const diffInDays = (checkout - checkin) / (1000 * 60 * 60 * 24);
    return diffInDays >= 1; // Thời gian lưu trú ít nhất là 1 đêm
}

function updateStayDates() {
    const checkinDate = document.getElementById('checkin').value;
    const checkoutDate = document.getElementById('checkout').value;

    if (checkinDate && checkoutDate) {
        const stayDatesElement = document.querySelector('.stay-dates');
        const formattedCheckin = new Date(checkinDate).toLocaleString('en-GB');
        const formattedCheckout = new Date(checkoutDate).toLocaleString('en-GB');

        stayDatesElement.textContent = `${formattedCheckin} — ${formattedCheckout}`;
    }
    CalculateRoomCost();
    displayCartRooms();
}

function isDateTimeBooked(selectedDate) {
    return bookedDates.some(({ checkIn, checkOut }) =>
        selectedDate >= checkIn && selectedDate < checkOut
    );
}



function isDateBooked(date) {
    return bookedDates.some(range => {
        const checkIn = range.checkIn;
        const checkOut = range.checkOut;
        return date >= checkIn && date < checkOut;
    });
}

function initializeDatePickers() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1); // Ngày mai
    tomorrow.setHours(12, 0, 0, 0); // Mặc định là 12h trưa

    // Hàm thiết lập giờ mặc định là 12h trưa
    function setDefaultTime(date) {
        date.setHours(12);
        date.setMinutes(0);
        return date;
    }

    flatpickr("#checkin", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: tomorrow, // Chỉ cho phép chọn từ ngày mai trở đi
        defaultDate: tomorrow, // Đặt mặc định ngày mai lúc 12h trưa
        disable: [
            function (date) {
                return isDateBooked(date); // Disable nếu ngày đã được đặt
            }
        ],
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const date = new Date(dayElem.dateObj);
            if (isDateBooked(date)) {
                dayElem.classList.add("flatpickr-disabled", "booked-date");
                dayElem.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
            }
        },
        onChange: function (selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                const selectedDate = selectedDates[0];

                // Nếu giờ nhỏ hơn 12, tự động đặt lại thành 12h trưa
                if (selectedDate.getHours() < 12) {
                    selectedDate.setHours(12, 0, 0, 0);
                    instance.setDate(selectedDate); // Cập nhật lại giá trị trong input
                }

                const isoFormat = selectedDate.toISOString();
                console.log("Check-in date selected (ISO format):", isoFormat);
                localStorage.setItem("checkin", isoFormat);
            }
        }
    });

    flatpickr("#checkout", {
        enableTime: true,
        dateFormat: "Y-m-d H:i",
        minDate: tomorrow, // Chỉ cho phép chọn từ ngày mai trở đi
        defaultDate: new Date(tomorrow), // Đặt mặc định ngày mai lúc 12h trưa
        disable: [
            function (date) {
                return isDateBooked(date); // Disable nếu ngày đã được đặt
            }
        ],
        onDayCreate: function (dObj, dStr, fp, dayElem) {
            const date = new Date(dayElem.dateObj);
            if (isDateBooked(date)) {
                dayElem.classList.add("flatpickr-disabled", "booked-date");
                dayElem.style.backgroundColor = "rgba(255, 0, 0, 0.4)";
            }
        },
        onChange: function (selectedDates, dateStr, instance) {
            if (selectedDates.length > 0) {
                const selectedDate = selectedDates[0];

                // Nếu giờ nhỏ hơn 12, tự động đặt lại thành 12h trưa
                if (selectedDate.getHours() < 12) {
                    selectedDate.setHours(12, 0, 0, 0);
                    instance.setDate(selectedDate); // Cập nhật lại giá trị trong input
                }

                const isoFormat = selectedDate.toISOString();
                console.log("Check-out date selected (ISO format):", isoFormat);
                localStorage.setItem("checkout", isoFormat);
            }
        }
    });
}





let roomData = []; // Dữ liệu phòng từ fetchReservations
//async function fetchReservations(filter = null) {
//    let url = '/api/Reservation/All';
//    if (filter) {
//        url += `?filter=${filter}`;
//    }

//    try {
//        const response = await fetch(url);
//        if (response.ok) {
//            const result = await response.json();
//            console.log(result);

//            if (result && Array.isArray(result.data)) {
//                // Lọc các trạng thái không phải 'Cancelled' và bao gồm 'Checked-out'
//                reservationData = result.data.filter(reservation =>
//                    reservation.status !== 'Cancelled' && reservation.status !== 'Checked-out'
//                );

//                // Map các ngày đã được đặt
//                bookedDates = reservationData.map(reservation => ({
//                    checkIn: new Date(reservation.checkInDate),
//                    checkOut: new Date(reservation.checkOutDate),
//                    roomNumber: reservation.roomNumber,
//                    roomType: reservation.typeName // Giả sử API trả về roomType
//                }));
//                roomData = JSON.parse(localStorage.getItem('rooms')) || [];
//                // Khởi tạo date pickers sau khi fetch dữ liệu
//                initializeDatePickers();
//            } else {
//                console.error("Unexpected data format:", result);
//            }
//        } else {
//            console.error("Error fetching reservations:", response.statusText);
//        }
//    } catch (error) {
//        console.error("Network error:", error);
//    }
//}




function formatCurrencyVND(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}
async function fetchImageRoom() {
    let url = '/api/Image/all'; // API endpoint to fetch images
    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json(); // Parse JSON data from API
            console.log("Fetched Image Room:", data); // Log fetched image data for verification
            return data; // Return the fetched image data
        } else {
            console.error("Error fetching Image Amenity:", response.statusText);
            return []; // Return an empty array if there is an error
        }
    } catch (error) {
        console.error("Network error:", error);
        return []; // Return an empty array if there is a network error
    }
}

async function fetchRoomType(isActive = null) {
    let url = '/api/RoomType/AllRoomTypes';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json(); // Parse JSON data from API
            console.log("Fetched Room Types:", data);
            return data; // Return room type data
        } else {
            console.error("Error fetching Room Types:", response.statusText);
            return []; // Return an empty array if there is an error
        }
    } catch (error) {
        console.error("Network error:", error);
        return []; // Return an empty array if there is a network error
    }
}
async function increaseGuestCount(guestType) {
    const input = document.getElementById(guestType);
    let currentValue = parseInt(input.value);

    // Set a maximum limit if needed, e.g., 5 for each type
    if (currentValue < 5) {
        input.value = currentValue + 1;

        // Lưu giá trị vào localStorage
        saveGuestCountsToLocalStorage();
    }
}



async function decreaseGuestCount(guestType) {
    const input = document.getElementById(guestType);
    let currentValue = parseInt(input.value);

    // Prevent the count from going below 0
    if (currentValue > 0) {
        input.value = currentValue - 1;

        // Lưu giá trị vào localStorage
        saveGuestCountsToLocalStorage();
    }
}
function saveGuestCountsToLocalStorage() {
    const adults = document.getElementById('adults').value;
    const children = document.getElementById('children').value;
    const infants = document.getElementById('infants').value;

    // Lưu giá trị vào localStorage
    localStorage.setItem('adults', adults);
    localStorage.setItem('children', children);
    localStorage.setItem('infants', infants);
}

async function fetchRoom(viewType = '', sortPrice = '', minPrice = '', maxPrice = '') {
    const localStorageKey = 'roomsData'; // Key for storing rooms in localStorage
    let rooms;

    // Check if rooms data already exists in localStorage
    const storedRooms = localStorage.getItem(localStorageKey);
    if (storedRooms) {
        rooms = JSON.parse(storedRooms);
        console.log('Loaded rooms from localStorage:', rooms);
    } else {
        let url = '/api/Room/All';

        try {
            const response = await fetch(url);
            if (response.ok) {
                const data = await response.json();
                rooms = data.data;
                console.log('Fetched rooms:', rooms);

                // Store fetched rooms in localStorage
                localStorage.setItem(localStorageKey, JSON.stringify(rooms));

                console.log('Available room view types:', rooms.map(room => room.viewType));
            } else {
                console.error("Error fetching rooms:", response.statusText);
                return; // Exit the function if there is an error
            }
        } catch (error) {
            console.error("Network error:", error);
            return; // Exit the function if there is a network error
        }
    }

    // Apply filters
    if (viewType) {
        const normalizedViewType = viewType.toLowerCase();
        rooms = rooms.filter(room => room.viewType.toLowerCase() === normalizedViewType);
        console.log('Filtered by viewType:', rooms);
    }
    if (minPrice) {
        rooms = rooms.filter(room => room.price >= parseInt(minPrice));
        console.log('Filtered by minPrice:', rooms);
    }
    if (maxPrice) {
        rooms = rooms.filter(room => room.price <= parseInt(maxPrice));
        console.log('Filtered by maxPrice:', rooms);
    }

    // Sort rooms by price
    if (sortPrice === 'low-high') {
        rooms.sort((a, b) => a.price - b.price);
        console.log('Sorted by low-high:', rooms);
    } else if (sortPrice === 'high-low') {
        rooms.sort((a, b) => b.price - a.price);
        console.log('Sorted by high-low:', rooms);
    }

    const roomTypeData = await fetchRoomType();
    const imageRoom = await fetchImageRoom();

    const roomTypes = roomTypeData.data;
    renderRoom(rooms, roomTypes, imageRoom); // Render rooms with filtered data
}
async function CreateReservation() {
    let url = '/api/Reservation/CreateReservation';

    // Lấy thông tin từ localStorage và frontend
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const checkInDate = localStorage.getItem('checkin');
    const checkOutDate = localStorage.getItem('checkout');
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {};
    const totalAmount = localStorage.getItem('totalAmount');
    const phone = localStorage.getItem('phone'); // Lấy số điện thoại từ localStorage

    // Lấy số lượng người từ localStorage
    const adults = parseInt(localStorage.getItem('adults')) || 0;
    const children = parseInt(localStorage.getItem('children')) || 0;
    const infants = parseInt(localStorage.getItem('infants')) || 0;

    // Kiểm tra số điện thoại
    if (!phone || phone.trim() === '') {
        showAlert('Vui lòng nhập số điện thoại.');
        return;
    }

    const totalPeople = rooms.reduce((total, room) => total + (room.people || 0), 0);
    if (rooms.length === 0) {
        showAlert(`Vui lòng chọn phòng bạn muốn đặt cho chuyến đi này.`);
        return;
    }

    if (!checkInDate || !checkOutDate) {
        showAlert(`Vui lòng chọn ngày đặt phòng.`);
        return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    checkIn.setHours(0, 0, 0, 0);
    checkOut.setHours(0, 0, 0, 0);

    if (checkIn <= today || checkOut <= checkIn) {
        showAlert(`Ngày check-in hoặc check-out không hợp lệ.`);
        return;
    }

    if (!userInfo.userId) {
        showAlert(`Vui lòng đăng nhập trước khi đặt phòng.`);
        return;
    }

    if (adults + children + infants === 0) {
        showAlert(`Vui lòng chọn số lượng khách.`);
        return;
    }

    if (adults + children > totalPeople) {
        showAlert(`Số lượng khách không được vượt quá ${totalPeople} người.`);
        return;
    }

    const roomIDs = rooms.map(room => room.roomID);

    // Chuẩn bị dữ liệu API
    const params = {
        userID: userInfo.userId,
        roomIDs: roomIDs,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate,
        adult: adults,
        child: children,
        infant: infants,
        SDT: phone // Thêm số điện thoại vào params
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(params)
        });

        const data = await response.json();

        if (response.ok && data.success) {
            showSuccessAlert('Đặt phòng thành công');
            localStorage.setItem('reservationID', data.data.reservationID);
            return data;
        } else {
            showAlert(data.message || 'Đặt phòng không thành công.');
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu đặt phòng:", error);
        return null;
    }
}


async function CalculateRoomCost() {
    // Define API URL
    let url = '/api/Reservation/CalculateRoomCosts';


    // Get rooms, check-in, and check-out data from local storage
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const checkInDate = localStorage.getItem('checkin');
    const checkOutDate = localStorage.getItem('checkout');

    // Ensure check-in and check-out dates are in the format 'YYYY-MM-DD'
    if (!checkInDate || !checkOutDate) {
        console.error("Check-in or Check-out date is missing");
        return;
    }

    // Extract roomIDs from the rooms array
    const roomIDs = rooms.map(room => room.roomID);

    // Prepare API parameters in the expected format
    const params = {
        roomIDs: roomIDs,
        checkInDate: checkInDate,
        checkOutDate: checkOutDate
    };

    try {
        // Send POST request with parameters
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'text/plain' // Match the 'accept' header in your API example
            },
            body: JSON.stringify(params)
        });

        if (response.ok) {
            const data = await response.json();
            console.log("Calculate: ", data);
            localStorage.setItem('gst', data.data.gst);
            localStorage.setItem('totalAmount', data.data.totalAmount);
            displayCartRooms(); // This will now use the updated data
            return data;
        } else {
            console.error("Error calculate:", response.status, response.statusText);
            const errorText = await response.text(); // Retrieve error details from the response
            console.error("Response Error Details:", errorText);
            return []; // Return an empty array if there is an error
        }
    } catch (error) {
        console.error("Network error:", error);
        return [];
    }
}


function renderRoom(rooms, roomTypes, imageRoom) {
    const containerRoom = document.querySelector('.room-info');
    containerRoom.innerHTML = ''; // Clear the container before rendering

    if (!Array.isArray(rooms) || rooms.length === 0) {
        containerRoom.innerHTML = '<p>No rooms available to display.</p>';
        return;
    }

    const displayedTypes = new Set();
    const roomTypeCounts = {}; // Object to keep track of room counts

    // First pass: Count the number of available rooms for each type
    rooms.forEach(room => {
        const roomType = roomTypes.find(type => type.roomTypeID === room.roomTypeID);
        if (roomType && room.status === "Available") {
            // Increment the count for this room type only if it's available
            roomTypeCounts[roomType.typeName] = (roomTypeCounts[roomType.typeName] || 0) + 1;
        }
    });

    // Second pass: Render rooms
    rooms.forEach(room => {
        const roomType = roomTypes.find(type => type.roomTypeID === room.roomTypeID);
        if (!roomType || displayedTypes.has(roomType.typeName)) return;

        displayedTypes.add(roomType.typeName);

        const imageData = imageRoom.find(image => image.roomID === room.roomID);
        const availableCount = roomTypeCounts[roomType.typeName] || 0; // Get the available count (default to 0)

        const roomHTML = `
            <div class="room-container">
                <div class="room-image">
                    <img src="${imageData ? imageData.imageURL : '/src/default-image.png'}" alt="${roomType.typeName}" style="width: 100%; height: auto;">
                </div>
                <div class="room-detail">
                    <h3 class="title-room">${roomType.typeName}</h3>
                    <div class="additional-info">
                        <p>${room.people || '1'} <strong> Người</strong></p>
                        <p>${room.roomSize || 'N/A'}</p>
                    </div>

                    <p style="margin-left: auto;">Giá: ${formatCurrencyVND(room.price)} / đêm</p>
                    <button class="select-button" data-room='${JSON.stringify(room)}'>Chọn</button>
                </div>
            </div>
        `;

        containerRoom.insertAdjacentHTML('beforeend', roomHTML);
    });

    // Add event listeners to each "Select" button
    containerRoom.querySelectorAll('.select-button').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomData = JSON.parse(e.target.getAttribute('data-room'));
            const roomType = roomTypes.find(type => type.roomTypeID === roomData.roomTypeID);
            const checkInDate = new Date();
            checkInDate.setDate(checkInDate.getDate() + 1); // Ngày mai
            checkInDate.setHours(12, 0, 0, 0); // 12 PM

            const checkOutDate = new Date();
            checkOutDate.setDate(checkOutDate.getDate() + 2); // Ngày mốt
            checkOutDate.setHours(12, 0, 0, 0); // 12 PM
            addRoom(roomType, checkInDate, checkOutDate);
        });
    });
}



 



function removeRoomFromCart(roomID) {
    // Get the current cart from localStorage
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    console.log("Stored Room IDs:", rooms.map(r => r.roomID)); // Log all stored room IDs

    // Find the index of the room to be removed
    const roomIndex = rooms.findIndex(r => String(r.roomID).trim() === String(roomID).trim());
    console.log(`Room ID to remove: ${roomID}`);
    console.log(`Room index found: ${roomIndex}`);

    if (roomIndex === -1) {
        showAlert('Room not found in cart.'); // Call showAlert function
        return;
    }

    // Remove the room from the cart
    const removedRoom = rooms[roomIndex]; // Store the removed room information
    rooms.splice(roomIndex, 1); // Remove the room from the array

    // Update localStorage
    localStorage.setItem('rooms', JSON.stringify(rooms));

    // Update the total price and other UI elements (optional)
    updateTotalAmountAndGST(rooms); // Call a new function to update total and GST
    displayCartRooms(); // Re-render the cart to reflect changes

    // Restore the room status to available in local storage
    const allRooms = JSON.parse(localStorage.getItem('roomsData')) || [];
    const roomToRestore = allRooms.find(room => room.roomID === removedRoom.roomID);

    //if (roomToRestore) {
    //    roomToRestore.status = "Occupied"; // Change status back to available
    //    localStorage.setItem('roomsData', JSON.stringify(allRooms)); // Save the updated room data back to localStorage
    //}
}

// New function to update totalAmount and gst
function updateTotalAmountAndGST(rooms) {
    // Calculate total price from the remaining rooms
    let totalPrice = 0;
    rooms.forEach(room => {
        totalPrice += parseInt(room.price);
    });

    // Assuming a GST rate of 10%. Adjust as necessary.
    const gstRate = 0.1;
    const gst = totalPrice * gstRate;
    const totalAmount = totalPrice + gst;

    // Update the localStorage with new gst and totalAmount
    localStorage.setItem('gst', gst.toFixed(2)); // Save GST rounded to 2 decimal places
    localStorage.setItem('totalAmount', totalAmount.toFixed(2)); // Save Total amount with GST included
}


function displayCartRooms() {
    console.log("Displaying cart rooms...");
    const roomCart = document.getElementById('room-cart');
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];

    // Log dữ liệu localStorage
    console.log("Check-in date:", localStorage.getItem('checkin'));
    console.log("Check-out date:", localStorage.getItem('checkout'));
    console.log("Rooms:", rooms);

    // Retrieve and format check-in and check-out dates
    const checkinISO = localStorage.getItem('checkin');
    const checkoutISO = localStorage.getItem('checkout');

    const checkinDate = checkinISO ? new Date(checkinISO).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }) : 'Chọn ngày';

    const checkoutDate = checkoutISO ? new Date(checkoutISO).toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    }) : 'Chọn ngày';

    const currencyFormatter = new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND'
    });

    if (rooms.length > 0) {
        roomCart.style.display = 'block';
        const cartWrapper = roomCart.querySelector('.cart-wrapper');
        cartWrapper.innerHTML = '';

        // Hiển thị từng phòng
        rooms.forEach((room, index) => {
            const roomPriceFormatted = currencyFormatter.format(room.price);
            const roomHTML = `
                <div class="cart-container">
                    <p class="title-room">Phòng ${index + 1}</p>
                    <p class="stay-dates">${checkinDate} — ${checkoutDate}</p>
                    <div class="room-details">
                        <p>x1 ${room.roomTypeName} Giá: <span class="price-info">${roomPriceFormatted}</span></p>
                        <p>${room.people || '1 Người lớn'} Người</p>
                    </div>
                    <div class="delete-order" onclick="removeRoomFromCart('${room.roomID}')"> 
                        <i class="fas fa-trash"></i>
                    </div>
                </div>
            `;
            cartWrapper.insertAdjacentHTML('beforeend', roomHTML);
        });

        // Lấy GST và tổng giá trị từ localStorage
        const gst = parseInt(localStorage.getItem('gst') || 0); // GST
        const gstFormatted = currencyFormatter.format(gst);

        const totalAmountWithoutGST = parseInt(localStorage.getItem('totalAmount') || 0); // Tổng tiền chưa cộng GST
        const totalAmount = totalAmountWithoutGST + gst; // Tổng tiền đã cộng GST
        const totalAmountFormatted = currencyFormatter.format(totalAmount);

        // Hiển thị tổng cộng
        const totalHTML = `
            <div class="total-info">
                <p class="total-price1">Thuế phí: <span class="price-info1">${gstFormatted}</span></p>
                <p class="total-price">Tổng cộng: <span class="price-info">${totalAmountFormatted}</span></p>
                <p class="tax-info">(Bao gồm thuế phí)</p>
            </div>
        `;

        cartWrapper.insertAdjacentHTML('beforeend', totalHTML);

        // Cập nhật lại tổng giá trị (nếu cần)
        localStorage.setItem('totalAmount', totalAmount);
    } else {
        roomCart.style.display = 'none';
    }
}





function showAlert(message) {
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');

    alertMessage.textContent = message; // Set the alert message
    alertBox.style.display = 'block'; // Show the alert box

    // Automatically hide the alert after 3 seconds
    setTimeout(() => {
        alertBox.classList.add('fade-out');
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.classList.remove('fade-out');
        }, 600); // Match the transition duration
    }, 800); // Show for 3 seconds
}
function closeAlert() {
    const alertBox = document.getElementById('alert-box');
    alertBox.style.display = 'none'; // Close the alert
}

function showSuccessAlert(message) {
    const successBox = document.getElementById('success-box');
    const successMessage = document.getElementById('success-message');

    successMessage.textContent = message; // Set the success message
    successBox.style.display = 'block'; // Show the success box

    // Automatically hide the success alert after 3 seconds
    setTimeout(() => {
        successBox.classList.add('fade-out');
        setTimeout(() => {
            successBox.style.display = 'none';
            successBox.classList.remove('fade-out');
        }, 600); // Match the transition duration
    }, 1000); // Show for 3 seconds
}

function closeSuccessAlert() {
    const successBox = document.getElementById('success-box');
    successBox.style.display = 'none'; // Close the success alert
}


async function addRoom(roomType, checkInDate, checkOutDate) {
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);

    // Lấy dữ liệu phòng từ localStorage
    const roomsData = JSON.parse(localStorage.getItem('roomsData')) || [];
    const roomsOfType = roomsData.filter(room => room.roomTypeID === roomType.roomTypeID);

    let availableRoom = null;

    try {
        // Fetch dữ liệu đặt phòng từ API
        const response = await fetch('/api/Reservation/All');
        if (response.ok) {
            const result = await response.json();
            console.log("Reservation data from API:", result);

            if (result && Array.isArray(result.data)) {
                const reservationData = result.data.filter(reservation =>
                    reservation.status !== 'Cancelled' && reservation.status !== 'Checked-out'
                );
                // Kiểm tra từng phòng từ roomsOfType
                for (const room of roomsOfType) {
                    console.log(`Checking room: ${room.roomNumber}`);
                    let isConflict = false;

                    // Duyệt qua tất cả các đặt phòng từ API
                    for (const reservation of reservationData) {
                        console.log(`Checking against reservation:`, reservation);

                        if (
                            reservation.roomNumber === room.roomNumber &&
                            (
                                (checkIn >= new Date(reservation.checkInDate) && checkIn < new Date(reservation.checkOutDate)) || // checkIn trùng
                                (checkOut > new Date(reservation.checkInDate) && checkOut <= new Date(reservation.checkOutDate)) || // checkOut trùng
                                (checkIn <= new Date(reservation.checkInDate) && checkOut >= new Date(reservation.checkOutDate))    // Bao trùm toàn bộ
                            )
                        ) {
                            isConflict = true;
                            console.log(`Conflict found for room: ${room.roomNumber}`);
                            break; // Nếu trùng, dừng kiểm tra phòng này
                        }
                    }

                    // Nếu không trùng ngày, chọn phòng này
                    if (!isConflict) {
                        // Kết hợp dữ liệu của room và roomType
                        availableRoom = {
                            ...room, // Copy toàn bộ thuộc tính của room
                            roomTypeName: roomType.typeName, // Thêm thông tin roomType
                            roomTypeID: roomType.roomTypeID // Hoặc thêm các thuộc tính khác từ roomType nếu cần
                        };
                        console.log(`Room available: ${availableRoom.roomNumber}`);
                        break; // Dừng vòng lặp khi tìm thấy phòng phù hợp
                    }

                }

                // Thêm phòng nếu tìm thấy phòng trống
                if (availableRoom) {
                    console.log(`Adding reservation for room: ${availableRoom.roomNumber}`);
                    const currentRooms = JSON.parse(localStorage.getItem('rooms')) || [];
                    currentRooms.push(availableRoom);
                    localStorage.setItem('rooms', JSON.stringify(currentRooms));
                    showSuccessAlert(`Thêm thành công phòng vào đơn đặt`);
                    CalculateRoomCost();
                    displayCartRooms(); // Re-render the cart
                } else {
                    showAlert(`Phòng ${roomType.typeName} đã hết chỗ vào thời gian này.`);
                }
            } else {
                console.error("Unexpected data format from API:", result);
            }
        } else {
            console.error("Error fetching reservations:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

document.getElementById('reservationForm').addEventListener('submit', function (event) {
    event.preventDefault(); // Ngừng hành động submit mặc định của form

    // Chuyển hướng đến /checkout
    window.location.href = '/checkout';
});

document.querySelector('.search-btn').addEventListener('click', () => {
    const viewType = document.getElementById('viewType').value;
    const sortPrice = document.getElementById('sortPrice').value;
    const minPrice = document.getElementById('minPrice').value;
    const maxPrice = document.getElementById('maxPrice').value;

    console.log('Search parameters:', { viewType, sortPrice, minPrice, maxPrice });

    // Call fetchRoom with search parameters
    fetchRoom(viewType, sortPrice, minPrice, maxPrice);
});
document.getElementById('checkin').addEventListener('input', (event) => {
    const selectedDate = new Date(event.target.value);
    if (!isValidCheckinTime(selectedDate)) {
        event.target.style.backgroundColor = '#f8d7da'; // Red background for invalid time
        event.target.setCustomValidity("Check-in time must be 14:00 or later.");
        showAlert('Check-in time must be 14:00 or later.');
    } else if (isDateTimeBooked(selectedDate)) {
        event.target.style.backgroundColor = '#f8d7da'; // Red background for booked
        event.target.setCustomValidity("This date and time are already booked.");
        showAlert('This date and time are already booked.');
    } else {
        event.target.style.backgroundColor = ''; // Reset background
        event.target.setCustomValidity(""); // Clear the error
        localStorage.setItem("checkin", selectedDate.toISOString()); // Store valid check-in date
        updateStayDates();
    }
});

document.getElementById('checkout').addEventListener('input', (event) => {
    const selectedDate = new Date(event.target.value);
    const checkinDate = new Date(localStorage.getItem("checkin"));

    if (!isValidCheckoutTime(selectedDate)) {
        event.target.style.backgroundColor = '#f8d7da'; // Red background for invalid time
        event.target.setCustomValidity("Check-out time must be before 12:00.");
        showAlert('Check-out time must be before 12:00.');
    } else if (!isValidStayDuration(checkinDate, selectedDate)) {
        event.target.style.backgroundColor = '#f8d7da'; // Red background for invalid duration
        event.target.setCustomValidity("Stay duration must be at least 1 night.");
        showAlert('Stay duration must be at least 1 night.');
    } else if (isDateTimeBooked(selectedDate)) {
        event.target.style.backgroundColor = '#f8d7da'; // Red background for booked
        event.target.setCustomValidity("This date and time are already booked.");
        showAlert('This date and time are already booked.');
    } else {
        event.target.style.backgroundColor = ''; // Reset background
        event.target.setCustomValidity(""); // Clear the error
        localStorage.setItem("checkout", selectedDate.toISOString()); // Store valid check-out date
        updateStayDates();
    }
});


document.addEventListener('DOMContentLoaded', () => {

    fetchRoom();
    displayCartRooms();
/*    fetchReservations();*/
    initializeDatePickers();

    setInterval(fetchReservations, 60000); 

});






///booking room to payment

