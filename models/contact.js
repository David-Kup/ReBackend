const mongoose = require("mongoose");
const validator = require("validator");

const schema = new mongoose.Schema(
  {
    owner: {
      type: String,
      required: [true, "Please provide email"],
      trim: true,
      lowercase: true,
      validate: [validator.isEmail, "Plase provide a valid email"],
    },
    name: {
      type: String,
      default: "",
    },
    contact_number: {
      type: [String],
      default: [],
    },
    email: {
      type: [String],
      default: [],
    },
    location: {
      type: [String],
      default: [],
    },
    category: {
      type: String,
      default: "Personal",
    },
    focus_folloing: {
      type: String,
      default: "Focus",
    },
    Notes: {
      type: String,
      default: "",
    },
    link: {
      type: [
        {
          social: String,
          link: String,
        },
      ],
      default: [],
    },
    image: {
      type: String,
      default: "",
    },
    shareble: {
      type: Boolean,
      default: false,
    },
    relate_other_subjects: {
      type: [String],
      default: [],
    },
    shareFolder: {
      type: Boolean,
      default: false,
    },
    shareFile: {
      type: Boolean,
      default: false,
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("contact", schema);
