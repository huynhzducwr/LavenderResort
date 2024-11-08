
const menuItems = document.querySelectorAll('#menu-list li');


const mainContent = document.getElementById('main-content');



// Định nghĩa nội dung cho từng trang
const pages = {
    'dashboard': {
        title: 'Dashboard',
        content: `
            <h2>Chào mừng đến Dashboard</h2>
            <p>Đây là trang quản lý Lavender Resort</p>
        `
    },
    'nguoi-dung': {
        title: 'Người dùng',
        content: `
        <h2 id="user-title">Quản lý Người dùng</h2>

        <!-- Search Form -->
        <div class="search-container">
            <input type="text" id="search-input" placeholder="Tìm kiếm người dùng..." />
            <button id="search-btn">Tìm kiếm</button>
        </div>

        <!-- Status Filter -->
        <div class="filter-buttons">
            <button id="active-btn">Đang hoạt động</button>
            <button id="inactive-btn">Vô hiệu hóa</button>
        </div>

        <!-- User Data Table -->
        <table class="user-table">
            <thead>
                <tr>
                    <th>UserID</th>
                    <th>RoleName</th>
                    <th>Email</th>
                    <th>FirstName</th>
                    <th>LastName</th>
                    <th>PasswordHash</th>
                    <th>CreatedAt</th>
                    <th>LastLogin</th>
                    <th>IsActive</th>
                    <th>Update</th>
                    <th>Active</th>
                </tr>
            </thead>
            <tbody id="user-table-body">
                <!-- User data will be populated here -->
            </tbody>
        </table>

        <!-- Pagination Controls -->
        <div class="pagination">
            <button class="page-btn" id="prev-btn" disabled>Previous</button>
            <span id="page-info">Page 1</span>
            <button class="page-btn" id="next-btn">Next</button>
        </div>

        <style>
            /* General Styling */
            body {
                font-family: Arial, sans-serif;
                color: #333;
            }

            /* Title Styling */
            #user-title {
                font-size: 24px;
                color: #007bff;
                margin-bottom: 10px;
                text-align: center;
            }

            #user-title:hover {
                color: #0056b3;
                cursor: pointer;
                text-decoration: underline;
            }

            /* Search and Filter Styling */
            .search-container, .filter-buttons {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
            }

            /* Table Styling */
            .user-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 10px;
            }

            .user-table th, .user-table td {
                padding: 12px;
                text-align: left;
                border: 1px solid #ddd;
            }

            .user-table th {
                background-color: #f8f9fa;
                font-weight: bold;
                color: #333;
            }

            .user-table tbody tr:nth-child(even) {
                background-color: #f2f2f2;
            }

            /* Pagination Styling */
            .pagination {
                display: flex;
                justify-content: center;
                align-items: center;
                margin: 20px 0;
            }

            .page-btn {
                padding: 8px 12px;
                font-size: 14px;
                background-color: #007bff;
                color: #fff;
                border: none;
                border-radius: 4px;
                margin: 0 5px;
                cursor: pointer;
                transition: background-color 0.3s ease;
            }

            .page-btn:disabled {
                background-color: #ccc;
                cursor: not-allowed;
            }

            .page-btn:hover:not(:disabled) {
                background-color: #0056b3;
            }

            #page-info {
                font-size: 16px;
                margin: 0 10px;
            }
        </style>
    `
    },
    'phong': {
        title: 'Danh sách phòng của LAVENDER',
        content: `
    <h2 id="room-title">Quản lý phòng</h2>

    <!-- Search Form -->
    <div class="search-container">
        <input type="text" id="search-room-input" placeholder="Search for rooms..." />
        <button id="search-room-btn">Search</button>
    </div>

    <!-- Status Filter -->
    <div class="filter-buttons">
        <button id="active-room-btn">Đang hoạt động</button>
        <button id="inactive-room-btn">Vô hiệu hóa</button>
    </div>

    <!-- Create Room Button -->
    <div class="create-room-container">
        <button id="create-room-btn">Tạo Phòng</button>
    </div>

    <!-- Hidden Form for Adding a Room -->
    <div id="create-room-form" style="display: none;">
        <!-- Form elements here, similar to the original form -->
    </div>

    <!-- Room Data Table -->
    <table class="room-table">
        <thead>
            <tr>
                <th>Room ID</th>
                <th>Room Number</th>
                <th>Room Type ID</th>
                <th>Price</th>
                <th>Bed Type</th>
                <th>Room Size</th>
                <th>View Type</th>
                <th>WiFi</th>
                <th>Breakfast</th>
                <th>Cable TV</th>
                <th>Transit Car</th>
                <th>Bathtub</th>
                <th>Pets Allowed</th>
                <th>Room Service</th>
                <th>Iron</th>
                <th>People</th>
                <th>Status</th>
                <th>isActive</th>
                <th>Update status</th>
                <th>Update Active</th>
            </tr>
        </thead>
        <tbody id="room-table-body">
            <!-- Room data will be filled here -->
        </tbody>
    </table>

    <!-- Pagination Controls -->
    <div class="pagination">
        <button class="page-btn" id="prev-room-btn" disabled>Previous</button>
        <span id="room-page-info">Page 1</span>
        <button class="page-btn" id="next-room-btn">Next</button>
    </div>

    <style>
        /* General Styling */
        body {
            font-family: Arial, sans-serif;
            color: #333;
        }

        /* Title Styling */
        #room-title {
            font-size: 24px;
            color: #007bff;
            margin-bottom: 10px;
            text-align: center;
        }

        #room-title:hover {
            color: #0056b3;
            cursor: pointer;
            text-decoration: underline;
        }

        /* Search and Filter Styling */
        .search-container, .filter-buttons {
            display: flex;
            justify-content: center;
            margin-bottom: 20px;
        }

        /* Create Room Button Styling */
        .create-room-container {
            text-align: center;
            margin-bottom: 20px;
        }

        /* Table Styling */
        .room-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
        }

        .room-table th, .room-table td {
            padding: 12px;
            text-align: left;
            border: 1px solid #ddd;
        }

        .room-table th {
            background-color: #f8f9fa;
            font-weight: bold;
            color: #333;
        }

        .room-table tbody tr:nth-child(even) {
            background-color: #f2f2f2;
        }

        /* Pagination Styling */
        .pagination {
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 20px 0;
        }

        .page-btn {
            padding: 8px 12px;
            font-size: 14px;
            background-color: #007bff;
            color: #fff;
            border: none;
            border-radius: 4px;
            margin: 0 5px;
            cursor: pointer;
            transition: background-color 0.3s ease;
        }

        .page-btn:disabled {
            background-color: #ccc;
            cursor: not-allowed;
        }

        .page-btn:hover:not(:disabled) {
            background-color: #0056b3;
        }

        #room-page-info {
            font-size: 16px;
            margin: 0 10px;
        }
    </style>
    `
    }






};



