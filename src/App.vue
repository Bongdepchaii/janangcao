<template>
    <div>
        <h1>My Vue App</h1>
        <p v-if="!data">Loading...</p>
        <div v-else-if="data.length === 0">Khong co san pham</div>
        <!-- <pre v-else>{{ data }}</pre> -->
        <div v-else>
            <div v-for="product in data" :key="product.id">
                <h3>{{ product.name }}</h3>
                <img :src="product.img" :alt="product.name" />
                <p>Price: {{ product.price }}</p>
                <p>Quantity: {{ product.quantity }}</p>
                <hr />
            </div>
        </div>
    </div>
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
        const url = `home/api/${page}/${limit}`;
        console.log("1");
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