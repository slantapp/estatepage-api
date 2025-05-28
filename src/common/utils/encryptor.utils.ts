import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { randomBytes, createHash, createCipheriv, createDecipheriv } from 'crypto';
import { User } from '@prisma/client';

dotenv.config();

const ENC_ALGO = 'aes-256-cbc';
const ENC_KEY = process.env.SECRET_ENCRYPT_KEY?.padEnd(32, '0').slice(0, 32) || 'default_secret_key_32bytes!!'; // 32 bytes
const ENC_IV = process.env.SECRET_ENCRYPT_IV?.padEnd(16, '0').slice(0, 16) || 'default_iv_16bytes!'; // 16 bytes

export class encrypt {
  static async encryptpass(password: string) {
    // Generate salt dynamically with a cost factor of 10
    const salt = await bcrypt.genSalt(10);
    // Hash the password using the generated salt
    return bcrypt.hashSync(password, salt);
  }

  static comparepassword(hashPassword: string, password: string) {
    return bcrypt.compare(password, hashPassword);
  }

  static getPasswordResetToken = function (user: User) {
    const resetToken = randomBytes(32).toString('hex');

    const passwordResetToken = createHash('sha256')
      .update(resetToken)
      .digest('hex');

    //token expires after 15 minutes
    const resetTokenExpiresAt = Date.now() + 15 * 60 * 1000;
    user.resetTokenExpiresAt = BigInt(resetTokenExpiresAt);
    user.passwordResetToken = passwordResetToken;

    return resetToken;
  };

  //Generate verification token for new registered User
  static getVerifyToken = function (user: User) {
    const verifyToken = randomBytes(32).toString('hex');

    const emailVerifyToken = createHash('sha256')
      .update(verifyToken)
      .digest('hex');
    user.emailVerificationToken = emailVerifyToken;
    return verifyToken;
  };

  static verifyPasswordResetToken(user: User, token: string): boolean {
    if (!user.passwordResetToken || !user.resetTokenExpiresAt) {
      return false; // No token set or expiration info
    }

    // Hash the provided token to compare with stored hashed token
    const hashedToken = createHash('sha256').update(token).digest('hex');

    // Check if the token matches and hasn't expired
    const isTokenValid =
      hashedToken === user.passwordResetToken &&
      Date.now() < user.resetTokenExpiresAt;

    return isTokenValid;
  }

  // For reversible encryption (not for passwords)
  static encryptField(value: string): string {
    const cipher = createCipheriv(ENC_ALGO, ENC_KEY, ENC_IV);
    let encrypted = cipher.update(value, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return encrypted;
  }

  static decryptField(encrypted: string): string {
    const decipher = createDecipheriv(ENC_ALGO, ENC_KEY, ENC_IV);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
