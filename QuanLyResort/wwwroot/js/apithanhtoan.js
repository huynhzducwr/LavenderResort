let isTransactionPaid = false; // Biến trạng thái toàn cục để kiểm tra thanh toán
const countdownKey = "countdownExpire"; // Key để lưu trong localStorage
const initialTime = 300; // Thời gian giữ phòng ban đầu (300 giây)

// Hàm kiểm tra giao dịch
async function checkTransaction() {
    const apiUrl = "https://thingproxy.freeboard.io/fetch/https://api.web2m.com/historyapivcbv3/Thanhan08022004@/1023105774/6DB61058-4C46-690B-BADD-ADDF6B43C822";

    try {
        const response = await fetch(apiUrl);
        const data = await response.json();
        console.log(data);

        if (data.status) {
            const transactions = data.transactions;
            const totalAmount = parseInt(urlParams.get('totalAmount'), 10);
            const reservationID = urlParams.get('reservationID');

            // Kiểm tra từng giao dịch
            const isMatched = transactions.some(transaction => {
                const descriptionParts = transaction.description.split('.');
                const extractedContent = descriptionParts.slice(3).join('.').trim();
                return transaction.amount === totalAmount && extractedContent === reservationID;
            });

            // Cập nhật trạng thái thanh toán và giao diện
            const statusPayment = document.getElementById('status_payment');

            if (isMatched && !isTransactionPaid) {
                isTransactionPaid = true; // Đánh dấu giao dịch đã được thanh toán
                localStorage.removeItem(countdownKey); // Xóa thời gian lưu trữ
                statusPayment.innerHTML = `
                    <p class="mb-0 text-success font-weight-bold d-flex justify-content-start align-items-center">
                        <small>
                            <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="18" viewBox="0 0 24 24" fill="none">
                                <circle cx="12" cy="12" r="8" fill="#28a745"></circle>
                            </svg>
                        </small>Đã thanh toán thành công
                    </p>
                     
                `;
                const reservationResponse = await CreateReservation();
                if (reservationResponse) {
                    console.log('Đặt phòng thành công:', reservationResponse);
                    showSuccessAlert(reservationResponse);
            

                } else {
                    showAlert('Có lỗi xảy ra khi đặt phòng. Vui lòng thử lại.');
                }
            } else if (!isMatched && !isTransactionPaid) {
                // Cập nhật lại trạng thái chỉ khi cần
                if (!statusPayment.innerHTML.includes("Đang chờ thanh toán")) {
                    statusPayment.innerHTML = `
                        <p class="mb-0 text-warning font-weight-bold d-flex justify-content-start align-items-center">
                            <small>
                                <svg class="mr-2" xmlns="http://www.w3.org/2000/svg" width="10" viewBox="0 0 24 24" fill="none">
                                    <circle cx="12" cy="12" r="8" fill="#db7e06"></circle>
                                </svg>
                            </small>Đang chờ thanh toán
                        </p>
                    `;
                }
            }
        } else {
            console.error("Không thể lấy dữ liệu giao dịch từ API:", data.message);
        }
    } catch (error) {
        console.error("Lỗi khi gọi API:", error);
    }
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

    // Debug thông tin lấy từ localStorage
    console.log("Rooms:", rooms);
    console.log("Check-In Date:", checkInDate);
    console.log("Check-Out Date:", checkOutDate);
    console.log("User Info:", userInfo);
    console.log("Total Amount:", totalAmount);
    console.log("Phone:", phone);
    console.log("Adults:", adults, "Children:", children, "Infants:", infants);

    // Kiểm tra số điện thoại
    if (!phone || phone.trim() === '') {
        console.error('Lỗi: Số điện thoại không hợp lệ');
        showAlert('Vui lòng nhập số điện thoại.');
        return;
    }

    const totalPeople = rooms.reduce((total, room) => total + (room.people || 0), 0);
    if (rooms.length === 0) {
        console.error('Lỗi: Không có phòng nào được chọn.');
        showAlert(`Vui lòng chọn phòng bạn muốn đặt cho chuyến đi này.`);
        return;
    }

    if (!checkInDate || !checkOutDate) {
        console.error('Lỗi: Ngày check-in hoặc check-out không được chọn.');
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
        console.error('Lỗi: Ngày check-in hoặc check-out không hợp lệ.');
        showAlert(`Ngày check-in hoặc check-out không hợp lệ.`);
        return;
    }

    if (!userInfo.userId) {
        console.error('Lỗi: Người dùng chưa đăng nhập.');
        showAlert(`Vui lòng đăng nhập trước khi đặt phòng.`);
        return;
    }

    if (adults + children + infants === 0) {
        console.error('Lỗi: Không có khách nào được chọn.');
        showAlert(`Vui lòng chọn số lượng khách.`);
        return;
    }

    if (adults + children > totalPeople) {
        console.error(`Lỗi: Số lượng khách (${adults + children}) vượt quá sức chứa (${totalPeople}).`);
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

    console.log("Dữ liệu gửi đến API:", params);

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

        console.log("Phản hồi từ API:", data);

        if (response.ok && data.success) {
            showSuccessAlert('Đặt phòng thành công');
            console.log("Đặt phòng thành công:", data);
            localStorage.setItem('reservationID', data.data.reservationID);
            return data;
        } else {
            console.error("Lỗi từ API:", data.message || 'Đặt phòng không thành công.');
            showAlert(data.message || 'Đặt phòng không thành công.');
            return null;
        }
    } catch (error) {
        console.error("Lỗi khi gửi yêu cầu đặt phòng:", error);
        return null;
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

// Hàm đếm ngược thời gian
function startCountdown() {
    const countdownElement = document.getElementById("countdown_timer");
    const storedTime = localStorage.getItem(countdownKey);

    // Nếu đã có thời gian lưu trong localStorage thì dùng, nếu không khởi tạo mới
    let endTime = storedTime ? parseInt(storedTime, 10) : Date.now() + initialTime * 1000;

    // Lưu thời gian hết hạn vào localStorage (nếu chưa lưu)
    localStorage.setItem(countdownKey, endTime);

    const interval = setInterval(() => {
        if (isTransactionPaid) {
            clearInterval(interval); // Dừng đếm ngược nếu đã thanh toán
            localStorage.removeItem(countdownKey); // Xóa thời gian lưu trữ
            return;
        }

        const remainingTime = Math.max(0, Math.floor((endTime - Date.now()) / 1000));

        // Hiển thị thời gian còn lại
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;
        countdownElement.textContent = `Còn lại: ${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

        // Nếu hết thời gian, xử lý trạng thái hết hạn
        if (remainingTime <= 0) {
            clearInterval(interval);
            localStorage.removeItem(countdownKey); // Xóa thời gian lưu trữ

            if (!isTransactionPaid) {
                alert("Đã hết thời gian thanh toán!");

            }
        }
    }, 1000);
}

// Gọi hàm kiểm tra giao dịch và đếm ngược khi tải trang
window.addEventListener('load', () => {
    startCountdown();
    checkTransaction();
    setInterval(checkTransaction, 15000); // Gọi lại mỗi 15 giây
});
