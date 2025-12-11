<script setup>
import { ref, onMounted } from 'vue'; // 1. Import onMounted

// State để quản lý dữ liệu thực tế
const purchaseHistory = ref([]); // Đã xóa dữ liệu mẫu
const expandedOrderId = ref(null);

// Hàm định dạng tiền tệ (giữ nguyên)
const formatCurrency = (amount) => {
    if (amount === undefined || amount === null) return '0 VNĐ';
    // Lấy giá trị tuyệt đối để tránh lỗi định dạng nếu total là 0 hoặc null
    const safeAmount = Math.abs(amount);
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeAmount);
}

// Hàm tải lịch sử đơn hàng từ API
const fetchHistory = async () => {
    try {
        const res = await fetch("/order/history");
        if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
        }
        purchaseHistory.value = await res.json();
        console.log("History loaded:", purchaseHistory.value);
    } catch (error) {
        console.error("Error fetching order history:", error);
        alert("Lỗi khi tải lịch sử đơn hàng. Vui lòng kiểm tra console.");
        purchaseHistory.value = [];
    }
}

// Hàm hủy đơn hàng
const cancelOrder = async (id) => {
    if (!confirm(`Bạn có chắc muốn hủy đơn hàng ID: ${id}?`)) {
        return;
    }
    try {
        const res = await fetch(`/order/cancel/${id}`, { method: "PUT" });
        const data = await res.json();
        
        if (res.ok) {
            alert(data.message);
            // Reload history sau khi hủy
            await fetchHistory();
        } else {
             alert(`Hủy đơn hàng thất bại: ${data.message || 'Lỗi không xác định'}`);
        }
    } catch (error) {
        console.error("Error canceling order:", error);
        alert("Có lỗi xảy ra khi hủy đơn hàng.");
    }
}

// Tải dữ liệu khi component được mount
onMounted(async () => {
    await fetchHistory();
});


// Dữ liệu người dùng (Giữ nguyên hoặc bạn có thể fetch từ API khác)
const user = ref({
    name: "Thanh Bui",
    email: "Bongdepchaii@example.com",
    phone: "0901234567",
    address: "Tan Phu HCM City, Vietnam"
});


// State và hàm quản lý việc mở/đóng chi tiết đơn hàng (giữ nguyên)
const toggleDetails = (orderId) => {
    if (expandedOrderId.value === orderId) {
        expandedOrderId.value = null;
    } else {
        expandedOrderId.value = orderId;
    }
}
</script>

