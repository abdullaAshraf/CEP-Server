import Joi, { ValidationError } from "@hapi/joi";

export default class ValidationService {

    static userRegisterValidation(data: any): ValidationError | undefined {
        const schema = Joi.object().keys({
            name: Joi.string().min(6).required(),
            email: Joi.string().min(6).required().email(),
            password: Joi.string().min(6).required(),
        });
    
        return schema.validate(data).error;
    }

    static userLoginValidation(data: any): ValidationError | undefined {
        const schema = Joi.object().keys({
            email: Joi.string().min(6).required().email(),
            password: Joi.string().min(6).required(),
        });
    
        return schema.validate(data).error;
    }
}

