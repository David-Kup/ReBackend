const jwt = require('jsonwebtoken');
const axios = require('axios');
const indicative = require('indicative').validator;
const File = require('../models/file');
const { sendError, processItem } = require('../utils/utils');
const mongoose = require('mongoose');


exports.create = async(req, res) => {
    const createdata = req.body;
    try {
        const data = {
            creator: createdata.creator,
            link_up_with_subject: JSON.parse(createdata.link_up_with_subject),
            file_access: createdata.file_access,
            parent_folder_id:createdata. parent_folder_id,
            file_name:  (req.files.length>0? req.files[0].filename : '')
        };

        await indicative.validate(data,{
            creator: 'required|email|min:1',
        });

        const file = await File.create(data);

        res.status(200).json({
            status: "success",
            file
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}


exports.getAllFiles = async (req, res) => {
    const {creator} = req.query;

    let filters = new Array;
    filters.push({creator: creator});
    console.log(filters)

    try {
        let fileresult = await File.find({ '$and': filters }).sort('_id');
        res.status(200).json({
            status: "success",
            fileresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}

exports.getFilesOfParentFolder = async(req, res) => {
    const { creator, parent_folder_id } = req.query;

    let filters = new Array;
    filters.push({
        creator: creator,
        parent_folder_id: new mongoose.Types.ObjectId(parent_folder_id),
    });
    
    try {
        let fileresult = await File.find({ '$and': filters }).sort('_id');
        res.status(200).json({
            status: "success",
            fileresult
        });
    } catch (err) {
        console.log(err);
        return sendError(req, res, 400, `Server error`);
    }
}