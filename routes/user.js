const express = require('express');
const router = express.Router();
const zod = require('zod')
const {User} = require('../db')
const jwt = require('jsonwebtoken');
const JWT_SECRET = require('../config');
const { json } = require('body-parser');
const { authMiddleware } = require('../middleware');
const { Account } = require('../db');



//////signup

const signupValidation = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6),
    firstName: zod.string(),
    lastName: zod.string()
})

router.post("/signup", async (req,res) =>{
    const body = req.body;
    const {success} = signupValidation.safeParse(body);
    if(!success){
        return res.status(411).json({
            message: "Incorrect inputs"
        })
    }
    const existingUser = await User.findOne({
        username: body.username
    })
    if(existingUser){
        return res.status(411).json({
            message: "Email already taken"
        })
    }
    const user = await User.create({
        username: body.username,
        password: body.password,
        firstName: body.firstName,
        lastName: body.lastName,
    })

    const userId = user._id;
    //fill account table with random balance when user signups

    await Account.create({
        userId,
        balance: 500 + Math.floor(Math.random()*5000)
    })
    ///

    const token = jwt.sign({
        userId
    },JWT_SECRET);

    res.json({
            message: "User created successfully",
            token: token
    })
})

////////signin

const signinValidation = zod.object({
    username: zod.string().email(),
    password: zod.string().min(6),
})

router.post("/signin", async (req,res)=>{
    const body = req.body;
    const {success} = signinValidation.safeParse(body);
    if(!success){
        return res.status(411).json({
            message: "Error while logging in"
        })
    }
    const user = await User.findOne({
        username: body.username,
        password: body.password
    })
    if(user){
        const token = jwt.sign({
            userId: user._id
        },JWT_SECRET)
        res.json({
            token: token
        })
        return
    }

    res.status(411).json({
        message: "Error while logging in"
    })
   
})

/////update

const updateValidation = zod.object({
    username: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional()
})

router.put("/", authMiddleware, async (req,res) =>{
    const {success} = updateValidation.safeParse(req.body);
    if(!success){
        res.status(411).json({
            message: "Error while updating information"
        })
    }
    await User.updateOne({_id: req.userId},req.body);
    res.json({
        message: "Updated successfully"
    })
})


/////get all users filter

router.get("/bulk",  async (req, res) => {
    const filter = req.query.filter || "";

    const users = await User.find({
        $or: [{
            firstName: {
                "$regex": filter
            }
        }, {
            lastName: {
                "$regex": filter
            }
        }]
    })

    res.json({
        user: users.map(user => ({
            username: user.username,
            firstName: user.firstName,
            lastName: user.lastName,
            _id: user._id
        }))
    })
})

module.exports = router;