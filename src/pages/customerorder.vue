<script setup>
import { ref, onMounted, computed } from 'vue';

const allOrders = ref([]);
const expandedOrderId = ref(null);
const shippingFee = 15500;
const allStatuses = ['Pending', 'Processing', 'Ship', 'Delivered', 'Canceled'];

// --- Biến cho Phân trang và Lọc ---
const currentPage = ref(1);
const ordersPerPage = 5; 
const searchQuery = ref('');
const filterStatus = ref(''); // Biến để lưu trạng thái lọc

// format vnd
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 VNĐ';
    const safeAmount = Math.abs(amount);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeAmount);
}

// 1. fetch all orders
const fetchAllOrders = async () => {
    try {
        const res = await fetch("/admin/orders");
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        allOrders.value = await res.json();
        
        // Đặt lại trang về 1 sau khi tải dữ liệu mới
        currentPage.value = 1;
    } catch (error) {
        console.error("Error fetching all orders:", error);
        alert("Lỗi khi tải dữ liệu đơn hàng.");
        allOrders.value = [];
    }
}

// 2. update status order 
const updateStatus = async (orderId, newStatus) => {
    // Trạng thái 'Canceled' không thể chuyển sang trạng thái khác
    const currentOrder = allOrders.value.find(o => o.id === orderId);
    
    if (currentOrder && currentOrder.status === 'Canceled') {
        alert("Đơn hàng đã hủy không thể thay đổi trạng thái.");
        return;
    }
    
    // Nếu là 'Canceled', yêu cầu xác nhận đặc biệt
    if (newStatus === 'Canceled' && !confirm(`Bạn có chắc muốn HỦY đơn hàng #${orderId} không?`)) {
        return;
    }

    if (newStatus !== 'Canceled' && !confirm(`Bạn có chắc muốn chuyển trạng thái đơn hàng #${orderId} sang "${newStatus}" không?`)) {
        return; 
    }
    
    try {
        const res = await fetch(`/admin/order/update/${orderId}`, {
            method: "PUT",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ status: newStatus })
        });
        const data = await res.json();

        if (res.ok) {
            alert(data.message);
            await fetchAllOrders(); 
        } else {
            alert(`Cập nhật thất bại: ${data.message || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error("Error updating order status:", error);
        alert("Có lỗi xảy ra khi cập nhật trạng thái.");
    }
}

// Hàm xác định trạng thái tiếp theo
const getNextStatus = (currentStatus) => {
    const statusMap = {
        'Pending': 'Processing',
        'Processing': 'Ship',
        'Ship': 'Delivered',
        'Delivered': 'Delivered', // Delivered là cuối cùng
        'Canceled': 'Canceled'    // Canceled không thay đổi
    };
    return statusMap[currentStatus];
}

// Toggle chi tiết đơn hàng
const toggleDetails = (orderId) => {
    if (expandedOrderId.value === orderId) {
        expandedOrderId.value = null;
    } else {
        expandedOrderId.value = orderId;
    }
}

// --- Logic Tìm kiếm và Lọc (Computed property) ---
const filteredOrders = computed(() => {
    const query = searchQuery.value.toLowerCase().trim();
    const status = filterStatus.value;

    return allOrders.value.filter(order => {
        const matchesSearch = !query || 
            String(order.id).includes(query) || 
            (order.customer_name && order.customer_name.toLowerCase().includes(query)) || 
            (order.address && order.address.toLowerCase().includes(query)) || 
            (order.phone && order.phone.includes(query));

        const matchesStatus = !status || order.status === status;

        return matchesSearch && matchesStatus;
    });
});


// --- Logic Phân trang (Computed property) ---
const totalPages = computed(() => {
    return Math.ceil(filteredOrders.value.length / ordersPerPage);
});

const paginatedOrders = computed(() => {
    const start = (currentPage.value - 1) * ordersPerPage;
    const end = start + ordersPerPage;
    return filteredOrders.value.slice(start, end);
});

// Chuyển trang
const goToPage = (page) => {
    if (page >= 1 && page <= totalPages.value) {
        currentPage.value = page;
        expandedOrderId.value = null; // Đóng chi tiết khi chuyển trang
    }
}

// Tạo mảng số trang để hiển thị
const pageNumbers = computed(() => {
    const pages = [];
    for (let i = 1; i <= totalPages.value; i++) {
        pages.push(i);
    }
    return pages;
});

onMounted(() => {
    fetchAllOrders();
});
</script>

<template>
    <body>
        <div class="container my-5 customer-order-management">
            <h1 class="text-center mb-5">Customer order</h1>
            
            <div class="row mb-4">
                <div class="col-md-4">
                    <select v-model="filterStatus" @change="goToPage(1)" class="form-control">
                        <option value="">-- Lọc theo Trạng thái --</option>
                        <option v-for="status in allStatuses" :key="status" :value="status">
                            {{ status }}
                        </option>
                    </select>
                </div>
                <div class="col-md-8">
                    <input 
                        type="text" 
                        class="form-control" 
                        placeholder="Tìm kiếm theo ID, Tên, Địa chỉ hoặc SĐT..." 
                        v-model="searchQuery"
                        @input="goToPage(1)"
                    >
                </div>
            </div>

            <div class="card shadow-sm history-card">
                <div class="card-header text-black font-weight-bold">
                    <i class="fa fa-list-alt mr-2"></i> List orders
                </div>
                <div class="card-body p-0">
                    <ul class="list-group list-group-flush">
                        <li v-if="filteredOrders.length === 0" class="list-group-item text-center text-muted">
                            No orders found.
                        </li>
                        <li v-for="order in paginatedOrders" :key="order.id" class="list-group-item"
                            :class="{ 'expanded': expandedOrderId === order.id }">
                            <div class="d-flex justify-content-between align-items-center order-summary">
                                <div class="order-info">
                                    <p class="mb-0"><strong>ID Order:</strong> #{{ order.id }}</p>
                                    <p class="mb-0 text-muted">Date: {{ new Date(order.date).toLocaleDateString('vi-VN')
                                    }}</p>
                                </div>
                                <div class="order-price text-right">
                                    <p class="mb-0"><strong>Total price: {{ formatCurrency(order.total) }}</strong></p>
                                    <span class="badge" :class="{
                                        'badge-secondary': order.status === 'Pending',
                                        'badge-warning': order.status === 'Processing',
                                        'badge-success': order.status === 'Delivered',
                                        'badge-info': order.status === 'Ship',
                                        'badge-danger': order.status === 'Canceled'
                                    }">
                                        {{ order.status }}
                                    </span>
                                </div>

                                <div class="admin-actions d-flex align-items-center">
                                    
                                    <template v-if="order.status !== 'Delivered' && order.status !== 'Canceled'">
                                        <button 
                                            @click="updateStatus(order.id, getNextStatus(order.status))"
                                            class="btn btn-sm btn-info"
                                        >
                                            Confirm to {{ getNextStatus(order.status) }}
                                        </button>
                                        <button 
                                            @click="updateStatus(order.id, 'Canceled')"
                                            class="btn btn-sm btn-danger ml-2"
                                            style="margin-left: 10px;"
                                        >
                                            Cancel
                                        </button>
                                    </template>
                                    <span v-else class="text-muted mr-3" style="min-width: 150px;">
                                        {{ order.status === 'Delivered' ? 'Completed' : 'Canceled' }}
                                    </span>

                                    <button style="margin-left: 15px;" @click="toggleDetails(order.id)"
                                        class="btn btn-outline-primary btn-sm ml-2">
                                        <i class="fa"
                                            :class="expandedOrderId === order.id ? 'fa-angle-up' : 'fa-angle-down'"></i>
                                        Check
                                    </button>
                                </div>
                            </div>

                            <div v-if="expandedOrderId === order.id" class="order-details mt-3 p-3 border-top">
                                <div class="receiver-info mb-3 p-2 bg-light border rounded">
                                    <h6><i class="fa fa-user-circle mr-1"></i>Customer:</h6>
                                    <p class="mb-1"><strong>Name:</strong> {{ order.customer_name }}</p>
                                    <p class="mb-1"><strong>Number Phone:</strong> {{ order.phone }}</p>
                                    <p class="mb-0"><strong>Address:</strong> {{ order.address }}</p>
                                </div>

                                <h6>Product details #{{ order.id }}:</h6>
                                <table class="table table-sm table-bordered">
                                    <thead>
                                        <tr>
                                            <th>Product</th>
                                            <th class="text-center">SL</th>
                                            <th class="text-right">Price (Unit)</th>
                                            <th class="text-right">Total (Item)</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr v-for="item in order.details" :key="item.name">
                                            <td>{{ item.name }}</td>
                                            <td class="text-center">{{ item.qty }}</td>
                                            <td class="text-right">{{ formatCurrency(item.price) }}</td>
                                            <td class="text-right">{{ formatCurrency(item.qty * item.price) }}</td>
                                        </tr>
                                        <tr class="table-secondary">
                                            <td colspan="3" class="text-right font-weight-bold">Sub total:</td>
                                            <td class="text-right font-weight-bold">{{ formatCurrency(order.total -
                                                shippingFee) }}</td>
                                        </tr>
                                        <tr>
                                            <td colspan="3" class="text-right">Ship:</td>
                                            <td class="text-right">{{ formatCurrency(shippingFee) }}</td>
                                        </tr>
                                        <tr class="font-weight-bold table-info">
                                            <td colspan="3" class="text-right">Total payment:</td>
                                            <td class="text-right text-primary">{{ formatCurrency(order.total) }}</td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        </li>
                    </ul>
                </div>
                <div class="card-footer d-flex justify-content-center" v-if="totalPages > 1">
                    <nav aria-label="Order pagination">
                        <ul class="pagination mb-0">
                            <li class="page-item" :class="{ disabled: currentPage === 1 }">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage - 1)">Back</a>
                            </li>
                            <li class="page-item" v-for="page in pageNumbers" :key="page"
                                :class="{ active: currentPage === page }">
                                <a class="page-link" href="#" @click.prevent="goToPage(page)">{{ page }}</a>
                            </li>
                            <li class="page-item"
                                :class="{ disabled: currentPage === totalPages || totalPages === 0 }">
                                <a class="page-link" href="#" @click.prevent="goToPage(currentPage + 1)">Next</a>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </div>
    </body>
</template>

<style scoped>
/* Thêm các styles cần thiết */

body {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 400;
}

.customer-order-management {
    max-width: 1400px;
}

.history-card {
    border: 1px solid #dee2e6;
}

.card-header {
    background-color: #f8f9fa;
    border-bottom: 1px solid #dee2e6;
}

.list-group-item {
    cursor: pointer;
    transition: background-color 0.2s;
    border-color: #dee2e6;
}

.list-group-item:hover {
    background-color: #f1f1f1;
}

.order-summary {
    padding: 10px 0;
}

.badge {
    padding: 5px 8px;
    border-radius: 10px;
    font-size: 0.85em;
    display: inline-block;
    min-width: 80px;
    text-align: center;
}

.badge-success {
    background-color: #28a745;
    color: white;
}

.badge-warning {
    background-color: #ffc107;
    color: #212529;
}

.badge-info {
    background-color: #17a2b8;
    color: white;
}

.badge-secondary {
    background-color: #6c757d;
    color: white;
    /* Chữ trắng */
}

.badge-danger {
    background-color: #dc3545;
    color: white;
}

.order-details table {
    margin-bottom: 0;
}

/* Thêm style cho Select box */
.status-select {
    width: 150px;
    /* Điều chỉnh chiều rộng theo ý muốn */
    min-width: 120px;
    border-radius: 0.25rem;
    border: 1px solid #ced4da;
}

.form-control {
    box-shadow: none;
}

/* Thêm style cho thông tin người nhận */
.receiver-info {
    font-size: 0.95em;
}
</style>