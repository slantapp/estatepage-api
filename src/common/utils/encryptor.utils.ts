import * as bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';
import { randomBytes, createHash } from 'crypto';
import { User } from '@prisma/client';

dotenv.config();

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
}
