import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient()

async function main() {
  console.log('Start seeding...');

  // --- Create Admin Users ---
  // You can add as many admins as you need.
  // The password for all is 'password123' before hashing.
  const adminPassword = await bcrypt.hash('password123', 10);

  const superAdmin = await prisma.user.upsert({
    where: { email: 'superadmin@example.com' },
    update: {},
    create: {
      email: 'superadmin@example.com',
      name: 'Super Admin',
      password: adminPassword,
      role: 'SUPER_ADMIN',
      isVerified: true, // Admins should be verified by default
      verificationStatus: 'APPROVED', // Assuming super admins are always approved
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
      isVerified: true,
      verificationStatus: 'APPROVED', // Assuming admins are always approved
    },
  });

  console.log({ superAdmin, admin });

  // --- Create Regular Users ---
  // Create a few regular users, one verified and two not.
  const userPassword = await bcrypt.hash('userpass', 10);

  const user1 = await prisma.user.upsert({
    where: { email: 'user1@example.com' },
    update: {},
    create: {
      email: 'user1@example.com',
      name: 'Verified User',
      password: userPassword,
      role: 'USER',
      isVerified: true,
      verificationStatus: 'APPROVED', //
    },
  });

  const user1wallet = await prisma.wallet.create({
    data: {
      userId: user1.id,
      walletNumber: `WAL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      currency: 'IDR',
      walletType: 'MAIN', // Assuming this is a main wallet
      name: 'Main Wallet',
      description: 'Primary wallet for transactions',
    },
  });
  
  const user2 = await prisma.user.upsert({
    where: { email: 'user2@example.com' },
    update: {},
    create: {
      email: 'user2@example.com',
      name: 'Unverified User One',
      password: userPassword,
      role: 'USER',
      isVerified: false,
      verificationStatus: 'PENDING', // Assuming unverified users have pending status
    },
  });

  const user2wallet = await prisma.wallet.create({
    data: {
      userId: user2.id,
      walletNumber: `WAL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      currency: 'IDR',
      walletType: 'MAIN', // Assuming this is a main wallet
      name: 'Main Wallet',
      description: 'Primary wallet for transactions',
    },
  });

  const user3 = await prisma.user.upsert({
    where: { email: 'user3@example.com' },
    update: {},
    create: {
      email: 'user3@example.com',
      name: 'Unverified User Two',
      password: userPassword,
      role: 'USER',
      isVerified: false,
      verificationStatus: 'PENDING', // Assuming unverified users have pending status
    },
  });

  const user3wallet = await prisma.wallet.create({
    data: {
      userId: user3.id,
      walletNumber: `WAL${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`,
      currency: 'IDR',
      walletType: 'MAIN', // Assuming this is a main wallet
      name: 'Main Wallet',
      description: 'Primary wallet for transactions',
    },
  });
  
  console.log({ user1, user2, user3, user1wallet, user2wallet, user3wallet });

  console.log('Seeding finished.');
}

main()