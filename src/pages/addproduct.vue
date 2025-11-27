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
            ImgFile: null,
            previewUrl: null,

            editingProduct: null, // ID sản phẩm đang chỉnh sửa
            editName: "",
            editQuantity: null,
            editPrice: null,
            editImgFile: null, // File ảnh mới
            editPreviewUrl: null // URL ảnh xem trước
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

        /**
         * 🌟 Mở Modal/Form chỉnh sửa và điền dữ liệu
         * @param {Object} product - Sản phẩm được chọn để chỉnh sửa.
         */

        openEditModal(product) {
            this.editingProduct = product.id;
            this.editName = product.name;
            this.editQuantity = product.quantity;
            this.editPrice = product.price;

            // Đặt URL ảnh hiện tại
            this.editPreviewUrl = `public/images/${product.img}`;
            this.editImgFile = null; // Luôn reset file ảnh mới
        },

        /**
         * 🌟 Xử lý tải lên file ảnh (đã được sửa đổi để dùng chung cho cả Thêm và Chỉnh sửa)
         * @param {Event} event - Sự kiện thay đổi input file.
         * @param {boolean} isEdit - Xác định là chức năng thêm mới (false) hay chỉnh sửa (true).
         */

        handleFileUpload(event, isEdit = false) {
            const file = event.target.files[0];

            // Xác định biến state sẽ được cập nhật
            const fileRef = isEdit ? 'editImgFile' : 'ImgFile';
            const previewRef = isEdit ? 'editPreviewUrl' : 'previewUrl';

            if (!file) {
                this[fileRef] = null;
                // Giữ lại ảnh cũ trong chế độ Edit nếu không có file mới
                if (!isEdit && this[previewRef]) {
                    URL.revokeObjectURL(this[previewRef]);
                }
                if (!isEdit) this[previewRef] = null;
                return;
            };

            // 1. Kiểm tra định dạng
            const allowedTypes = ["image/jpeg", "image/png"];
            if (!allowedTypes.includes(file.type)) {
                alert("Chỉ chấp nhận JPG hoặc PNG!");
                event.target.value = "";
                this[fileRef] = null;
                return;
            }

            // 2. Kiểm tra dung lượng (10MB)
            const maxSize = 10 * 1024 * 1024;
            if (file.size > maxSize) {
                alert("File quá lớn! Tối đa 10MB.");
                event.target.value = "";
                this[fileRef] = null;
                return;
            }

            // 3. Kiểm tra kích thước ảnh
            const img = new Image();
            img.src = URL.createObjectURL(file);

            img.onload = () => {
                // ⚠️ Logic kiểm tra: Ảnh hợp lệ khi chiều rộng > 100px.
                // Nếu yêu cầu của bạn là chiều rộng PHẢI <= 100px, bạn giữ lại logic cũ.
                // Tôi sửa thành > 100px (thông thường)
                if (img.width <= 100) {
                    alert("Chiều rộng ảnh phải lớn hơn 100px!");
                    event.target.value = "";
                    this[fileRef] = null;
                    this[previewRef] = null;
                    return;
                }

                // Nếu tất cả hợp lệ → lưu file và tạo preview URL
                this[fileRef] = file;

                // Hủy URL cũ nếu có (để tránh rò rỉ bộ nhớ)
                if (this[previewRef] && this[previewRef].startsWith('blob:')) {
                    URL.revokeObjectURL(this[previewRef]);
                }
                this[previewRef] = URL.createObjectURL(file);
                console.log("File hợp lệ!", file);
            };

            img.onerror = () => {
                alert("File không phải hình ảnh hợp lệ!");
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
                const errorData = await response.json(); // Server trả về JSON lỗi
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
                alert("Không có sản phẩm nào được chọn để chỉnh sửa.");
                return;
            }

            const formData = new FormData();

            // Điền dữ liệu mới từ form chỉnh sửa
            formData.append('Name', this.editName);
            formData.append('Quantity', this.editQuantity);
            formData.append('Price', this.editPrice);

            // Chỉ thêm file ảnh mới nếu người dùng đã chọn (editImgFile không null)
            if (this.editImgFile) {
                formData.append('image', this.editImgFile);
            }

            // Giả định API endpoint là /updateproduct/:id
            const url = `/updateproduct/${this.editingProduct}`;

            try {
                const response = await fetch(url, {
                    method: "PUT",
                    body: formData
                });

                if (!response.ok) {
                    // 🌟 BỔ SUNG LOGIC XỬ LÝ LỖI PHẢN HỒI NON-JSON 🌟
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.includes("application/json")) {
                        // Server trả về JSON, ta đọc lỗi từ JSON
                        const errorData = await response.json();
                        throw new Error(`Lỗi: ${response.status} - ${errorData.message || 'Lỗi server.'}`);
                    } else {
                        // Server KHÔNG trả về JSON (có thể là HTML hoặc chuỗi text 404/500)
                        const errorText = await response.text();
                        console.error('Non-JSON Error Response:', errorText);

                        // Xử lý lỗi 404 cụ thể hơn
                        if (response.status === 404) {
                            throw new Error(`Lỗi 404: Không tìm thấy API cập nhật (/updateproduct/${this.editingProduct}). Vui lòng kiểm tra Server.`);
                        }

                        throw new Error(`Lỗi: ${response.status} - Phản hồi không phải JSON.`);
                    }
                }

                const data = await response.json();
                alert(data.message || "Cập nhật sản phẩm thành công!");

                // Đóng Modal và reset state chỉnh sửa
                this.editingProduct = null;
                this.editPreviewUrl = null;

                // Lấy lại dữ liệu để cập nhật bảng
                await this.fetchData(this.currenpage, this.limit);

            } catch (error) {
                console.error('Error updating product:', error);
                alert(`Có lỗi xảy ra trong quá trình cập nhật sản phẩm: ${error.message}`);
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
            <h1>Thêm Sản phẩm!!</h1>
            <!-- <input class="form-control" type="hidden" v-model="Id" id="Id" placeholder="Nhập ID"> -->
            <input class="form-control" type="text" v-model="Name" id="Name" placeholder="Nhập tên sản phẩm">
            <input class="form-control" type="number" v-model="Quantity" id="Quantity" placeholder="Nhập số lượng">
            <input class="form-control" type="number" v-model="Price" id="Price" placeholder="Nhập giá bán">
            <span> Thêm hình ảnh</span>
            <input class="form-control" type="file" @change="handleFileUpload">
            <div v-if="previewUrl">
                Image Preview:
                <br>
                <img :src="previewUrl" style="max-width:100px; margin-top:10px; margin-bottom: 10px;">
            </div>
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
            <button @click="gotoPage(currenpage - 1)" :disabled="currenpage === 1">Trước</button>
            <button v-for="page in totalPages" :key="page" @click="gotoPage(page)"
                :class="{ active: currenpage === page }">{{ page }}</button>
            <button @click="gotoPage(currenpage + 1)" :disabled="currenpage === totalPages">Sau</button>
        </div>
        <div v-if="editingProduct" class="edit-modal-overlay">
            <form @submit.prevent="updateProduct" enctype="multipart/form-data" class="edit-product-form">
                <h2>Chỉnh Sửa Sản phẩm ID: {{ editingProduct }}</h2>
                <input class="form-control" type="text" v-model="editName" id="editName" placeholder="Nhập tên sản phẩm"
                    required>
                <input class="form-control" type="number" v-model="editQuantity" id="editQuantity"
                    placeholder="Nhập số lượng" required min="0">
                <input class="form-control" type="number" v-model="editPrice" id="editPrice" placeholder="Nhập giá bán"
                    required min="0">

                <span> Đổi hình ảnh (Để trống nếu không đổi)</span>
                <input class="form-control" type="file" @change="event => handleFileUpload(event, true)">

                <div v-if="editPreviewUrl">
                    Image Preview:
                    <br>
                    <img :src="editPreviewUrl" style="max-width:100px; margin-top:10px; margin-bottom: 10px;">
                </div>

                <button class="btn btn-success" type="submit" style="margin-right: 10px;">Cập Nhật</button>
                <button class="btn btn-secondary" type="button"
                    @click="editingProduct = null; editPreviewUrl = null;">Hủy</button>
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