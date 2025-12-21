<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router'; 

const route = useRoute(); 
const router = useRouter();
const data = ref(null);
const loading = ref(true);
const error = ref(null);

const fetchProductDetail = async () => {
    loading.value = true;
    error.value = null;
    const id = route.params.id;

    const url = `/productdetail/${id}`;

    try {
        const res = await fetch(url);
        if (!res.ok) {
            throw new Error(`Failed to fetch product detail for ID: ${id}`);
        }

        const result = await res.json();

        if (result && result.length > 0) {
            data.value = result[0];
        } else {
            data.value = null;
        }

        console.log("Product detail loaded: ", data.value);

    } catch (e) {
        console.error("Error fetching product detail: ", e);
        error.value = e.message;
        data.value = null;
    } finally {
        loading.value = false;
    }
};

const back = () => {
    router.back()
}

onMounted(() => {
    fetchProductDetail();
});
</script>

<template>
    <div class="container">
        <p v-if="loading">Loading...</p>
        <div v-else-if="error">Error load data: {{ error }}</div>
        <div v-else-if="!data">product empty (ID: {{ route.params.id }})</div>

        <div v-else class="product-detail-card">
            <h1>Product details: {{ data.name }}</h1>

            <div class="row">
                <div class="col-md-6">
                    <img :src="`http://localhost:8080/images/${data.img}`" :alt="data.name" class="detail-img" />
                </div>
                <div class="col-md-6 product-info">
                    <h2>{{ data.name }}</h2>
                    <p><strong>ID:</strong> {{ data.id }}</p>
                    <p><strong>Price:</strong> {{ data.price }}</p>
                    <p><strong>Quantity:</strong> {{ data.quantity }}</p>
                    <button @click="back" class="btn btn-dark">Back</button>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.product-detail-card {
    padding: 20px;
    border: 1px solid #ccc;
    margin-top: 30px;
}

.detail-img {
    max-width: 100%;
    height: auto;
    border-radius: 5px;
}

div.col-md-6 {
    width: 300px;
    height: 250px;
    margin: 66px auto 10px;
    overflow: hidden;
}

.product-info {
    padding-left: 30px;
}

h1 {
    font-size: 1.5rem;
    font-weight: 400;
    margin-bottom: 15px;
}
</style>