const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('12345678', 10);
  
  await prisma.user.update({
    where: { email: 'aldeia@gmail.com' },
    data: { passwordHash }
  });
  console.log('Updated aldeia@gmail.com');
  
  await prisma.user.update({
    where: { email: 'vendedor@gmail.com' },
    data: { passwordHash }
  });
  console.log('Updated vendedor@gmail.com');
  
  await prisma.user.update({
    where: { email: 'smpsandro1239@gmail.com' },
    data: { passwordHash }
  });
  console.log('Updated smpsandro1239@gmail.com');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
