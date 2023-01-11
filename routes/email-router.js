const express = require('express');
const router = express.Router();
const emailController = require('../controllers/emailController');

router
    .route('/send')
    .post(emailController.send);

router
    .route('/getAllEmail')
    .get(emailController.getAllEmail);

router
    .route('/getUnreadEmail')
    .get(emailController.getUnreadEmail);

router
    .route('/getDeletedEmail')
    .get(emailController.getDeletedEmail);

router
    .route('/read')
    .post(emailController.read);

router
    .route('/delete')
    .post(emailController.delete);

router
    .route('/getEmail')
    .get(emailController.getEmail);

module.exports = router;