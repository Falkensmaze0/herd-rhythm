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
      console.log('Password hash length:', user.password.length);
      console.log('Password hash starts with:', user.password.substring(0, 10));
      console.log('Last Login:', user.lastLogin);
      console.log('2FA Enabled:', user.twoFactorEnabled);
      console.log('Created At:', user.createdAt);
    } else {
      console.log('User not found in database');
    }

    // List all users
    const allUsers = await prisma.user.findMany({
      select: { id: true, email: true, role: true, isActive: true, createdAt: true }
    });
    console.log('\nAll users in database:');
    allUsers.forEach(u => {
      console.log(`- ${u.email} (${u.role}, active: ${u.isActive}, created: ${u.createdAt})`);
    });

    // Check sessions for this user if exists
    if (user) {
      const sessions = await prisma.session.findMany({
        where: { userId: user.id },
        select: { id: true, sessionToken: true, expires: true, ipAddress: true }
      });
      console.log('\nUser sessions:');
      sessions.forEach(s => {
        console.log(`- Expires: ${s.expires}, IP: ${s.ipAddress || 'N/A'}`);
      });
    }
  } catch (error) {
    console.error('Error querying database:', error);
    if (error.code === 'P1001') {
      console.log('Prisma client not properly connected. Check DATABASE_URL in .env');
    } else if (error.code === 'P2021') {
      console.log('Database connection failed. Check PostgreSQL server and DATABASE_URL');
    }
  } finally {
    await prisma.$disconnect();
  }
}

checkUser();

// Also check environment
console.log('\nEnvironment check:');
console.log('NODE_ENV:', process.env.NODE_ENV);
console.log('USE_MOCK_AUTH:', process.env.USE_MOCK_AUTH);
console.log('JWT_SECRET exists:', !!process.env.JWT_SECRET);
console.log('DATABASE_URL starts with:', process.env.DATABASE_URL ? process.env.DATABASE_URL.substring(0, 20) + '...' : 'Not set');