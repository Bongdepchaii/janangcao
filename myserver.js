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

    con.query(sql, [Name, Quantity, Price, Img], (err, result) => {
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
