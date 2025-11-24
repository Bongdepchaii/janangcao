<script setup>
import { ref } from 'vue';

const Id = ref("");
const Name = ref("");
const Quantity = ref("");
const Price = ref("");
const Img = ref("");

const addproduct = async () => {
    const payload = {
        Id: Id.value,
        Name: Name.value,
        Quantity: Quantity.value,
        Price: Price.value,
        Img: Img.value && typeof Img.value === 'object' ? Img.value.name : ""
    };

    const response = await fetch("/addproduct", {
        method: "POST",
        headers: {
            "Content-type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        const errorText = await response.text();
        alert(`Lỗi: ${response.status} - ${errorText}`);
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
            <input class="form-control" type="hidden" v-model="Id" id="Id" placeholder="Nhập ID">
            <input class="form-control" type="text" v-model="Name" id="Name" placeholder="Nhập tên sản phẩm">
            <input class="form-control" type="number" v-model="Quantity" id="Quantity" placeholder="Nhập số lượng">
            <input class="form-control" type="number" v-model="Price" id="Price" placeholder="Nhập giá bán">
            <span> Thêm hình ảnh</span>
            <input class="form-control" type="file" @change="(e) => Img.value = e.target.files[0]">
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