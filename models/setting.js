const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema({
    PageId: {
        type: String,
        default: ''
    },
    Page_Logo: {
        type: String,
        default: ''
    },
    Title: {
        type: String,
        default: ''
    },
    Description : {
        type: String,
        default: ''
    },
    HTML: {
        type: String,
        default: ''
    },
    Last_Updated: {
        type: String,
        default: ''
    },
    Count_Time_Opened: {
        type: String,
        default: ''
    },
},{ timestamps: true });

module.exports = mongoose.model("settings", schema);
