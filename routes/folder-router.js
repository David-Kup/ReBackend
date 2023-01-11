const express = require('express');
const router = express.Router();
const folderController = require('../controllers/folderController');

router
    .route('/create')
    .post(folderController.create);

router
    .route('/getAllFolders')
    .get(folderController.getAllFolders);

router
    .route('/getFolderList')
    .get(folderController.getFolderList);

module.exports = router;