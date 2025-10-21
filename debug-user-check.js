const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkUser() {
  try {
    const user = await prisma.user.findUnique({
      where: { email: 'cheemsyyy@yahoo.com' }
    });

    if (user) {
      console.log('User found:');
      console.log('ID:', user.id);
      console.log('Email:', user.email);
      console.log('Role:', user.role);
      console.log('Is Active:', user.isActive);
      console.log('Password hash:', user.password.substring(0, 20) + '...'); // Partial for security
      console.log('Last Login:', user.lastLogin);
      console.log('2FA Enabled:', user.twoFactorEnabled);
    } else {
      console.log('User not found');
    }

    // Also list all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true }
    });
    console.log('All users:', allUsers);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();