import jwt from 'jsonwebtoken';
import User from '../schema/User';

export function token(req: any, res: any, next: any) {
    const token = req.header('auth-token');
    if (!token) {
        return res.status(401).send('Acess Denied');
    }

    if (!process.env.SECRET) {
        return res.status(500).send('Missing token secret');
    }

    try {
        const verified = jwt.verify(token, process.env.SECRET);
        req.user = verified;
        next();
    } catch (err) {
        return res.status(401).send('Invalid Token');
    }
}

export async function key(req: any, res: any, next: any) {
    const key = req.header('auth-key');
    if (!key) {
        return res.status(401).send('Acess Denied');
    }

    const user = await User.findOne({key: key});
    if (!user) {
        return res.status(401).send('Invalid key');
    }

    req.user = user;
    next();
}