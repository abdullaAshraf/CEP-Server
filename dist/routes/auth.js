"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const User_1 = __importDefault(require("../schema/User"));
const validation_1 = __importDefault(require("../services/validation"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const verify_1 = require("./verify");
const uuid_1 = require("uuid");
const router = express_1.default.Router();
// Register new user
router.get('/register', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const error = validation_1.default.userRegisterValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    //Check for unique email
    const emailExist = yield User_1.default.findOne({ email: req.body.email });
    if (emailExist) {
        return res.status(400).send('User email already registered');
    }
    //Hash the password
    const salt = yield bcryptjs_1.default.genSalt(10);
    const hashedPassword = yield bcryptjs_1.default.hash(req.body.password, salt);
    //Create new User
    const user = new User_1.default({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        key: (0, uuid_1.v4)()
    });
    try {
        const savedUser = yield user.save();
        res.send({ user: savedUser._id });
    }
    catch (err) {
        res.status(400).send(err);
    }
}));
// Login user using username and password
router.get('/login', (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const error = validation_1.default.userLoginValidation(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    //Check for unique email
    const user = yield User_1.default.findOne({ email: req.body.email });
    if (!user) {
        return res.status(400).send('No user registered with this email');
    }
    //Validate password
    const validPassword = yield bcryptjs_1.default.compare(req.body.password, user.password);
    if (!validPassword) {
        return res.status(400).send('Invalid email or password');
    }
    //Create and assign jwt token
    if (!process.env.SECRET) {
        return res.status(500).send('Missing token secret');
    }
    const token = jsonwebtoken_1.default.sign({ _id: user._id }, process.env.SECRET);
    res.header('auth-token', token).send(token);
}));
// Get API Key
router.get('/key', verify_1.token, (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    console.log(req.user);
    const user = yield User_1.default.findById(req.user);
    if (!user) {
        return res.status(400).send('No user registered with this token');
    }
    return res.status(200).send(user.key);
}));
exports.default = router;
