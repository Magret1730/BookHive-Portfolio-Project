import User from '../models/userModel.js';
import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import redisClient from '../utils/redis.js';

// configuration for nodemailer
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASSWORD,
  },
});

// Method to register
export const registerUser = async (req, res) => {
  try {
    const { id, firstName, lastName, email, password } = req.body;

    // Basic checks for empty fields
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({ error: 'All fields are compulsory' });
    }

    // First and Last name length validation of least 2 letters
    if (firstName.length < 2 || lastName.length < 2) {
      return res.status(400).json({ error: 'firstName and lastName should be at least 2 characters long' });
    }

    // First name and last name validation (only alphabetic characters)
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      return res.status(400).json({ error: 'First name and last name should only contain alphabetic characters' });
    }

    // Email validation (basic format check)
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    // const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format. Example of valid format: user@example.com' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(401).json({ error: 'User already exist with this email' });
    }

    // Password validations
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{4,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(401).json({ error: 'Password should contain at least one letter and one number, and be at least 4 characters long' });
    }

    const encyptedPwd = await bcrypt.hash(password, 10);
    if (!encyptedPwd) {
      return res.status(500).json({ error: 'Could not encrypt password' });
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

    // Remove the password field from the response
    newUser.password = undefined;

    // when a new user registers, they will automatically receive a token in their cookies,
    // allowing them to be authenticated without needing to log in immediately afterward.
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
    });

    res.status(201).json(newUser);

  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Method to login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // console.log(email, password);

    if (!(email && password)) {
      return res.status(400).json({ error: 'All fields are compulsory' });
    };

    const existingUser = await User.findOne({ where: { email } });
    if (!existingUser) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    if (existingUser && (await bcrypt.compare(password, existingUser.password))) {
      const token = jsonwebtoken.sign(
        { id: existingUser.id, email },
        process.env.JWTSECRET,
        { expiresIn: '7d' }
      );

      existingUser.token = token;
      await existingUser.save();

      // Store the token in Redis
      await redisClient.set(existingUser.id.toString(), token, 7 * 24 * 60 * 60);

      existingUser.password = undefined;

      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true 
      };
      res.cookie('token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      });
      res.status(200).cookie("token", token, options).json({
        success: true, token, existingUser
      });
    } else {
        res.status(401).json({ error: 'Invalid email or password' });
    }
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Method for users to logout // Handled by frontend
// export const logoutUser = async (req, res) => {
//   try {
//     const userId = req.user.id; // Get user's id if authenticated
//     await redisClient.del(userId.toString()); // Delete the user's session from Redis

//     res.clearCookie('token', {
//       httpOnly: true,
//       sameSite: 'strict'
//     });

//     res.status(200).json({ success: true, message: 'User logged out successfully' });
//   } catch (error) {
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// Method to get all users
export const allUsers = async (req, res) => {
  // Get page and size from query params, with defaults
  const page = parseInt(req.query.page) || 1; // Default to page 1
  const size = parseInt(req.query.size) || 5; // Default to 5 items per page // specifies how many records to return
  const offset = (page - 1) * size; // specifies where to start the records based on the current page.

  try {
    const { count, rows: users } = await User.findAndCountAll({
      attributes: { exclude: ['password'] }, // Excluded the password from the result
      limit: size,
      offset,
      order: [['createdAt', 'DESC']], // Optional: order by creation date
    });

    if (count === 0) {
      return res.status(404).json({ error: 'No borrowed book history found.' });
    }

    // Calculate total pages
    const totalPages = Math.ceil(count / size);

    res.status(200).json({
      users,
      totalPages,
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Method to get link in email
export const forgotPassword = async (req, res) => {
  const { email } = req.body;
  // console.log('Forgot Password');
  try {
    if (!(email)) {
      return res.status(400).json({ error: 'Please put in your email' });
    };

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exist' });
    }

    const token = jsonwebtoken.sign(
      { id: user.id },
      process.env.RESET_PASSWORD_KEY,
      { expiresIn: '20m' }
    );

    const mailOptions = {
      from: process.env.GMAIL_USER,
      to: email,
      subject: 'BookHive Password Reset',
      html: `
          <h2>Click the following link to reset your password:</h2>
          <h2>The link expires in 20 minutes</h2>
          <p>http://localhost:${process.env.PORT}/resetPassword/${token}</p>
        `,
    };

    // Update user's resetLink
    await user.update({ resetLink: token });

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return res.status(500).json({ error: 'Failed to send email' });
      }
      return res.json({ message: 'Email has been sent, kindly follow the instructions' });
    });
  } catch (error) { 
    console.error('Error in forgotPassword:', error.message);
    return res.status(500).json({ error: error.message });
  }
};

