const jwt = require('jsonwebtoken');
const axios = require('axios');
const indicative = require('indicative').validator;
const Infocard = require('../models/infocard');
const { sendError, processItem, upload } = require('../utils/utils');
const { json } = require('express');
const mongoose = require('mongoose');

exports.getallinfo = async (req, res) => {

    try {
        const Infocardlist = await Infocard.find({Info_Card_Packet: req.query.packet}).sort('Info_Card_Show_order');
        res.status(200).json({
            status: "success",
            Infocardlist
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.create = async(req, res, next) => {
    const { showOrder, bt1Show, bt2Show, bodyTitle, bodyDesc, headerTitle, headerDesc, cardPacket, userFr, bt1Link, bt2Link } = req.body;

    try {
        const infocard = await Infocard.create({
            Info_Card_Show_order: showOrder,
            Info_Card_BT_1_Show: bt1Show,
            Info_Card_BT_2_Show: bt2Show,
            Body_Title: bodyTitle,
            Body_Description: bodyDesc,
            Header_Title: headerTitle,
            Header_Description: headerDesc,
            Info_Card_Packet: cardPacket,
            Info_Card_Used_Fr: userFr,
            Info_Card_BT_1_Link_to: bt1Link,
            Info_Card_BT_2_Link_to: bt2Link,
            Info_Card_Logo: (req.files.length>0? req.files[0].filename : ''),
        });

        res.status(200).json({
            status: "success",
            infocard
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.getInfocard = async (req, res) => {
    try {
        let Infocardresult = await Infocard.findOne({_id: new mongoose.Types.ObjectId(req.body.id)});
        res.status(200).json({
            status: "success",
            Infocardresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.edit = async(req, res) => {
    const {id, showOrder, bt1Show, bt2Show, bodyTitle, bodyDesc, headerTitle, headerDesc, cardPacket, userFr, bt1Link, bt2Link } = req.body;

    try {
        let img = req.files.length>0? req.files[0].filename : '';
        if(img == ''){
            const preinfocard = await Infocard.findById(id);
            img = preinfocard.Info_Card_Logo;
        }

        const updatedata = {
            Info_Card_Show_order: showOrder,
            Info_Card_BT_1_Show: bt1Show,
            Info_Card_BT_2_Show: bt2Show,
            Body_Title: bodyTitle,
            Body_Description: bodyDesc,
            Header_Title: headerTitle,
            Header_Description: headerDesc,
            Info_Card_Packet: cardPacket,
            Info_Card_Used_Fr: userFr,
            Info_Card_BT_1_Link_to: bt1Link,
            Info_Card_BT_2_Link_to: bt2Link,
            Info_Card_Logo: img,
        }

        let Infocardresult = await Infocard.findOneAndUpdate({_id: new mongoose.Types.ObjectId(id)}, updatedata);

        res.status(200).json({
            status: "success",
            Infocardresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}
