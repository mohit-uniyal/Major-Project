const express = require('express')
const router = express.Router();
const {registerController,loginController, getuserController, verifyFaceController} = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const User = require('../models/userModel');
const { upload } = require('../middlewares/multer.middleware');
//routing
//REGISTER || METHOD POST
router.post("/register", registerController);

//LOGIN || POST
router.post("/login", loginController);

// Get loggedin User details using POST "/api/auth/getuser". Login required
router.post("/getuser", authMiddleware, getuserController);

//Face detection route
router.post("/faceauthenticate", upload.single('faceImage'), verifyFaceController);

module.exports = router;