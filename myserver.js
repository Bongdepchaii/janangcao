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


// ADMIN 

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

// API get all orders with details
app.get("/admin/orders", (req, res) => {
  const sql = `SELECT o.id AS order_id, o.create_at, o.payment, o.total AS order_total, o.customer_name, o.address, o.phone, (o.total - 15500) AS subtotal, oi.quantity AS qty, oi.price AS unit_price, p.name AS product_name, p.img 
    FROM orders o 
    JOIN order_item oi ON o.id = oi.idorder 
    JOIN product p ON oi.idproduct = p.id 
    ORDER BY o.id DESC, oi.id DESC`;

  con.query(sql, (err, result) => {
    if (err) {
      console.error("SQL Error in /admin/orders:", err);
      return res.status(500).json({ message: "DB error" });
    }

    const orders = {};
    const shippingFee = 15500;

    result.forEach(item => {
      if (!orders[item.order_id]) {
        orders[item.order_id] = {
          id: item.order_id,
          date: item.create_at,
          status: item.payment,
          total: item.order_total,
          customer_name: item.customer_name, // Bổ sung
          address: item.address, // Bổ sung
          phone: item.phone, // Bổ sung
          subtotal: item.order_total - shippingFee,
          shipping: shippingFee,
          details: []
        };
      }

      orders[item.order_id].details.push({
        name: item.product_name,
        qty: item.qty,
        price: item.unit_price,
        img: item.img
      });
    });

    res.json(Object.values(orders));
  });
});

app.put("/admin/order/update/:id", (req, res) => {
  const orderId = req.params.id;
  const { status } = req.body;

  if (!status) {
    return res.status(400).json({ message: "Status is required." });
  }

  let sql;
  let params;

  if (status.toLowerCase() === 'canceled') {
    sql = "UPDATE orders SET payment = ?, cannel_at = ? WHERE id = ?";
    params = [status, new Date(), orderId];
  } else {
    sql = "UPDATE orders SET payment = ? WHERE id = ?";
    params = [status, orderId];
  }

  con.query(sql, params, (err, result) => {
    if (err) {
      console.error("Database error updating status:", err);
      return res.status(500).json({ message: "Error updating order status." });
    }
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Order not found." });
    }
    res.json({ message: `Order ID ${orderId} status updated to ${status}.` });
  });
});


// USER

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
app.get("/order", (req, res) => {
  const queryorder = "SELECT SUM(gh.quantity) AS total_quantity_cart, SUM(gh.quantity * sp.price) AS total_price_cart FROM cart gh LEFT JOIN product sp ON gh.idproduct = sp.id;"
  con.query(queryorder, (err, result) => {
    if (err) return res.status(500).json({ error: "DB error" });
    res.json(result[0]);
  })
});

// complete payment
app.post("/payment/complete", async (req, res) => {
  // Thêm các biến mới nhận từ body request
  const { customer_name, address, phone } = req.body;

  // Kiểm tra dữ liệu bắt buộc
  if (!customer_name || !address || !phone) {
    return res.status(400).json({ message: "Thiếu thông tin nhận hàng: tên, địa chỉ hoặc số điện thoại." });
  }

  const getCartDetails = `SELECT gh.idproduct, gh.quantity, sp.price, sp.quantity AS stock FROM cart gh LEFT JOIN product sp ON gh.idproduct = sp.id`;

  const now = new Date();
  const shippingFee = 15500;

  try {
    const cartItems = await new Promise((resolve, reject) => {
      con.query(getCartDetails, (err, result) => {
        if (err) return reject(err);
        resolve(result);
      });
    });

    // vallidate cart item and stock
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({ message: `Product id ${item.idproduct} stock not enough.` });
      };
    };

    if (cartItems.length === 0) return res.status(400).json({ message: "Giỏ hàng rỗng" });

    const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalAmount = subtotal + shippingFee;

    // Cập nhật query INSERT INTO orders để thêm thông tin người nhận
    const orderId = await new Promise((resolve, reject) => {
      const insertOrderHeader = `INSERT INTO orders (total, create_at, payment, customer_name, address, phone) VALUES (?, ?, ?, ?, ?, ?)`;
      con.query(insertOrderHeader, [totalAmount, now, "Pending", customer_name, address, phone], (err, result) => {
        if (err) return reject(err);
        resolve(result.insertId);
      });
    });

    // Phần còn lại: Thêm vào order_item, cập nhật product quantity, xóa cart
    for (const item of cartItems) {
      // ... (Phần logic insertOrderDetail, updateProduct, deleteCart giữ nguyên)
      await new Promise((resolve, reject) => {
        const insertOrderDetail = `INSERT INTO order_item (idorder, idproduct, quantity, price) VALUES (?, ?, ?, ?)`;
        con.query(insertOrderDetail, [orderId, item.idproduct, item.quantity, item.price], (err) => {
          if (err) {
            console.error("Insert Order Item Error:", err);
            return reject(err);
          }
          resolve();
        });
      });

      await new Promise((resolve, reject) => {
        const updateProduct = `UPDATE product SET quantity = quantity - ? WHERE id = ?`;
        con.query(updateProduct, [item.quantity, item.idproduct], (err) => {
          if (err) return reject(err);
          resolve();
        });
      });
    }

    await new Promise((resolve, reject) => {
      con.query("DELETE FROM cart", (err) => {
        if (err) return reject(err);
        resolve();
      });
    });


    res.json({ message: `Thanh toán thành công. Mã đơn hàng: ${orderId}` });
  } catch (error) {
    console.error("Lỗi trong quá trình thanh toán:", error);
    res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình thanh toán. Vui lòng kiểm tra nhật ký máy chủ." });
  }
});

// history order user
app.get("/order/history", (req, res) => {
  const sql = `SELECT o.id AS order_id, o.create_at, o.payment, o.total AS order_total, oi.quantity AS qty, oi.price AS unit_price, p.name AS product_name, p.img FROM orders o JOIN order_item oi ON o.id = oi.idorder JOIN product p ON oi.idproduct = p.id ORDER BY o.id DESC, oi.id DESC`;
  con.query(sql, (err, result) => {
    if (err) return res.status(500).json({ message: "DB error" });

    const history = {};

    result.forEach(item => {
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
  const queryupdatequantity = "UPDATE product SET quantity = quantity + ? WHERE id = ?";

  // first getting order items to restore product quantitiles
  con.query("SELECT oi.idproduct, oi.quantity from order_item oi where oi.idorder = ?", [req.params.id], (err, items) => {
    if (err) {
      console.error("Error fetching order items:", err);
      return res.status(500).json({ message: "Error canel order" });
    }
    // Restore produtc quantities
    items.forEach(item => {
      con.query(queryupdatequantity, [item.quantity, item.idproduct], (err) => {
        if (err) {
          console.error("Error restoring product quanttity:", err);
          return res.status(500).json({ message: "Error canel orer" });
        };
      });
    });
  });

  con.query(sql, [new Date(), req.params.id], (err, result) => {
    if (err) return res.status(500).json({ message: "Error cancel order" });
    if (result.affectedRows === 0) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order canceled" });
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
