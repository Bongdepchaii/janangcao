require("dotenv").config();
const express = require("express");

// ngan refest trang
// const history = require("connect-history-api-fallback");

// app.use(history());
// app.use(express.static(path.join(__dirname, 'dist')));

const app = express();
const port = 8080;
let mysql = require("mysql");
const nodecache = require("node-cache");
const myCache = new nodecache();

// thu vien import multer and path
const multer = require("multer");
const path = require("path");

// add cors middleware, npm install cors
const cors = require("cors");
const { error } = require("console");
app.use(cors());

// thu muc de luu tru data images
const storageDir = path.join(__dirname, "public", "images");

// storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

// upload
const upload = multer({ storage: storage }).single("image");

// use add product json
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

let con = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: process.env.DB,
});

con.connect(function (err) {
  if (err) throw err;
  console.log("Connected!");
});

// Define a route for GET requests to the root URL
app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

// mysql
// app.get('/home/:pagenumber/:limitpage', (req, res) => {
//   con.query("SELECT * FROM product limit 10 offset " + (req.params.limitpage * (req.params.pagenumber - 1)), function (err, result, fields) {
//     if (err) throw err;
//     res.json(result);
//   });
// });

// Fix mysql route to match the rewritten path
app.get("/home/:pagenumber/:limitpage", (req, res) => {
  con.query(
    "SELECT * FROM product order by id desc limit " +
    req.params.limitpage +
    " offset " +
    req.params.limitpage * (req.params.pagenumber - 1),
    function (err, result, fields) {
      if (err) throw err;
      res.json(result);
    }
  );
});

app.get("/productcount", (req, res) => {
  // remove khoan trang sql
  con.query(
    "SELECT COUNT(*) as total FROM product",
    function (err, result, fields) {
      if (err) {
        console.error("Error fetching count:", err);
        return res.status(500).send("Database query failed.");
      }
      //  luu y tra ve json result[0] de lay duoc total trong object
      res.json(result[0]);
    }
  );
});

//node-cache
app.get("/productdetail/:id", (req, res) => {
  //  khai bao bien productId
  const productId = req.params.id;
  // const cacheproduct = myCache.get(productId);
  const sql = "SELECT * FROM product WHERE id = ?";

  con.query(sql, [productId], function (err, result, fields) {
    // Truyền [productId]
    if (err) {
      console.error("Lỗi truy vấn chi tiết sản phẩm:", err); // Ghi log loi 
      // tra ve loi 500 neu co loi database
      return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu." });
    }
    console.log("dl tu database");
    myCache.set(productId, result);
    res.json(result);
  });
});



// api add product
app.post("/addproduct", (req, res) => {
  upload(req, res, function (err) {
    //  xu ly loi multer

    // bat buoc phai co file hinh anh
    if (!req.file) {
      // neu khong co file thi tra ve loi
      return res.status(400).json({ message: "Please add Images." });
    }

    // neu co req.file thi moi lay duoc filename
    const { Name, Quantity, Price } = req.body;
    const Img = req.file.filename;

    if (!Name || !Quantity || !Price) {
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(400)
        .json({ message: "Litte data: Name, Quantity, or Price." });
    }

    const sql =
      "INSERT INTO product (name, quantity, price, img) VALUES (?, ?, ?, ?)";

    con.query(sql, [Name, Quantity, Price, Img], (err) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Error add product to database." });
      }
      res.json({ message: "Add successfly!" });
    });
  });
});

// api delete product
app.delete("/deleteproduct/:id", (req, res) => {
  const productId = req.params.id;
  const sql = "DELETE FROM product WHERE id = ?";

  con.query(sql, [productId], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Erorr delete product database." });
    }
    myCache.del(productId);
    console.log(`Cache product id ${productId} Delete successfly.`);
    res.json({ message: "Delete successfly" });
  });
});

