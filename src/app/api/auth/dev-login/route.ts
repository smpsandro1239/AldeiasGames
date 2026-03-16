import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

// Quick login - creates test users if they don't exist and logs them in
export async function POST(request: Request) {
  try {
    const { role } = await request.json()
    
    // Password for all test users
    const passwordHash = await bcrypt.hash('123456', 10)
    
    let email = ''
    let userRole = 'PLAYER'
    let userName = ''
    
    switch (role) {
      case 'SUPERADMIN':
        email = 'admin@aldeias.pt'
        userRole = 'SUPERADMIN'
        userName = 'Super Administrador'
        break
      case 'ORG_ADMIN':
        email = 'admin@aldeia.pt'
        userRole = 'ORG_ADMIN'
        userName = 'Admin Organização'
        break
      case 'VENDEDOR':
        email = 'vendedor@aldeia.pt'
        userRole = 'VENDEDOR'
        userName = 'Vendedor Teste'
        break
      case 'PLAYER':
      default:
        email = 'jogador@aldeia.pt'
        userRole = 'PLAYER'
        userName = 'Jogador Teste'
        break
    }
    
    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email }
    })
    
    if (!user) {
      // Create user with organization if needed
      let org = null
      if (userRole === 'ORG_ADMIN' || userRole === 'VENDEDOR' || userRole === 'PLAYER') {
        org = await prisma.organization.findFirst()
        if (!org) {
          org = await prisma.organization.create({
            data: {
              nome: 'Aldeia de Teste',
              slug: 'aldeia-teste',
              email: 'teste@aldeia.pt',
              telefone: '+351912345678',
            }
          })
        }
      }
      
      // Create the user
      user = await prisma.user.create({
        data: {
          email,
          nome: userName,
          password: passwordHash,
          role: userRole as any,
          orgId: org?.id || null,
        }
      })
    } else {
      // Update password and role
      user = await prisma.user.update({
        where: { email },
        data: {
          password: passwordHash,
          role: userRole as any,
        }
      })
    }
    
    // Create a simple token (for demo purposes)
    const token = Buffer.from(JSON.stringify({
      id: user.id,
      email: user.email,
      nome: user.nome,
      role: user.role,
    })).toString('base64')
    
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role,
      },
      token
    })
    
    // Set cookie
    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7 // 1 week
    })
    
    return response
    
  } catch (error) {
    console.error('Erro no login de desenvolvimento:', error)
    return NextResponse.json(
      { error: 'Erro ao fazer login' },
      { status: 500 }
    )
  }
}
