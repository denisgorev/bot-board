const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const scriptSchema = new Schema({
    code: String,
    text: String,
    next_codes: Array,
    acceptable_role_codes: Array
});


module.exports = mongoose.model('Script', scriptSchema);