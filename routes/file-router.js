const express = require('express');
const router = express.Router();
const fileController = require('../controllers/fileController');

router
    .route('/create')
    .post(fileController.create);

router
    .route('/getAllFiles')
    .get(fileController.getAllFiles);

router
    .route('/getFilesOfParentFolder')
    .get(fileController.getFilesOfParentFolder);

module.exports = router;