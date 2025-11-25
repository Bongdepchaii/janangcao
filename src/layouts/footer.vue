<script setup >
// import router from '../router';
</script>
<template>
    <div class="footer">
        <div class="container text-white py-5">
            <span class="home">TBS</span>
            <div class="row mt-4 lists-footer">
                <div class="col-md-6 content-footer">
                    <h2>About</h2>
                    <p style="width: 90%;">
                        Chúng tôi luôn quý trọng và tiếp thu mọi ý kiến đóng góp từ khách hàng, nhằm không ngừng cải
                        thiện và nâng tầm trải nghiệm dịch vụ cũng như chất lượng sản phẩm.
                    </p>
                </div>
                <div class="col-md-3 content-footer">
                    <h2>Support</h2>
                    <ul>
                        <li>Chính sách đổi trả</li>
                        <li>Hướng dẫn mua hàng</li>
                        <li>Liên hệ</li>
                    </ul>
                </div>
                <div class="col-md-3 content-footer nav-icons">
                    <h2>Connect</h2>
                        <a href=""><i class="bi bi-facebook"></i></a>
                        <a href=""><i class="bi bi-instagram"></i></a>
                        <a href=""><i class="bi bi-tiktok"></i></a>
                        <a href=""><i class="bi bi-telegram"></i></a>
                </div>
            </div>
            <hr>
            <div class="c">
                <p>© 2024 My Vue App. All rights reserved.</p>
                <img src="https://lms.poly.edu.vn/assets/FPT_Polytechnic-26eda0e9.png" style="width: 15%;" alt="">
            </div>
        </div>
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