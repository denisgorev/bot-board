const express = require("express"); 
require('dotenv').config()
const app = express();
const PORT = process.env.PORT
const boardGameBot = require('./controllers/bot-controller')
const mongoose = require('mongoose');

app.get('/', (req, res) => {
    res.send('Hello debug_Yourself')
})

boardGameBot.boardGameBot()

// app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))

mongoose
    .connect(process.env.MONGO_CRED)
    .then(() => {
        app.listen(PORT, () => console.log(`My server is running on port ${PORT}`))
    })
    .catch(err => {
        console.log(err);
    });
