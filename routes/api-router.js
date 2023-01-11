const express =  require('express');
const router = express.Router();

router.use('/auth', require('./auth-router'));
router.use('/infocard', require('./infocard-router'));
router.use('/setting', require('./setting-router'));
router.use('/engageUsers', require('./engageUsers-router'));
router.use('/contact',require('./contact-router'));
router.use('/email',require('./email-router'));
router.use('/message',require('./message-router'));
router.use('/folder',require('./folder-router'));
router.use('/file',require('./file-router'));

module.exports = router;