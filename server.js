const express = require(`express`)
var bodyParser = require('body-parser')
/** create object that instances of express */
const app = express()
const PORT = 8000
const cors = require(`cors`)
app.use(cors())
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }))
 
// parse application/json
app.use(bodyParser.json())

const tipe_kamarRoute = require(`./routes/tipe_kamar.route`)
app.use(`/tipekamar`, tipe_kamarRoute)

const kamarRoute = require(`./routes/kamar.route`)
app.use(`/kamar`, kamarRoute)

const userRoute = require(`./routes/user.route`)
app.use(`/user`, userRoute)

const pemesananRoute = require(`./routes/pemesanan.route`)
app.use(`/pemesanan`, pemesananRoute)

app.listen(PORT, () => {
    console.log(`Server of hotel runs on port
    ${PORT}`)
    })
    
