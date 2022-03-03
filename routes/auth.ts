import express from 'express';
import User from "../schema/User";
import ValidationService from '../services/validation';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import {token} from './verify';
import {v4 as uuidv4} from 'uuid';

const router = express.Router();

// Register new user
router.get('/register', async (req, res, next) => {
    const error = ValidationService.userRegisterValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Check for unique email
    const emailExist = await User.findOne({email: req.body.email});
    if (emailExist) {
        return res.status(400).send('User email already registered');
    }

    //Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    
    //Create new User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        key: uuidv4()
    });

    try {
        const savedUser = await user.save();
        res.send({user: savedUser._id});
    } catch (err) {
        res.status(400).send(err);
    }
});

// Login user using username and password
router.get('/login', async (req, res, next) => {
    const error = ValidationService.userLoginValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }

    //Check for unique email
    const user = await User.findOne({email: req.body.email});
    if (!user) {
        return res.status(400).send('No user registered with this email');
    }

    //Validate password
    const validPassword = await bcrypt.compare(req.body.password, user.password)
    if (!validPassword) {
        return res.status(400).send('Invalid email or password');
    }

    //Create and assign jwt token
    if (!process.env.SECRET) {
        return res.status(500).send('Missing token secret');
    }

    const token = jwt.sign({_id: user._id}, process.env.SECRET);
    res.header('auth-token', token).send(token);
});

// Get API Key
router.get('/key', token, async (req: any, res, next) => {
    console.log(req.user);
    const user = await User.findById(req.user);
    if (!user) {
        return res.status(400).send('No user registered with this token');
    }
    return res.status(200).send(user.key);
});


export default router;