// Người dùng
async function fetchUsers(isActive = null) {
    let url = '/api/User/AllUsers';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json(); 
            renderUsers(data.data);
            console.log(data);
        } else {
            console.error("Error fetching users:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}


function renderUsers(users) {
    const userTableBody = document.getElementById('user-table-body');
    userTableBody.innerHTML = ''; // Xóa nội dung hiện tại


    users.forEach(user => {
        const row = `
                <tr>
                    <td>${user.userID}</td>
                    <td>${user.roleName}</td>
                    <td>${user.email}</td>
                    <td>${user.firstName}</td>
                    <td>${user.lastName}</td>
                    <td>******</td> <!-- Không hiển thị mật khẩu hash -->
                    <td>${new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>${user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Chưa đăng nhập'}</td>
                    <td>${user.isActive ? 'Yes' : 'No'}</td>
     
    <td>
        <select class="role-select" data-userid="${user.userID}">
            <!-- Các options sẽ được điền bằng fetchUserRoles() -->
        </select>
        <button class="update-role-btn" data-userid="${user.userID}">Cập nhật Role</button>
    </td>

           <td>
        <select class="status-select" data-userid="${user.userID}">
            <option value="true" ${user.isActive ? 'selected' : ''}>Kích hoạt</option>
            <option value="false" ${!user.isActive ? 'selected' : ''}>Không kích hoạt</option>
        </select>
        <button class="update-status-btn" data-userid="${user.userID}">Cập nhật Trạng thái</button>
    </td>

                </tr>
            `;
        userTableBody.insertAdjacentHTML('beforeend', row);
    });
    // Thêm sự kiện cho nút cập nhật Role

    document.querySelectorAll('.update-role-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.getAttribute('data-userid');
            updateUserRole(userId); // Gọi hàm updateUserRole với userId
            fetchUsers();
        });
    });
    // Gọi hàm để lấy danh sách Role
    fetchUserRoles();
    // Thêm sự kiện cho nút thay đổi trạng thái hoạt động
    document.querySelectorAll('.update-status-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const userId = e.target.getAttribute('data-userid'); // Lấy userID từ thuộc tính data
            const statusSelect = document.querySelector(`.status-select[data-userid="${userId}"]`); // Lấy dropdown tương ứng
            const isActive = statusSelect.value === 'true'; // Lấy giá trị true/false từ dropdown và chuyển thành boolean

            // In ra giá trị để kiểm tra
            console.log('Updating UserID:', userId, 'to isActive:', isActive); // In ra để kiểm tra dữ liệu

            // Gọi API để thay đổi trạng thái người dùng
            toggleUserActive(userId, isActive);
        });
    });



}
async function fetchUserRoles() {
    try {
        const response = await fetch('/api/User/GetRoles'); // Gọi API để lấy danh sách role
        if (response.ok) {
            const roles = await response.json();
            document.querySelectorAll('.role-select').forEach(select => {
                // Xóa các tùy chọn hiện tại nếu có
                select.innerHTML = '';

                roles.forEach(role => {
                    const option = document.createElement('option');
                    option.value = role.roleID; // Đặt value là roleID
                    option.textContent = role.roleName; // Đặt text là roleName
                    select.appendChild(option);
                });
            });
        } else {
            console.error("Error fetching roles:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}
async function updateUserRole(userId) {
    const roleSelect = document.querySelector(`.role-select[data-userid="${userId}"]`);
    const roleId = roleSelect.value; // Lấy giá trị từ dropdown

    if (!roleId) {
        alert("Vui lòng chọn một vai trò.");
        return;
    }

    try {
        const response = await fetch('/api/User/AssignRole', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                UserID: userId,
                RoleID: roleId
            })
        });

        const result = await response.json();
        if (result.isAssign) {
            alert(result.message); // Hiển thị thông báo cập nhật thành công
            fetchUsers(); // Reload lại danh sách người dùng
        } else {
            alert(result.message);
        }
    } catch (error) {
        console.error("Error updating user role:", error);
    }
}


async function fetchRooms(isActive = null) {
    let url = '/api/Room/All';
    if (isActive !== null) {
        url += `?isActive=${isActive}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json();
            renderRooms(data.data);
            console.log(data);
        } else {
            console.error("Error fetching rooms:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}




// Function to render the rooms data in the table
function renderRooms(rooms) {
    const roomTableBody = document.getElementById('room-table-body');
    roomTableBody.innerHTML = ''; // Clear existing content

    rooms.forEach(room => {
        const row = `
            <tr>
                <td>${room.roomID}</td>
                <td>${room.roomNumber}</td>
                <td>${room.roomTypeID}</td>
                <td>${room.price}</td>
                <td>${room.bedType}</td>
                <td>${room.roomSize}</td>
                <td>${room.viewType}</td>
                <td>${room.wifi}</td>
                <td>${room.breakfast}</td>
                <td>${room.cableTV}</td>
                <td>${room.transitCar}</td>
                <td>${room.bathtub}</td>
                <td>${room.petsAllowed}</td>
                <td>${room.roomService}</td>
                <td>${room.iron}</td>
                <td>${room.people}</td>
                <td>${room.status}</td>
                <td>${room.isActive ? 'Yes' : 'No'}</td>

                <td>
                    <button class="update-room-btn" data-roomid="${room.roomID}">Update Room</button>
                </td>

                <td>
                    <button class="delete-room-btn" data-roomid="${room.roomID}">Delete Room</button>
                </td>
            </tr>
        `;
        roomTableBody.insertAdjacentHTML('beforeend', row);
    });

    // Event listeners for updating room
    document.querySelectorAll('.update-room-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomId = e.target.getAttribute('data-roomid');
            const roomData = rooms.find(room => room.roomID == roomId);

            if (roomData) {
                openUpdateModal(roomData);
            }
        });
    });

    // Event listeners for deleting room
    document.querySelectorAll('.delete-room-btn').forEach(button => {
        button.addEventListener('click', (e) => {
            const roomId = e.target.getAttribute('data-roomid');
            toggleRoomActive(roomId);
        });
    });
}

async function openUpdateModal(roomData) {
    // Populate form fields with room data
    document.getElementById('roomID').value = roomData.roomID || '';
    document.getElementById('roomNumber').value = roomData.roomNumber || '';
    document.getElementById('roomTypeID').value = roomData.roomTypeID || '';
    document.getElementById('price').value = roomData.price || '';
    document.getElementById('bedType').value = roomData.bedType || '';
    document.getElementById('roomSize').value = roomData.roomSize || '';
    document.getElementById('viewType').value = roomData.viewType || '';
    document.getElementById('wifi').value = roomData.wifi || '';
    document.getElementById('breakfast').value = roomData.breakfast || '';
    document.getElementById('cableTV').value = roomData.cableTV || '';
    document.getElementById('transitCar').value = roomData.transitCar || '';
    document.getElementById('bathtub').value = roomData.bathtub || '';
    document.getElementById('petsAllowed').value = roomData.petsAllowed || '';
    document.getElementById('roomService').value = roomData.roomService || '';
    document.getElementById('iron').value = roomData.iron || '';
    document.getElementById('status').value = roomData.status || '';
    document.getElementById('people').value = roomData.people || '';
    document.getElementById('isActive').checked = roomData.isActive;

    // Show the modal
    document.getElementById('update-room-modal').style.display = 'block';
}

// Function to close the update modal
async function closeUpdateModal() {
    document.getElementById('update-room-modal').style.display = 'none';
}

// Function to submit the update form
async function submitUpdateForm() {
    // Lấy dữ liệu đã cập nhật từ biểu mẫu
    const updatedRoomData = {
        roomID: parseInt(document.getElementById('roomID').value) || 0,
        roomNumber: document.getElementById('roomNumber').value.trim(),
        roomTypeID: parseInt(document.getElementById('roomTypeID').value) || null,
        price: parseFloat(document.getElementById('price').value) || null,
        bedType: document.getElementById('bedType').value.trim(),
        roomSize: document.getElementById('roomSize').value.trim(),
        viewType: document.getElementById('viewType').value.trim(),
        wifi: document.getElementById('wifi').value.trim(),
        breakfast: document.getElementById('breakfast').value.trim(),
        cableTV: document.getElementById('cableTV').value.trim(),
        transitCar: document.getElementById('transitCar').value.trim(),
        bathtub: document.getElementById('bathtub').value.trim(),
        petsAllowed: document.getElementById('petsAllowed').value.trim(),
        roomService: document.getElementById('roomService').value.trim(),
        iron: document.getElementById('iron').value.trim(),
        status: document.getElementById('status').value.trim(),
        people: parseInt(document.getElementById('people').value) || 0,
        isActive: document.getElementById('isActive').checked
    };

    // Kiểm tra các trường dữ liệu cần thiết
    if (!updatedRoomData.roomNumber || !updatedRoomData.roomTypeID || !updatedRoomData.price) {
        showAlert('Các trường Room Number, Room Type ID và Price là bắt buộc.');
        return;
    }

    console.log('Updated Room Data:', updatedRoomData);

    try {
        const response = await fetch(`/api/Room/Update/${updatedRoomData.roomID}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedRoomData)
        });

        if (response.ok) {
            const result = await response.json();
            console.log('Room updated successfully:', result);
            showSuccessAlert(result.message || 'Room updated successfully');
            closeUpdateModal();
            fetchRooms(); // Làm mới danh sách phòng sau khi cập nhật
        } else {
            const result = await response.json();
            console.error('Failed to update room:', result);
            showAlert(result.message || 'Failed to update room');
        }
    } catch (error) {
        console.error('Error updating room:', error);
        showAlert('An error occurred while updating the room');
    }
}


