const authController = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const verifyToken = require("../middlewares/verifyToken");
const nodemailer = require("nodemailer");

//register
authController.post("/register", async (req, res) => {
  try {
    const isExisting = await User.findOne({ email: req.body.email });
    if (isExisting) {
      throw new Error("Email already exists");
    }
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const newUser = await User.create({
      ...req.body,
      password: hashedPassword,
    });
    const { password, ...others } = newUser._doc;
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    return res.status(201).json({ others, token });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

//login
authController.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      throw new Error("Wrong Credentials!!");
    }
    const comparePass = await bcrypt.compare(req.body.password, user.password);
    if (!comparePass) {
      throw new Error("Wrong Credentials!!");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "4h",
    });
    const { password, ...others } = user._doc;
    return res.status(200).json({ others, token });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

//forgot-password
authController.post('/forgot-password', async(req,res) => {
    try {
        const user = await User.findOne({email: req.body.email})
        if(!user){
            throw new Error("Email not found")
        }
        const token = jwt.sign({id: user._id}, process.env.JWT_SECRET, {expiresIn: '4h'})
        
        var transporter = nodemailer.createTransport({
          service: "gmail",
          auth: {
            user: `${process.env.USER_EMAIL}`,
            pass: `${process.env.EMAIL_PASSKEY}`,
          },
        });

        var mailOptions = {
          from: `${process.env.USER_EMAIL}`,
          to: req.body.email,
          subject: "Reset Password Link",
          text: `${process.env.CLIENT_URL}/resetpassword/${user._id}/${token}`,
        };

        transporter.sendMail(mailOptions, function(error, info) {
          if (error) {
            console.log(error);
            return res.status(500).json("Error sending reset email");
          } else {
            return res.status(201).json({ token });
          }
        });
        return res.status(201).json({token})
    } catch (error) {
        return res.status(500).json(error.message)
    }
})

// reset Password
authController.post('/reset-password/:id/:token', async (req, res) => {
  try {
    const {id,token} = req.params
    const {newPassword} = req.body
    const user = await User.findById(id);
    if(!user){
            throw new Error("Email not found")
    }
    jwt.verify(token, process.env.JWT_SECRET, async (err, data) => {
        if (err) {
            throw new Error("Invalid or expired token");
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10)
        user.password = hashedPassword;
        const updatedUser = await user.save();
        const token = jwt.sign({ id: updatedUser._id }, process.env.JWT_SECRET, {expiresIn: '4h'});

    const { password, ...others } = updatedUser._doc;
    return res.status(200).json({ others, token });
    });
  } catch (error) {
    return res.status(500).json(error.message);
  }
});

authController.post("/updateHandles",verifyToken ,async (req, res) => {
  try {
    const userId = req.user.id;
    const { leetcode, codeforces, codechef } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    user.handles.leetcode = leetcode || user.handles.leetcode;
    user.handles.codeforces = codeforces || user.handles.codeforces;
    user.handles.codechef = codechef || user.handles.codechef;

    await user.save();

    const { password, ...others } = user._doc;
    return res.status(200).json({ others });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

authController.get("/fetchHandles" ,async (req, res) => {
  try {
    const userId = req.query.id;

    const user = await User.findById(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const { leetcode, codeforces, codechef } = user.handles;

    return res.status(200).json({ leetcode, codeforces, codechef });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
});

authController.put("/updateProfile", verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, bio, organization, country } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, bio, organization, country },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password, ...others } = updatedUser._doc;
    res.status(200).json(others);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = authController;
