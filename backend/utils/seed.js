const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../models/User');
const Item = require('../models/Item');
const Claim = require('../models/Claim');
const Notification = require('../models/Notification');
const ActivityLog = require('../models/ActivityLog');
const { connectDB } = require('../config/db');

const seedData = async () => {
  try {
    console.log(' Connecting to database for seeding...');
    await connectDB();

    console.log(' Clearing existing collection records...');
    await User.deleteMany({});
    await Item.deleteMany({});
    await Claim.deleteMany({});
    await Notification.deleteMany({});
    await ActivityLog.deleteMany({});

    console.log(' Creating verified users...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@lostlink.com',
      password: 'Admin@123456',
      role: 'admin',
      phone: '+1 800-555-0100',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      reputationScore: 100,
    });

    const userAlex = await User.create({
      name: 'Alex Rivera',
      email: 'alex@example.com',
      password: 'User@123456',
      role: 'user',
      phone: '+1 555-0192',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
      reputationScore: 35,
    });

    const userSarah = await User.create({
      name: 'Sarah Chen',
      email: 'sarah@example.com',
      password: 'User@123456',
      role: 'user',
      phone: '+1 555-0144',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
      reputationScore: 40,
    });

    const userMarcus = await User.create({
      name: 'Marcus Vance',
      email: 'marcus@example.com',
      password: 'User@123456',
      role: 'user',
      phone: '+1 555-0183',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      reputationScore: 25,
    });

    console.log(' Seeding verified Lost & Found items with Smart Match pairs...');
    const now = new Date();
    const daysAgo = (days) => new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    // Pair 1: iPhone in Central Park (Alex lost, Sarah found)
    const itemIPhoneLost = await Item.create({
      title: 'Midnight Blue iPhone 15 Pro',
      type: 'lost',
      category: 'Electronics',
      brand: 'Apple',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      location: {
        city: 'New York',
        specificLocation: 'Central Park Belvedere Castle Bench',
      },
      date: daysAgo(3),
      description: 'Lost my iPhone 15 Pro in a blue leather case with a small scratch near the camera lens. Lock screen has a picture of a golden retriever. Desperately need it back!',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
          public_id: 'sample_iphone_lost',
        },
      ],
      status: 'active',
      reportedBy: userAlex._id,
      securityQuestions: ['What photo is on the lock screen?', 'What case is on the phone?'],
      views: 42,
    });

    const itemIPhoneFound = await Item.create({
      title: 'Blue iPhone 15 Pro in Dark Case',
      type: 'found',
      category: 'Electronics',
      brand: 'Apple',
      primaryColor: 'Blue',
      secondaryColor: 'Black',
      location: {
        city: 'New York',
        specificLocation: 'Central Park near Belvedere Castle pathway bench',
      },
      date: daysAgo(2),
      description: 'Found a late-model dark blue iPhone in leather protection case sitting on a park bench. Charged it at home, currently with safe custody.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600',
          public_id: 'sample_iphone_found',
        },
      ],
      status: 'active',
      reportedBy: userSarah._id,
      securityQuestions: ['Can you describe the lockscreen photo?'],
      views: 38,
    });

    // Pair 2: Fossil Wallet in San Francisco
    const itemWalletLost = await Item.create({
      title: 'Black Leather Fossil Bifold Wallet',
      type: 'lost',
      category: 'Wallets & Purses',
      brand: 'Fossil',
      primaryColor: 'Black',
      location: {
        city: 'San Francisco',
        specificLocation: 'Montgomery BART Station Platform Area',
      },
      date: daysAgo(5),
      description: 'Lost a black Fossil leather wallet. Contains California drivers license with name Marcus, transit Clipper card, and a family photo tucked inside.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
          public_id: 'sample_wallet_lost',
        },
      ],
      status: 'active',
      reportedBy: userMarcus._id,
      securityQuestions: ['What photo is tucked inside the card slot?'],
      views: 19,
    });

    const itemWalletFound = await Item.create({
      title: 'Mens Black Leather Wallet (Fossil)',
      type: 'found',
      category: 'Wallets & Purses',
      brand: 'Fossil',
      primaryColor: 'Black',
      location: {
        city: 'San Francisco',
        specificLocation: 'Montgomery BART Station ticket booth',
      },
      date: daysAgo(4),
      description: 'Handed in by passenger. Genuine black leather wallet with brand badge. Held safely for verification.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600',
          public_id: 'sample_wallet_found',
        },
      ],
      status: 'active',
      reportedBy: userAlex._id,
      securityQuestions: ['What initials or cards are inside?'],
      views: 24,
    });

    // Pair 3: Sony Headphones in Seattle
    await Item.create({
      title: 'Sony WH-1000XM5 Wireless Headphones (Silver)',
      type: 'lost',
      category: 'Electronics',
      brand: 'Sony',
      primaryColor: 'Silver',
      secondaryColor: 'Gray',
      location: {
        city: 'Seattle',
        specificLocation: 'UW Suzzallo Library 3rd Floor Study Carrel',
      },
      date: daysAgo(1),
      description: 'Silver Sony WH-1000XM5 headphones in grey zipper hardcase. Left behind on the study desk after evening revision.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          public_id: 'sample_headphones_lost',
        },
      ],
      status: 'active',
      reportedBy: userSarah._id,
      securityQuestions: ['What is inside the mesh pocket of the case?'],
      views: 15,
    });

    await Item.create({
      title: 'Silver Over-Ear Sony Headphones in Case',
      type: 'found',
      category: 'Electronics',
      brand: 'Sony',
      primaryColor: 'Silver',
      location: {
        city: 'Seattle',
        specificLocation: 'University of Washington Library security desk',
      },
      date: daysAgo(1),
      description: 'Over-ear silver Sony noise-cancelling headphones found in library study hall. Turned into lost desk.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600',
          public_id: 'sample_headphones_found',
        },
      ],
      status: 'active',
      reportedBy: userMarcus._id,
      securityQuestions: ['Specify model number or accessories inside.'],
      views: 12,
    });

    // Reunited Item
    const itemReunited = await Item.create({
      title: 'Tiffany & Co. Silver Heart Tag Pendant Necklace',
      type: 'found',
      category: 'Jewelry & Watches',
      brand: 'Tiffany & Co.',
      primaryColor: 'Silver',
      location: {
        city: 'Chicago',
        specificLocation: 'Millennium Park near Cloud Gate sculpture',
      },
      date: daysAgo(10),
      description: 'Found a silver chain necklace with heart pendant. Successfully claimed and returned to owner!',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=600',
          public_id: 'sample_jewelry',
        },
      ],
      status: 'reunited',
      reportedBy: userAlex._id,
      views: 65,
    });

    // Key item in Austin
    await Item.create({
      title: 'Honda Smart Key Fob with Red Lanyard & Gym Tag',
      type: 'found',
      category: 'Keys',
      brand: 'Honda',
      primaryColor: 'Black',
      secondaryColor: 'Red',
      location: {
        city: 'Austin',
        specificLocation: 'Zilker Park Great Lawn Picnic Area',
      },
      date: daysAgo(2),
      description: 'Set of Honda car keys found near picnic tables. Has a red braided lanyard and barcode membership tag.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600',
          public_id: 'sample_keys',
        },
      ],
      status: 'active',
      reportedBy: userMarcus._id,
      securityQuestions: ['What gym or store is the barcode tag for?'],
      views: 8,
    });

    // Backpack in Boston
    await Item.create({
      title: 'Patagonia Black Hole 32L Travel Backpack',
      type: 'lost',
      category: 'Bags & Luggage',
      brand: 'Patagonia',
      primaryColor: 'Black',
      location: {
        city: 'Boston',
        specificLocation: 'South Station Food Court Seating Area',
      },
      date: daysAgo(4),
      description: 'Matte black weatherproof Patagonia backpack containing university notebooks, a blue Hydro Flask, and laptop charger.',
      images: [
        {
          url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600',
          public_id: 'sample_backpack',
        },
      ],
      status: 'active',
      reportedBy: userAlex._id,
      views: 22,
    });

    console.log(' Creating sample claims...');
    const claim1 = await Claim.create({
      item: itemIPhoneFound._id,
      claimant: userAlex._id,
      proofDescription: 'This is my personal phone. The lock screen is a wallpaper of my 2-year old golden retriever Cooper sitting in grass, and there is a hairline scratch on the top edge of the camera bumper.',
      proofImages: [
        {
          url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=600',
          public_id: 'proof_cooper',
        },
      ],
      securityAnswers: [
        {
          question: 'Can you describe the lockscreen photo?',
          answer: 'Photo of a golden retriever puppy named Cooper in green grass.',
        },
      ],
      contactPhone: '+1 555-0192',
      contactEmail: 'alex@example.com',
      status: 'pending',
    });

    console.log(' Creating realistic notifications...');
    await Notification.create({
      recipient: userAlex._id,
      type: 'match_found',
      title: 'High Confidence Match (94%): Blue iPhone 15 Pro',
      message: 'A found item reported in Central Park strongly matches your lost iPhone 15 Pro.',
      relatedItem: itemIPhoneFound._id,
      metadata: {
        score: 94,
        itemTitle: itemIPhoneFound.title,
      },
    });

    await Notification.create({
      recipient: userSarah._id,
      type: 'claim_submitted',
      title: 'New Ownership Claim: Blue iPhone 15 Pro',
      message: 'Alex Rivera submitted an ownership claim with photos and proof details.',
      relatedItem: itemIPhoneFound._id,
      relatedClaim: claim1._id,
    });

    await Notification.create({
      recipient: userAlex._id,
      type: 'item_reunited',
      title: 'Item Reunited: Tiffany Necklace',
      message: 'You helped successfully return a Tiffany necklace! 20 reputation points earned.',
      relatedItem: itemReunited._id,
    });

    console.log(' Recording initial activity logs...');
    await ActivityLog.create([
      {
        user: adminUser._id,
        action: 'PLATFORM_INITIALIZED',
        details: { message: 'LostLink platform seeded and initialized' },
      },
      {
        user: userAlex._id,
        action: 'ITEM_REPORTED',
        details: { title: 'Midnight Blue iPhone 15 Pro', type: 'lost' },
      },
      {
        user: userSarah._id,
        action: 'ITEM_REPORTED',
        details: { title: 'Blue iPhone 15 Pro in Dark Case', type: 'found' },
      },
      {
        user: userAlex._id,
        action: 'CLAIM_SUBMITTED',
        details: { itemId: itemIPhoneFound._id, claimId: claim1._id },
      },
      {
        user: userAlex._id,
        action: 'ITEM_REUNITED',
        details: { itemId: itemReunited._id, notes: 'Owner verified' },
      },
    ]);

    console.log('\n===========================================');
    console.log(' LostLink Database Seeding Complete!');
    console.log('===========================================');
    console.log('Demo Credentials:');
    console.log('  Admin User: admin@lostlink.com / Admin@123456');
    console.log('  Normal User: alex@example.com  / User@123456');
    console.log('  Normal User: sarah@example.com / User@123456');
    console.log('===========================================\n');

    process.exit(0);
  } catch (error) {
    console.error(' Seeding failed:', error);
    process.exit(1);
  }
};

seedData();
