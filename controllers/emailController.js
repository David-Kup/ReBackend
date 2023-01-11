const jwt = require("jsonwebtoken");
const axios = require("axios");
const indicative = require("indicative").validator;
const Email = require("../models/email");
const Contact = require("../models/contact");
const { sendError, processItem } = require("../utils/utils");
const mongoose = require("mongoose");
var FormData = require("form-data");
var fs = require("fs");
const Nylas = require("nylas");

exports.send = async (req, res) => {
  const send_data = req.body;
  try {
    await indicative.validate(send_data, {
      from: "required|email|min:1",
      to: "required|email|min:1",
    });

    let media = new Array();

    let medianylasid1 = [];
    let medianylasid2 = [];
    
    Nylas.config({
      clientId: "746kr6ifwu65a4vfdtil8t90h",
      clientSecret: "10qqmmauowm40xdeoma5ob7nt",
    });

    const nylas = Nylas.with("YNMXLzjAts8q2lz8ZEZXi0Jt6hJS3R");

    if (req.files.length > 0) {
      let temp_media = new Array();
      for (let i = 0; i < req.files.length; i++) {
        var form = new FormData();
        form.append("file", fs.createReadStream(req.files[i].path));
        let fileuploadresult1 = await axios.post(
          "https://api.nylas.com/files",
          form,
          {
            headers: {
              Authorization: `Bearer ${process.env.ACCESS_TOKEN}`,
              ...form.getHeaders(),
            },
          }
        );
        medianylasid1.push(fileuploadresult1.data[0].id);
        
        temp_media.push(req.files[i].filename);
      }
      media = temp_media;
    }

    const data = {
      from: send_data.from,
      to: send_data.to,
      subject: send_data.subject,
      content: send_data.content,
      media: media,
      link: JSON.parse(send_data.link),
    };

    var tempdata = await Contact.findOne({
      owner: send_data.to,
      email: send_data.from,
    });
    if (tempdata == null) {
      tempdata = new Contact();
      tempdata.owner = send_data.to;
      tempdata.email.push(send_data.from);
      await tempdata.save();
    }
    tempdata = await Contact.findOne({
      owner: send_data.from,
      email: send_data.to,
    });
    if (tempdata == null) {
      tempdata = new Contact();
      tempdata.owner = send_data.from;
      tempdata.name = send_data.name;
      tempdata.email.push(send_data.to);
      await tempdata.save();
    }

    var draft = nylas.drafts.build({
      subject: `No Reply, < ${data.subject} > From Recite`,
      to: [
        {
          email: data.to,
          name: "",
        },
      ],
      body: `You received Message from ${data.from}.\n${data.content}`,
      file_ids: medianylasid1,
    });

    let message = await draft.send();

    const email = await Email.create(data);

    res.status(200).json({
      status: "success",
      email,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getAllEmail = async (req, res) => {
  const { owner, to, page, display_per_page } = req.query;

  let orQuery = [];
  const or1 = [];
  or1.push({ from: owner });
  or1.push({ to: to });
  or1.push({ delete: false });
  orQuery.push({ $and: or1 });

  const or2 = [];
  or2.push({ from: to });
  or2.push({ to: owner });
  or2.push({ delete: false });
  orQuery.push({ $and: or2 });

  try {
    const offset = page * display_per_page;
    let emailresult = await Email.find({ $or: orQuery })
      .sort("createdAt")
      .exec();
    res.status(200).json({
      status: "success",
      emailresult,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getUnreadEmail = async (req, res) => {
  const { to } = req.query;

  let filters = new Array();
  filters.push({ to: to });
  filters.push({ show: false });

  try {
    let emailresult = await Email.find({ $and: filters }).sort("_id");
    res.status(200).json({
      status: "success",
      emailresult,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getDeletedEmail = async (req, res) => {
  const { to } = req.query;

  let filters = new Array();
  filters.push({ to: to });
  filters.push({ delete: true });

  try {
    let emailresult = await Email.find({ $and: filters }).sort("_id");
    res.status(200).json({
      status: "success",
      emailresult,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.read = async (req, res) => {
  const { id, owner } = req.body;
  try {
    const read_email = await Email.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { show: true }
    );
    res.status(200).json({
      status: "success",
      read_email,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.delete = async (req, res) => {
  const { id } = req.body;
  try {
    const delete_email = await Email.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      { delete: true }
    );
    res.status(200).json({
      status: "success",
      delete_email,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getEmail = async (req, res) => {
  const { id } = req.query;
  try {
    let result = await Email.findOne({ _id: new mongoose.Types.ObjectId(id) });
    res.status(200).json({
      status: "success",
      result,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};
