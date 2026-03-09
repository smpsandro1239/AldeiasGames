/**
 * Logout API Route
 * Clears auth cookies and returns to home
 */

import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ success: true });
  
  // Clear auth cookies
  response.cookies.set('user-role', '', { 
    expires: new Date(0),
    path: '/'
  });
  
  return response;
}

export async function GET() {
  return POST();
}
