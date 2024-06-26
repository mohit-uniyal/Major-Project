const User = require('../models/userModel')
const bcrypt = require("bcrypt")
const JWT = require('jsonwebtoken')
const fs = require('fs');
const path = require('path');
const { default: axios } = require('axios');
const tempDirectory = path.join(__dirname, '..', 'public', 'temp');

exports.registerController = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    //validations
    if (!name) {
      return res.send({ success: false, error: "Name is Required" });
    }
    if (!email) {
      return res.send({ success: false, error: "Email is Required" });
    }
    if (!password) {
      return res.send({ success: false, error: "Password is Required" });
    }
    //check user
    const exisitingUser = await User.findOne({ email });
    //exisiting user
    if (exisitingUser) {
      return res.status(409).send({
        success: false,
        message: "Sorry a user with this email already exists",
      });
    }

    //register user
    const salt = await bcrypt.genSalt(10);
    const securePassword = await bcrypt.hash(req.body.password, salt);
    //save
    let user = await User.create({
      name: req.body.name,
      password: securePassword,
      email: req.body.email,
    });


    res.status(201).send({
      success: true,
      message: "User Register Successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in Registeration",
      error,
    });
  }
}

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;
    //validation
    if (!email || !password) {
      return res.status(404).send({
        success: false,
        message: "Invalid email or password",
      });
    }
    //check user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).send({
        success: false,
        message: "Email is not registered",
      });
    }
    const passwordCompare = await bcrypt.compare(password, user.password);
    if (!passwordCompare) {
      return res
        .status(400)
        .json({ success: false, error: "Please try to login with correct Credentials" });
    }
    //token
    const token = await JWT.sign({ _id: user._id }, process.env.JWT_SECRET);
    res.status(200).send({
      success: true,
      message: "login successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: user.role,
      },
      token
    });
  } catch (error) {
    console.log(error);
    res.status(500).send({
      success: false,
      message: "Error in login",
      error,
    });
  }
};

exports.getuserController = async (req, res) => {
  try {
    let userId = req.user._id;
    const user = await User.findById(userId).select("-password");
    res.send(user);
  } catch (error) {
    console.log(error.message);
    res.status(400).send("Internal Server Error");
  }
}

function deleteJPGFilesFromTemp() {
  fs.readdir(tempDirectory, (err, files) => {
    if (err) {
      console.error('Error reading directory:', err);
      return;
    }
    files.forEach(file => {
      if (path.extname(file) === '.jpg') {
        fs.unlink(path.join(tempDirectory, file), err => {
          if (err) {
            console.error(`Error deleting file ${file}:`, err);
          }
        });
      }
    });
  });
}

exports.verifyFaceController = async (req, res) => {
  try {

    const files = fs.readdirSync(tempDirectory);
    const jpegFile = files.find(file => path.extname(file).toLowerCase() === '.jpg' || path.extname(file).toLowerCase() === '.jpeg');
    if (!jpegFile) {
      throw new Error('No JPEG file found in the folder.');
    }
    const imagePath = path.join(tempDirectory, jpegFile);
    const imageData = fs.readFileSync(imagePath);

    const formData = new FormData();
    formData.append('image', imageData);


    // const response = await fetch("http://127.0.0.1:5000/recognize", {
    //   method: 'POST',
    //   body: formData,
    //   headers: {
    //     "Content-Type": "multipart/form-data"
    //   }
    // });

    const response = await axios.post(
      "http://127.0.0.1:5000/recognize",
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      }
    );

    const data = await response.json();
    // console.log(data);

    deleteJPGFilesFromTemp();

    res.status(200).json({ message: "working" });
  } catch (error) {
    console.log(error.response.data);
    deleteJPGFilesFromTemp();
    res.status(400).json({ message: "Internal Server Error" });
  }
}