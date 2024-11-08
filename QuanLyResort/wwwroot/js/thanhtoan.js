// Hàm định dạng giá tiền
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Hàm định dạng ngày
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Lấy dữ liệu từ localStorage
const userInfo = JSON.parse(localStorage.getItem('userInfo'));

// Kiểm tra xem dữ liệu có tồn tại hay không
if (userInfo) {
    // Điền dữ liệu vào các trường
    document.getElementById('first-name').value = userInfo.firstname || '';
    document.getElementById('last-name').value = userInfo.lastname || '';
    document.getElementById('email').value = userInfo.email || '';
}

// Hiển thị dữ liệu phòng và tổng tiền
function displayRoomsAndTotal() {
    // Lấy dữ liệu từ localStorage
    const rooms = JSON.parse(localStorage.getItem('rooms')) || [];
    const checkin = localStorage.getItem('checkin');
    const checkout = localStorage.getItem('checkout');
    const totalAmount = localStorage.getItem('totalAmount');

    const productContainer = document.getElementById('product-container');
    const totalPriceElement = document.getElementById('totalPrice');

    // Xóa nội dung cũ trong container (nếu cần)
    productContainer.innerHTML = '';

    // Hiển thị thông tin từng phòng
    rooms.forEach((room, index) => {
        const roomElement = document.createElement('div');
        roomElement.classList.add('room-cart');
        roomElement.innerHTML = `
            <div class="cart-wrapper">
                <div class="cart-container">
                    <p class="title-room">Phòng ${index + 1}</p>
                    <p class="stay-dates">${formatDate(checkin)} — ${formatDate(checkout)}</p>

                    <div class="room-details">
                        <p>x1 ${room.roomTypeName} — Giá: <span class="price-info">${formatCurrency(room.price)}</span></p>
                        <p>${room.people} Người</p>
                    </div>
                    <div class="total-info">
                        <p class="total-price1">thuế phí: <span class="price-info1">Bao gồm VAT</span></p>
                        <p class="tax-info">(Bao gồm thuế phí)</p>
                    </div>
                </div>
            </div>
        `;
        productContainer.appendChild(roomElement);
    });

    totalPriceElement.textContent = formatCurrency(totalAmount);
}

// Gọi hàm hiển thị khi tải trang
// Gộp tất cả logic vào một sự kiện 'load'
window.addEventListener('load', function () {
    // Hiển thị thông tin phòng và tổng giá
    displayRoomsAndTotal();

    // Khôi phục số điện thoại từ localStorage
    const savedPhone = localStorage.getItem('phone');
    if (savedPhone) {
        document.getElementById('phone').value = savedPhone; // Gán giá trị lưu trữ vào trường nhập liệu
    }
});

// Lưu số điện thoại vào localStorage khi người dùng nhập
document.getElementById('phone').addEventListener('input', function () {
    const phone = this.value;
    localStorage.setItem('phone', phone); // Lưu số điện thoại vào localStorage
});
