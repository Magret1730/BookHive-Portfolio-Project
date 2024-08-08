import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';

'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
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

    // Generate the token using the admin user's ID
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Users', { email: 'taskifyhubproject@gmail.com' }, {});
  }
};
