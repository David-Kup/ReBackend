const jwt = require('jsonwebtoken');
const axios = require('axios');
const indicative = require('indicative').validator;
const Message = require('../models/message');
const { sendError, processItem } = require('../utils/utils');
const mongoose = require('mongoose');


exports.send = async(req, res) => {
    const send_data = req.body;
    try {
        await indicative.validate(send_data, {
            from: 'required|email|min:1',
            to: 'required|email|min:1',
        });

        let media = new Array;
        if(req.files.length>0){
            let temp_media = new Array;
            for(let i=0;i<req.files.length;i++) {
                temp_media.push(req.files[i].filename);
            }
            media = temp_media;
        }

        const data = {
            from:send_data.from,
            to:send_data.to,
            subject: send_data.subject,
            content: send_data.content,
            media: media,
            link: JSON.parse(send_data.link),
        }

        const message = await Message.create(data);

        res.status(200).json({
            status: "success",
            message
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}


exports.getAllMessage = async (req, res) => {
    const {user1, user2, page, display_per_page} = req.query;

    let orQuery = [];
    const or1 = [];
    or1.push({from: user1});
    or1.push({to: user2});
    or1.push({delete:false});
    orQuery.push({'$and': or1});


    const or2 = [];
    or2.push({from: user2});
    or2.push({to: user1});
    or2.push({delete:false});
    orQuery.push({'$and': or2});

    try {

        const offset = page * display_per_page;
        let messageresult = await Message.find({ '$or':orQuery }).sort('createdAt').exec();
        res.status(200).json({ 
            status: "success",
            messageresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.getUnreadMessage = async(req, res) => {
    const {from, to} = req.query;

    let filters = new Array;
    filters.push({from: from});
    filters.push({to: to});
    filters.push({show: false});


    try {
        let messageresult = await Message.find({ '$and': filters }).sort('_id');
        res.status(200).json({
            status: "success",
            messageresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.getDeletedMessage = async(req, res) => {
    const {from, to} = req.query;

    let filters = new Array;
    filters.push({from: from});
    filters.push({to: to});
    filters.push({delete: true});

    try {
        let messageresult = await Message.find({ '$and': filters }).sort('_id');
        res.status(200).json({
            status: "success",
            messageresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.read = async(req, res) => {
    const { id } = req.body;
    try {
        const read_message = await Message.updateOne({_id: new mongoose.Types.ObjectId(id)}, {"show":true});
        res.status(200).json({
            status: "success",
            read_message
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.delete = async(req, res) => {
    const { id } = req.body;
    try {
        const delete_message = await Message.updateOne({_id: new mongoose.Types.ObjectId(id)}, {"delete":true});
        res.status(200).json({
            status: "success",
            delete_message
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}


exports.getMessage = async(req, res) => {
    const { id } = req.query;
    try {
        let result = await Message.findOne({_id: new mongoose.Types.ObjectId(id)});
        res.status(200).json({
            status: "success",
            result
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}
