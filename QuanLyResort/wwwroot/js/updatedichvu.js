// Event listener for the form submission to update the service
// Event listener for the form submission to update the service
document.getElementById('updateServiceForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent the default form submission

    // Get the service ID from the URL query parameters
    const urlParams = new URLSearchParams(window.location.search);
    const serviceID = urlParams.get('id');  // Get the 'id' parameter from the URL

    // Create the data object for updating the service
    const formData = {
        serviceName: document.getElementById('serviceNameInput').value,
        description1: document.getElementById('description1Input').value,
        description2: document.getElementById('description2Input').value,
        description3: document.getElementById('description3Input').value
    };

    try {
        // Send a PUT request to update the service
        const response = await fetch(`/api/Services/Update/${serviceID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(formData),
        });

        // Handle the response
        if (response.ok) {
            alert("Cập nhật dịch vụ thành công!");
            window.location.href = '/admin/dichvu'; // Redirect to the service list page after success
        } else {
            const error = await response.json();
            alert(`Cập nhật thất bại: ${error.message || "Vui lòng thử lại."}`);
        }
    } catch (error) {
        alert("Có lỗi xảy ra khi cập nhật dịch vụ.");
        console.error("Error updating service:", error);
    }
});


// Fetch the service data when the page loads and populate the form
// Fetch the service data when the page loads and populate the form
// Fetch service data and fill in the form
async function fetchServiceData() {
    const urlParams = new URLSearchParams(window.location.search);
    const serviceID = urlParams.get('id'); // Get the 'id' parameter from the URL

    try {
        const response = await fetch(`/api/Services/GetServiceByID/${serviceID}`);
        if (response.ok) {
            const serviceData = await response.json();
            console.log(serviceData); // Log the response to inspect the data

            if (serviceData.success && serviceData.data) {
                const service = serviceData.data; // Access the data property

                // Fill in the form fields with the service data
                document.getElementById('serviceNameInput').value = service.serviceName;
                document.getElementById('description1Input').value = service.description1;
                document.getElementById('description2Input').value = service.description2;
                document.getElementById('description3Input').value = service.description3;
            } else {
                alert("Không tìm thấy dịch vụ.");
            }
        } else {
            alert("Không tìm thấy dịch vụ.");
        }
    } catch (error) {
        alert("Có lỗi xảy ra khi tải thông tin dịch vụ.");
        console.error("Error fetching service data:", error);
    }
}

// Call fetchServiceData when the page is loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchServiceData();
});





