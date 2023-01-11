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
    file_name: {
        type: String,
        default:'New File',
    },
    link_up_with_subject: {
        type: [String],
        default:undefined,
    },
    file_access: {
        type: String,
        default:'',
    },
    parent_folder_id: {
        type: String,
        default:'',
    },
},{ timestamps: true });

module.exports = mongoose.model("file", schema);
