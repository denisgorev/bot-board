const mongoose = require('mongoose');

const Schema = mongoose.Schema;


const broadcastSchema = new Schema({
    code: String,
    text: String,
});


module.exports = mongoose.model('Broadcast', broadcastSchema);