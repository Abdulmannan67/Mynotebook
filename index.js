const express = require('express');

const connectToMongo = require('./db')
var cors = require('cors')
connectToMongo();

const app = express()
const port =process.env.PORT || 8000;

//Now, we are getting an error as the access to fetch the API from the https://localhost:3000 has been blocked by the CORS policy. 

app.use(cors())

// uploads k photos page pr dikhane k liye
app.use('/uploads',express.static('uploads'))

app.use(express.json())
app.use('/api/auth', require("./routes/auth"));
app.use('/api/upload', require("./routes/upload"));
app.use('/api/notes', require("./routes/notes"));





app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})