<template>
    <body>
        <div class="container my-5 user-profile-page">
            <h1 class="text-center mb-4">Profile</h1> <div class="row">
                <div class="col-lg-4 col-md-12 mb-4">
                    <div class="card shadow-sm profile-card">
                        <div class="card-header text-black">
                            <i class="fa fa-user-circle mr-2"></i>User profile
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                                <strong><i class="fa fa-id-card-o mr-2"></i>Name:</strong>
                                <p class="card-text">{{ user.name }}</p>
                            </div>
                            <div class="mb-3">
                                <strong><i class="fa fa-envelope mr-2"></i>Email:</strong>
                                <p class="card-text">{{ user.email }}</p>
                            </div>
                            <div class="mb-3">
                                <strong><i class="fa fa-phone mr-2"></i>Phone:</strong>
                                <p class="card-text">{{ user.phone }}</p>
                            </div>
                            <div>
                                <strong><i class="fa fa-map-marker mr-2"></i>Address:</strong>
                                <p class="card-text">{{ user.address }}</p>
                            </div>
                            <button class="btn btn-outline-primary mt-3 w-100">
                                <i class="fa fa-pencil"></i> Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                <div class="col-lg-8 col-md-12">
                    <div class="card shadow-sm history-card">
                        <div class="card-header text-black">
                            <i class="fa fa-history mr-2"></i> History order
                        </div>
                        <div class="card-body p-0">
                            <ul class="list-group list-group-flush">
                                <li 
                                    v-for="order in purchaseHistory" 
                                    :key="order.id" 
                                    class="list-group-item"
                                    :class="{ 'expanded': expandedOrderId === order.id }"
                                >
                                    <div class="d-flex justify-content-between align-items-center order-summary">
                                        <div class="order-info">
                                            <p class="mb-0"><strong>Id:</strong> #{{ order.id }}</p>
                                            <p class="mb-0 text-muted">Date: {{ new Date(order.date).toLocaleDateString('vi-VN') }}</p>
                                        </div>
                                        <div class="order-price text-right">
                                            <p class="mb-0"><strong>{{ formatCurrency(order.total) }}</strong></p>
                                            <span 
                                                class="badge" 
                                                :class="{
                                                    'badge-success': order.status === 'Pending',
                                                    'badge-warning': order.status === 'Delivered',
                                                    'badge-danger': order.status === 'Canceled'
                                                }"
                                            >
                                                {{ order.status }}
                                            </span>
                                        </div>
                                        <div class="d-flex align-items-center">
                                            <button 
                                                v-if="order.status === 'Pending'" 
                                                @click.stop="cancelOrder(order.id)" 
                                                class="btn btn-outline-danger btn-sm ml-3"
                                                style="margin-right: 10px;"
                                            >
                                                Cannel
                                            </button>
                                            
                                            <button 
                                                @click="toggleDetails(order.id)" 
                                                class="btn btn-outline-primary btn-sm ml-3"
                                            >
                                                <i class="fa" :class="expandedOrderId === order.id ? 'fa-angle-up' : 'fa-angle-down'"></i> Check
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div v-if="expandedOrderId === order.id" class="order-details mt-3 p-3 border-top">
                                        <h6>Order details {{ order.id }}:</h6>
                                        <table class="table table-sm table-bordered">
                                            <thead>
                                                <tr>
                                                    <th>Product</th>
                                                    <th class="text-center">Quantity</th>
                                                    <th class="text-right">Price</th>
                                                    <th class="text-right">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr v-for="item in order.details" :key="item.name">
                                                    <td>{{ item.name }}</td>
                                                    <td class="text-center">{{ item.qty }}</td>
                                                    <td class="text-right">{{ formatCurrency(item.price) }}</td>
                                                    <td class="text-right">
                                                        {{ formatCurrency(item.qty * item.price) }}
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td colspan="3" class="text-right">Ship:</td>
                                                    <td class="text-right">{{ formatCurrency(15500) }}</td>
                                                </tr>
                                                <tr class="font-weight-bold">
                                                    <td colspan="3" class="text-right">Total Payment:</td>
                                                    <td class="text-right text-primary">{{ formatCurrency(order.total) }}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </li>
                                <li v-if="purchaseHistory.length === 0" class="list-group-item text-center text-muted">
                                    Not empty history order
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </body>
</template>

<style scoped>
    body{
        font-family: Arial, Helvetica, sans-serif;
        font-weight: 400;
    }
.user-profile-page {
    max-width: 1200px;
}

.profile-card .card-header, .history-card .card-header {
    font-weight: bold;
    font-size: 1.1em;
}

.profile-card p.card-text {
    margin-bottom: 0;
    margin-left: 15px;
}

/* Lịch sử Mua hàng */
.list-group-item {
    transition: background-color 0.3s ease;
    cursor: pointer;
}

.list-group-item.expanded {
    background-color: #f8f9fa; /* Màu nền nhẹ khi mở rộng */
}

.order-summary {
    padding: 10px 0;
}

.order-details {
    background-color: #ffffff;
    border-radius: 5px;
}

.order-price .badge {
    font-size: 0.85em;
    padding: 5px 8px;
    border-radius: 10px;
    font-weight: 500;
}

/* Bootstrap 4 badges */
.badge-success { background-color: #28a745; color: white; }
.badge-warning { background-color: #ffc107; color: #212529; }
.badge-danger { background-color: #dc3545; color: white; }
.btn-outline-info {
    border-color: #17a2b8;
    color: #17a2b8;
}
.btn-outline-info:hover {
    background-color: #17a2b8;
    color: white;
}
</style>