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

            // add
            Name: "",
            Quantity: null,
            Price: null,
            ImgFile: null,
            previewUrl: null,

            // edit
            editingProduct: null, 
            editName: "",
            editQuantity: null,
            editPrice: null,
            editImgFile: null, 
            editPreviewUrl: null 
        };
    },

    methods: {
        // page
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
            if (!confirm(`are you sure delete product ID: ${productId}?`)) {
                return; 
            }
            try {
                // url dinh nghia dung voi vite.config.js
                const url = `/deleteproduct/${productId}`;

                const response = await fetch(url, {
                    method: 'DELETE',
                });

                if (response.ok) {
                    alert(`delete product ID: ${productId} successfly.`);

                    await this.fetchData(this.currenpage, this.limit);

                } else {
                    const errorData = await response.json();
                    alert(`Error delete product: ${response.status} - ${errorData.message || 'Error not xac dinh.'}`);
                }
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('Co error xay ra khi xoa product.');
            }
        },
        formatCurrency (amount) {
            if (amount === undefined || amount === null) return '0 VNĐ';
            const safeAmount = Math.abs(amount);
            return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(safeAmount);
        },
        gotoPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currenpage = page;
            this.fetchData(this.currenpage, this.limit);
        },



        openEditModal(product) {
            this.editingProduct = product.id;
            this.editName = product.name;
            this.editQuantity = product.quantity;
            this.editPrice = product.price;

            // url hien tai
            this.editPreviewUrl = `public/images/${product.img}`;
            this.editImgFile = null; // luon reset file anh new
        },

        handleFileUpload(event, isEdit = false) {
            const file = event.target.files[0];

            // xac dinh bien state neu duoc cap nhat
            const fileRef = isEdit ? 'editImgFile' : 'ImgFile';
            const previewRef = isEdit ? 'editPreviewUrl' : 'previewUrl';

            if (!file) {
                this[fileRef] = null;
                // giu lai file anh cu neu nguoi dung khong edit
                if (!isEdit && this[previewRef]) {
                    URL.revokeObjectURL(this[previewRef]);
                }
                if (!isEdit) this[previewRef] = null;
                return;
            };

            // 1. check dinh dang jpg va png
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                alert("File must be JPG or PNG");
                event.target.value = "";
                this[fileRef] = null;
                return;
            }

            // check dung luong (10mb)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("File max size 10MB");
                event.target.value = "";
                this[fileRef] = null;
                return;
            }

            // kiem tra kich thuoc anh
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                if (img.width <= 100) {
                    alert("width phai 100px!");
                    event.target.value = "";
                    this[fileRef] = null;
                    this[previewRef] = null;
                    return;
                }

                // neu tat ca hop le → luu file va tao url review
                this[fileRef] = file;

                // canel url cu neu co
                if (this[previewRef] && this[previewRef].startsWith('blob:')) {
                    URL.revokeObjectURL(this[previewRef]);
                }
                this[previewRef] = URL.createObjectURL(file);
                console.log("File hop le!", file);
            };

            img.onerror = () => {
                alert("not image file.");
                event.target.value = "";
                this[fileRef] = null;
                this[previewRef] = null;
            };
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
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json(); // server tra ve json error
                alert(`Lỗi: ${response.status} - ${errorData.message}`);
                return;
            }

            const data = await response.json();
            alert(data.message);

            // Reset form
            this.Name = "";
            this.Quantity = "";
            this.Price = "";
            this.ImgFile = null;

            await this.fetchData(this.currenpage, this.limit);
        },
        async updateProduct() {
            if (!this.editingProduct) {
                alert("Khong co san pham nao duoc chinh sua.");
                return;
            }

            const formData = new FormData();

            // Dien du lieu moi vao form data
            formData.append('Name', this.editName);
            formData.append('Quantity', this.editQuantity);
            formData.append('Price', this.editPrice);

            // chi them file anh neu co chon moi
            if (this.editImgFile) {
                formData.append('image', this.editImgFile);
            }

            // gia dinh api update theo id san pham dang chinh sua 
            const url = `/updateproduct/${this.editingProduct}`;

            try {
                const response = await fetch(url, {
                    method: "PUT",
                    body: formData
                });

                if (!response.ok) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        // Server tra ve json error
                        const errorData = await response.json();
                        throw new Error(`Error: ${response.status} - ${errorData.message || 'Error server.'}`);
                    } else {
                        // Server khong tra ve json
                        const errorText = await response.text();
                        console.error('Non-JSON Error Response:', errorText);

                        // xu ly loi 404 rieng
                        if (response.status === 404) {
                            throw new Error(`Error 404: khong tim thay api update (/updateproduct/${this.editingProduct}). Check lai server.`);
                        }

                        throw new Error(`Error: ${response.status} - Phan hoi khong phai json.`);
                    }
                }

                const data = await response.json();
                alert(data.message || "Update product successful.");

                // Close Modal và reset state editing
                this.editingProduct = null;
                this.editPreviewUrl = null;

                // lay lai du lieu update bang
                await this.fetchData(this.currenpage, this.limit);

            } catch (error) {
                console.error('Error updating product:', error);
                alert(`error xay ra cap nhat: ${error.message}`);
            }
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
        <form action="" @submit.prevent="addproduct" enctype="multipart/form-data" class="addproduct">
            <h1>Add product!!</h1>
            <!-- <input class="form-control" type="hidden" v-model="Id" id="Id" placeholder="Nhập ID"> -->
            <input class="form-control" type="text" v-model="Name" id="Name" placeholder="Name product">
            <input class="form-control" type="number" v-model="Quantity" id="Quantity" placeholder="Quantity">
            <input class="form-control" type="number" v-model="Price" id="Price" placeholder="Price">
            <span>Add image</span>
            <input class="form-control" type="file" @change="handleFileUpload">
            <div v-if="previewUrl">
                Image Preview:
                <br>
                <img :src="previewUrl" style="max-width:100px; margin-top:10px; margin-bottom: 10px;">
            </div>
            <button class="btn btn-success">Add product</button>
        </form>
        <h1>List product!!</h1>
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
                    <td>{{ formatCurrency(product.price) }}</td>
                    <td><img :src="`public/images/${product.img}`" :alt="product.name" style="max-width: 70px;"></td>
                    <td>
                        <button class="btn btn-primary" @click="openEditModal(product)"
                            style="margin-right: 10px;">Edit</button>
                        <button class="btn btn-outline-danger" @click="deleteProduct(product.id)">Delete</button>
                    </td>
                </tr>
            </tbody>
        </table>
        <div class="filter-page-container" v-if="totalPages > 1">
            <button @click="gotoPage(currenpage - 1)" :disabled="currenpage === 1">Back</button>
            <button v-for="page in totalPages" :key="page" @click="gotoPage(page)"
                :class="{ active: currenpage === page }">{{ page }}</button>
            <button @click="gotoPage(currenpage + 1)" :disabled="currenpage === totalPages">Next</button>
        </div>
        <div v-if="editingProduct" class="edit-modal-overlay">
            <form @submit.prevent="updateProduct" enctype="multipart/form-data" class="edit-product-form">
                <h2>Edit product ID: {{ editingProduct }}</h2>
                <input class="form-control" type="text" v-model="editName" id="editName" placeholder="Enter name product"
                    required>
                <input class="form-control" type="number" v-model="editQuantity" id="editQuantity"
                    placeholder="Enter quantity" required min="0">
                <input class="form-control" type="number" v-model="editPrice" id="editPrice" placeholder="Enter price"
                    required min="0">

                <span> Image</span>
                <input class="form-control" type="file" @change="event => handleFileUpload(event, true)">

                <div v-if="editPreviewUrl">
                    Image Preview:
                    <br>
                    <img :src="editPreviewUrl" style="max-width:100px; margin-top:10px; margin-bottom: 10px;">
                </div>

                <button class="btn btn-success" type="submit" style="margin-right: 10px;">Update</button>
                <button class="btn btn-secondary" type="button"
                    @click="editingProduct = null; editPreviewUrl = null;">Canel</button>
            </form>
        </div>
    </div>

</template>
<style scoped>
.edit-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.edit-product-form {
    background-color: white;
    padding: 30px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    max-width: 500px;
    width: 90%;
}

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
    width: 100%;
    margin: 50px auto;
}

.addproduct {
    box-shadow: 1px 1px 10px #ccc;
    padding: 50px;
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