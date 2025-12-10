<script setup>
import { ref } from 'vue';

// Dữ liệu mẫu (Sample data)
// Trong ứng dụng thực tế, dữ liệu này sẽ được tải từ API
const user = ref({
    name: "Thanh Bui",
    email: "Bongdepchaii@example.com",
    phone: "0901234567",
    address: "Tan Phu HCM City, Vietnam"
});

const purchaseHistory = ref([
    {
        id: 'DH1001',
        date: '2024-10-01',
        total: 550000, // VND
        status: 'Đã giao hàng',
        details: [
            { name: "Áo thun cơ bản", qty: 2, price: 150000 },
            { name: "Quần Jeans Slim Fit", qty: 1, price: 250000 }
        ]
    },
    {
        id: 'DH1002',
        date: '2024-10-05',
        total: 800000,
        status: 'Đang xử lý',
        details: [
            { name: "Giày thể thao A", qty: 1, price: 800000 }
        ]
    },
    {
        id: 'DH1003',
        date: '2024-10-10',
        total: 120000,
        status: 'Đã hủy',
        details: [
            { name: "Mũ lưỡi trai X", qty: 1, price: 120000 }
        ]
    }
]);

// Hàm định dạng tiền tệ (cho dễ nhìn)
const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// State để quản lý việc mở/đóng chi tiết đơn hàng
const expandedOrderId = ref(null);

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
        <h1 class="text-center mb-4"></h1>
        
        <div class="row">
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
                                        <p class="mb-0"><strong>Id:</strong> {{ order.id }}</p>
                                        <p class="mb-0 text-muted">Date: {{ order.date }}</p>
                                    </div>
                                    <div class="order-price text-right">
                                        <p class="mb-0"><strong>{{ formatCurrency(order.total) }}</strong></p>
                                        <span 
                                            class="badge" 
                                            :class="{
                                                'badge-success': order.status === 'Đã giao hàng',
                                                'badge-warning': order.status === 'Đang xử lý',
                                                'badge-danger': order.status === 'Đã hủy'
                                            }"
                                        >
                                            {{ order.status }}
                                        </span>
                                    </div>
                                    <button 
                                        @click="toggleDetails(order.id)" 
                                        class="btn btn-outline-primary btn-sm ml-3"
                                    >
                                        <i class="fa" :class="expandedOrderId === order.id ? 'fa-angle-up' : 'fa-angle-down'">Check</i>
                                    </button>
                                </div>
                                
                                <div v-if="expandedOrderId === order.id" class="order-details mt-3 p-3 border-top">
                                    <h6>Chi tiết Đơn hàng {{ order.id }}:</h6>
                                    <table class="table table-sm table-bordered">
                                        <thead>
                                            <tr>
                                                <th>Sản phẩm</th>
                                                <th class="text-center">SL</th>
                                                <th class="text-right">Đơn giá</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr v-for="item in order.details" :key="item.name">
                                                <td>{{ item.name }}</td>
                                                <td class="text-center">{{ item.qty }}</td>
                                                <td class="text-right">{{ formatCurrency(item.price) }}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </li>
                            <li v-if="purchaseHistory.length === 0" class="list-group-item text-center text-muted">
                                Bạn chưa có đơn hàng nào.
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