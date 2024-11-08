let reservationData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 5;

// Fetch reservation room data from API and store it for later use

function exportToExcel() {
    if (reservationData.length === 0) {
        alert("Không có dữ liệu để xuất!");
        return;
    }

    // Chuẩn bị dữ liệu cho Excel
    const data = reservationData.map(reservation => ({
        "ID Đặt Phòng": reservation.reservationID,
        "Họ": reservation.lastname,
        "Tên": reservation.firstname,
        "Phòng": reservation.roomNumber,
        "Loại Phòng": reservation.typeName,
        "Ngày Đặt": new Date(reservation.bookingDate).toLocaleDateString(),
        "Check-in": new Date(reservation.checkInDate).toLocaleDateString(),
        "Check-out": new Date(reservation.checkOutDate).toLocaleDateString(),
        "Số Đêm": reservation.numberOfNights,
        "Người Lớn": reservation.adult,
        "Trẻ Em": reservation.child,
        "Trẻ Sơ Sinh": reservation.infant,
        "Tổng Chi Phí": reservation.totalCost,
        "Trạng Thái": reservation.status
    }));

    // Tạo workbook và worksheet
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Reservations");

    // Xuất file Excel
    XLSX.writeFile(workbook, "Reservations_Report.xlsx");
}



async function fetchReservations(filter = null) {
    let url = '/api/Reservation/All';
    if (filter) {
        url += `?filter=${filter}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            if (result && Array.isArray(result.data)) {
                reservationData = result.data;
                filteredData = reservationData;
                displayReservations();
                updatePaginationControls();
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

async function changeReservationStatus(selectElement, reservationID) {
    const status = selectElement.value;  // Lấy giá trị trạng thái từ dropdown
    if (!status) return;  // Nếu không có trạng thái chọn thì không làm gì

    const url = '/api/Reservation/ToggleReservationStatus';  // Địa chỉ API của bạn

    const requestBody = {
        ReservationID: reservationID,
        Status: status  // Trạng thái cần cập nhật
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.statusCode === 200) {
                console.log("Reservation status updated successfully.");
                // Có thể gọi lại fetchReservations để làm mới dữ liệu
                fetchReservations();
            } else {
                console.error("Error updating reservation status:", result.message);
            }
        } else {
            console.error("Error fetching reservation status update:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}



// Display current page of reservations
function displayReservations() {
    const tableBody = document.getElementById('user-table-body');
    tableBody.innerHTML = '';

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    paginatedData.forEach(reservation => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${reservation.reservationID}</td>
            <td>${reservation.lastname}</td>
            <td>${reservation.firstname}</td>
            <td>${reservation.typeName}</td>
            <td>${reservation.numberOfNights}</td>
            <td>${reservation.totalCost}đ</td>
            <td>
                <select id="status-select-${reservation.reservationID}">
                    <option value="Checked-in" ${reservation.status === 'Checked-in' ? 'selected' : ''}>Checked-in</option>
                    <option value="Paid" ${reservation.status === 'Paid' ? 'selected' : ''}>Paid</option>
                    <option value="Checked-out" ${reservation.status === 'Checked-out' ? 'selected' : ''}>Checked-out</option>
                    <option value="Cancelled" ${reservation.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
                </select>
                <button onclick="confirmStatusChange(${reservation.reservationID})">Xác nhận</button>
            </td>
            <td>
                <button onclick="viewReservation(${reservation.reservationID})">Xem</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}
async function confirmStatusChange(reservationID) {
    const selectElement = document.getElementById(`status-select-${reservationID}`);
    const status = selectElement.value;  // Lấy giá trị trạng thái từ dropdown

    const url = '/api/Reservation/ToggleReservationStatus';  // Địa chỉ API của bạn

    const requestBody = {
        ReservationID: reservationID,
        Status: status  // Trạng thái cần cập nhật
    };

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });

        if (response.ok) {
            const result = await response.json();
            if (result.statusCode === 200) {
                console.log("Reservation status updated successfully.");
                fetchReservations();  // Làm mới dữ liệu nếu cần
            } else {
                console.error("Error updating reservation status:", result.message);
                fetchReservations();  // Làm mới dữ liệu nếu cần
                alert(result.message);
                showSuccessAlert(result.message);
            }
        } else {
            console.error("Error fetching reservation status update:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}


// Update pagination controls
function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = '';

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trước';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayReservations();
            updatePaginationControls();
        }
    };
    paginationControls.appendChild(prevButton);

    const pageInfo = document.createElement('span');
    pageInfo.id = 'page-info';
    pageInfo.textContent = `Trang ${currentPage} của ${totalPages}`;
    paginationControls.appendChild(pageInfo);

    const nextButton = document.createElement('button');
    nextButton.textContent = 'Sau';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayReservations();
            updatePaginationControls();
        }
    };
    paginationControls.appendChild(nextButton);
}

// View reservation details in the modal
function viewReservation(reservationID) {
    const reservation = reservationData.find(res => res.reservationID === reservationID);
    if (reservation) {
        document.getElementById('modal-reservationID').textContent = reservation.reservationID;
        document.getElementById('modal-lastname').textContent = reservation.lastname;
        document.getElementById('modal-firstname').textContent = reservation.firstname;

        // Display room numbers - check if it's an array and join them with commas
        const roomNumbers = Array.isArray(reservation.roomNumber) ? reservation.roomNumber.join(', ') : reservation.roomNumber;
        document.getElementById('modal-roomNumbers').textContent = roomNumbers;

        document.getElementById('modal-typeName').textContent = reservation.typeName;

        // Define options for displaying date and time in 12-hour format with AM/PM
        const dateTimeOptions = {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true // Use 12-hour format with AM/PM
        };

        // Parse and display booking, check-in, and check-out dates with AM/PM
        document.getElementById('modal-bookingDate').textContent = new Date(reservation.bookingDate).toLocaleDateString();
        document.getElementById('modal-checkInDate').textContent = new Date(reservation.checkInDate).toLocaleString(undefined, dateTimeOptions);
        document.getElementById('modal-checkOutDate').textContent = new Date(reservation.checkOutDate).toLocaleString(undefined, dateTimeOptions);

        document.getElementById('modal-numberOfNights').textContent = reservation.numberOfNights;
        document.getElementById('modal-adult').textContent = reservation.adult;
        document.getElementById('modal-child').textContent = reservation.child;
        document.getElementById('modal-infant').textContent = reservation.infant;
        document.getElementById('modal-status').textContent = reservation.status;

        // Display the modal
        document.getElementById('reservation-modal').style.display = 'flex';
    } else {
        console.error("Reservation not found.");
    }
}





const style = document.createElement('style');
style.textContent = `
    /* Table styling */
    table {
        width: 100%;
        border-collapse: collapse;
    }

    th, td {
        padding: 12px;
        text-align: left;
        border-bottom: 1px solid #ddd;
    }

    /* Styling for "Xem Thêm" button */
    .details-btn {
        background-color: #007bff;
        color: white;
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
    }

    .details-btn:hover {
        background-color: #0056b3;
    }

    /* Details row styling */
    .details-row {
        background-color: #f9f9f9;
        font-size: 0.9em;
        color: #333;
    }

    .details-row td {
        padding: 10px;
    }

    .details-content {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
    }

    .details-content span {
        margin-right: 15px;
    }

    /* Pagination controls styling */
    #pagination-controls {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 20px;
        font-size: 16px;
    }

    #pagination-controls button {
        background-color: #4CAF50; /* Green background */
        color: white; /* White text */
        border: 1px solid #4CAF50; /* Green border */
        padding: 10px 20px;
        margin: 0 5px;
        border-radius: 5px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
        font-family: Arial, sans-serif;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }

    #pagination-controls button:hover {
        background-color: #45a049; /* Darker green on hover */
        box-shadow: 0 6px 12px rgba(0, 0, 0, 0.3);
    }

    #pagination-controls button:disabled {
        background-color: #ddd;
        color: #aaa;
        border-color: #ddd;
        cursor: not-allowed;
        box-shadow: none;
    }

    #page-info {
        margin: 0 10px;
        font-weight: bold;
        color: #333;
    }
`;
document.head.appendChild(style);

// Close the modal
function closeModal() {
    document.getElementById('reservation-modal').style.display = 'none';
}

// Search function to filter reservations based on input
function searchReservations() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    filteredData = reservationData.filter(reservation =>
        reservation.lastname.toLowerCase().includes(searchInput) ||
        reservation.firstname.toLowerCase().includes(searchInput) ||
        reservation.status.toLowerCase().includes(searchInput)
    );
    currentPage = 1;
    displayReservations();
    updatePaginationControls();
}

// Initialize and fetch reservations on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchReservations();
    fetchReservationsRoom();
});
