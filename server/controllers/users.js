import bcrypt from 'bcryptjs'; //hash the password
import jwt from 'jsonwebtoken'; //store user in a browser for specific amount of time->stay signed in.

import UserModel from '../models/user.js';

const secret = 'test';

export const signin = async(req,res) => {
    const {email,password} = req.body;

    try {
        const existingUser = await UserModel.findOne({email});

        if(!existingUser) return res.status(404).json({message:"User Does Not Exist!"});

        const isPasswordCorrect = await bcrypt.compare(password, existingUser.password);
        //Comparing the entered password and password entered earlier

        if(!isPasswordCorrect) return res.status(400).json({message:"Invalid Credential!"});

        const token = jwt.sign({email:existingUser.email, id:existingUser._id},secret,{expiresIn: "1h"});

        res.status(200).json({result:existingUser, token});
        
    } catch (error) {
        res.status(500).json({message:'Something Wen\'t Wrong'});
    }
}

export const signup = async(req,res) => {
    const {firstName, lastName, email, password, confirmPassword} = req.body;

    try {
        const existingUser = await UserModel.findOne({email});
        if(existingUser) return res.status(400).json({message:"Email Already Has An Account. Kindly Sign In!"});

        if(password!=confirmPassword) return res.status(403).json({message:"Passwords do not match!"});
        //Hash The Password
        const hashedPassword = await bcrypt.hash(password,12);

        const result = await UserModel.create({email, password:hashedPassword, name: `${firstName} ${lastName}`});

        const token = jwt.sign({email:result.email, id:result._id},'test',{expiresIn: "1h"});

        res.status(201).json({result, token});

    } catch (error) {
        res.status(500).json({message:'Something Went Wrong'});
        console.log(error);
    }
}