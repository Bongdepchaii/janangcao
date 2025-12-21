<script>

export default {
    data() {
        return {
            plusquantity: {},
            minusquantity: {},
            totalcart: {},
            data: [],
            currenpage: 1,
            limit: 5,
            totalPages: 0,
            customer_name: '',
            address: '',
            phone: '',
            isLoading: true
        };
    },


    methods: {
        // hide data product to cart
        async fetchdata(page, limit) {
            const url = `cart/${page}/${limit}`;
            this.isLoading = true;
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
            } finally {
                // sau khi hoan thanh fetch data
                this.isLoading = false;
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
        // plus
        async plus(id) {
            const url = `/plusquantity/${id}`;
            try {
                const res = await fetch(url, {
                    method: "PATCH",
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch pllus quantity order error");
                };
                console.log("Fetch plus: url ", url);
                this.plusquantity = await res.json();
                console.log("Data not plus error ", this.plusquantity);
                await this.fetchdata(this.currenpage, this.limit);
                await this.fetchdatacart();
                // await this.fetchdatatotal(this.limit);
            } catch (error) {
                console.error("error fetching plusquantity: ", error);
            }
        },
        // minus
        async minus(id) {
            const url = `/minusquantity/${id}`;
            try {
                const res = await fetch(url, {
                    method: "PATCH",
                });
                if (!res.ok) {
                    throw new Error("Failed to fetch menus quantity order error");
                };
                console.log("Fetch menus: url ", url);
                this.menusquantity = await res.json();
                console.log("data not menus error ", this.menusquantity);
                await this.fetchdata(this.currenpage, this.limit);
                await this.fetchdatacart();
                // await this.fetchdatatotal(this.limit);
            } catch (error) {
                console.error("error fetching Menus Quantity product cart: ", error);
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
        // complete payment
        async completePayment() {
            // check thong tin nhan hang
            if (!this.customer_name || !this.address || !this.phone) {
                alert("Please Enter name, address, numberphone.");
                return;
            }

            const paymentData = {
                customer_name: this.customer_name,
                address: this.address,
                phone: this.phone
            };

            try {
                const res = await fetch("/payment/complete", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(paymentData),
                });
                const data = await res.json();
                alert(data.message);

                // Reset form data sau khi hoàn tất
                this.customer_name = '';
                this.address = '';
                this.phone = '';

                await this.fetchdata(this.currenpage, this.limit);
                await this.fetchdatatoal(this.limit);
                await this.fetchdatacart();
            } catch (error) {
                console.error("Error during payment:", error);
                alert("Error payment.");
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
            <div v-if="isLoading">
                <h1>Loading...</h1>
            </div>
            <div class="row" style="position: relative;" v-else-if="data && data.length > 0">
                <div class="col-md-8" v-for="cart in data" :key="cart.id">
                    <div class="row">
                        <img :src="`../../public/images/${cart.img}`" alt="product-image">
                        <div class="col-md-9">
                            <div class="productorremove">
                                <h5 style="">{{ cart.nameproduct }}</h5>
                                <i class="bi bi-trash3 btn btn-outline-danger" @click="deleteCart(cart.id)"></i>
                            </div>
                            <p>Price: {{ cart.price }} VND</p>
                            <p>Quantity: <Button @click="minus(cart.id)" class="btn btn-outline-primary">-</Button> {{
                                cart.quantitycart }}<button class="btn btn-outline-primary"
                                    @click="plus(cart.id)">+</button></p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 card p-3 card-body card-1" style="position: absolute; right: 15px;">
                    <h3>Order Detail</h3>
                    <div class="mb-3">
                        <input type="text" class="form-control" id="customer_name" v-model="customer_name" required
                            placeholder="Enter name">
                    </div>
                    <div class="mb-3">
                        <input type="text" class="form-control" id="address" v-model="address" required
                            placeholder="Enter Address">
                    </div>
                    <div class="mb-3">
                        <input type="tel" class="form-control" id="phone" v-model="phone" required
                            placeholder="Enter phone number">
                    </div>
                    <hr>
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

            <div v-else>
                <h1>Your cart is empty.</h1>
                <router-link to="/" class="nav-link">Start shopping now!</router-link>
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
    font-size: 15px;

}

div.total {
    font-size: 20px;
    display: flex;
    justify-content: space-between;
}

hr {
    margin: 5px;
}

button {
    margin: 5px;
}
</style>