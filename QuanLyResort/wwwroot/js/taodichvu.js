document.getElementById('addServiceForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent page reload

    // Collect data from the form
    const formData = {
        serviceName: document.getElementById('serviceNameInput').value,
        description1: document.getElementById('description1Input').value,
        description2: document.getElementById('description2Input').value,
        description3: document.getElementById('description3Input').value
    };

    try {
        const response = await fetch('/api/Services/AddServices', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        if (response.ok) {
            alert('Thêm dịch vụ thành công!');
            window.location.href = '/admin/dichvu'; // Redirect to the services list page
        } else {
            const error = await response.json();
            alert(`Thêm dịch vụ thất bại: ${error.message || "Vui lòng kiểm tra lại thông tin."}`);
        }
    } catch (error) {
        alert("Lỗi mạng. Vui lòng thử lại.");
        console.error("Error adding service:", error);
    }
});
