const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema({
    creator: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Plase provide a valid email']
    },
    folder_name: {
        type: String,
        default:'New Folder',
    },
    folder_path: {
        type: String,
        default:''
    },
    link_up_with_subject: {
        type: [String],
        default:undefined,
    },
    folder_icon: {
        type: String,
        default:'',
    },
},{ timestamps: true });

module.exports = mongoose.model("folder", schema);
