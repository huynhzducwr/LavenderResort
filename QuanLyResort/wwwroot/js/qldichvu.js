let serviceData = [];
let filteredData = [];
let currentPage = 1;
const rowsPerPage = 5;

// Fetch all services
async function fetchServices(filter = null) {
    let url = '/api/Services/AllServices'; // Assuming this API endpoint exists
    if (filter) {
        url += `?filter=${filter}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            if (result && Array.isArray(result.data)) {
                serviceData = result.data;
                filteredData = serviceData;
                displayServices();
                updatePaginationControls();
            } else {
                console.error("Unexpected data format:", result);
            }
        } else {
            console.error("Error fetching services:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

// Display the services on the current page
function displayServices() {
    const tableBody = document.getElementById('user-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    paginatedData.forEach(service => {
        const row = document.createElement('tr');

        // Check if isActive is true or false, and display the corresponding text
        const statusText = service.isActive ? 'Khả Dụng' : 'Không Khả Dụng';

        row.innerHTML = `
            <td>${service.serviceName}</td>
            <td>${statusText}</td> <!-- Display the status text -->
            <td>
                <button class="btn btn-warning btn-sm" onclick="viewService(${service.servicesID})">Xem</button>
                <button class="btn btn-primary btn-sm" onclick="updateService(${service.servicesID})">Cập nhật</button>
                <button class="btn btn-danger btn-sm" onclick="deleteService(${service.servicesID})">Xóa</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// Add the updateService function (this would open the update page or show a modal)
function updateService(serviceID) {
    window.location.href = `/admin/updateService?id=${serviceID}`; // Redirect to the update service page
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
            displayServices();
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
            displayServices();
            updatePaginationControls();
        }
    };
    paginationControls.appendChild(nextButton);
}

// View service details in the modal
function viewService(serviceID) {
    const service = serviceData.find(s => s.serviceID === serviceID);
    if (service) {
        document.getElementById('modal-serviceName').textContent = service.serviceName;
        document.getElementById('modal-description1').textContent = service.description1 || 'No description available';
        document.getElementById('modal-description2').textContent = service.description2 || 'No description available';
        document.getElementById('modal-description3').textContent = service.description3 || 'No description available';
        document.getElementById('modal-status').textContent = service.isActive ? 'Active' : 'Inactive';

        // Show the modal
        document.getElementById('service-modal').style.display = 'flex';
    } else {
        console.error("Service not found.");
    }
}

// Close the modal
function closeModal() {
    document.getElementById('service-modal').style.display = 'none';
}

// Delete a service
async function deleteService(serviceID) {
    if (confirm("Bạn có chắc muốn xóa dịch vụ này?")) {
        try {
            const response = await fetch(`/api/Services/Delete/${serviceID}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (response.ok) {
                alert("Dịch vụ đã được xóa.");
                fetchServices(); // Refresh the list after deletion
            } else {
                const error = await response.json();
                alert(`Xóa dịch vụ thất bại: ${error.message || "Vui lòng thử lại sau."}`);
            }
        } catch (error) {
            console.error("Error deleting service:", error);
            alert("Có lỗi xảy ra khi xóa dịch vụ.");
        }
    }
}


// Search function to filter services
function searchServices() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    filteredData = serviceData.filter(service =>
        service.serviceName.toLowerCase().includes(searchInput) ||
        service.description.toLowerCase().includes(searchInput)
    );
    currentPage = 1;
    displayServices();
    updatePaginationControls();
}

// Initialize and fetch services on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchServices();
});
