<script>
// import { ref } from 'vue';


// const Id = ref("");
// const Name = ref("");
// const Quantity = ref("");
// const Price = ref("");
// const ImgFile = ref(null);


// hide product here
export default {
    data() {
        return {
            data: null,
            currenpage: 1,
            limit: 10,
            totalPages: 0,

            Name: "",
            Quantity: null,
            Price: null,
            ImgFile: null
        };
    },
    methods: {

        async fetchData(page, limit) {
            const url = `/api/${page}/${limit}`;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to fetch data from server");
                };
                console.log("fetch url: ", url);
                this.data = await res.json();
                console.log("data load: ", this.data);
            } catch (error) {
                console.error("Error fetching data: ", error);
                this.data = [];
            }
        },
        async fetchTotalPages(limit) {
            const url = `/productcount `;
            try {
                const res = await fetch(url);
                if (!res.ok) {
                    throw new Error("Failed to fetch total count from server");
                };
                const result = await res.json();
                const totalCount = result.total;
                this.totalPages = Math.ceil(totalCount / limit);
                console.log("total pages: ", this.totalPages);
            } catch (error) {
                console.error("Error fetching total count: ", error);
                this.totalPages = 0;
            }
        },
        async deleteProduct(productId) {
            if (!confirm(`Bạn có chắc chắn muốn xóa sản phẩm ID: ${productId} không?`)) {
                return; // Người dùng hủy bỏ
            }

            try {
                // Đảm bảo URL /deleteproduct được định nghĩa trong vite.config.js
                const url = `/deleteproduct/${productId}`;

                const response = await fetch(url, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert(`Đã xóa sản phẩm ID: ${productId} thành công.`);

                    await this.fetchData(this.currenpage, this.limit);

                } else {
                    const errorData = await response.json();
                    alert(`Lỗi xóa sản phẩm: ${response.status} - ${errorData.message || 'Lỗi không xác định.'}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Có lỗi xảy ra trong quá trình xóa sản phẩm.');
            }
        },
        gotoPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currenpage = page;
            this.fetchData(this.currenpage, this.limit);
        },
        handleFileUpload(event) {
            // ImgFile.value = event.target.files[0];
            this.ImgFile = event.target.files[0];
        },

        async addproduct() {
            const formData = new FormData();

            formData.append('Name', this.Name);
            formData.append('Quantity', this.Quantity);
            formData.append('Price', this.Price);

            if (this.ImgFile) {
                formData.append('image', this.ImgFile);
            }

            const response = await fetch("/addproduct", {
                method: "POST",
                // QUAN TRỌNG: BỎ header "Content-type": "application/json"
                // Trình duyệt sẽ tự động thiết lập Content-Type: multipart/form-data
                // headers: { "Content-type": "application/json" }, // BỎ DÒNG NÀY
                body: formData // Gửi FormData thay vì JSON
            });

            if (!response.ok) {
                const errorData = await response.json(); // Server trả về JSON lỗi
                alert(`Lỗi: ${response.status} - ${errorData.message}`);
                return;
            }

            const data = await response.json();
            alert(data.message);

            // Reset form
            this.Name = "";
            this.Quantity = null;
            this.Price = null;
            this.ImgFile = null;

            await this.fetchData(this.currenpage, this.limit);
        }
    },

    async mounted() {
        await this.fetchTotalPages(this.limit);
        await this.fetchData(this.currenpage, this.limit);
    }
};



</script>
<template>
    <div class="container">
        <form action="" @submit.prevent="addproduct" class="addproduct">
            <h1>Thêm Sản phẩm!!</h1>
            <!-- <input class="form-control" type="hidden" v-model="Id" id="Id" placeholder="Nhập ID"> -->
            <input class="form-control" type="text" v-model="Name" id="Name" placeholder="Nhập tên sản phẩm">
            <input class="form-control" type="number" v-model="Quantity" id="Quantity" placeholder="Nhập số lượng">
            <input class="form-control" type="number" v-model="Price" id="Price" placeholder="Nhập giá bán">
            <span> Thêm hình ảnh</span>
            <input class="form-control" type="file" @change="handleFileUpload">
            <button class="btn btn-success">Thêm</button>
        </form>
        <h1>Các sản phẩm hiện tại đang ở đây!</h1>
        <br>
        <table class="table">
            <thead>
                <tr>
                    <th scope="col">Id</th>
                    <th scope="col">Name</th>
                    <th scope="col">Quantity</th>
                    <th scope="col">Price</th>
                    <th scope="col">Image</th>
                    <th scope="col">Act</th>
                </tr>
            </thead>
            <tbody>
                <tr v-for="product in data" :key="product.id">
                    <th scope="row">{{ product.id }}</th>
                    <td>{{ product.name }}</td>
                    <td>{{ product.quantity }}</td>
                    <td>{{ product.price }}</td>
                    <td><img :src="product.img" alt="" style="max-width: 70px;"></td>
                    <td>
                        <button class="btn btn-primary" style="margin-right: 10px;">Edit</button>
                        <button class="btn btn-outline-danger" @click="deleteProduct(product.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="filter-page-container" v-if="totalPages > 1">
            <button @click="gotoPage(currenpage - 1)" :disabled="currenpage === 1">Trước</button>
            <button v-for="page in totalPages" :key="page" @click="gotoPage(page)"
                :class="{ active: currenpage === page }">{{ page }}</button>
            <button @click="gotoPage(currenpage + 1)" :disabled="currenpage === totalPages">Sau</button>
        </div>
    </div>

</template>
<style scoped>
h1 {
    font-size: 1.5rem;
    font-weight: 400;

}

div.container {
    margin-top: 20px;
    max-width: 1100px;
}

input {
    margin: 20px 0px;
}

form {
    width: 50%;
    margin: 50px auto;
}

.addproduct {
    box-shadow: 1px 1px 10px #ccc;
    padding: 20px;
}

/* button */
div.filter-page-container button {
    margin: 0 2.5px;
    padding: 5px 10px;
    border: 0.5px solid #007bff;
    text-align: right;
}

div.filter-page-container button.active {
    background-color: #007bff;
    color: white;
}

div.filter-page-container {
    margin-top: 20px;
    margin-bottom: 100px;
    /* justify-content: center; */
    text-align: left;
}
</style>