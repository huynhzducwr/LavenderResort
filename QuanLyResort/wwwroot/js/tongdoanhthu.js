function calculateRevenue() {
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // Lưu ý: tháng trong JS bắt đầu từ 0

    let dailyRevenue = 0;
    let monthlyRevenue = 0;
    let yearlyRevenue = 0;

    reservationData.forEach(reservation => {
        const bookingDate = new Date(reservation.bookingDate);
        const revenue = reservation.totalCost;

        // Tính doanh thu theo ngày
        if (bookingDate.toDateString() === today.toDateString()) {
            dailyRevenue += revenue;
        }

        // Tính doanh thu theo tháng
        if (bookingDate.getFullYear() === currentYear && bookingDate.getMonth() === currentMonth) {
            monthlyRevenue += revenue;
        }

        // Tính doanh thu theo năm
        if (bookingDate.getFullYear() === currentYear) {
            yearlyRevenue += revenue;
        }
    });

    // Hiển thị doanh thu
    document.getElementById('daily-revenue').textContent = `${dailyRevenue.toLocaleString()}đ`;
    document.getElementById('monthly-revenue').textContent = `${monthlyRevenue.toLocaleString()}đ`;
    document.getElementById('yearly-revenue').textContent = `${yearlyRevenue.toLocaleString()}đ`;
}

// Gọi hàm tính doanh thu sau khi dữ liệu được tải
async function fetchReservations(filter = null) {
    let url = '/api/Reservation/All';
    if (filter) {
        url += `?filter=${filter}`;
    }

    try {
        const response = await fetch(url);
        if (response.ok) {
            const result = await response.json();
            console.log(result);
            if (result && Array.isArray(result.data)) {
                reservationData = result.data;
                filteredData = reservationData;
                displayReservations();
                updatePaginationControls();
                calculateRevenue(); // Gọi hàm tính toán doanh thu
            } else {
                console.error("Unexpected data format:", result);
            }
        } else {
            console.error("Error fetching reservations:", response.statusText);
        }
    } catch (error) {
        console.error("Network error:", error);
    }
}