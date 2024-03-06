import * as express from 'express'
import {userRouter} from "./userRouter.js";
import { blockRouter } from './blockRouter.js';
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

dotenv.config()

const router = express.Router();

export async function checkToken(req, res, next) {
    try {
        const authorizationHeader = String(req.headers.authorization);
        
        let user = true;

        if (!authorizationHeader) {
            user = null;
        }
        
        const parts = authorizationHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            user = null;
        }
        
        let token = parts[1];
        if (token === null) {
            user = null;
        }
        if(user !== null){
            user = jwt.verify(token, process.env.JWT_SECRET).id;
            req.body.user = user;
            next();
        }
        else {
            res.status(401).json({message: 'Unauthorized'});
        }
    }
    catch(err){
        console.log(err);
        res.status(401).json({error: err.message, message: 'Unauthorized'});
    }
}

export async function checkAuthorization(req, res) {
    try {
        const authorizationHeader = String(req.headers.authorization);
        
        let user = true;

        if (!authorizationHeader) {
            user = null;
        }
        
        const parts = authorizationHeader.split(' ');
        if (parts.length !== 2 || parts[0].toLowerCase() !== 'bearer') {
            user = null;
        }
        
        let token = parts[1];
        if (token === null) {
            user = null;
        }
        if(user !== null){
            user = jwt.verify(token, process.env.JWT_SECRET).id;
            res.status(200).json({message: 'Authorized'});
        }
        else {
            res.status(401).json({message: 'Unauthorized'});
        }
    }
    catch(err){
        console.log(err);
        res.status(401).json({error: err.message, message: 'Unauthorized'});
    }
}

router.use('/user', userRouter);

router.post("/checkjwt", checkAuthorization);

router.use(checkToken);

router.use('/block', blockRouter);

export default router;