// api update product
app.put("/updateproduct/:id", (req, res) => {
  const productId = req.params.id;

  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer error:", err);
      return res.status(500).json({ message: "Error upload file." });
    } else if (err) {
      console.error("Unknown upload error:", err);
      return res.status(500).json({ message: "error server not xac dinh" });
    }

    const { Name, Quantity, Price } = req.body;
    // lay ten img moi neu co
    const newImg = req.file ? req.file.filename : null;

    if (!Name || !Quantity || !Price) {
      // thieu du lieu
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(400)
        .json({ message: "Thieu data: Name, Quantity, hoặc Price." });
    }

    let sql;
    let params;

    if (newImg) {
      sql = "UPDATE product SET name = ?, quantity = ?, price = ?, img = ? WHERE id = ?";
      params = [Name, Quantity, Price, newImg, productId];
    } else {
      sql = "UPDATE product SET name = ?, quantity = ?, price = ? WHERE id = ?";
      params = [Name, Quantity, Price, productId];
    }

    con.query(sql, params, (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "error update database." });
      }
      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "not search product update" });
      }
      myCache.del(productId);
      console.log(`Cache product id ${productId} delete successfly.`);
      res.json({ message: "Update succesfly" });
    });
  });
});

// addtocart api
app.post("/addtocart/:id", (req, res) => {
  const id = req.params.id;
  const created_at = new Date();

  // Check query cart 
  const checkquery = "select * from cart where idproduct = ?";
  con.query(checkquery, [id], (err, result) => {
    if (err) {
      console.error("Database error: ", err);
      return res.status(500).json({ message: "Database error" });
    }
    // If add to cart exist
    if (result.length > 0) {
      const updateproduct = "Update cart set quantity = quantity + 1 Where idproduct = ?";
      con.query(updateproduct, [id], (err2) => {
        if (err2) {
          console.log("Update error: ", err2);
          return res.status(500).json({ message: "update quantity product error" });
        }
        return res.json({ message: "Update quantity + 1" });
      });
    }
    // else if not item to cart
    else {
      const insertquery = "INSERT INTO cart (idproduct, quantity, created_at) VALUES (?, ?, ?)";
      con.query(insertquery, [id, 1, created_at], (err) => {
        if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ message: "Error adding to cart" });
        }
        res.json({ message: "Add to cart success" });
      });
    }
  });
});

// cart data
app.get("/cart/:page/:limit", (req, res) => {
  const { page, limit } = req.params;
  const sql = `Select gh.id, gh.idproduct, gh.quantity as quantitycart, gh.created_at, sp.id as idproduct, sp.name as nameproduct, sp.quantity as quantityproduct, sp.price, sp.img from cart gh left join product sp on gh.idproduct = sp.id order by sp.id DESC LIMIT ? OFFSET ?`;
  con.query(sql, [parseInt(limit), (page - 1) * limit], (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(result);
  });
});

app.get("/cartcount", (req, res) => {
  con.query(`Select count(*) as total from cart`, (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(result[0]);
  });
});

// cart remove
app.delete("/deletecart/:id", (req, res) => {
  const cartid = req.params.id;
  const sql = "DELETE FROM cart WHERE id = ?";

  con.query(sql, [cartid], (err, result) => {
    if (err) {
      console.error("Database error:", err);
      return res
        .status(500)
        .json({ message: "Erorr delete product database." });
    }
    myCache.del(cartid);
    console.log(`Cache cart id ${cartid} Delete successfly.`);
    res.json({ message: "Delete successfly" });
  });
});

// Order hide data total
app.get("/order", (req, res) =>{
  const queryorder = "SELECT SUM(gh.quantity) AS total_quantity_cart, SUM(gh.quantity * sp.price) AS total_price_cart FROM cart gh LEFT JOIN product sp ON gh.idproduct = sp.id;"
  con.query(queryorder, (err, result) => {
    if (err) return res.status(500).json({ error: "DB error"});
    res.json(result[0]);
  })
})

