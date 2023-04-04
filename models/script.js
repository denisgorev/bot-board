const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const scriptSchema = new Schema({
    code: String,
    text: String,
});


module.exports = mongoose.model('Script', scriptSchema);