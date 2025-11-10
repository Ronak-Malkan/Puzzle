"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserInfo = exports.login = exports.signup = void 0;
const UserModel = __importStar(require("../models/user.model"));
const password_1 = require("../utils/password");
const validation_1 = require("../utils/validation");
const jwt_1 = require("../utils/jwt");
const logger_1 = require("../utils/logger");
const signup = async (data) => {
    const { email, password, firstname, lastname } = data;
    // Validate email format
    if (!(0, validation_1.validateEmail)(email)) {
        throw new Error('Invalid email format. Please enter a valid email address.');
    }
    // Validate password strength
    if (!(0, password_1.validatePasswordStrength)(password)) {
        throw new Error('Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
    }
    // Check if email already exists
    const emailAlreadyExists = await UserModel.emailExists(email);
    if (emailAlreadyExists) {
        throw new Error('Email already exists. Please use a different email address.');
    }
    // Hash password
    const hashedPassword = await (0, password_1.hashPassword)(password);
    // Create user
    const user = await UserModel.createUser({
        email,
        password: hashedPassword,
        firstname,
        lastname,
    });
    logger_1.logger.info({ userId: user.id, email: user.email }, 'User created successfully');
    // Generate JWT token
    const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
    return {
        message: 'User registered successfully',
        token,
        user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
        },
    };
};
exports.signup = signup;
const login = async (data) => {
    const { email, password } = data;
    // Get user by email
    const user = await UserModel.getUserByEmail(email);
    if (!user) {
        throw new Error('Invalid email or password.');
    }
    // Verify password
    const isPasswordValid = await (0, password_1.comparePassword)(password, user.password);
    if (!isPasswordValid) {
        throw new Error('Invalid email or password.');
    }
    logger_1.logger.info({ userId: user.id, email: user.email }, 'User logged in successfully');
    // Generate JWT token
    const token = (0, jwt_1.generateToken)({ id: user.id, email: user.email });
    return {
        message: 'Login successful',
        token,
        user: {
            id: user.id,
            email: user.email,
            firstname: user.firstname,
            lastname: user.lastname,
        },
    };
};
exports.login = login;
const getUserInfo = async (userId) => {
    const user = await UserModel.getUserById(userId);
    if (!user) {
        throw new Error('User not found');
    }
    return {
        id: user.id,
        email: user.email,
        firstname: user.firstname,
        lastname: user.lastname,
        created_at: user.created_at,
    };
};
exports.getUserInfo = getUserInfo;
//# sourceMappingURL=auth.service.js.map