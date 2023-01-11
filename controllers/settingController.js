const jwt = require('jsonwebtoken');
const axios = require('axios');
const indicative = require('indicative').validator;
const Setting = require('../models/setting');
const { sendError, processItem } = require('../utils/utils');

exports.getallinfo = async (req, res) => {
    try {
        const Settinglist = await Setting.find({});
        res.status(200).json({
            status: "success",
            Settinglist
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.create = async(req, res) => {
    const createdata = req.body.createdata;
    try {
        const setting = await Setting.create(createdata);

        res.status(200).json({
            status: "success",
            setting
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.edit = async(req, res) => {
    const updatedata = req.body.updatedata;

    try {
        let setting = await Setting.findOneAndUpdate({_id: new mongoose.Types.ObjectId(updatedata.id)}, updatedata);

        res.status(200).json({
            status: "success",
            setting
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}
