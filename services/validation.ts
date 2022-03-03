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

    static communityValidation(data: any): ValidationError | undefined {
        const schema = Joi.object().keys({
            name: Joi.string().min(3).max(255).required(),
            description: Joi.string().max(1024)
        });
    
        return schema.validate(data).error;
    }
}

