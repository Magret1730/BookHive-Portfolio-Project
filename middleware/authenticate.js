// Authentication ensures that the user is who they claim to be by verifying a token ie loggedin
// The token can be stored in a cookie, local storage, or sent in the Authorization header. In this case, it is stored in Authorization header.
// The authenticate middleware checks this token and attaches the user information to the request object if the token is valid.

import jsonwebtoken from 'jsonwebtoken';
import User from '../models/userModel.js';

export const authenticate = async (req, res, next) => {
   try {
        const authHeader = req.header('Authorization');
        if (!authHeader) {
            return res.status(401).json({ error: 'Authorization header missing.' });
        }

        const token = authHeader.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ error: 'Authentication token missing.' });
        }

        const decoded = jsonwebtoken.verify(token, process.env.JWTSECRET); // Verify the token
        // console.log(`Decoded token: ${JSON.stringify(decoded)}`);
        const user = await User.findOne({ where: { email: decoded.email } }); // Find the user by email
        if (!user) {
            throw new Error('User not found.');
        }
        req.user = user; // Attach the user to req.user
        next(); // Proceed to the next middleware
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Token has expired. Please log in again.' });
        }
        console.error('Authentication error:', error);
        res.status(401).json({ error: 'Invalid token' });
    }
};
