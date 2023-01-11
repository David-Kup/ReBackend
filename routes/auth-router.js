const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router
    .route('/register')
    .post(userController.register);

router
    .route('/login')
    .post(userController.login);

router
    .route('/verification')
    .post(userController.verification);

router
    .route('/resend')
    .post(userController.resend);

router
    .route('/reset')
    .post(userController.reset);

router
    .route('/resetcode')
    .post(userController.resetcode);

router
    .route('/setUpPassword')
    .post(userController.setUpPassword);
    
router
.route('/updateprofile')
.post(userController.updateprofile);
module.exports = router;