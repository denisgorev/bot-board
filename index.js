const express = require("express"); 
require('dotenv').config()
const app = express();
const PORT = process.env.PORT
const boardGameBot = require('./controllers/bot-controller')
const mongoose = require('mongoose');
const axios = require('axios');

// const WAIT_INTERVAL = 1680000 // 28 minutes
const WAIT_INTERVAL = 1680000
//  const TIMEOUT = 28800000 //8 hours
const TIMEOUT = 7200000
// 7200000
let interval = 0;

app.get('/', (req, res) => {
    res.send('Hello debug_Yourself')
})




const wakeUp = async () => {
    try {
        await axios.get('https://bot-boardgame.onrender.com')
    } catch (err) {
        console.log(err)
    }
};
const timeFinish = () => {
    clearInterval(interval);
    console.log('go to sleep');
}

interval = setInterval(wakeUp, WAIT_INTERVAL);
setTimeout(timeFinish, TIMEOUT);



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
