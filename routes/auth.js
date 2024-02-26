const express = require('express');
const authController = require('../controller/authController');

const router = express.Router();


router.get('/login',authController.getUserLogin);
router.post('/login',authController.doUserlogin)
router.get('/signup',authController.getUserSignup);
router.post('/signup',authController.doUserSignup);

router.get('/admin',authController.getAdminLogin);
router.post('/admin',authController.doAdminLogin);                  



router.get('/forgotPass',authController.getForgotPassword);
router.post('/forgotPass',authController.doNewPasswordOtp);
// router.get('/setNewPassword',authController.getNewPasswordOtp);

router.get('/signupOtp',authController.getSignupOtp);
router.post('/signupOtp',authController.doSignupOtp);

router.get('/otpEmail',authController.getOtpEmail);
router.post('/otpEmail',authController.doOtpEmail);


router.get('/resendOtp',authController.resendOtp);


router.post('/newPass',authController.doNewPassword);
router.get('/newPass',authController.getNewPassword);

router.get('/logout',authController.logOut);



module.exports = router;