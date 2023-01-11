const express = require('express');
const router = express.Router();
const settingController = require('../controllers/settingController');

router
    .route('/getallinfo')
    .post(settingController.getallinfo);

router
    .route('/create')
    .post(settingController.create);

router
    .route('/edit')
    .post(settingController.edit);

// router
//     .route('/resend')
//     .post(infoController.resend);

module.exports = router;