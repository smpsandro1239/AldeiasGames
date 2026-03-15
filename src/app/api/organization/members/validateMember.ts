// Member validation middleware

import { Request, Response, NextFunction } from 'express';

export const validateMember = (req: Request, res: Response, next: NextFunction) => {
  // Validate required fields
  const { email, name, role } = req.body;
  if (!email || !name || !role) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  // Basic email validation
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Validate role
  if (!['ADMIN', 'MEMBER'].includes(role)) {
    return res.status(400).json({ error: 'Invalid role. Must be ADMIN or MEMBER' });
  }

  next();
};
