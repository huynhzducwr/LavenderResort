// Add CSS styles dynamically
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

// Variables to store the room data and filtered data
let roomData = [];

// Fetch data and display in the table
async function fetchRooms(isActive = null) {
    let url = '/api/Room/All';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            if (result && Array.isArray(result.data)) {
                roomData = result.data; // Store original data
                displayRooms(roomData); // Display all rooms initially
            } else {
                console.error("Unexpected data format:", result);
            }
        } else {
            console.error("Error fetching rooms:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

function displayRooms(data) {
    const tableBody = document.getElementById('room-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    data.forEach((room, index) => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${room.roomNumber}</td>
            <td>${room.roomTypeID}</td>
            <td>${room.roomSize}</td>
            <td>${room.bedType}</td>
            <td>${room.people}</td>
            <td>${room.price}</td>
            <td>${room.status}</td>
            <td><button class="details-btn" onclick="toggleDetails(${index})">Xem Thêm</button></td>
        `;
        tableBody.appendChild(row);

        // Add a hidden row for details
        const detailsRow = document.createElement('tr');
        detailsRow.id = `details-${index}`;
        detailsRow.classList.add('details-row');
        detailsRow.style.display = 'none'; // Hide details row by default
        detailsRow.innerHTML = `
            <td colspan="8">
                <div class="details-content">
                    <span><strong>Bữa Sáng:</strong> ${room.breakfast}</span>
                    <span><strong>TV Cáp:</strong> ${room.cableTV}</span>
                    <span><strong>Wi-Fi:</strong> ${room.wifi}</span>
                    <span><strong>Dịch Vụ Phòng:</strong> ${room.roomService}</span>
                    <span><strong>Vật Nuôi:</strong> ${room.petsAllowed}</span>
                    <span><strong>Xe Trung Chuyển:</strong> ${room.transitCar}</span>
                    <span><strong>Tầm Nhìn:</strong> ${room.viewType}</span>
                    <span><strong>Vòi Sen:</strong> ${room.bathtub}</span>
                    <span><strong>Bàn Là:</strong> ${room.iron}</span>
                </div>
            </td>
        `;
        tableBody.appendChild(detailsRow);
    });
}

function toggleDetails(index) {
    const detailsRow = document.getElementById(`details-${index}`);
    if (detailsRow.style.display === 'none') {
        detailsRow.style.display = 'table-row';
    } else {
        detailsRow.style.display = 'none';
    }
}

// Search function to filter rooms based on input
function searchRooms() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    const filteredData = roomData.filter(room =>
        room.roomNumber.toString().includes(searchInput) ||
        room.roomTypeID.toString().includes(searchInput) ||
        room.status.toLowerCase().includes(searchInput)
    );
    displayRooms(filteredData);
}

document.addEventListener('DOMContentLoaded', () => {
    fetchRooms();

    // Add the search bar at the top of the section
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <input type="text" id="search-bar" placeholder="Tìm kiếm phòng..." onkeyup="searchRooms()" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
    `;

    // Append the search container to the beginning of the section element
    const section = document.querySelector('.section');
    section.insertBefore(searchContainer, section.firstChild);
});
