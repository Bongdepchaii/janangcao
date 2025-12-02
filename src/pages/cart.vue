<script setup>



</script>
<template>
    <body>
        <div class="container">
            <h2>Cart</h2>
            <div class="row">
                <div class="col-md-8">
                    <div class="row">
                        <img src="../../public/images/1764034392814-text_ng_n_5__9_25.webp" alt="product-image">
                        <div class="col-md-9">
                            <div class="productorremove">
                                <h5>Tên Sản Phẩm</h5>
                                <i class="bi bi-trash3 btn btn-outline-danger"></i>
                            </div>
                            <p>Giá: 0 VND</p>
                            <p>Số Lượng: 1</p>
                        </div>
                    </div>
                    <div class="row">
                        <img src="../../public/images/1764034392814-text_ng_n_5__9_25.webp" alt="product-image">
                        <div class="col-md-9">
                            <div class="productorremove">
                                <h5>Tên Sản Phẩm</h5>
                                <i class="bi bi-trash3 btn btn-outline-danger"></i>
                            </div>
                            <p>Giá: 0 VND</p>
                            <p>Số Lượng: 1</p>
                        </div>
                    </div>
                    <div class="row">
                        <img src="../../public/images/1764034392814-text_ng_n_5__9_25.webp" alt="product-image">
                        <div class="col-md-9">
                            <div class="productorremove">
                                <h5>Tên Sản Phẩm</h5>
                                <i class="bi bi-trash3 btn btn-outline-danger"></i>
                            </div>
                            <p>Giá: 0 VND</p>
                            <p>Số Lượng: 1</p>
                        </div>
                    </div>
                </div>
                <div class="col-md-3 card p-3 card-body card-1">
                    <h3>Tổng Cộng</h3>
                    <p>Sản phẩm: 4</p>
                    <p>Số lượng: 12</p>
                    <p>Shipper: 15.500VNĐ</p>
                    <hr>
                    <div class="total">
                        <p>Tổng tiền:</p>
                        <p>0 VND</p>
                    </div>
                        <button class="btn btn-primary">Thanh Toán</button>
                </div>
            </div>

            <div class="row gx-5 mt-5">
                <h2>Sản phẩm liên quan</h2>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764035310550-iphone-8-plus-64gb-128gb-256gb-cu-like-new-99-qkm-4-1.jpg" alt="related-product-image">
                    <h5>Tên Sản Phẩm</h5>
                    <p>Giá: 0 VND</p>
                    <button class="btn btn-light">Thêm vào giỏ</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764047793297-54923-iphone-5s-32gb-quoc-te-den.jpg" alt="related-product-image">
                    <h5>Tên Sản Phẩm</h5>
                    <p>Giá: 0 VND</p>
                    <button class="btn btn-light">Thêm vào giỏ</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764053104965-(600x600)_samsung_galaxy_a16_5g_trang_thumb_1.jpg" alt="related-product-image">
                    <h5>Tên Sản Phẩm</h5>
                    <p>Giá: 0 VND</p>
                    <button class="btn btn-light">Thêm vào giỏ</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764221093268-download (1).jpg" alt="related-product-image">
                    <h5>Tên Sản Phẩm</h5>
                    <p>Giá: 0 VND</p>
                    <button class="btn btn-light">Thêm vào giỏ</button>
                </div>
                <div class="col-md-2 mb-3 card-2 card p-3">
                    <img src="../../public/images/1764221093268-download (1).jpg" alt="related-product-image">
                    <h5>Tên Sản Phẩm</h5>
                    <p>Giá: 0 VND</p>
                    <button class="btn btn-light">Thêm vào giỏ</button>
                </div>
            </div>
        </div>
    </body>
</template>

<style scoped>
body {
    font-family: Arial, Helvetica, sans-serif;
    font-weight: 400;
    /* background-color: #f8f9fa; */
}

div.container {
    margin-top: 20px;
    /* max-width: 1300px; */
    margin-bottom: 100px;
}

div.col-md-8 div.row img {
    width: 200px;
    height: auto;
}

div.col-md-8 div.row {
    margin-bottom: 20px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
}

div.productorremove {
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.card-1 {
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    height: fit-content;
    margin-left: 15px;
}

.card-1 h3{
    font-weight: 600;
    margin-bottom: 20px;
}

.card-2 {
    width: 258px;
    border: 1px solid #ccc;
    border-radius: 5px;
    padding: 15px;
    text-align: center;
    margin: 5px;
}

.card-2 img {
    width: 100%;
    padding: 15px;
    height: auto;
}

h2 {
    margin-bottom: 20px;
}
div.card-1 p{
    font-size: 18px;

}
div.total{
    font-size: 20px;
    display: flex;
    justify-content: space-between;
}
</style>