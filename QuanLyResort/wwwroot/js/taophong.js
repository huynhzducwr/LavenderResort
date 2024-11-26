

async function fetchRoomTypes(isActive = null) {
    let url = '/api/RoomType/AllRoomTypes';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            console.log(result);

            // Kiểm tra dữ liệu trả về có thuộc tính data
            if (result && result.data) {
                const roomTypes = result.data;

                // Lấy dropdown từ HTML
                const dropdown = document.getElementById('roomTypeDropdown');

                // Xóa các tùy chọn cũ (nếu có)
                dropdown.innerHTML = '<option value="" disabled selected>Chọn Kiểu Phòng</option>';

                // Thêm các tùy chọn mới vào dropdown
                roomTypes.forEach(roomType => {
                    const option = document.createElement('option');
                    option.value = roomType.roomTypeID; // ID kiểu phòng
                    option.textContent = roomType.typeName; // Tên kiểu phòng
                    dropdown.appendChild(option);
                });
            } else {
                console.error("Unexpected data format:", result);
            }

        } else {
            console.error("Error fetching room types:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

// Gọi hàm để tải danh sách kiểu phòng ngay khi trang được tải
document.addEventListener('DOMContentLoaded', () => {
    fetchRoomTypes();
});

const addRoomForm = document.getElementById('addRoomForm');

// Gắn sự kiện submit
addRoomForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn reload trang

    const formData = {
        roomNumber: document.querySelector('input[placeholder="Số Phòng"]').value,
        roomTypeID: parseInt(document.getElementById('roomTypeDropdown').value),
        price: parseFloat(document.querySelector('input[placeholder="Giá"]').value),
        bedType: document.querySelector('input[placeholder="Kiểu Giường"]').value,
        roomSize: document.querySelector('input[placeholder="Diện Tích Phòng"]').value,
        viewType: document.querySelector('input[placeholder="View Phòng"]').value,
        wifi: document.getElementById('wifiDropdown').value,
        breakfast: document.getElementById('breakfastDropdown').value,
        cableTV: document.getElementById('cableTVDropdown').value,
        transitCar: document.getElementById('transitCarDropdown').value,
        bathtub: document.getElementById('bathtubDropdown').value,
        petsAllowed: document.getElementById('petsAllowedDropdown').value,
        roomService: document.getElementById('roomServiceDropdown').value,
        iron: document.getElementById('ironDropdown').value,
        status: document.getElementById('statusDropdown').value,
        people: parseInt(document.getElementById('peopleInput').value),
        isActive: document.getElementById('statusDropdown').value === 'Available'
    };

    try {
        const response = await fetch('/api/Room/Create', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), // Chuyển dữ liệu thành JSON
        });

        if (response.ok) {
            const result = await response.json();
            alert("Tạo phòng thành công!");
            console.log(result);
            window.location.href = '/admin/room'; // Chuyển hướng sau khi tạo thành công
        } else {
            const error = await response.json();
            alert(`Tạo phòng thất bại: ${error.message || "Vui lòng kiểm tra lại thông tin."}`);
            console.error(error);
        }
    } catch (error) {
        alert("Lỗi mạng. Vui lòng thử lại sau.");
        console.error(error);
    }
});