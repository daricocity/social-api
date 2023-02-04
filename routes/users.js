const bcrypt = require("bcrypt");
const User = require("../models/User");
const router = require("express").Router();

// GET ALL REGISTERED USER
router.get("/all/:id", async (req, res) => {
    try {
        // get users except admin and the login user
        const user = await User.find(
            {isAdmin:{ $ne:"true"}, _id:{ $ne:req.params.id}}, 
            'username email city from relationship createdAt updatedAt profilePicture coverPicture'
        );
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json(err);
    }
});

// UPDATE USER
router.put("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin){
        if(req.body.password){
            try {
                const salt = await bcrypt.genSalt(10);
                req.body.password = await bcrypt.hash(req.body.password, salt)
            } catch(err) {
                return res.status(500).json(err);
            }
        }
        try {
            const user = await User.findByIdAndUpdate(req.params.id, {$set: req.body,});
            res.status(200).json("Account has been updated")
        } catch(err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can update only your account ")
    }
});

// DELETE USER
router.delete("/:id", async (req, res) => {
    if (req.body.userId === req.params.id || req.body.isAdmin){
        try {
            const user = await User.findByIdAndDelete(req.params.id);
            res.status(200).json("Account has been deleted")
        } catch(err) {
            return res.status(500).json(err);
        }
    } else {
        return res.status(403).json("You can delete only your account ")
    }
});

// GET USER
router.get("/", async (req, res) => {
    const userId = req.query.userId;
    const username = req.query.username;
    try {
        const user = userId ? await User.findById(userId) : await User.findOne({username:username});
        const {password, updatedAt, ...other} = user._doc
        res.status(200).json(other)
    } catch(err) {
        return res.status(500).json(err);
    }
});

// GET FRIENDS
router.get("/friends/:userId", async (req, res) => {
    try {
        // Get user by id
        const user = await User.findById(req.params.userId);
        // Inside the user, get the friend that are following the user
        const friends = await Promise.all(
            user.followings.map((friendId) => {
                return User.findById(friendId)
            })
        )
        // Destructure the props needed from the result
        let friendList = [];
        friends.map((friend) => {
            const {_id, username, profilePicture} = friend;
            friendList.push({_id, username, profilePicture});
        });
        res.status(200).json(friendList);
    } catch (err) {
        return res.status(500).json(err);
    }
});

// FOLLOW A USER
router.put("/:id/follow", async (req, res) => {
    if(req.body.userId !== req.params.id){
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(!user.followers.includes(req.body.userId)){
            await user.updateOne({$push: {followers: req.body.userId}});
            await currentUser.updateOne({$push: {followings: req.params.id}});
            res.status(200).json("user has been followed")
        } else {
            return res.status(403).json("you already follow this user");
        }
    } else {
        return res.status(403).json("You can't follow yourself");
    }
});

// UNFOLLOW A USER
router.put("/:id/unfollow", async (req, res) => {
    if(req.body.userId !== req.params.id){
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if(user.followers.includes(req.body.userId)){
            await user.updateOne({$pull: {followers: req.body.userId}});
            await currentUser.updateOne({$pull: {followings: req.params.id}});
            res.status(200).json("user has been unfollowed")
        } else {
            return res.status(403).json("you don't follow this user");
        }
    } else {
        return res.status(403).json("You can't unfollow yourself");
    }
});

module.exports = router;