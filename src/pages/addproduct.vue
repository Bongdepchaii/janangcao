<script setup>
import { ref } from 'vue';

// const Id = ref("");
const Name = ref("");
const Quantity = ref("");
const Price = ref("");
const ImgFile = ref(null);

const handleFileUpload = (event) => {
    ImgFile.value = event.target.files[0];
};

const addproduct = async () => {

    const formData = new FormData();

    formData.append('Name', Name.value);
    formData.append('Quantity', Quantity.value);
    formData.append('Price', Price.value);

    if (ImgFile.value) {
        formData.append('image', ImgFile.value); 
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
}



</script>
<template>
    <div class="container">
        <form action="" @submit.prevent="addproduct">
            <h1>Thêm Sản phẩm!!</h1>
            <!-- <input class="form-control" type="hidden" v-model="Id" id="Id" placeholder="Nhập ID"> -->
            <input class="form-control" type="text" v-model="Name" id="Name" placeholder="Nhập tên sản phẩm">
            <input class="form-control" type="number" v-model="Quantity" id="Quantity" placeholder="Nhập số lượng">
            <input class="form-control" type="number" v-model="Price" id="Price" placeholder="Nhập giá bán">
            <span> Thêm hình ảnh</span>
            <input class="form-control" type="file" @change="handleFileUpload">
            <button class="btn btn-success">Thêm</button>
        </form>
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
</style>