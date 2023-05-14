const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const userSchema = new Schema({
    name: String,
    chatId: String,
    role: String
});


module.exports = mongoose.model('User', userSchema);