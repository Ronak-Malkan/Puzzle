import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv'
import * as User_CRUD from '../database/User_CRUD.js';

dotenv.config();


export async function signup(user){
    try {
        if(!correctEmail(user.email)) throw new Error('Incorrect Email. Please enter a RFC 5322 certified email.');
        if(!correctPassword(user.password)) throw new Error('Password should be 8 characters long, and should contain at least 1 Uppercase letter, 1 Special Character, 1 Number');
        if(await emailAlreadyExists(user.email)) throw new Error('Email already exists, please use another email id.');

        user.password = await bcrypt.hash(user.password, 10);
        await User_CRUD.createUser(user);

    }catch(err){
        throw err;
    }
}

export async function login({email, password}){
    try {
        const res = await User_CRUD.getUserByEmail(email);
        if(res == null) throw new Error("Email doesn't exist.");
        const passwordCorrect = await bcrypt.compare(password, res.password.toString());
        if(!passwordCorrect) throw new Error("Incorrect password.");
        return {
            message: 'User logged in.',
            firstname: res.firstname,
            lastname: res.lastname,
            token: jwt.sign({ id: res.id }, process.env.JWT_SECRET , { expiresIn: '1d'})
        }
    }
    catch(err) {
        throw err;
    }
}

function correctEmail(email) {
    const regexEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    return regexEmail.test(email);
}

function correctPassword(password) {
    const regexPassword = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$ %^&*-]).{8,}$/;
    return regexPassword.test(password);
}

async function emailAlreadyExists(email) {
    return await User_CRUD.emailExists(email);
}