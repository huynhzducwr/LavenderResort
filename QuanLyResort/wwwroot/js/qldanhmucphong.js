let roomTypeData = []; // Array to store all room type data
let filteredData = []; // Array to store filtered data for search
let currentPage = 1; // Current page number
const rowsPerPage = 5; // Number of rows per page

// Fetch room type data from the API
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
            if (result && Array.isArray(result.data)) {
                roomTypeData = result.data; // Store the original data
                filteredData = roomTypeData; // Set filtered data to be the full data initially
                displayRoomTypes(); // Display the first page of room types
                updatePaginationControls(); // Initialize pagination controls
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

// Display the current page of room types
function displayRoomTypes() {
    const tableBody = document.getElementById('user-table-body'); // Reuse the 'user-table-body' for room types
    tableBody.innerHTML = ''; // Clear existing rows

    // Calculate the start and end indices for the current page
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedData = filteredData.slice(startIndex, endIndex);

    // Populate the table with paginated data
    paginatedData.forEach(roomType => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${roomType.roomTypeID}</td>
            <td>${roomType.typeName}</td>
            <td>${roomType.description}</td>
            <td>${roomType.accessibilityFeatures}</td>
            <td>${roomType.isActive ? 'Active' : 'Inactive'}</td>
        `;
        tableBody.appendChild(row);
    });
}

// Update pagination controls
function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Clear existing controls

    const totalPages = Math.ceil(filteredData.length / rowsPerPage);

    // Create "Previous" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trước';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayRoomTypes();
            updatePaginationControls();
        }
    };
    paginationControls.appendChild(prevButton);

    // Page information
    const pageInfo = document.createElement('span');
    pageInfo.id = 'page-info';
    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    paginationControls.appendChild(pageInfo);

    // Create "Next" button
    const nextButton = document.createElement('button');
    nextButton.textContent = 'Sau';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => {
        if (currentPage < totalPages) {
            currentPage++;
            displayRoomTypes();
            updatePaginationControls();
        }
    };
    paginationControls.appendChild(nextButton);
}

const style = document.createElement('style');
style.textContent = `
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
// Search function to filter room types based on input
function searchRoomTypes() {
    const searchInput = document.getElementById('search-bar').value.toLowerCase();
    filteredData = roomTypeData.filter(roomType =>
        roomType.typeName.toLowerCase().includes(searchInput) ||
        roomType.description.toLowerCase().includes(searchInput) ||
        roomType.accessibilityFeatures.toLowerCase().includes(searchInput)
    );
    currentPage = 1; // Reset to first page after search
    displayRoomTypes();
    updatePaginationControls();
}

// Initialize and fetch room types on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchRoomTypes();

    // Add the search bar and event listener for search
    const searchContainer = document.createElement('div');
    searchContainer.innerHTML = `
        <input type="text" id="search-bar" placeholder="Tìm kiếm danh mục phòng..." onkeyup="searchRoomTypes()" style="width: 100%; padding: 10px; margin-bottom: 10px; border: 1px solid #ccc; border-radius: 5px;">
    `;
    const section = document.querySelector('.section');
    section.insertBefore(searchContainer, section.firstChild);
});
