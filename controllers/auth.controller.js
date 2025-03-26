import mongoose from "mongoose";
import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET, JWT_EXPIRES_IN } from "../config/env.js";

export const register = async (req, res, next) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try {
        const { name, email, password, role } = req.body;
        

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const error = new Error("User already exists");
            error.statusCode = 409;
            throw error;
        }

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await User.create(
            [{ name, email, password: hashedPassword, role }],
            { session: session }
        );

        const token = jwt.sign({ id: newUser[0]._id, role:newUser[0].role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        await session.commitTransaction();
        session.endSession();

        const { password: userPassword, ...userData } = newUser[0]._doc;

        res.status(201).json({
            success: true,
            message: "User created successfully",
            data:{
                user: userData,
                token
            }
        })


    } catch (error) {
        await session.abortTransaction();
        session.endSession();

        next(error);
        
    }
};


export const login = async (req, res, next) => {
    try{

        const {email, password} = req.body;
        const user = await User.findOne({email});
        if(!user){
            const error = new Error(`User with email ${email} not found`);
            error.statusCode = 404;
            throw error;
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            const error = new Error("Invalid password");
            error.statusCode = 401;
            throw error;
        }

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN,
        });

        const { password: userPassword, ...userData } = user._doc;

        res.status(200).json({
            success: true,
            message: "User logged in successfully",
            data: {
                user: userData,
                token
            }
        });

    }
    catch(error){
        next(error);
    }
};

