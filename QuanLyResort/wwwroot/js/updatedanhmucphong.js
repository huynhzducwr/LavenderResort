document.getElementById('updateRoomTypeForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn trang reload

    // Lấy id từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomTypeId = urlParams.get('id');  // Lấy giá trị 'id' từ URL

    const formData = {
        roomTypeID: roomTypeId,  // Include the RoomTypeId here in the body
        typeName: document.getElementById('typeNameInput').value,
        accessibilityFeatures: document.getElementById('accessibilityFeaturesInput').value,
        description: document.getElementById('descriptionInput').value,
    };

    console.log('Form Data:', formData); // Log the data you are sending in the request

    try {
        const response = await fetch(`/api/RoomType/Update/${roomTypeId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        console.log('Response Status:', response.status); // Log the response status

        if (response.ok) {
            const responseData = await response.json();
            console.log('Response Data:', responseData); // Log the full response data from the API

            alert('Cập nhật loại phòng thành công!');
            window.location.href = '/admin/danhmucphong'; // Chuyển hướng về trang danh sách kiểu phòng
        } else {
            const error = await response.json();
            console.log('Error Data:', error); // Log the error response data
            alert(`Cập nhật thất bại: ${error.message || "Vui lòng kiểm tra lại thông tin."}`);
        }
    } catch (error) {
        alert("Lỗi mạng. Vui lòng thử lại.");
        console.error("Error updating room type:", error);
    }
});



// Hàm lấy danh sách kiểu phòng và điền vào dropdown
async function fetchRoomTypes() {
    // Get the roomTypeId from the URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomTypeId = urlParams.get('id'); // Get 'id' parameter from the URL

    if (!roomTypeId) {
        console.error("Room Type ID not found in URL.");
        return;
    }

    // Fetch details for a specific room type using the RoomTypeID
    let url = `/api/RoomType/GetRoomType/${roomTypeId}`;

    try {
        const response = await fetch(url);
        if (response.ok) {  
            const roomType = await response.json();
            console.log(roomType);

            // Populate form fields with the fetched room type details
            if (roomType && roomType.data) {
                const roomTypeData = roomType.data;
                document.getElementById('typeNameInput').value = roomTypeData.typeName;
                document.getElementById('accessibilityFeaturesInput').value = roomTypeData.accessibilityFeatures;
                document.getElementById('descriptionInput').value = roomTypeData.description;
                // Status will not be included in the form
            } else {
                console.error("Room type data not found.");
            }

        } else {
            console.error("Error fetching room type details:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

// Gọi hàm để tải kiểu phòng khi trang tải
document.addEventListener('DOMContentLoaded', () => {
    fetchRoomTypes();
});
