let users = [];
let filteredUsers = []; // For storing search-filtered users
let currentPage = 1;
const rowsPerPage = 10;

async function fetchUsers(isActive = null) {
    let url = '/api/User/AllUsers';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            users = data.data.filter(user => user.roleName === 'Khách hàng'); // Only include 'Khách hàng' users
            filteredUsers = users; // Initialize filtered users to all 'Khách hàng'
            displayPage(1); // Display the first page initially
        } else {
            console.error("Error fetching users:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}

function displayPage(page) {
    const tableBody = document.getElementById('user-table-body');
    tableBody.innerHTML = ''; // Clear existing rows

    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    const paginatedUsers = filteredUsers.slice(start, end);

    paginatedUsers.forEach(user => {
        const row = document.createElement('tr');
        row.innerHTML = `
                <td>${user.userID}</td>
                <td>${user.firstName}</td>
                <td>${user.lastName}</td>
                <td>${user.email}</td>
                <td>${user.roleName}</td>
                <td>${user.isActive ? 'Yes' : 'No'}</td>
                <td>${user.lastLogin ? user.lastLogin : 'N/A'}</td>
            `;
        tableBody.appendChild(row);
    });

    // Update pagination controls
    document.getElementById('page-info').textContent = `Page ${page} of ${Math.ceil(filteredUsers.length / rowsPerPage)}`;
}

// Filter users based on search input
function filterUsers() {
    const query = document.getElementById('search-bar').value.toLowerCase();
    filteredUsers = users.filter(user =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query) ||
        user.email.toLowerCase().includes(query)
    );
    currentPage = 1; // Reset to the first page
    displayPage(currentPage); // Update the display with the filtered results
}

function nextPage() {
    if (currentPage * rowsPerPage < filteredUsers.length) { // Check if next page exists
        currentPage++;
        displayPage(currentPage);
    }
}

function prevPage() {
    if (currentPage > 1) { // Check if previous page exists
        currentPage--;
        displayPage(currentPage);
    }
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

document.addEventListener('DOMContentLoaded', () => {
    fetchUsers();
});
