import { PrismaClient } from '@prisma/client';

import bcrypt from 'bcryptjs';

async function testConnection() {
  const prisma = new PrismaClient();
  try {
    console.log('Testing Prisma connection...');
    
    // Test connection
    await prisma.$connect();
    console.log('✅ Prisma connected successfully');
    
    // Query the user
    const user = await prisma.user.findUnique({
      where: { email: 'cheemsyyy@yahoo.com' }
    });
    
    if (user) {
      console.log('✅ User found:', {
        id: user.id,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        passwordLength: user.password.length,
        createdAt: user.createdAt
      });
      
      // Test password hash (assuming known plain password 'admin123')
      const isValid = await bcrypt.compare('admin123', user.password);
      console.log('🔑 Password match for \"admin123\":', isValid);
    } else {
      console.log('❌ User not found');
    }
    
  } catch (error) {
    console.error('❌ Prisma error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testConnection();