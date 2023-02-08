const express = require(`express`)
const app = express()
app.use(express.json())
const tipe_kamarController = require(`../controllers/tipe_kamar.controller`)

app.get("/get", tipe_kamarController.getAllTipe_kamar)
app.post("/add", tipe_kamarController.addTipe_kamar)
app.post("/find", tipe_kamarController.findTipe_kamar)
app.put("/:id", tipe_kamarController.updateTipe_kamar)
app.delete("/:id", tipe_kamarController.deleteTipe_kamar)

module.exports = app



