import bcrypt from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import User from '../models/userModel.js';

export const runAdminSeeder = async () => {
  try {
    const adminEmail = 'taskifyhubproject@gmail.com';
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });

     // Admin already exists, no need to create again
    if (existingAdmin) {
      console.log('Admin user already exists. Skipping seeder.');
      return;
    }

    const password = process.env.ADMINPASSWORD;
    if (!password) throw new Error('ADMINPASSWORD is not set');

    const encryptedPwd = await bcrypt.hash(password, 10);

    // Insert the admin user
    const adminUser = await User.create({
      firstName: 'Abiodun',
      lastName: 'Oyedele',
      email: adminEmail,
      isAdmin: true,
      password: encryptedPwd,
    });

    if (!adminUser) throw new Error('Failed to insert admin user');

    // Generate the token using the admin user's ID and email
    const adminToken = jsonwebtoken.sign(
      { id: adminUser.id, email: adminUser.email },
      process.env.JWTSECRET,
      { expiresIn: '1h' }
    );

    // Update the admin user with the generated token
    await adminUser.update({ token: adminToken });

    console.log('Admin user created and seeded successfully.');

  } catch (error) {
    console.error('Error in seeder:', error);
    throw error;
  }
};
