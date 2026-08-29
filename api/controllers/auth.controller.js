import User from '../models/user.model.js';
import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import jwt from 'jsonwebtoken';

export const signup = async (req, res,next) => {
    const{ username, email, password } = req.body;
    const hashedPassword = bcryptjs.hashSync(password, 10);
    const newUser = new User({ username, email, password: hashedPassword });
    try {
    await newUser.save()
    res.status(201).json({ message: 'User created successfully!' });
    } catch (error) {
    // next(error);
    next(errorHandler(550, 'Error creating user'));
    }
};

export const signin = async (req, res,next) => {
    const {email, password} = req.body;
    try {
        const validUser = await User.findOne({email});
        if(!validUser) return next(errorHandler(404, 'User not found'));
        const valiPassword = bcryptjs.compareSync(password, validUser.password);
        if(!valiPassword) return next(errorHandler(401, 'Wrong credentials!'));
        const token = jwt.sign({id: validUser._id}, process.env.JWT_SECRET);
        const {password: pass, ...rest} = validUser._doc;
        res
        .cookie('access_token', token, {httpOnly: true})
        .status(200)
        .json(validUser);

    } catch (error) {
        next(error);
    }
};

export const signout = async (req, res,next) => {
    try {
       res.clearCookie('access_token');
        res.status(200).json({ message: 'User signed out successfully!' });
    } catch (error) {
        next(error);
    }
}