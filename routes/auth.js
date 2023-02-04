const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const router = require("express").Router();

// REGISTER
router.post("/register", async (req, res) => {
    try {
        // Generate password
        const salt = await bcrypt.genSalt(10);
        const hashedpassword = await bcrypt.hash(req.body.password, salt)
        
        // Create New User
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedpassword,
        });

        // Save user and return responds
        const user = await newUser.save();
        res.status(200).json(user);
    } catch(err) {
        res.status(500).json(err)
    }
})

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({email: req.body.email});
        !user && res.status(404).json("user not found");

        const validPassword = await bcrypt.compare(req.body.password, user.password);
        !validPassword && res.status(404).json("wrong password");

        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

module.exports = router
