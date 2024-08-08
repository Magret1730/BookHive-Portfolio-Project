import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

export const registerUser = async (req, res) => {
    try {
        const { id, firstName, lastName, email, password } = req.body;

        // Basic checks for empty fields
        if (!(firstName && lastName && email && password)) {
            return res.status(400).send('All fields are compulsory');
        }

        // First and Last name length validation of least 2 letters
        if (firstName.length < 2 || lastName.length < 2) {
          return res.status(400).send('firstName and lastName should be at least 2 characters long');
        }

        // First name and last name validation (only alphabetic characters)
        const nameRegex = /^[a-zA-Z]+$/;
        if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
            return res.status(400).send('First name and last name should only contain alphabetic characters');
        }

        // Email validation (basic format check)
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).send('Invalid email format. Example of valid format: user@example.com');
        }

        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(401).send('User already exist with this email');
        }

        // Password validation (minimum 4 characters, optionally add more checks)
        if (password.length < 4) {
            return res.status(400).send('Password should be at least 4 characters long');
        }

        const encyptedPwd = await bcrypt.hash(password, 8);
        if (!encyptedPwd) {
            return res.status(500).send('Could not encrypt password');
        }

        const newUser = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: encyptedPwd,
            isAdmin: false
        });

        const token = jsonwebtoken.sign(
            { id: newUser.id, email },
            process.env.JWTSECRET,
            { expiresIn: '7d' }
        );

        newUser.token = token;
        await newUser.save();

        newUser.password = undefined;

        // when a new user registers, they will automatically receive a token in their cookies,
        // allowing them to be authenticated without needing to log in immediately afterward.
        // res.cookie('token', token, {
        //     httpOnly: true, secure: process.env.NODE_ENV === 'production'
        // });
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'development',
            expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        });

        res.status(200).json(newUser);

    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // console.log(email, password);

        if (!(email && password)) {
            return res.status(400).send('All fields are compulsory');
        };

        const existingUser = await User.findOne({ where: { email } });
        if (!existingUser) {
            return res.status(401).send('User with this email does not exist');
        }

        if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
            const token = jsonwebtoken.sign(
                { id: existingUser.id, email },
                process.env.JWTSECRET,
                { expiresIn: '7d' }
            );

            existingUser.token = token;
            await existingUser.save();

            existingUser.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true 
            };
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'development',
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
            });
            res.status(200).cookie("token", token, options).json({
                success: true, token, existingUser
            });
        } else {
            res.status(401).send('Invalid password');
        }
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

export const logoutUser = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            sameSite: 'strict'
        });

        res.status(200).json({ success: true, message: 'User logged out successfully' });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

export const allUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            attributes: { exclude: ['password'] } // Excluded the password from the result
        });

        res.status(200).json(users);
    } catch {
        res.status(500).json({ error: error.message });
    }
};
