require("dotenv").config();
const express = require("express");
const app = express();
const port = 8080;
let mysql = require("mysql");
const nodecache = require("node-cache");
const myCache = new nodecache();

// add cors middleware, npm install cors
const cors = require("cors");
app.use(cors());

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
app.get("/detailproduct/:productid", (req, res) => {
  //lay dl tu cache
  const cacheproduct = myCache.get(req.params.productid);
  if (cacheproduct) {
    console.log("dl tu cache");
    return res.json(cacheproduct);
  }

  con.query(
    "SELECT * FROM product where id = " + req.params.productid,
    function (err, result, fields) {
      if (err) throw err;
      //set cache;
      console.log("dl tu database");
      myCache.set(req.params.productid, result);
      res.json(result);
    }
  );
});

// API thêm sản phẩm
app.post("/addproduct", (req, res) => {
  const { Id, Name, Quantity, Price, Img } = req.body;

  if (!Id || !Name || !Quantity || !Price) {
    return res.status(400).json({ message: "Thiếu dữ liệu" });
  }

  const sql =
    "INSERT INTO product (name, quantity, price, img) VALUES (?, ?, ?, ?, ?)";
  con.query(sql, [Id, Name, Quantity, Price, Img], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ message: "Lỗi thêm sản phẩm" });
    }
    res.json({ message: "Thêm thành công!" });
  });
});

app.use((req, res) => {
  res.status(404).send("404 - not found!");
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
