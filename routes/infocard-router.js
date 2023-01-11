const express = require('express');
const router = express.Router();
const infoController = require('../controllers/infocardController');

router
    .route('/getallinfo')
    .get(infoController.getallinfo);

router
    .route('/create')
    .post(infoController.create);

router
    .route('/edit')
    .post(infoController.edit);

router
    .route('/getInfocard')
    .post(infoController.getInfocard);

module.exports = router;