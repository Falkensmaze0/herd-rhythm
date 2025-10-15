import { PrismaClient } from '@prisma/client';

async function updatePassword() {
  const prisma = new PrismaClient();
  try {
    console.log('Updating password for user cheemsyyy@yahoo.com...');
    
    const newHash = '$2a$12$KtR..79HxSRgdb9bUsDhfOYE4xG8nD3EXL0lU7OuZqWvTiJscxTca';
    
    const updatedUser = await prisma.user.update({
      where: { email: 'cheemsyyy@yahoo.com' },
      data: { password: newHash }
    });
    
    console.log('✅ Password updated successfully:', {
      id: updatedUser.id,
      email: updatedUser.email,
      passwordLength: updatedUser.password.length
    });
    
  } catch (error) {
    console.error('❌ Update error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

updatePassword();