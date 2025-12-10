<script>

export default {
    data() {
        return {
            totalcart: {},
            data: [],
            currenpage: 1,
            limit: 5,
            totalPages: 0
        };
    },


    methods: {
        // hide data product to cart
        async fetchdata(page, limit) {
            const url = `cart/${page}/${limit}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("failed to fetch data error");
                };
                console.log("fetch: url ", url);
                this.data = await res.json();
                console.log("data error", this.data);
            } catch (error) {
                console.error("error fetching data: ", error);
                this.data = [];
            }
        },
        // page item cart
        async fetchdatatoal(limit) {
            const url = "/cartcount";
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to fetch total count from server");
                };
                const result = await res.json();
                const totalcount = result.total;
                this.totalPages = Math.ceil(totalcount / limit);
                console.log("total pages: ", this.totalPages);
            } catch (error) {
                console.error("error fetching total pages", error);
                this.totalPages = 0;
            }
        },
        // remove cart
        async deleteCart(id) {
            if (!confirm(`Are you sure remove product: ${id}?`)) {
                return;
            }
            try {
                const url = `/deletecart/${id}`;
                const res = await fetch(url, {
                    method: "DELETE",
                });
                if (res.ok) {
                    alert(`Delete product Id: ${id} successfly.`);
                    await this.fetchdata(this.currenpage, this.limit);
                } else {
                    const err = await res.json();
                    alert(`Error delete product: ${res.status} - ${err.message || 'Error not xac dinh'}`);
                }
            } catch (error) {
                console.error('Error delete product: ', error);
                alert('Co Error xay ra khi xoa product.');
            }
        },
        // order
        async fetchdatacart() {
            const url = "/order";
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("failed to fetch data order error");
                };
                console.log("fetch: url ", url);
                this.totalcart = await res.json();
                console.log("data order error", this.totalcart);
            } catch (error) {
                console.error("Error fetching order data: ", error);
                this.totalcart = [];
            }
        },
        // formart vnđ
        formatCurrency(value) {
            if (value == null) return '0 VNĐ';
            return new Intl.NumberFormat('vi-VN', {
                style: 'currency',
                currency: 'VND'
            }).format(value);
        },
        async completePayment() {
            if (!this.data || this.data.length === 0) {
                alert('Giỏ hàng trống! Vui lòng thêm sản phẩm để thanh toán.');
                return;
            }

            const shippingCost = 15000; // Lấy từ phần hiển thị của bạn
            const totalAmount = this.totalcart.total_price_cart + shippingCost;

            // Bạn có thể thêm một modal để nhập thông tin thanh toán (COD, Credit Card,...) 
            // Ở đây tôi dùng prompt đơn giản và mặc định là COD
            const paymentMethod = prompt("Vui lòng nhập phương thức thanh toán (ví dụ: COD, VISA):", "COD");

            if (!paymentMethod) {
                alert('Vui lòng chọn phương thức thanh toán.');
                return;
            }

            try {
                const url = "/complete-order"; // API mới sẽ được tạo trong Node.js
                const res = await fetch(url, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    // Gửi dữ liệu giỏ hàng, tổng tiền, phương thức thanh toán lên server
                    body: JSON.stringify({
                        cartItems: this.data,
                        totalAmount: totalAmount,
                        payment: paymentMethod,
                        // Trong thực tế cần có: user_id, shipping_address
                    }),
                });

                if (res.ok) {
                    alert("Đơn hàng đã được đặt thành công! Giỏ hàng sẽ được làm trống.");
                    // Cập nhật lại giỏ hàng và tổng tiền sau khi đặt hàng thành công
                    await this.fetchdata(this.currenpage, this.limit);
                    await this.fetchdatatoal(this.limit);
                    await this.fetchdatacart();
                } else {
                    const err = await res.json();
                    alert(`Lỗi khi đặt hàng: ${err.message || 'Lỗi không xác định.'}`);
                }
            } catch (error) {
                console.error("Lỗi network/server khi đặt hàng: ", error);
                alert("Đã xảy ra lỗi kết nối. Vui lòng thử lại.");
            }
        },
        // page
        gotoPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currenpage = page;
            this.fetchdata(this.currenpage, this.limit);
        },
    },
    // reload
    mounted() {
        this.fetchdata(this.currenpage, this.limit);
        this.fetchdatatoal(this.limit);
        this.fetchdatacart();
    }
}
</script>
<template>

    <body>
        <div class="container">
            <h2>Cart</h2>
            <div class="row" style="position: relative;">
                <div class="col-md-8" v-for="cart in data" :key="cart.id">
                    <div class="row">
                        <img :src="`../../public/images/${cart.img}`" alt="product-image">
                        <div class="col-md-9">
                            <div class="productorremove">
                                <h5 style="">{{ cart.nameproduct }}</h5>
                                <i class="bi bi-trash3 btn btn-outline-danger" @click="deleteCart(cart.id)"></i>
                            </div>
                            <p>Price: {{ cart.price }} VND</p>
                            <p>Quantity: {{ cart.quantitycart }}</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 card p-3 card-body card-1" style="position: absolute; right: 15px;">
                    <h3>Order Detail</h3>
                    <p>Product: {{ totalcart.total_quantity_cart }}</p>
                    <p>Price: {{ formatCurrency(totalcart.total_price_cart) }}</p>
                    <p>Shipper: 15.500 ₫</p>
                    <hr>
                    <div class="total">
                        <p>Total:</p>
                        <p style="font-weight: bold; color: blue;">{{ formatCurrency(totalcart.total_price_cart + +
                            15000) }}</p>
                    </div>
                    <button class="btn btn-primary" @click="completePayment()">Complete Payment</button>
                </div>
            </div>

            <div class="row gx-5 mt-5">
                <h2>Related products</h2>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764035310550-iphone-8-plus-64gb-128gb-256gb-cu-like-new-99-qkm-4-1.jpg"
                        alt="related-product-image">
                    <h5>Name product 1</h5>
                    <p>Price: 0 VND</p>
                    <button class="btn btn-light">Add to cart</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764047793297-54923-iphone-5s-32gb-quoc-te-den.jpg"
                        alt="related-product-image">
                    <h5>Name product 2</h5>
                    <p>Price: 0 VND</p>
                    <button class="btn btn-light">Add to cart</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764053104965-(600x600)_samsung_galaxy_a16_5g_trang_thumb_1.jpg"
                        alt="related-product-image">
                    <h5>Name product 3</h5>
                    <p>Price: 0 VND</p>
                    <button class="btn btn-light">Add to cart</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764221093268-download (1).jpg" alt="related-product-image">
                    <h5>Name product 4</h5>
                    <p>Price: 0 VND</p>
                    <button class="btn btn-light">Add to cart</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764221093268-download (1).jpg" alt="related-product-image">
                    <h5>Name Product 5</h5>
                    <p>Price: 0 VND</p>
                    <button class="btn btn-light">Add to cart</button>
                </div>
            </div>
        </div>
    </body>
</template>

<style scoped>
body {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 400;
    /* background-color: #f8f9fa; */
}

div.container {
    margin-top: 20px;
    /* max-width: 1300px; */
    margin-bottom: 100px;
}

div.col-md-8 div.row img {
    width: 200px;
    height: auto;
}

div.col-md-8 div.row {
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
}

div.productorremove {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-1 {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    height: fit-content;
    margin-left: 15px;
    width: 31%;
}

.card-1 h3 {
    font-weight: 600;
    margin-bottom: 20px;
}

.card-2 {
    width: 258px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    text-align: center;
    margin: 5px;
}

.card-2 img {
    width: 100%;
    padding: 15px;
    height: auto;
}

h2 {
    margin-bottom: 20px;
}

div.card-1 p {
    font-size: 18px;

}

div.total {
    font-size: 20px;
    display: flex;
    justify-content: space-between;
}
</style>