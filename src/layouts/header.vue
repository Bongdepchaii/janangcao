<script setup>
import { createRouter, createWebHistory } from "vue-router";
import router from '../router';
</script>
<template>
    <div class="header container mb-4">
        <nav class="navbar navbar-expand-lg navbar-light">
            <router-link to="/" class="navbar-brand home" href="#">TBS</router-link>
            <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent"
                aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                <span class="navbar-toggler-icon"></span>
            </button>

            <div class="collapse navbar-collapse" id="navbarSupportedContent">
                <ul class="navbar-nav mr-auto">
                    <li class="nav-item active">
                        <router-link to="/addproduct" class="nav-link">Product</router-link>
                    </li>
                </ul>
            </div>
        </nav>
    </div>
</template>
<style scoped>
div.card-2 div.col-md-4 {
    border: 1px solid #ccc;
    padding: 10px;
    margin-bottom: 20px;
    margin-left: px;
    text-align: center;
}

div.card-2 div.col-md-4 :hover {
    transition: 0.3s;
}

div.col-md-4 img {
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
    border: 0.5px solid #007bff;
}

div.filter-page-container button.active {
    background-color: #007bff;
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
</style>