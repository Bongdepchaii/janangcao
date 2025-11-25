require("dotenv").config();
const express = require("express");

// thu vien import multer and path
const multer = require("multer");
const path = require("path");

const app = express();
const port = 8080;
let mysql = require("mysql");
const nodecache = require("node-cache");
const myCache = new nodecache();

// add cors middleware, npm install cors
const cors = require("cors");
app.use(cors());

// upload img
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
    "SELECT * FROM product limit " +
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
  // ĐÃ BỎ KHOẢNG TRẮNG
  con.query(
    "SELECT COUNT(*) as total FROM product",
    function (err, result, fields) {
      if (err) {
        console.error("Error fetching count:", err);
        return res.status(500).send("Database query failed.");
      }
      // LƯU Ý: ĐẢM BẢO TRẢ VỀ JSON, VÍ DỤ: { "total": 50 }
      res.json(result[0]);
    }
  );
});

//node-cache
app.get("/productdetail/:id", (req, res) => {
  // THÊM DÒNG NÀY: Khai báo biến productId để sử dụng
  const productId = req.params.id;
  const cacheproduct = myCache.get(productId); // ... (xử lý cache) // SỬA: Sử dụng Prepared Statement và chỉ truyền productId
  const sql = "SELECT * FROM product WHERE id = ?";

  con.query(sql, [productId], function (err, result, fields) {
    // Truyền [productId]
    if (err) {
      console.error("Lỗi truy vấn chi tiết sản phẩm:", err); // Ghi log lỗi database chi tiết
      // Trả về lỗi 500 nếu có lỗi DB
      return res.status(500).json({ message: "Lỗi truy vấn cơ sở dữ liệu." });
    }
    console.log("dl tu database");
    myCache.set(productId, result);
    res.json(result);
  });
});

// API thêm sản phẩm
app.post("/addproduct", (req, res) => {
  // BƯỚC 1: Xử lý Upload file trước
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error("Multer Error:", err);
      return res.status(500).json({ message: "Lỗi upload file." });
    } else if (err) {
      console.error("Unknown Error:", err);
      return res.status(500).json({ message: "Lỗi Server không xác định." });
    }
    const { Name, Quantity, Price } = req.body;
    const Img = req.file ? req.file.filename : null;

    if (!Name || !Quantity || !Price) {
      if (req.file) {
        const fs = require("fs");
        fs.unlinkSync(req.file.path);
      }
      return res
        .status(400)
        .json({ message: "Thiếu dữ liệu: Name, Quantity, hoặc Price." });
    }

    const sql =
      "INSERT INTO product (name, quantity, price, img) VALUES (?, ?, ?, ?)";

    con.query(sql, [Name, Quantity, Price, Img], (err, result) => {
      if (err) {
        console.error("Database error:", err);
        return res
          .status(500)
          .json({ message: "Lỗi thêm sản phẩm vào database." });
      }
      res.json({ message: "Thêm thành công!" });
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
        .json({ message: "Lỗi xóa sản phẩm khỏi database." });
    }
    res.json({ message: "Xóa thành công!" });
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
