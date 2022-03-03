"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("@hapi/joi"));
class ValidationService {
    static userRegisterValidation(data) {
        const schema = joi_1.default.object().keys({
            name: joi_1.default.string().min(6).required(),
            email: joi_1.default.string().min(6).required().email(),
            password: joi_1.default.string().min(6).required(),
        });
        return schema.validate(data).error;
    }
    static userLoginValidation(data) {
        const schema = joi_1.default.object().keys({
            email: joi_1.default.string().min(6).required().email(),
            password: joi_1.default.string().min(6).required(),
        });
        return schema.validate(data).error;
    }
    static communityValidation(data) {
        const schema = joi_1.default.object().keys({
            name: joi_1.default.string().min(3).max(255).required(),
            description: joi_1.default.string().max(1024)
        });
        return schema.validate(data).error;
    }
}
exports.default = ValidationService;
