const bcrypt = require('bcryptjs');
const jsonwebtoken = require('jsonwebtoken');
require('dotenv').config();
import { User } from '../models/userModel';

'use strict';

// @type {import('sequelize-cli').Migration}
module.exports = {
  async up(queryInterface, Sequelize) {
    try {
      const adminEmail = 'taskifyhubproject@gmail.com';
      const existingAdmin = await User.findOne({ where: { email: adminEmail } });

      if (existingAdmin) {
        console.log('Admin user already exists. Skipping seeder...');
        return; // Admin already exists, no need to create again
      }

      const password = process.env.ADMINPASSWORD;
      if (!password) throw new Error('ADMINPASSWORD is not set');
      
      const encryptedPwd = await bcrypt.hash(password, 10);

      // Insert the admin user without the token
      const [adminUser] = await queryInterface.bulkInsert('Users', [{
        firstName: 'Abiodun',
        lastName: 'Oyedele',
        email: 'taskifyhubproject@gmail.com',
        isAdmin: true,
        password: encryptedPwd,
        createdAt: new Date(),
        updatedAt: new Date()
      }], { returning: true });

      if (!adminUser) throw new Error('Failed to insert admin user');

      // Generate the token using the admin user's ID and email
      const adminToken = jsonwebtoken.sign(
        { id: adminUser.id, email: adminUser.email },
        process.env.JWTSECRET,
        { expiresIn: '1h' }
      );

      // Update the admin user with the generated token
      await queryInterface.bulkUpdate('Users', {
        token: adminToken
      }, {
        id: adminUser.id
      });

    } catch (error) {
      console.error('Error in seeder:', error);
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'taskifyhubproject@gmail.com' }, {});
  }
};

// npm run admin-seed - To create admin seed in db
