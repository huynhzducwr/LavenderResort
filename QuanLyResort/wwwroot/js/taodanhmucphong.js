document.getElementById('addRoomTypeForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Ngăn trang reload

    const formData = {
        typeName: document.getElementById('typeNameInput').value.trim(),
        accessibilityFeatures: document.getElementById('accessibilityFeaturesInput').value.trim(),
        description: document.getElementById('descriptionInput').value.trim()
    };

    // Kiểm tra dữ liệu trước khi gửi
    if (!formData.typeName || !formData.accessibilityFeatures || !formData.description) {
        alert("Vui lòng điền đầy đủ thông tin trước khi gửi.");
        return;
    }

    try {
        const response = await fetch('/api/RoomType/AddRoomType', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Thêm loại phòng thành công!');
            window.location.href = '/admin/danhmucphong'; // Chuyển hướng đến danh sách loại phòng
        } else {
            const error = await response.json();
            alert(`Thêm loại phòng thất bại: ${error.message || "Vui lòng kiểm tra lại thông tin."}`);
            console.error("Error response:", error);
        }
    } catch (error) {
        alert("Lỗi mạng. Vui lòng thử lại.");
        console.error("Error adding room type:", error);
    }
});
