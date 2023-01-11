const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema({
    Info_Card_Packet: {
        type: String,
        default: ''
    },
    Info_Card_Show_order: {
        type: Number,
        default: ''
    },
    Info_Card_Used_Fr: {
        type: String,
        default: ''
    },
    Info_Card_Logo: {
        type: String,
        default: ''
    },
    Header_Logo: {
        type: String,
        default: ''
    },
    Header_Title: {
        type: String,
        default: ''
    },
    Header_Description: {
        type: String,
        default: ''
    },
    HTML: {
        type: String,
        default: ''
    },
    Info_Card_BT_1_Show: {
        type: String,
        default: ''
    },
    Info_Card_BT_1_Link_to: {
        type: String,
        default: ''
    },
    Info_Card_BT_2_Show: {
        type: String,
        default: ''
    },
    Info_Card_BT_2_Link_to: {
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
    Body_Title: {
        type: String,
        default: ''
    },
    Body_Description: {
        type: String,
        default: ''
    },
},{ timestamps: true });

module.exports = mongoose.model("infocards", schema);
