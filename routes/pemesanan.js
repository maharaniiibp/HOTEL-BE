const express = require('express')
// var body = require("body-parser");

const app = express()

app.use(express.json())

var bodyParser = require("body-parser");
app.use(bodyParser.json());
// // penggunaan body-parser untuk ekstrak data request dari body
app.use(bodyParser.urlencoded({extended: true}));

const pemesananController = require("../controllers/pemesanan.controller")
// const upload = require('../controller/upload-cover');
const auth = require(`../auth/auth`)

app.get("/",auth.authVerify, pemesananController.getAllPemesanan)
// app.put('/status/:id', auth.authVerify, pemesananController.updateStatusBooking)
app.post("/findPemesanan", pemesananController.findPemesanan)
app.post("/find", pemesananController.findNumber)
app.post("/findPemesananCheck",pemesananController.findPemesananCheck)
app.post("/add", pemesananController.addPemesanan)
// app.put("/:id", auth.authVerify,pemesananController.updatePemesanan)
// app.delete("/:id", auth.authVerify,pemesananController.deletePemesanan)
app.put("/updateStatusPemesanan/:id", pemesananController.updateStatusBooking)
app.get("/getbycust/:email", pemesananController.getByUser)


module.exports=app