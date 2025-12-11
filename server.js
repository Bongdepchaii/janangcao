require("dotenv").config();
const express = require("express");
const app = express();
const port = 8080;
let mysql = require("mysql");
const nodecache = require("node-cache");
const myCache = new nodecache();
const multer = require("multer");
const path = require("path");
const cors = require("cors");
const { error } = require("console");
app.use(cors());

const storageDir = path.join(__dirname, "public", "images");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, storageDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage }).single("image");

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

app.get("/", (req, res) => {
  res.send("Hello World from Express!");
});

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
  con.query(
    "SELECT COUNT(*) as total FROM product",
    function (err, result, fields) {
      if (err) {
        console.error("Error fetching count:", err);
        return res.status(500).send("Database query failed.");
      }
      res.json(result[0]);
    }
  );
});

app.get("/productdetail/:id", (req, res) => {
  const productId = req.params.id;
  const sql = "SELECT * FROM product WHERE id = ?";

  con.query(sql, [productId], function (err, result, fields) {
    if (err) {
      console.error("Lỗi truy vấn chi tiết sản phẩm:", err);
      return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu." });
    }
    console.log("dl tu database");
    myCache.set(productId, result);
    res.json(result);
  });
});

app.post("/addproduct", (req, res) => {
  upload(req, res, function (err) {
    if (!req.file) {
      return res.status(400).json({ message: "Please add Images." });
    }

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
    const newImg = req.file ? req.file.filename : null;

    if (!Name || !Quantity || !Price) {
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

app.post("/addtocart/:id", (req, res) => {
  const id = req.params.id;
  const created_at = new Date();

  const checkquery = "select * from cart where idproduct = ?";
  con.query(checkquery, [id], (err, result) => {
    if (err) {
      console.error("Database error: ", err);
      return res.status(500).json({ message: "Database error" });
    }
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

app.get("/order", (req, res) => {
  const queryorder = "SELECT SUM(gh.quantity) AS total_quantity_cart, SUM(gh.quantity * sp.price) AS total_price_cart FROM cart gh LEFT JOIN product sp ON gh.idproduct = sp.id;"
  con.query(queryorder, (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(result[0]);
  })
});

// complete payment (Đã sửa lỗi Parse Error và phí ship)
app.post("/payment/complete", async (req, res) => {
  // Query lấy thông tin chi tiết sản phẩm trong giỏ hàng (bao gồm giá)
  // Đã chuyển thành 1 dòng để tránh lỗi ký tự Parse Error
  const getCartDetails = "SELECT gh.idproduct, gh.quantity, sp.price FROM cart gh LEFT JOIN product sp ON gh.idproduct = sp.id"; 

  const now = new Date();
  const shippingFee = 15500; // Đã sửa để khớp với 15.500 ₫ trên giao diện

  try {
    const cartItems = await new Promise((resolve, reject) => {
      con.query(getCartDetails, (err, result) => {
        if (err) {
            console.error("SQL Error getCartDetails:", err);
            return reject(err);
        }
        resolve(result);
      });
    });

    if (cartItems.length === 0) return res.status(400).json({ message: "Cart empty" });

    // Tính tổng tiền
    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal + shippingFee;

    // BƯỚC 1: TẠO HEADER ĐƠN HÀNG (Bảng orders)
    const orderId = await new Promise((resolve, reject) => {
      const insertOrderHeader = "INSERT INTO orders (total, create_at, payment) VALUES (?, ?, ?)";
      con.query(insertOrderHeader, [totalAmount, now, "Pending"], (err, result) => {
        if (err) {
            console.error("SQL Error insertOrderHeader:", err);
            return reject(err);
        }
        resolve(result.insertId);
      });
    });

    // BƯỚC 2: TẠO DETAIL ĐƠN HÀNG (Bảng order_item) và cập nhật quantity
    for (const item of cartItems) {
      await new Promise((resolve, reject) => {
        const insertOrderDetail = "INSERT INTO order_item (idorder, idproduct, quantity, price) VALUES (?, ?, ?, ?)";
        con.query(insertOrderDetail, [orderId, item.idproduct, item.quantity, item.price], (err) => {
          if (err) {
            console.error("Insert Order Item Error:", err);
            return reject(err);
          }
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        const updateProduct = "UPDATE product SET quantity = quantity - ? WHERE id = ?";
        con.query(updateProduct, [item.quantity, item.idproduct], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    // BƯỚC 3: Xóa giỏ hàng
    await new Promise((resolve, reject) => {
      con.query("DELETE FROM cart", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    res.json({ message: `Payment success. Order ID: ${orderId}` });
  } catch (error) {
    console.error("Payment Process Error:", error);
    res.status(500).json({ message: "An error occurred during payment. Check server logs." });
  }
});

// history order user (Đã sửa lỗi Parse Error)
app.get("/order/history", (req, res) => {
  // Query gộp 3 bảng: orders (header), order_item (detail) và product
  const sql = `
        SELECT 
            o.id AS order_id, 
            o.create_at, 
            o.payment, 
            o.total AS order_total,
            oi.quantity AS qty, 
            oi.price AS unit_price,
            p.name AS product_name, 
            p.img
        FROM orders o
        JOIN order_item oi ON o.id = oi.idorder
        JOIN product p ON oi.idproduct = p.id
        ORDER BY o.id DESC, oi.id DESC
    `.trim(); // <--- Đã thêm .trim() để khắc phục lỗi Parse Error

  con.query(sql, (err, result) => {
    if (err) {
        console.error("SQL Error in /order/history:", err); // Log lỗi chi tiết hơn
        return res.status(500).json({ message: "DB error" });
    }

    const history = {};

    result.forEach(item => {
      // Gom nhóm theo order_id
      if (!history[item.order_id]) {
        history[item.order_id] = {
          id: item.order_id,
          date: item.create_at,
          status: item.payment,
          total: item.order_total,
          details: []
        };
      }

      history[item.order_id].details.push({
        name: item.product_name,
        qty: item.qty,
        price: item.unit_price,
        img: item.img
      });
    });

    res.json(Object.values(history));
  });
});


// cannel order
app.put("/order/cancel/:id", (req, res) => {
  const sql = "UPDATE orders SET payment = 'Canceled', cannel_at = ? WHERE id = ?";
  con.query(sql, [new Date(), req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error cancel order" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order canceled" });
  });
});

app.use("/images", express.static(storageDir));

app.use((req, res) => {
  res.status(404).send("404 - not found!");
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});