const express = require('express')
var body = require("body-parser");

const app = express()

app.use(express.json())


const tipeController = require("../controllers/tipe_kamar.controller");
// const upload = require('../controller/upload-cover');
const auth = require(`../auth/auth`)

app.get("/getAll", tipeController.getAllType)
app.post("/find", tipeController.findType)
app.post("/add", auth.authVerify,tipeController.addType)
app.delete("/:id", auth.authVerify,tipeController.deleteType)
app.put("/:id", auth.authVerify,tipeController.updateType)
app.post("/getAvailableType", tipeController.getAvailable)

module.exports=app