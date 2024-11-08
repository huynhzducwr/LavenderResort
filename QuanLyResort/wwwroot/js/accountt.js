// Hàm chuyển đổi giữa các phần (section)
function showSection(sectionID) {
    // Ẩn tất cả các phần
    const sections = document.querySelectorAll('.section');
    sections.forEach(section => {
        section.style.display = 'none';
    });

    // Hiển thị phần được chọn
    const selectedSection = document.getElementById(sectionID);
    selectedSection.style.display = 'block';
}

// Biến toàn cục
let reservationData = []; // Dữ liệu từ API
let filteredData = []; // Dữ liệu đã lọc (nếu có phân trang hoặc tìm kiếm)

// Hàm hiển thị danh sách đơn đặt phòng
function displayReservations() {
    const reservationList = document.getElementById('reservationList');
    reservationList.innerHTML = ""; // Xóa nội dung cũ

    if (filteredData.length === 0) {
        reservationList.innerHTML = "<p>No reservations found.</p>";
        return;
    }

    filteredData.forEach(reservation => {
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div>
                <strong>Room:</strong> ${reservation.roomNumber} (${reservation.typeName})<br>
                <strong>Check-in:</strong> ${new Date(reservation.checkInDate).toLocaleDateString()}<br>
                <strong>Check-out:</strong> ${new Date(reservation.checkOutDate).toLocaleDateString()}<br>
                <strong>Status:</strong> ${reservation.status}
            </div>
            <button class="view-details-btn" onclick="viewDetails(${reservation.reservationID})">View Details</button>
        `;
        reservationList.appendChild(listItem);
    });
}

function viewDetails(reservationID) {
    const reservation = filteredData.find(r => r.reservationID === reservationID);

    if (!reservation) return;

    const modal = document.getElementById('reservationModal');
    const details = document.getElementById('reservationDetails');

    details.innerHTML = `
        <p><strong>Reservation ID:</strong> ${reservation.reservationID}</p>
        <p><strong>Booking Date:</strong> ${new Date(reservation.bookingDate).toLocaleDateString()}</p>
        <p><strong>Room:</strong> ${reservation.roomNumber} (${reservation.typeName})</p>
        <p><strong>Check-in:</strong> ${new Date(reservation.checkInDate).toLocaleDateString()}</p>
        <p><strong>Check-out:</strong> ${new Date(reservation.checkOutDate).toLocaleDateString()}</p>
        <p><strong>Total Cost:</strong> ${reservation.totalCost}</p>
        <p><strong>Guests:</strong> ${reservation.adult} Adults, ${reservation.child} Children, ${reservation.infant} Infants</p>
        <p><strong>Number of Nights:</strong> ${reservation.numberOfNights}</p>
        <p><strong>Booked By:</strong> ${reservation.firstname} ${reservation.lastname}</p>
        <p><strong>Status:</strong> ${reservation.status}</p>
    `;

    modal.style.display = "block";
}

function closeModal() {
    const modal = document.getElementById('reservationModal');
    modal.style.display = "none";
}

// Đóng modal khi nhấp bên ngoài
window.onclick = function (event) {
    const modal = document.getElementById('reservationModal');
    if (event.target === modal) {
        modal.style.display = "none";
    }
};


// Hàm gọi API để lấy dữ liệu đặt phòng
async function fetchReservations(filter = null) {
    let url = '/api/Reservation/All';
    if (filter) {
        url += `?filter=${filter}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            console.log("Reservation data from API:", result);

            if (result && Array.isArray(result.data)) {
                reservationData = result.data; // Lưu dữ liệu gốc
                filteredData = reservationData; // Gán vào dữ liệu lọc
                displayReservations(); // Hiển thị dữ liệu lên giao diện
            } else {
                console.error("Unexpected data format:", result);
            }
        } else {
            console.error("Error fetching reservations:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

// Xử lý khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    // Gọi API để lấy dữ liệu thực
    fetchReservations();

    // Hiển thị phần tài khoản mặc định
    showSection('account');
});
