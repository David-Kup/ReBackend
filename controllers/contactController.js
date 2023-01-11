const jwt = require("jsonwebtoken");
const axios = require("axios");
const indicative = require("indicative").validator;
const Contact = require("../models/contact");
const Message = require("../models/message");
const Email = require("../models/email");
const User = require("../models/users");

const { sendError, processItem } = require("../utils/utils");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
  const createdata = req.body;
  try {
    await indicative.validate(createdata, {
      owner: "required|email|min:1",
    });

    const data = {
      owner: createdata.owner,
      name: createdata.name,
      contact_number: JSON.parse(createdata.contact_number),
      email: JSON.parse(createdata.email),
      location: JSON.parse(createdata.location),
      category: createdata.category,
      Notes: createdata.Notes,
      link: JSON.parse(createdata.link),
      shareble: createdata.shareble,
      image: req.files.length > 0 ? req.files[0].filename : "",
      relate_other_subjects: JSON.parse(createdata.relate_other_subjects),
    };

    const contact = await Contact.create(data);

    res.status(200).json({
      status: "success",
      contact,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

// exports.getUnreadInfo = async (req, res) => {

//     const {owner,category,focus_following} = req.query;

//     let contact_filter = new Array;
//     contact_filter.push({owner: owner});

//     if(category == "Personal") {
//         contact_filter.push({category: "Personal"});
//     }

//     if(category == "Business") {
//         contact_filter.push({category: "Business"});
//     }

//     if(focus_following == "Focus") {
//         contact_filter.push({focus_folloing: "Focus"});
//     }

//     if(focus_following == "Following") {
//         contact_filter.push({focus_folloing: "Following"});
//     }

//     let infos = [];
//     let content = [];

//     try {
//         let contactresult = await Contact.find({ '$and': contact_filter }).sort('_id');

//         if (contactresult.length > 0) {
//             for(let i = 0; i<contactresult.length;i++) {
//                 let emails = contactresult[i].email;

//                 for(let j = 0; j<emails.length;j++) {
//                     let email_filter = new Array;
//                     email_filter.push({from: emails[j]});
//                     email_filter.push({to: owner});
//                     email_filter.push({show:false});
//                     email_filter.push({delete:false});
//                     let emailresult = await Email.find({ '$and': email_filter }).sort('_id');

//                     let message_filter = new Array;
//                     message_filter.push({from: owner});
//                     message_filter.push({to: emails[j]});
//                     message_filter.push({show: false});
//                     message_filter.push({delete: false});
//                     let messageresult = await Message.find({ '$and': message_filter }).sort('_id');

//                     content.push({
//                         to: emails[j],
//                         emailresult: emailresult,
//                         messageresult: messageresult,
//                         count: emailresult.length + messageresult.length,
//                     });
//                 }
//                 infos.push({
//                     to: contactresult[i],
//                     content: content
//                 })
//             }

//         }
//         res.status(200).json({
//             status: "success",
//             infos
//         });
//     } catch (err) {
//         console.log(err);
//         return sendError(req, res, 400, `Server error`);
//     }
// }

exports.getUnreadInfo = async (req, res) => {
  const { owner, category, focus_following } = req.query;

  let contact_filter = new Array();
  contact_filter.push({ owner: owner });

  if (category == "Personal") {
    contact_filter.push({ category: "Personal" });
  }

  if (category == "Business") {
    contact_filter.push({ category: "Business" });
  }

  if (focus_following == "Focus") {
    contact_filter.push({ focus_folloing: "Focus" });
  }

  if (focus_following == "Following") {
    contact_filter.push({ focus_folloing: "Following" });
  }

  let infos = [];

  try {
    let contactresult = await Contact.find({ $and: contact_filter }).sort( "_id" );

    let empty = true;
    if (contactresult.length > 0) {
      for (let i = 0; i < contactresult.length; i++) {
        let emails = contactresult[i].email;
        let content = [];
        let noticeEmail = false;
        for (let j = 0; j < emails.length; j++) {
          let email_filter = new Array();
          email_filter.push({ from: emails[j] });
          email_filter.push({ to: owner });
          email_filter.push({ show: false });
          email_filter.push({ delete: false });
          let emailresult = await Email.find({ $and: email_filter }).sort( "_id" );

          let message_filter = new Array();
          message_filter.push({ from: emails[j] });
          message_filter.push({ to: owner });
          message_filter.push({ show: false });
          message_filter.push({ delete: false });
          let messageresult = await Message.find({ $and: message_filter }).sort( "_id" );

          content.push({
            to: emails[j],
            emailresult: emailresult,
            messageresult: messageresult,
            count: emailresult.length + messageresult.length,
          });
          if ((emailresult.length + messageresult.length) > 0) {
            empty = false;
            noticeEmail = true;
          }
        }
        infos.push({
          to: contactresult[i],
          noticeEmail,
          content: content,
        });
      }
    }
    res.status(200).json({
      status: "success",
      infos,
      empty,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getAllInfo = async (req, res) => {
  const { owner, id } = req.query;

  let contact_filter = new Array();
  contact_filter.push({ _id: new mongoose.Types.ObjectId(id) });

  let infos = new Array();

  try {
    let contactresult = await Contact.findOne({
      _id: new mongoose.Types.ObjectId(id),
    });

    let emails = contactresult.email;

    for (let i = 0; i < emails.length; i++) {
      let email_filter = [];

      let or_filter = [];
      or_filter.push({ from: emails[i] });
      or_filter.push({ to: owner });
      or_filter.push({ delete: false });
      email_filter.push({ $and: or_filter });

      let or_filter_1 = [];
      or_filter_1.push({ to: emails[i] });
      or_filter_1.push({ from: owner });
      or_filter_1.push({ delete: false });
      email_filter.push({ $and: or_filter_1 });

      let emailresult = await Email.find({ $or: email_filter }).sort( "_id" );

      let message_filter = [];

      let or_filter_2 = [];
      or_filter_2.push({ from: emails[i] });
      or_filter_2.push({ to: owner });
      or_filter_2.push({ delete: false });
      message_filter.push({ $and: or_filter_2 });

      let or_filter_3 = [];
      or_filter_3.push({ to: emails[i] });
      or_filter_3.push({ from: owner });
      or_filter_3.push({ delete: false });
      message_filter.push({ $and: or_filter_3 });

      let messageresult = await Message.find({ $or: message_filter }).sort( "_id" );

      infos.push({
        to: emails[i],
        emailresult: emailresult,
        messageresult: messageresult,
        count: emailresult.length + messageresult.length,
      });
    }

    res.status(200).json({
      status: "success",
      contactresult,
      infos,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getContact = async (req, res) => {
  const { owner } = req.query;

  let filters = new Array();
  filters.push({ owner: owner });

  try {
    let contactresult = await Contact.find({ $and: filters }).sort("_id");
    res.status(200).json({
      status: "success",
      contactresult,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.edit = async (req, res) => {
  const updatedata = req.body;
  try {
    if (updatedata.owner) {
      await indicative.validate(updatedata, {
        owner: "required|email|min:1",
      });
    }

    const data = {
      owner: updatedata.owner,
      name: updatedata.name,
      contact_number: JSON.parse(updatedata.contact_number),
      email: JSON.parse(updatedata.email),
      location: JSON.parse(updatedata.location),
      category: updatedata.category,
      Notes: updatedata.Notes,
      link: JSON.parse(updatedata.link),
      shareble: updatedata.shareble,
      image: req.files.length > 0 ? req.files[0].filename : updatedata.image,
      relate_other_subjects: JSON.parse(updatedata.relate_other_subjects),
    };

    let contact = await Contact.updateOne(
      { _id: new mongoose.Types.ObjectId(updatedata.id) },
      data
    );

    res.status(200).json({
      status: "success",
      contact,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.delete = async (req, res) => {
  const { id } = req.body;

  let filters = new Array();
  filters.push({ _id: new mongoose.Types.ObjectId(id) });

  try {
    await Contact.deleteOne({ $and: filters });

    res.status(200).json({
      status: "success",
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getAccount = async (req, res) => {
  const { owner } = req.query;

  try {
    let accountresult = await User.find({ email: { $ne: owner } });
    res.status(200).json({
      status: "success",
      accountresult,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};
