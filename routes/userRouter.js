import * as express from 'express' 
import * as UserService from '../services/UserService.js';

const userRouter = express.Router();

let ErrorMessages = [
    'Incorrect Email. Please enter a RFC 5322 certified email.',
    'Password should be 8 characters long, and should contain at least 1 Uppercase letter, 1 Special Character, 1 Number',
    'Email already exists, please use another email id.',
    "Email doesn't exist.",
    "Incorrect password."
]

userRouter.post("/signup", async (req, res) => {
    try {
        await UserService.signup(req.body);
        res.status(201).json({message: 'User signed up'});
        return;
    }
    catch(err){
        if(err.message === ErrorMessages[0] || err.message === ErrorMessages[1] || err.message === ErrorMessages[2]){
            res.status(400).json({message: err.message});
            return;
        }
        console.log(err)
        res.status(500).json({message: 'Server error.'});
        return;
    }
})

userRouter.post("/login", async (req, res) => {
    try {
        console.log('1');
        const loginDetails = await UserService.login(req.body);
        res.status(201).json(loginDetails);
        return;
    }
    catch(err) {
        if(err.message === ErrorMessages[3] || err.message === ErrorMessages[4]){
            res.status(400).json({message: err.message});
            return;
        }
        console.log(err)
        res.status(500).json({message: 'Server error.'});
        return;
    }
})


export {userRouter};