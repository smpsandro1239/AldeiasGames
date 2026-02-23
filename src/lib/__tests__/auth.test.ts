import { hashPassword, verifyPassword, createToken, verifyToken } from '../auth';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

// Mock dependencies
jest.mock('bcryptjs');
jest.mock('jose');
jest.mock('../db', () => ({
  db: {
    user: {
      create: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('Auth functions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('hashPassword', () => {
    it('should hash a password', async () => {
      const mockHash = '$2b$10$hashedpassword';
      (bcrypt.hash as jest.Mock).mockResolvedValue(mockHash);

      const result = await hashPassword('mypassword');

      expect(bcrypt.hash).toHaveBeenCalledWith('mypassword', 10);
      expect(result).toBe(mockHash);
    });

    it('should throw error if bcrypt fails', async () => {
      (bcrypt.hash as jest.Mock).mockRejectedValue(new Error('Hash failed'));

      await expect(hashPassword('mypassword')).rejects.toThrow('Hash failed');
    });
  });

  describe('verifyPassword', () => {
    it('should return true for valid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await verifyPassword('mypassword', 'hashedpassword');

      expect(bcrypt.compare).toHaveBeenCalledWith('mypassword', 'hashedpassword');
      expect(result).toBe(true);
    });

    it('should return false for invalid password', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await verifyPassword('wrongpassword', 'hashedpassword');

      expect(result).toBe(false);
    });
  });

  describe('createToken', () => {
    it('should create a JWT token', async () => {
      const mockToken = 'mock.jwt.token';
      const mockSign = {
        setProtectedHeader: jest.fn().mockReturnThis(),
        setIssuedAt: jest.fn().mockReturnThis(),
        setExpirationTime: jest.fn().mockReturnThis(),
        sign: jest.fn().mockResolvedValue(mockToken),
      };
      (SignJWT as jest.Mock).mockImplementation(() => mockSign);

      const payload = { id: '1', email: 'test@test.com', nome: 'Test', role: 'user' };
      const result = await createToken(payload);

      expect(result).toBe(mockToken);
      expect(mockSign.setProtectedHeader).toHaveBeenCalledWith({ alg: 'HS256' });
      expect(mockSign.setExpirationTime).toHaveBeenCalledWith('7d');
    });
  });

  describe('verifyToken', () => {
    it('should return payload for valid token', async () => {
      const mockPayload = { id: '1', email: 'test@test.com', nome: 'Test', role: 'user' };
      (jwtVerify as jest.Mock).mockResolvedValue({ payload: mockPayload });

      const result = await verifyToken('valid.token');

      expect(result).toEqual(mockPayload);
    });

    it('should return null for invalid token', async () => {
      (jwtVerify as jest.Mock).mockRejectedValue(new Error('Invalid token'));

      const result = await verifyToken('invalid.token');

      expect(result).toBeNull();
    });
  });
});
