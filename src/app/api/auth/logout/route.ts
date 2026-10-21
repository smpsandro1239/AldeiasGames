/**
 * Logout API Route
 * Clears auth cookies and returns to home
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookies (auth-token é o cookie de sessão real definido no login/dev-login)
  response.cookies.set('auth-token', '', { 
    expires: new Date(0),
    path: '/'
  });
  response.cookies.set('user-role', '', { 
    expires: new Date(0),
    path: '/'
  });
  
  return response;
}

export async function GET() {
  return POST();
}
