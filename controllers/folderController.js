const jwt = require("jsonwebtoken");
const axios = require("axios");
const indicative = require("indicative").validator;
const Folder = require("../models/folder");
const File = require("../models/file");
const { sendError, processItem } = require("../utils/utils");
const mongoose = require("mongoose");

exports.create = async (req, res) => {
  const createdata = req.body;
  try {
    await indicative.validate(createdata, {
      creator: "required|email|min:1",
    });

    const folder = await Folder.create(createdata);

    res.status(200).json({
      status: "success",
      folder,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getAllFolders = async (req, res) => {
  const { creator, path } = req.query;

  let filters = new Array();
  filters.push({ creator: creator });
  filters.push({ folder_path: path });
  filters.push({ delete: false });

  try {
    let folderresult = await Folder.find({ $and: filters }).sort("_id");
    let folderList = new Array();
    await Promise.all(
      folderresult.map(async (item, i) => {
        let foldercount = await Folder.count({
          creator: creator,
          folder_path:
            item.folder_path == "/"
              ? "/" + item.folder_name
              : item.folder_path + "/" + item.folder_name,
          delete: false,
        });
        let filecount = await File.count({
          creator: creator,
          parent_folder_id: item._id,
          delete: false,
        });
        folderList.push({ ...item._doc, count: foldercount + filecount });
      })
    );

    let previouspath = path.substr(
      0,
      path.length - path.split("/").pop().length - 1
    );

    let parentfolder = "";
    if (path !== "/") {
      let folderfilters = new Array();
      folderfilters.push({ creator: creator });
      folderfilters.push({
        folder_path: previouspath !== "" ? previouspath : "/",
      });
      folderfilters.push({ delete: false });
      folderfilters.push({ folder_name: path.split("/").pop() });

      parentfolder = await Folder.findOne({ $and: folderfilters });
    }

    let fileList = await File.find({
      creator: creator,
      parent_folder_id: ((parentfolder == null || parentfolder == '') ? "" : parentfolder._id),
      delete: false,
    });

    res.status(200).json({
      status: "success",
      folderList,
      fileList,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.getFolderList = async (req, res) => {
  const { creator } = req.query;

  let filters = new Array();
  filters.push({ creator: creator });
  filters.push({ delete: false });

  try {
    let folderList = await Folder.find({ $and: filters }).sort("_id");

    res.status(200).json({
      status: "success",
      folderList,
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};
