let imageData = []; // Array to store all image data
let groupedImages = {}; // Object to store grouped images by room number
let currentPage = 1; // Current page number
const rowsPerPage = 5; // Number of rows per page

// Fetch image data from the API
async function fetchImageRoom(isActive = null) {
    let url = '/api/Image/all';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            if (Array.isArray(result)) {
                imageData = result;
                groupImagesByRoom(); // Group images by room number
                displayRooms(); // Display the first page of rooms with one image each
                updatePaginationControls(); // Initialize pagination controls
            } else {
                console.error("Unexpected data format:", result);
            }
        } else {
            console.error("Error fetching images:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

// Group images by room number
function groupImagesByRoom() {
    groupedImages = imageData.reduce((acc, image) => {
        if (!acc[image.roomNumber]) {
            acc[image.roomNumber] = [];
        }
        acc[image.roomNumber].push(image);
        return acc;
    }, {});
}

// Display one main image per room with "See More" button
function displayRooms() {
    const tableBody = document.getElementById('image-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    // Get room numbers and paginate
    const roomNumbers = Object.keys(groupedImages);
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    const paginatedRooms = roomNumbers.slice(startIndex, endIndex);

    // Populate the table with one image per room
    paginatedRooms.forEach(roomNumber => {
        const roomImages = groupedImages[roomNumber];
        const mainImage = roomImages[0]; // Select the first image as the main image
        const row = document.createElement('tr');
        row.innerHTML = `
    <td>${mainImage.roomID}</td>
    <td>${roomNumber}</td>
    <td><img src="${mainImage.imageURL}" alt="Room Image" style="width: 100px; height: auto;" /></td>
    <td><button class="see-more-btn" onclick="showAllImages('${roomNumber}')">Xem Thêm</button></td>
`;
        tableBody.appendChild(row);

    });
}

// Show all images for a specific room number
function showAllImages(roomNumber) {
    const images = groupedImages[roomNumber];
    const modalContent = images.map(image => `<img src="${image.imageURL}" style="width: 100px; height: auto; margin: 5px; cursor: pointer;" onclick="zoomImage('${image.imageURL}')" />`).join('');

    const modal = document.createElement('div');
    modal.id = 'image-modal';
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = '#fff';
    modal.style.padding = '20px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    modal.style.zIndex = '1000';
    modal.innerHTML = `
        <h3>Hình ảnh của phòng ${roomNumber}</h3>
        <div style="display: flex; flex-wrap: wrap; justify-content: center;">${modalContent}</div>
        <button onclick="closeModal()" style="margin-top: 10px; padding: 5px 10px;">Đóng</button>
    `;

    document.body.appendChild(modal);
}

// Zoom in on a specific image when clicked
function zoomImage(imageURL) {
    const zoomModal = document.createElement('div');
    zoomModal.id = 'zoom-modal';
    zoomModal.style.position = 'fixed';
    zoomModal.style.top = '50%';
    zoomModal.style.left = '50%';
    zoomModal.style.transform = 'translate(-50%, -50%)';
    zoomModal.style.backgroundColor = 'rgba(0, 0, 0, 0.8)';
    zoomModal.style.padding = '20px';
    zoomModal.style.borderRadius = '8px';
    zoomModal.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.5)';
    zoomModal.style.zIndex = '1001';
    zoomModal.innerHTML = `
        <img src="${imageURL}" alt="Zoomed Image" style="width: 80%; height: auto; display: block; margin: 0 auto;" />
        <button onclick="closeZoomModal()" style="margin-top: 10px; padding: 5px 10px; display: block; margin-left: auto; margin-right: auto;">Đóng</button>
    `;

    document.body.appendChild(zoomModal);
}

// Close the modal
function closeModal() {
    const modal = document.getElementById('image-modal');
    if (modal) {
        modal.remove();
    }
}

// Close the zoom modal
function closeZoomModal() {
    const zoomModal = document.getElementById('zoom-modal');
    if (zoomModal) {
        zoomModal.remove();
    }
}

// Update pagination controls
function updatePaginationControls() {
    const paginationControls = document.getElementById('pagination-controls');
    paginationControls.innerHTML = ''; // Clear existing controls

    const totalPages = Math.ceil(Object.keys(groupedImages).length / rowsPerPage);

    // Create "Previous" button
    const prevButton = document.createElement('button');
    prevButton.textContent = 'Trước';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => {
        if (currentPage > 1) {
            currentPage--;
            displayRooms();
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
            displayRooms();
            updatePaginationControls();
        }
    };
    paginationControls.appendChild(nextButton);
}
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
    .see-more-btn {
background-color: #007bff; /* Blue background */
        color: white; /* White text */
        padding: 5px 10px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }

    .see-more-btn:hover {
     background-color: #0056b3; /* Darker blue on hover */
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2); /* Add shadow on hover */
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
`;
document.head.appendChild(style);


// Initialize and fetch image data on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchImageRoom();
});
