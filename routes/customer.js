const express = require('express')
var body = require("body-parser");

const app = express()

app.use(express.json())

// var bodyParser = require("body-parser");
// app.use(bodyParser.json());
// // penggunaan body-parser untuk ekstrak data request dari body
// app.use(bodyParser.urlencoded({extended: true}));

const customerController = require("../controllers/customer.controller");
// const upload = require('../controller/upload-cover');
const auth = require(`../auth/auth`)

app.post("/loginCust", customerController.loginCust)
app.get("/getAllCustomer", customerController.getAllCustomer)
app.post("/findCustomer", customerController.findCustomer)
app.post("/addCustomer", customerController.addCustomer)
app.delete("/:id", customerController.deleteCustomer)
app.put("/:id",  customerController.updateCustomer) 

module.exports=app