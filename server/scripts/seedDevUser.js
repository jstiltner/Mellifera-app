// server/scripts/seedDevUser.js
// Development user seeding script
// Creates a default user for development purposes

const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });

// Import User model
const User = require('../models/User');

// Development user credentials
const DEV_USER = {
  name: 'Dev User',
  email: 'dev@mellifera.local',
  password: 'dev123', // Will be hashed
};

async function seedDevUser() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.ATLAS_URI;
    
    if (!mongoUri) {
      console.log('⚠️  MongoDB not configured - skipping dev user seeding');
      console.log('   Guest mode will be available without database');
      console.log('   Configure ATLAS_URI in .env to enable full features\n');
      return; // Don't exit, allow server to start
    }

    console.log('🔌 Connecting to MongoDB...');
    
    // Add timeout to connection attempt
    await Promise.race([
      mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 }),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Connection timeout')), 5000)
      )
    ]);
    
    console.log('✅ Connected to MongoDB');

    // Check if dev user already exists
    const existingUser = await User.findOne({ email: DEV_USER.email });
    
    if (existingUser) {
      console.log('ℹ️  Dev user already exists');
      console.log(`📧 Email: ${DEV_USER.email}`);
      console.log(`🔑 Password: ${DEV_USER.password}`);
      await mongoose.disconnect();
      return;
    }

    // Hash the password
    console.log('🔐 Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(DEV_USER.password, salt);

    // Create the dev user
    console.log('👤 Creating dev user...');
    const newUser = new User({
      name: DEV_USER.name,
      email: DEV_USER.email,
      password: hashedPassword,
    });

    await newUser.save();

    console.log('✅ Dev user created successfully!');
    console.log('');
    console.log('📋 Development Credentials:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`📧 Email:    ${DEV_USER.email}`);
    console.log(`🔑 Password: ${DEV_USER.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('');
    console.log('🌐 You can now login at: http://localhost:3000/login');
    console.log('');

    // Disconnect from MongoDB
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');

  } catch (error) {
    console.error('❌ Error seeding dev user:', error.message);
    console.log('');
    console.log('💡 MongoDB not available - Guest mode will be enabled');
    console.log('   Guest mode allows using the app without a database');
    console.log('   All data will be stored locally in the browser');
    console.log('');
    console.log('   To enable full features with database:');
    console.log('   1. Install and start MongoDB locally');
    console.log('   2. Or configure ATLAS_URI for MongoDB Atlas');
    console.log('   3. Then restart the server');
    console.log('');
    // Don't exit - allow server to start in guest-only mode
  }
}

// Run the seeding function
if (require.main === module) {
  seedDevUser();
}

module.exports = seedDevUser;