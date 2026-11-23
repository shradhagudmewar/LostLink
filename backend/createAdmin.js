
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./models/User');

const createAdmin = async () => {
  try {
    if (!process.env.MONGODB_URI) {
      throw new Error('MONGODB_URI is missing');
    }

    await mongoose.connect(process.env.MONGODB_URI);

    const email = 'admin@lostlink.com';

    let admin = await User.findOne({ email });

    if (admin) {
      admin.role = 'admin';
      admin.password = 'Admin@123456';
      admin.isBanned = false;

      await admin.save();

      console.log('Existing account updated to Admin.');
    } else {
      admin = await User.create({
        name: 'System Admin',
        email,
        password: 'Admin@123456',
        role: 'admin',
        isBanned: false
      });

      console.log('New Admin account created.');
    }

    console.log('Admin Email:', email);
    console.log('Admin Role:', admin.role);

  } catch (error) {
    console.error('Admin creation failed:', error.message);
  } finally {
    await mongoose.disconnect();
  }
};

createAdmin();
