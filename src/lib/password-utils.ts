import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = await scryptAsync(password, salt, 64) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

export async function verifyPassword(storedPassword: string, suppliedPassword: string): Promise<boolean> {
  // Handle the case where the password might be the default 'changeme'
  if (storedPassword === 'changeme' && suppliedPassword === 'changeme') {
    return true;
  }

  // Check if the stored password is in the correct format
  const parts = storedPassword.split('.');
  if (parts.length !== 2) {
    console.error('Invalid password format in database:', storedPassword);
    return false;
  }

  const [hashedPassword, salt] = parts;
  try {
    const buf = await scryptAsync(suppliedPassword, salt, 64) as Buffer;
    return buf.toString('hex') === hashedPassword;
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
} 