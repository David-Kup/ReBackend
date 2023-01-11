const jwt = require('jsonwebtoken');
const axios = require('axios');
const indicative = require('indicative').validator;
const Users = require('../models/users');
const { sendError, processItem } = require('../utils/utils');
const mongoose = require('mongoose');

exports.getalluser = async (req, res) => {
    try {
        const userlist = await Users.find({});
        res.status(200).json({
            status: "success",
            userlist
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.create = async(req, res) => {
    const createdata = req.body;
    try {
        await indicative.validate(createdata, {
            email: 'required|email|min:1',
        });

        const user = await Users.create(createdata);

        res.status(200).json({
            status: "success",
            user
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.edit = async(req, res) => {
    const updatedata = req.body;
    try {
        await indicative.validate(updatedata, {
            email: 'required|email|min:1',
        });

        let user = await Users.updateOne({_id: new mongoose.Types.ObjectId(updatedata.id)}, updatedata);

        res.status(200).json({
            status: "success",
            user
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.getUser = async (req, res) => {
    const {id} = req.body;
    try {
        let userresult = await Users.findOne({_id: new mongoose.Types.ObjectId(id)});
        res.status(200).json({
            status: "success",
            userresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.delAccount = async (req, res) => {
    const {id} = req.body;
    try {
        await Users.deleteOne({_id: new mongoose.Types.ObjectId(id)});
        res.status(200).json({
            status: "success"
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}
