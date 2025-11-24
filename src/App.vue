<script>
// import { Key } from 'react';
import Header from "./layouts/header.vue";
import Footer from "./layouts/footer.vue";

export default {
    components: { Header, Footer },
};


// export default {
//     data() {
//         return {
//             data: null,
//             currenpage: 1,
//             limit: 6,
//             totalPages: 0
//         };
//     },
//     methods: {
//         async fetchData(page, limit) {
//             const url = `/api/${page}/${limit}`;
//             try {
//                 const res = await fetch(url);
//                 if (!res.ok) {
//                     throw new Error("Failed to fetch data from server");
//                 };
//                 console.log("fetch url: ", url);
//                 this.data = await res.json();
//                 console.log("data load: ", this.data);
//             } catch (error) {
//                 console.error("Error fetching data: ", error);
//                 this.data = [];
//             }
//         },
//         async fetchTotalPages(limit) {
//             const url = `/productcount `;
//             try {
//                 const res = await fetch(url);
//                 if (!res.ok) {
//                     throw new Error("Failed to fetch total count from server");
//                 };
//                 const result = await res.json();
//                 const totalCount = result.total;
//                 this.totalPages = Math.ceil(totalCount / limit);
//                 console.log("total pages: ", this.totalPages);
//             } catch (error) {
//                 console.error("Error fetching total count: ", error);
//                 this.totalPages = 0;
//             }
//         },
//         gotoPage(page) {
//             if (page < 1 || page > this.totalPages) return;
//             this.currenpage = page;
//             this.fetchData(this.currenpage, this.limit);
//         }
//     },
//     async mounted() {
//         await this.fetchTotalPages(this.limit);
//         await this.fetchData(this.currenpage, this.limit);
//     }
// };


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
    <Header />

    <router-view></router-view>

    <Footer />
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Alumni+Sans+Pinstripe:ital@1&family=Funnel+Sans:ital,wght@0,300..800;1,300..800&family=Inspiration&display=swap');

body {
    margin: 0;
    padding: 0;
}
</style>