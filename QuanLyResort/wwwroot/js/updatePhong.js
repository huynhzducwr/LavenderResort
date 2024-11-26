// Hàm lấy thông tin chi tiết phòng
async function fetchRoomDetails(roomID) {
    try {
        const response = await fetch(`/api/Room/${roomID}`); // Sử dụng {id} trong URL
        if (response.ok) {
            const result = await response.json(); // Lấy toàn bộ kết quả trả về
            const room = result.data; // Lấy thông tin phòng từ thuộc tính `data`
            console.log("Room Details:", room);

            // Điền thông tin phòng vào form
            document.getElementById('roomNumberInput').value = room.roomNumber;
            document.getElementById('roomTypeDropdown').value = room.roomTypeID;
            document.getElementById('priceInput').value = room.price;
            document.getElementById('bedTypeInput').value = room.bedType;
            document.getElementById('roomSizeInput').value = room.roomSize;
            document.getElementById('viewTypeInput').value = room.viewType;
            document.getElementById('wifiDropdown').value = room.wifi;
            document.getElementById('breakfastDropdown').value = room.breakfast;
            document.getElementById('cableTVDropdown').value = room.cableTV;
            document.getElementById('transitCarDropdown').value = room.transitCar;
            document.getElementById('bathtubDropdown').value = room.bathtub;
            document.getElementById('petsAllowedDropdown').value = room.petsAllowed;
            document.getElementById('roomServiceDropdown').value = room.roomService;
            document.getElementById('ironDropdown').value = room.iron;
            document.getElementById('statusDropdown').value = room.status;
            document.getElementById('peopleInput').value = room.people;
        } else {
            console.error("Error fetching room details:", response.statusText);
            alert("Không thể tải thông tin phòng. Vui lòng thử lại.");
        }
    } catch (error) {
        console.error("Network error:", error);
        alert("Lỗi kết nối mạng. Vui lòng kiểm tra lại.");
    }
}



// Hàm lấy danh sách kiểu phòng
async function fetchRoomTypes(isActive = null) {
    let url = '/api/RoomType/AllRoomTypes';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();

            if (result && result.data) {
                const roomTypes = result.data;

                // Lấy dropdown từ HTML
                const dropdown = document.getElementById('roomTypeDropdown');
                dropdown.innerHTML = '<option value="" disabled selected>Chọn Kiểu Phòng</option>';

                // Thêm các tùy chọn mới vào dropdown
                roomTypes.forEach(roomType => {
                    const option = document.createElement('option');
                    option.value = roomType.roomTypeID;
                    option.textContent = roomType.typeName;
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

// Hàm xử lý cập nhật phòng
document.getElementById('updateRoomForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn reload trang

    const urlParams = new URLSearchParams(window.location.search);
    const roomID = urlParams.get('id'); // Lấy ID từ URL

    if (!roomID) {
        alert("Không tìm thấy ID phòng để cập nhật.");
        return;
    }

    const formData = {
        roomID: parseInt(roomID), // Bắt buộc truyền `roomID` trong body
        roomNumber: document.getElementById('roomNumberInput').value,
        roomTypeID: parseInt(document.getElementById('roomTypeDropdown').value),
        price: parseFloat(document.getElementById('priceInput').value),
        bedType: document.getElementById('bedTypeInput').value,
        roomSize: document.getElementById('roomSizeInput').value,
        viewType: document.getElementById('viewTypeInput').value,
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
        const response = await fetch(`/api/Room/Update/${roomID}`, { // Truyền `roomID` vào URL
            method: 'PUT', // Sử dụng PUT cho cập nhật
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData), // Gửi dữ liệu dạng JSON
        });

        if (response.ok) {
            alert("Cập nhật phòng thành công!");
            window.location.href = '/admin/room'; // Chuyển hướng sau khi cập nhật thành công
        } else {
            const error = await response.json();
            alert(`Cập nhật thất bại: ${error.message || "Vui lòng thử lại."}`);
            console.error("API Error:", error);
        }
    } catch (error) {
        alert("Lỗi mạng. Vui lòng thử lại.");
        console.error("Network Error:", error);
    }
});


document.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded đã được gọi"); // Log để đảm bảo hàm chạy

    const urlParams = new URLSearchParams(window.location.search); // Lấy tham số từ URL
    const roomID = urlParams.get('id'); // Lấy giá trị tham số `id`
    console.log("roomID:", roomID); // Log giá trị `roomID`

    if (roomID) {
        fetchRoomDetails(roomID); // Gọi hàm lấy thông tin phòng
    } else {
        console.error("Không tìm thấy roomID trong URL."); // Thông báo lỗi nếu không có `id`
        alert("Không tìm thấy ID của phòng để cập nhật.");
    }

    fetchRoomTypes(); // Tải danh sách kiểu phòng
});
