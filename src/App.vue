<template>
    <div>
        <!-- <h1>My Vue App</h1> -->
        <p v-if="!data">Loading...</p>
        <div v-else-if="data.length === 0">Khong co san pham</div>
        <!-- <pre v-else>{{ data }}</pre> -->
        <div v-else>
            <div class="container">
                <div class="row">
                    <div class="col-md-4" v-for="product in data" :key="product.id">
                        <h3>{{ product.name }}</h3>
                        <img :src="product.img" :alt="product.name" />
                        <p>Price: {{ product.price }}</p>
                        <p>Quantity: {{ product.quantity }}</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <center class="filter-page">
        <button>1</button>
        <button>1</button>
        <button>1</button>
    </center>
</template>

<script>
// import { Key } from 'react';

export default {
    data() {
        return { data: null };
    },

    async mounted() {
        const page = 1;
        const limit = 5;
        const url = `/api/${page}/${limit}`;
        // console.log("1");
        // const res = await fetch(`Dang goi API o day: ${url}`);
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
    }
};
</script>
<style scoped>
div.col-md-4 {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 20px;
    text-align: center;
}
div.col-md-4 img{
    max-width: 100%;
    height: auto;
}
center.filter-page {
    margin-top: 20px;
    margin-bottom: 100px;
}
center.filter-page button {
    margin: 0 5px;
    padding: 5px 10px;
    border: 0.5px solid #007bff;
}
</style>