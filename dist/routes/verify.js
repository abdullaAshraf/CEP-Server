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
exports.key = exports.token = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../schema/User"));
function token(req, res, next) {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Acess Denied');
    }
    if (!process.env.SECRET) {
        return res.status(500).send('Missing token secret');
    }
    try {
        const verified = jsonwebtoken_1.default.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    }
    catch (err) {
        return res.status(401).send('Invalid Token');
    }
}
exports.token = token;
function key(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = req.header('auth-key');
        if (!key) {
            return res.status(401).send('Acess Denied');
        }
        const user = yield User_1.default.findOne({ key: key });
        if (!user) {
            return res.status(401).send('Invalid key');
        }
        req.user = user;
        next();
    });
}
exports.key = key;
