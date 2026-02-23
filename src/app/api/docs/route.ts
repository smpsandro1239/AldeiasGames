import { NextResponse } from 'next/server';
import { generateOpenApi } from '@/lib/openapi';

export async function GET() {
  const spec = generateOpenApi();
  return NextResponse.json(spec);
}
