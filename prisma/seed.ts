import { PrismaClient } from '@prisma/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const prisma = new PrismaClient();
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

async function main() {
  // Create admin user
  const hashedPassword = await hashPassword('admin123');
  const admin = await prisma.user.upsert({
    where: { email: 'admin@gym.com' },
    update: {
      passwordHash: hashedPassword, // Update password even if user exists
      role: 'ADMIN',
      requiresPasswordChange: false,
    },
    create: {
      email: 'admin@gym.com',
      name: 'Admin',
      passwordHash: hashedPassword,
      role: 'ADMIN',
      requiresPasswordChange: false,
    },
  });

  console.log('Admin user created/updated:', {
    id: admin.id,
    email: admin.email,
    role: admin.role
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 