// payment
app.post("/complete-order", async (req, res) => {
    const { cartItems, totalAmount, payment } = req.body;
    
    // Giả định phí vận chuyển cố định: 15000 ₫
    const SHIPPING_FEE = 15000; 

    if (!cartItems || cartItems.length === 0) {
        return res.status(400).json({ message: "Giỏ hàng trống." });
    }

    // 1. Khởi tạo transaction (QUAN TRỌNG để đảm bảo tất cả đều thành công hoặc thất bại)
    con.beginTransaction(async (err) => {
        if (err) {
            console.error("Error starting transaction:", err);
            return res.status(500).json({ message: "Lỗi Server (Transaction)." });
        }

        try {
            // Lấy ra các ID sản phẩm trong giỏ hàng để kiểm tra tính hợp lệ và giá
            const productIds = cartItems.map(item => item.idproduct);
            const placeholders = productIds.map(() => "?").join(",");
            
            // 2. Lấy giá sản phẩm hiện tại từ bảng product (để đảm bảo giá không bị giả mạo từ client)
            const productSql = `SELECT id, price FROM product WHERE id IN (${placeholders})`;
            const [productsPrice] = await con.promise().query(productSql, productIds);
            
            const productMap = {};
            productsPrice.forEach(p => {
                productMap[p.id] = p.price;
            });
            
            let calculatedTotal = 0;
            const orderDetails = [];

            for (const item of cartItems) {
                const serverPrice = productMap[item.idproduct];
                if (serverPrice === undefined) {
                    throw new Error(`Sản phẩm ID ${item.idproduct} không tồn tại.`);
                }
                
                // Tính toán tổng tiền sản phẩm
                calculatedTotal += serverPrice * item.quantitycart;

                // Chuẩn bị dữ liệu chi tiết đơn hàng
                orderDetails.push({
                    idproduct: item.idproduct,
                    quantity: item.quantitycart,
                    price: serverPrice // Giá tại thời điểm đặt hàng
                });
            }

            const finalTotal = calculatedTotal + SHIPPING_FEE;
            
            // 3. Tạo bản ghi Đơn hàng chính (Bảng ordercart)
            const orderSql = `INSERT INTO ordercart (idproduct, idcart, total, price, create_at, create_cannel, payment) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            // Do cấu trúc bảng ordercart của bạn hơi kỳ lạ (có idproduct, idcart, price), tôi sẽ điền tạm giá trị hợp lý nhất
            // Giả định: total là tổng tiền, price là tổng tiền sản phẩm.
            
            const now = new Date();
            const [orderResult] = await con.promise().query(orderSql, [
                orderDetails[0].idproduct, // Lấy ID product đầu tiên (Cần FIX cấu trúc DB)
                cartItems[0].id, // Lấy ID cart đầu tiên (Cần FIX cấu trúc DB)
                finalTotal, // Total: Tổng tiền cuối cùng
                calculatedTotal, // Price: Tổng tiền sản phẩm
                now,
                now, // create_cannel -> tôi để tạm là now vì không có status/cancel_at
                payment || 'COD' // Phương thức thanh toán
            ]);

            const orderId = orderResult.insertId; // Lấy ID của đơn hàng vừa tạo

            // 4. Tạo bản ghi Chi tiết Đơn hàng (Giả định bạn có bảng order_detail nếu không thì bỏ qua bước này)
            // LƯU Ý: Vì bạn chưa có bảng order_detail, tôi sẽ bỏ qua bước này để không làm lỗi code của bạn.
            // Nếu bạn muốn lưu chi tiết, bạn cần tạo bảng và thêm đoạn code lặp qua orderDetails ở đây.

            // 5. Xóa Giỏ hàng (Cart)
            const deleteCartSql = `DELETE FROM cart`;
            await con.promise().query(deleteCartSql);

            // 6. Hoàn tất Transaction
            con.commit((commitErr) => {
                if (commitErr) {
                    con.rollback(() => {
                        console.error("Error committing transaction:", commitErr);
                        return res.status(500).json({ message: "Lỗi Server (Commit)." });
                    });
                }
                res.json({ 
                    message: "Order placed successfully!", 
                    orderId: orderId,
                    total: finalTotal
                });
            });

        } catch (error) {
            // Rollback nếu có bất kỳ lỗi nào xảy ra
            con.rollback(() => {
                console.error("Transaction rolled back due to error:", error.message);
                res.status(500).json({ message: `Đặt hàng thất bại: ${error.message}` });
            });
        }
    });
});


// app use image
app.use("/images", express.static(storageDir));

// 404 not found
app.use((req, res) => {
  res.status(404).send("404 - not found!");
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
