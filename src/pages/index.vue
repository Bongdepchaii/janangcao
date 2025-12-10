<script>

export default {
    data() {
        return {
            data: null,
            currenpage: 1,
            limit: 6,
            totalPages: 0
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
        // add to cart 
        async Addtocart(id) {
            const url = `/addtocart/${id}`;
            try {
                const res = await fetch(url, {
                    method: "POST",
                    // headers: {
                    //     'Content-Type': 'application/json'
                    // }
                });
                if (!res.ok) {
                    throw new Error(`add to cart failed:  ${res.status}`);
                };
                alert("add product successfly")
                console.log("add product successfly")
            } catch (error) {
                console.error("bug", error);
            }
        },
        gotoPage(page) {
            if (page < 1 || page > this.totalPages) return;
            this.currenpage = page;
            this.fetchData(this.currenpage, this.limit);
        }
    },
    async mounted() {
        await this.fetchTotalPages(this.limit);
        await this.fetchData(this.currenpage, this.limit);
    }
};


//     async mounted() {
//         // const page = 1;
//         // const limit = 5;
//         const url = `/api/${page}/${limit}`;
//         // console.log("1");
//         // const res = await fetch(`Dang goi API o day: ${url}`);
//         try {
//             const res = await fetch(url);
//             if (!res.ok) {
//                 throw new Error("Failed to fetch data from server");
//             };
//             console.log("fetch url: ", url);
//             this.data = await res.json();
//             console.log("data load: ", this.data);
//         } catch (error) {
//             console.error("Error fetching data: ", error);
//             this.data = [];
//         }
//     }
// };


</script>

<template>
    <div>
        <!-- <h1>My Vue App</h1> -->
        <p v-if="!data">Loading...</p>
        <div v-else-if="data.length === 0">Khong co san pham</div>
        <!-- <pre v-else>{{ data }}</pre> -->
        <div v-else>
            <div class="container">
                <h1>Welcome!!</h1>
                <div class="row card-2">
                    <div class="col-md-4 card" v-for="product in data" :key="product.id">
                        <router-link :to="`productdetail/${product.id}`" style="color: black; text-decoration: none;">
                            <div class="img-width mt-2 mb-2">
                                <!-- <img :src="product.img" :alt="product.name" />  -->
                                <img :src="`images/${product.img}`" :alt="product.name" />
                            </div>
                            <h3>{{ product.name }}</h3>
                            <p>Price: {{ product.price }}</p>
                            <p>Quantity: {{ product.quantity }}</p>
                        </router-link>
                        <button class="btn btn-outline-dark mb-2" @click="Addtocart(product.id)">Add to cart</button>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="filter-page-container" v-if="totalPages > 1">
        <button @click="gotoPage(currenpage - 1)" :disabled="currenpage === 1">Back</button>
        <button v-for="page in totalPages" :key="page" @click="gotoPage(page)"
            :class="{ active: currenpage === page }">{{ page }}</button>
        <button @click="gotoPage(currenpage + 1)" :disabled="currenpage === totalPages">Next</button>
    </div>
</template>

<style scoped>
body {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 400;
    /* background-color: #f8f9fa; */
}

div.card-2 .col-md-4 {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 20px;
    margin-left: px;
    text-align: center;
}

div.card-2 .col-md-4 :hover {
    transition: 0.3s;
}

.col-md-4 img {
    max-width: 100%;
    height: auto;
}

div.img-width {
    width: 300px;
    height: 200px;
    margin: 0 auto 10px;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
}

div.filter-page-container {
    margin-top: 20px;
    margin-bottom: 100px;
    /* justify-content: center; */
    text-align: center;
}

div.filter-page-container button {
    margin: 0 2.5px;
    padding: 5px 10px;
    border: 0.5px solid pink;
}

div.filter-page-container button.active {
    background-color: pink;
    color: white;
}

div.container {
    margin-top: 20px;
    max-width: 1100px;
}

a {
    font-family: "Funnel Sans", sans-serif;
    font-optical-sizing: auto;
}

.home {
    font-family: "Inspiration", cursive;
    font-weight: 400;
    font-size: 2rem;
    font-style: normal;
}

.home:hover {
    color: pink;
    transition: 0.1s;
}

.footer {
    background-color: black;
    opacity: 0.9;
    position: relative;
    bottom: 0;
    width: 100%;
}

.footer ul {
    list-style-type: none;
    padding: 0;
}

.content-footer {
    /* border-left: none !important; */
    font-size: 0.95rem;
    line-height: 1.6;
    /* float: left; */
    padding: 0;
    /* justify-content: flex-start; */
    text-align: left;
    float: none;
    display: block;
}

.content-footer h2 {
    font-family: "roboto";
    font-optical-sizing: auto;
    font-weight: 400;
    font-style: normal;
    margin-bottom: 15px;
}

.nav-icons a {
    font-size: 1.5rem;
    margin-right: 15px;
    color: white;

}

div.c {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

h1 {
    font-size: 1.5rem;
    font-weight: 400;
    margin-bottom: 15px;
}
</style>