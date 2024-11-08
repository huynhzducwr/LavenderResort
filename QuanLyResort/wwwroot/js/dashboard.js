async function fetchReservations(filter = null) {
    let url = '/api/Reservation/All'; // Đường dẫn API
    if (filter) {
        url += `?filter=${filter}`; // Thêm tham số `filter` nếu cần (ví dụ: "today", "month", "year")
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log(data); // Log dữ liệu để kiểm tra
            if (data.success && data.data) {
                updateRevenueCard(data.data, filter); // Cập nhật doanh thu
                updateCustomerCard(data.data, filter); // Cập nhật tổng số khách hàng
                updateReservationTable(data.data); // Cập nhật bảng các phòng đã đặt
                updateTopSellingTable(data.data);
            }
        } else {
            console.error("Error fetching reservations:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}




async function fetchReservationsRoom(filter = null) {
    let url = '/api/Reservation/AllReservationRooom'; // Đường dẫn API

    // Chỉ thêm `filter` nếu cần
    if (filter) {
        url += `?filter=${filter}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            console.log(data); // Log dữ liệu để kiểm tra
            if (data.success && data.data) {
                updateRoomCountCard(data.data, filter); // Gọi hàm để cập nhật số phòng
            }
        } else {
            console.error("Error fetching reservation rooms:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

function updateCustomerCard(reservations, filter) {
    // Lấy ngày hiện tại
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Lưu ý: Tháng bắt đầu từ 0
    const currentDay = currentDate.getDate();

    // Lọc dữ liệu dựa trên bộ lọc
    const filteredReservations = reservations.filter((reservation) => {
        const bookingDate = new Date(reservation.bookingDate); // Chuyển đổi ngày booking thành đối tượng Date

        if (filter === 'today') {
            // Kiểm tra nếu ngày đặt phòng trùng với ngày hiện tại
            return (
                bookingDate.getFullYear() === currentYear &&
                bookingDate.getMonth() === currentMonth &&
                bookingDate.getDate() === currentDay
            );
        } else if (filter === 'month') {
            // Kiểm tra nếu tháng và năm trùng khớp
            return (
                bookingDate.getFullYear() === currentYear &&
                bookingDate.getMonth() === currentMonth
            );
        } else if (filter === 'year') {
            // Kiểm tra nếu năm trùng khớp
            return bookingDate.getFullYear() === currentYear;
        }

        // Không áp dụng bộ lọc nào (mặc định trả về tất cả dữ liệu)
        return true;
    });

    // Đếm tổng số reservationID
    const totalCustomers = filteredReservations.length;

    // Cập nhật nội dung thẻ "Khách hàng"
    const customerCardTitle = document.querySelector('.customers-card h5.card-title span');
    const customerCardValue = document.querySelector('.customers-card .ps-3 h6');

    if (customerCardTitle) {
        // Cập nhật tiêu đề thẻ dựa trên bộ lọc
        if (filter === 'today') {
            customerCardTitle.textContent = '| Hôm nay';
        } else if (filter === 'month') {
            customerCardTitle.textContent = '| Tháng này';
        } else if (filter === 'year') {
            customerCardTitle.textContent = '| Năm';
        } else {
            customerCardTitle.textContent = '| Tất cả';
        }
    }

    if (customerCardValue) {
        customerCardValue.textContent = totalCustomers; // Hiển thị tổng số khách hàng
    }
}

function updateTopSellingTable(reservations) {
    const tableBody = document.querySelector('.top-selling .table tbody');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ trong bảng

    // Tạo đối tượng để lưu tổng số sold, revenue và imageURL cho từng loại phòng (typeName)
    const roomStats = {};

    reservations.forEach((reservation) => {
        const { typeName, totalCost, imageURL } = reservation;

        if (!roomStats[typeName]) {
            roomStats[typeName] = {
                sold: 0,
                revenue: 0,
                imageURL: imageURL || "/path/to/default-image.jpg" // Đặt hình ảnh mặc định nếu không có imageURL
            };
        }

        roomStats[typeName].sold += 1; // Tăng số lượng sold
        roomStats[typeName].revenue += totalCost; // Tăng tổng revenue
    });

    // Tạo các hàng bảng từ dữ liệu thống kê
    Object.entries(roomStats).forEach(([typeName, stats]) => {
        const row = document.createElement('tr');

        row.innerHTML = `
    
            <td><a href="#" class="text-primary fw-bold">${typeName}</a></td>
            <td>${stats.revenue.toLocaleString()} VNĐ</td>
            <td class="fw-bold">${stats.sold}</td>
  
        `;

        tableBody.appendChild(row);
    });
}


function updateRoomCountCard(reservationRooms, filter) {
    // Lấy ngày hiện tại
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Lưu ý: Tháng bắt đầu từ 0
    const currentDay = currentDate.getDate();

    // Lọc dữ liệu dựa trên bộ lọc
    const filteredReservationRooms = reservationRooms.filter((reservationRoom) => {
        const checkInDate = new Date(reservationRoom.checkInDate); // Chuyển đổi `checkInDate` thành đối tượng Date

        if (filter === 'today') {
            // Kiểm tra nếu ngày check-in trùng với ngày hiện tại
            return (
                checkInDate.getFullYear() === currentYear &&
                checkInDate.getMonth() === currentMonth &&
                checkInDate.getDate() === currentDay
            );
        } else if (filter === 'month') {
            // Kiểm tra nếu tháng và năm trùng khớp
            return (
                checkInDate.getFullYear() === currentYear &&
                checkInDate.getMonth() === currentMonth
            );
        } else if (filter === 'year') {
            // Kiểm tra nếu năm trùng khớp
            return checkInDate.getFullYear() === currentYear;
        }

        // Không áp dụng bộ lọc nào (mặc định trả về tất cả dữ liệu)
        return true;
    });

    // Tính tổng số phòng
    const totalRooms = filteredReservationRooms.length;

    // Cập nhật nội dung thẻ "Tổng phòng"
    const roomCardTitle = document.querySelector('.sales-card h5.card-title span');
    const roomCardValue = document.querySelector('.sales-card .ps-3 h6'); // Cụ thể hơn trong selector

    if (roomCardTitle) {
        // Cập nhật tiêu đề thẻ dựa trên bộ lọc
        if (filter === 'today') {
            roomCardTitle.textContent = '| Hôm nay';
        } else if (filter === 'month') {
            roomCardTitle.textContent = '| Tháng này';
        } else if (filter === 'year') {
            roomCardTitle.textContent = '| Năm';
        } else {
            roomCardTitle.textContent = '| Tất cả';
        }
    }

    if (roomCardValue) {
        roomCardValue.textContent = totalRooms; // Cập nhật giá trị tổng số phòng
    }
}

function updateRevenueCard(reservations, filter) {
    // Lấy ngày hiện tại
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth(); // Lưu ý: Tháng bắt đầu từ 0
    const currentDay = currentDate.getDate();

    // Lọc dữ liệu dựa trên bộ lọc
    const filteredReservations = reservations.filter((reservation) => {
        const bookingDate = new Date(reservation.bookingDate); // Chuyển đổi ngày trong dữ liệu trả về thành đối tượng Date

        if (filter === 'today') {
            return (
                bookingDate.getFullYear() === currentYear &&
                bookingDate.getMonth() === currentMonth &&
                bookingDate.getDate() === currentDay
            );
        } else if (filter === 'month') {
            return (
                bookingDate.getFullYear() === currentYear &&
                bookingDate.getMonth() === currentMonth
            );
        } else if (filter === 'year') {
            return bookingDate.getFullYear() === currentYear;
        }

        return true;
    });

    // Tính tổng doanh thu
    const totalRevenue = filteredReservations.reduce(
        (sum, reservation) => sum + reservation.totalCost,
        0
    );

    // Cập nhật nội dung thẻ "Doanh thu"
    const revenueCardTitle = document.querySelector('.revenue-card h5.card-title span');
    const revenueCardValue = document.querySelector('.revenue-card .ps-3 h6'); // Cụ thể hơn trong selector

    if (revenueCardTitle) {
        if (filter === 'today') {
            revenueCardTitle.textContent = '| Hôm nay';
        } else if (filter === 'month') {
            revenueCardTitle.textContent = '| Tháng này';
        } else if (filter === 'year') {
            revenueCardTitle.textContent = '| Năm';
        } else {
            revenueCardTitle.textContent = '| Tất cả';
        }
    }

    if (revenueCardValue) {
        revenueCardValue.textContent = `${totalRevenue.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}`; // Cập nhật giá trị doanh thu theo VNĐ
    }
}

function updateReservationTable(reservations) {
    const tableBody = document.querySelector('.recent-sales .datatable tbody');
    tableBody.innerHTML = ''; // Xóa dữ liệu cũ trong bảng

    reservations.forEach((reservation, index) => {
        const displayStatus = getDisplayStatus(reservation.status); // Sử dụng hàm để chuyển đổi trạng thái hiển thị

        const row = document.createElement('tr');
        row.innerHTML = `
            <th scope="row"><a href="#">#${reservation.reservationID}</a></th>
            <td>${reservation.firstname} ${reservation.lastname}</td>
            <td><a href="#" class="text-primary">${reservation.typeName}</a></td>
            <td>${reservation.totalCost.toLocaleString()} VNĐ</td>
            <td><span class="badge ${getStatusBadgeClass(reservation.status)}">${displayStatus}</span></td>
        `;

        tableBody.appendChild(row);
    });
}

// Hàm phụ để chuyển đổi trạng thái hiển thị
function getDisplayStatus(status) {
    switch (status) {
        case 'Reserved':
            return 'Đã đặt';
        case 'Checked-in':
            return 'Đã nhận phòng';
        case 'Checked-out':
            return 'Đã trả phòng';
        case 'Cancelled':
            return 'Đã hủy';
        default:
            return status; // Trả về trạng thái gốc nếu không có trong danh sách
    }
}

// Hàm phụ để trả về lớp CSS cho trạng thái
function getStatusBadgeClass(status) {
    switch (status) {
        case 'Reserved':
            return 'bg-info';
        case 'Checked-in':
            return 'bg-success';
        case 'Checked-out':
            return 'bg-primary';
        case 'Cancelled':
            return 'bg-danger';
        default:
            return 'bg-secondary';
    }
}


document.addEventListener('DOMContentLoaded', () => {
    // Gọi API mặc định (toàn bộ thời gian)
    fetchReservationsRoom();
    fetchReservations();
    
});
document.querySelector('.customers-card .dropdown-menu').addEventListener('click', (event) => {
    if (event.target.classList.contains('dropdown-item')) {
        const filterText = event.target.textContent.trim(); // Lấy giá trị bộ lọc từ text
        let filter = null;

        if (filterText === 'Hôm nay') {
            filter = 'today';
        } else if (filterText === 'Tháng này') {
            filter = 'month';
        } else if (filterText === 'Năm') {
            filter = 'year';
        }

        // Gọi lại API với bộ lọc mới
        fetchReservations(filter);

        // Đổi text trong dropdown menu của thẻ "Khách hàng"
        const dropdownHeader = document.querySelector('.customers-card h5.card-title span');
        if (dropdownHeader) {
            dropdownHeader.textContent = filterText ? `| ${filterText}` : '| Tất cả';
        }
    }
});
// Xử lý click cho dropdown "Doanh thu"
document.querySelector('.revenue-card .dropdown-menu').addEventListener('click', (event) => {
    if (event.target.classList.contains('dropdown-item')) {
        const filterText = event.target.textContent.trim(); // Lấy giá trị bộ lọc từ text
        let filter = null;

        if (filterText === 'Hôm nay') {
            filter = 'today';
        } else if (filterText === 'Tháng này') {
            filter = 'month';
        } else if (filterText === 'Năm') {
            filter = 'year';
        }

        // Gọi lại API với bộ lọc mới
        fetchReservations(filter);

        // Đổi text trong dropdown menu của thẻ "Doanh thu"
        const dropdownHeader = document.querySelector('.revenue-card h5.card-title span');
        if (dropdownHeader) {
            dropdownHeader.textContent = filterText ? `| ${filterText}` : '| Tất cả';
        }
    }
});

// Xử lý click cho dropdown "Tổng phòng"
document.querySelector('.sales-card .dropdown-menu').addEventListener('click', (event) => {
    if (event.target.classList.contains('dropdown-item')) {
        const filterText = event.target.textContent.trim(); // Lấy giá trị bộ lọc từ text
        let filter = null;

        if (filterText === 'Hôm nay') {
            filter = 'today';
        } else if (filterText === 'Tháng này') {
            filter = 'month';
        } else if (filterText === 'Năm') {
            filter = 'year';
        }

        // Gọi lại API với bộ lọc mới
        fetchReservationsRoom(filter);

        // Đổi text trong dropdown menu của thẻ "Tổng phòng"
        const dropdownHeader = document.querySelector('.sales-card h5.card-title span');
        if (dropdownHeader) {
            dropdownHeader.textContent = filterText ? `| ${filterText}` : '| Tất cả';
        }
    }
});
