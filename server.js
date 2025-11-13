const express = require('express');
const app = express();
const port = 8080;
let mysql = require('mysql');

const nodecache = require('node-cache');
// const { cache } = require('react');
const mycache = new nodecache({ stdTTL: 300, checkperiod: 120 });

let con = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "jsnangcao"

});

// con.connect(function(err) {
//   if (err) throw err;
//   console.log("Connected!");
// });  

// Define a route for GET requests to the root URL
app.get('/', (req, res) => {
  res.send('Hello World from Express!');
});

app.get('/home/:Trang/:LimitTrang', (req, res) => {
  con.query("Select * from product limit 10 offset" + (req.params.LimitTrang * (req.params.Trang - 1)),
    function (err, result, fields) {
      if (err) throw err;
      res.send(result);
    });
});

app.get('/home', (req, res) => {
  const cachekey = "allproducts";
  const cachedata = mycache.get(cachekey);
  if (cachedata) {
    console.log("[Cache kit] Serving /home from cache");
    return res.send(cachedata)
  }

  console.log("[Cache Miss] Querying DB for /home");
  //res.send('Hello Home page!');
  //if (err) throw err;
  con.query("SELECT * FROM product", function (err, result, fields) {
    if (err) throw err;
    mycache.set(cachekey, result)
    //console.log(result);
    res.send(result);
  });
});

app.use((req, res) => {
  res.status(404).send('404 - Trang ban yeu cau khong ton tai!!');
});

// Start the server
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});