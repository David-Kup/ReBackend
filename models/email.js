const mongoose = require('mongoose');
const validator = require('validator');

const schema = new mongoose.Schema({
    from: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Plase provide a valid email']
    },
    to: {
        type: String,
        required: [true, 'Please provide email'],
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, 'Plase provide a valid email']
    },
    subject: {
        type: String,
        default:'',
    },
    content: {
        type: String,
        default:''
    },
    media: {
        type: [String],
        default:undefined,
    },
    link: {
        type: [String],
        default: undefined,
    },
    show: {
        type: Boolean,
        default:false,
    },
    mid: {
        type: String,
        default:'',
    },
    fromDelete: {
        type: Boolean,
        default:false,
    },
    toDelete: {
        type: Boolean,
        default:false,
    },
    delete: {
        type: Boolean,
        default:false,
    },
    remind: {
      type: Date,
      default: new Date(),
    }
},{ timestamps: true });

module.exports = mongoose.model("email", schema);