// Method to resetPassword
export const resetPassword = async (req, res) => {
  const { resetLink, newPassword } = req.body;
  if (!resetLink || !newPassword) {
    return res.status(400).json({ error: 'Reset link and new password are required.' });
  }
  try {
    const decodedData = jsonwebtoken.verify(resetLink, process.env.RESET_PASSWORD_KEY);

    const user = await User.findOne({ where: { resetLink } });
    if (!user) {
      return res.status(401).json({ error: 'User with this token does not exist' });
    }

    // Password validations
    const passwordRegex = /^(?=.*[a-zA-Z])(?=.*\d).{4,}$/;
    if (!passwordRegex.test(newPassword)) {
      return res.status(401).json({ error: 'New password should contain at least one letter and one number, and be at least 4 characters long' });
    }

    // Encrypt the new password
    const encyptedPwd = await bcrypt.hash(newPassword, 10);
    if (!encyptedPwd) {
      return res.status(500).send('Could not encrypt password');
    }

    // Update user password and clear reset link
    user.password = encyptedPwd;
    user.resetLink = '';

    // save user new informations
    await user.save();

    // Remove the password field from the response
    user.password = undefined;

    return res.status(200).json({ message: 'Your password has been changed. Please log in with your new password.' });
  } catch (error) {
    res.status(401).json({ error: 'Incorrect or expired token. Please request a new password reset link by entering your email to ge another link in your email address.' });
  }
};

// Method for user to delete/deactivate account
export const deleteAccount = async (req, res) => {
  try {
    const user = req.user; // Get user if authenticated
    if (!user) {
      return res.status(401).json({ error: 'User is not authenticated' });
    }

    const userId = user.id;

    // Delete the user's session from Redis
    await redisClient.del(userId.toString());

    // Clear the authentication token cookie
    res.clearCookie('token', {
      httpOnly: true,
      sameSite: 'strict'
    });

    const userDetails = await User.findOne({ where: { id: userId } });
    if (!userDetails) {
      return res.status(400).json({ error: 'User with this ID does not exist' });
    }

    // Deactivate or delete the user
    await User.destroy({ where: { id: userId } });

    res.status(200).json({ success: true, message: 'User account deactivated successfully.' });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

// Method for user's to edit email, firstName, lastName
export const editUserDetails = async (req, res) => {
  const { email } = req.user; // authenticated user
  const { newFirstName, newLastName, newEmail} = req.body;
  // console.log('Edit user details');

  if (!newEmail && !newFirstName && !newLastName) {
    return res.status(400).json({ error: 'Please provide either your email, first name, or last name.' });
  };

  // Validate newEmail if provided
  if (newEmail) {
    // Email validation (basic format check)
    // const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    if (!emailRegex.test(newEmail)) {
      return res.status(400).json({ error: 'Invalid email format. Example of valid format: user@example.com' });
    }
  }

  // Validate newFirstName if provided
  if (newFirstName) {
    // First name length validation of least 2 letters
    if (newFirstName.length < 2) {
      return res.status(400).json({ error: 'First name should be at least 2 characters long' });
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(newFirstName)) {
      return res.status(400).json({ error: 'First name should only contain alphabetic characters' });
    }
  }
  
  // Validate newLastName if provided
  if (newLastName) {
    if (newLastName.length < 2) {
      return res.status(400).json({ error: 'Last name should be at least 2 characters long' });
    }
    const nameRegex = /^[a-zA-Z]+$/;
    if (!nameRegex.test(newLastName)) {
      return res.status(400).json({ error: 'Last name should only contain alphabetic characters' });
    }
  }

  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ error: 'User with this email does not exist' });
    }

    // Update email if provided
    if (newEmail) {
      const beforeEmailChange = {
        from: process.env.GMAIL_USER,
        to: email,
        subject: 'Email Address Change Notification',
        html: `<p>We received a request to change your email address to <strong>${newEmail}</strong>.
              If you did not make this request, please <a href="mailto:taskifyhubproject@gmail.com">contact support</a> immediately.</p>`,
      };

      transporter.sendMail(beforeEmailChange, (error, info) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to send before email change request email', error });
        }
        return res.json({ message: 'Before emailChange email has been sent.' });
      });

      user.email = newEmail;
      await user.save();

      // Email after changing
      const afterEmailChange = {
        from: process.env.GMAIL_USER,
        to: newEmail,
        subject: 'Email Address Change Notification',
        html: `<p>Your request to change your email address from <strong>${email}</strong> has been updated.
              If you did not make this request, please <a href="mailto:taskifyhubproject@gmail.com">contact support</a> immediately.</p>`,
      };

      transporter.sendMail(afterEmailChange, (error, info) => {
        if (error) {
          return res.status(500).json({ error: 'Failed to send after email change request email', error });
        }
        return res.json({ message: 'After emailChange email has been sent.' });
      });
    }
    
    // Update first name if provided
    if (newFirstName) {
      user.firstName = newFirstName;
      await user.save();
    }
    
    // Update last name if provided
    if (newLastName) {
      user.lastName = newLastName;
      await user.save();
    }

    // Remove the password field from the response
    user.password = undefined;
    
    return res.status(200).json({ message: `User details changed`, user });
  } catch (error) {
     return res.status(500).json({ success: false, error: error.message });
  }
}