// Update room function to update entire room data
//async function updateRoom(roomData) {
//    try {
//        const response = await fetch(`/api/Room/Update/${roomData.roomID}`, {
//            method: 'PUT',
//            headers: {
//                'Content-Type': 'application/json'
//            },
//            body: JSON.stringify(roomData)
//        });

//        const result = await response.json();
//        if (response.ok) {
//            console.log('Room updated successfully:', result);
//            showSuccessAlert(result.message || 'Room updated successfully');
//            fetchRooms(); // Refresh the room list to reflect the updated data
//        } else {
//            console.error('Failed to update room:', result);
//            showAlert(result.message || 'Failed to update room');
//        }
//    } catch (error) {
//        console.error('Error updating room:', error);
//    }
//}
// Delete room function to remove room by ID
async function toggleRoomActive(roomId) {
    try {
        const response = await fetch(`/api/Room/Delete/${roomId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
       
            showSuccessAlert(result.message || 'Room deleted successfully'); // Show success message
            fetchRooms(); // Reload the room list after deletion
        
    } catch (error) {
        console.error("Error deleting room:", error);
    }
}

async function showAlert(message) {
    const alertBox = document.getElementById('alert-box');
    const alertMessage = document.getElementById('alert-message');

    alertMessage.textContent = message; // Set the alert message
    alertBox.style.display = 'block'; // Show the alert box

    // Automatically hide the alert after 3 seconds
    setTimeout(() => {
        alertBox.classList.add('fade-out');
        setTimeout(() => {
            alertBox.style.display = 'none';
            alertBox.classList.remove('fade-out');
        }, 600); // Match the transition duration
    }, 800); // Show for 3 seconds
}
async function closeAlert() {
    const alertBox = document.getElementById('alert-box');
    alertBox.style.display = 'none'; // Close the alert
}

async function showSuccessAlert(message) {
    const successBox = document.getElementById('success-box');
    const successMessage = document.getElementById('success-message');

    successMessage.textContent = message; // Set the success message
    successBox.style.display = 'block'; // Show the success box

    // Automatically hide the success alert after 3 seconds
    setTimeout(() => {
        successBox.classList.add('fade-out');
        setTimeout(() => {
            successBox.style.display = 'none';
            successBox.classList.remove('fade-out');
        }, 600); // Match the transition duration
    }, 1000); // Show for 3 seconds
}

async function closeSuccessAlert() {
    const successBox = document.getElementById('success-box');
    successBox.style.display = 'none'; // Close the success alert
}

async function toggleUserActive(userId, isActive) {
    console.log('UserID:', userId, 'isActive:', isActive); // Log userID and isActive
    try {
        const response = await fetch(`/api/User/ToggleActive?userId=${userId}&isActive=${isActive}`, {
            method: 'POST', // Keep POST if that's how your API is designed
            headers: {
                'Content-Type': 'application/json'
            }
        });

        const result = await response.json();
        if (result.success) {
            alert(result.message); // Hiển thị thông báo thay đổi trạng thái thành công
            fetchUsers(); // Reload lại danh sách người dùng
        } else {
            alert("Update trang thai thanh cong");

        }
    } catch (error) {
        console.error("Error toggling user active status:", error);
    }
}

menuItems.forEach(item => {
    item.addEventListener('click', () => {
        // Lấy giá trị của thuộc tính data-page
        const page = item.getAttribute('data-page');

        // Cập nhật nội dung phần main-content
        mainContent.querySelector('header h1').textContent = pages[page].title;
        mainContent.querySelector('.content').innerHTML = pages[page].content;

        // Logic cho trang "Người dùng"
        if (page === 'nguoi-dung') {
            fetchUsers();
            setTimeout(() => {
                const searchBtn = document.getElementById('search-btn');
                const activeBtn = document.getElementById('active-btn');
                const inactiveBtn = document.getElementById('inactive-btn');
                const userTableBody = document.getElementById('user-table-body');
                let currentPage = 1;
                const rowsPerPage = 10;

                // Function to display the table rows for the current page
                function displayPage(page) {
                    const rows = Array.from(userTableBody.querySelectorAll('tr'));
                    rows.forEach((row, index) => {
                        row.style.display = (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) ? '' : 'none';
                    });
                }

                // Function to create pagination buttons
                function createPagination(totalRows) {
                    const paginationContainer = document.createElement('div');
                    paginationContainer.classList.add('pagination-container');
                    mainContent.querySelector('.content').appendChild(paginationContainer);

                    const totalPages = Math.ceil(totalRows / rowsPerPage);
                    paginationContainer.innerHTML = '';

                    for (let i = 1; i <= totalPages; i++) {
                        const btn = document.createElement('button');
                        btn.textContent = i;
                        btn.classList.add('pagination-btn');
                        if (i === currentPage) btn.classList.add('active');

                        btn.addEventListener('click', () => {
                            currentPage = i;
                            displayPage(currentPage);
                            document.querySelectorAll('.pagination-btn').forEach(button => button.classList.remove('active'));
                            btn.classList.add('active');
                        });
                        paginationContainer.appendChild(btn);
                    }
                }

                // Initial display and pagination setup
                displayPage(currentPage);
                createPagination(userTableBody.querySelectorAll('tr').length);

                // Event listeners for search and filter functionality
                searchBtn.addEventListener('click', () => {
                    const query = document.getElementById('search-input').value.toLowerCase();
                    const rows = Array.from(userTableBody.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const email = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
                        row.style.display = email.includes(query) ? '' : 'none';
                    });
                    currentPage = 1; // Reset to first page on new search
                    displayPage(currentPage);
                });

                activeBtn.addEventListener('click', () => {
                    const rows = Array.from(userTableBody.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const isActive = row.querySelector('td:nth-child(9)').textContent;
                        row.style.display = isActive === 'Yes' ? '' : 'none';
                    });
                    currentPage = 1;
                    displayPage(currentPage);
                });

                inactiveBtn.addEventListener('click', () => {
                    const rows = Array.from(userTableBody.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const isActive = row.querySelector('td:nth-child(9)').textContent;
                        row.style.display = isActive === 'No' ? '' : 'none';
                    });
                    currentPage = 1;
                    displayPage(currentPage);
                });
            }, 0); // Đảm bảo các phần tử đã tồn tại trước khi gắn sự kiện
        }

        if (page === 'phong') {
            fetchRooms(); // Function to fetch and render room data
            setTimeout(() => {
                const searchBtn = document.getElementById('room-search-btn');
                const availableBtn = document.getElementById('available-btn');
                const unavailableBtn = document.getElementById('unavailable-btn');
                const roomTableBody = document.getElementById('room-table-body');
                let currentPage = 1;
                const rowsPerPage = 10;

                // Function to display rows for the current page
                function displayPage(page) {
                    const rows = Array.from(roomTableBody.querySelectorAll('tr'));
                    rows.forEach((row, index) => {
                        row.style.display = (index >= (page - 1) * rowsPerPage && index < page * rowsPerPage) ? '' : 'none';
                    });
                }

                // Function to create pagination buttons
                function createPagination(totalRows) {
                    const paginationContainer = document.createElement('div');
                    paginationContainer.classList.add('pagination-container');
                    mainContent.querySelector('.content').appendChild(paginationContainer);

                    const totalPages = Math.ceil(totalRows / rowsPerPage);
                    paginationContainer.innerHTML = '';

                    for (let i = 1; i <= totalPages; i++) {
                        const btn = document.createElement('button');
                        btn.textContent = i;
                        btn.classList.add('pagination-btn');
                        if (i === currentPage) btn.classList.add('active');

                        btn.addEventListener('click', () => {
                            currentPage = i;
                            displayPage(currentPage);
                            document.querySelectorAll('.pagination-btn').forEach(button => button.classList.remove('active'));
                            btn.classList.add('active');
                        });
                        paginationContainer.appendChild(btn);
                    }
                }

                // Initial display and pagination setup
                displayPage(currentPage);
                createPagination(roomTableBody.querySelectorAll('tr').length);

                // Event listeners for search and filter functionality
                searchBtn.addEventListener('click', () => {
                    const query = document.getElementById('room-search-input').value.toLowerCase();
                    const rows = Array.from(roomTableBody.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const roomNumber = row.querySelector('td:nth-child(2)').textContent.toLowerCase();
                        row.style.display = roomNumber.includes(query) ? '' : 'none';
                    });
                    currentPage = 1; // Reset to first page on new search
                    displayPage(currentPage);
                });

                availableBtn.addEventListener('click', () => {
                    const rows = Array.from(roomTableBody.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const status = row.querySelector('td:nth-child(17)').textContent;
                        row.style.display = status === 'Available' ? '' : 'none';
                    });
                    currentPage = 1;
                    displayPage(currentPage);
                });

                unavailableBtn.addEventListener('click', () => {
                    const rows = Array.from(roomTableBody.querySelectorAll('tr'));
                    rows.forEach(row => {
                        const status = row.querySelector('td:nth-child(17)').textContent;
                        row.style.display = status === 'Not Available' ? '' : 'none';
                    });
                    currentPage = 1;
                    displayPage(currentPage);
                });
            }, 0); // Ensure elements exist before attaching events
        }
    
    });
});

// CSS for pagination buttons
const style = document.createElement('style');
style.innerHTML = `
    .pagination-container {
        text-align: center;
        margin-top: 20px;
    }

    .pagination-btn {
        padding: 8px 12px;
        margin: 0 4px;
        font-size: 14px;
        border: none;
        background-color: #007bff;
        color: #fff;
        border-radius: 4px;
        cursor: pointer;
    }

    .pagination-btn.active, .pagination-btn:hover {
        background-color: #0056b3;
    }
`;
document.head.appendChild(style);
