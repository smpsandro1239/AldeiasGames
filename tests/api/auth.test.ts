import { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import bcrypt from 'bcrypt'

// Mock do prisma
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    findFirst: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  organization: {
    findFirst: jest.fn()
  }
}

// Mock da função auth
const mockAuth = jest.fn()

describe('API de Autenticação', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('POST /api/register', () => {
    it('deve registar novo PLAYER com sucesso', async () => {
      const body = {
        nome: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        telefone: '912345678',
        role: 'PLAYER'
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-123' })
      mockPrisma.user.create.mockResolvedValue({
        id: 'user-123',
        ...body,
        status: 'ATIVO',
        orgId: 'org-123',
        saldo: 0
      })

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.success).toBe(true)
    })

    it('deve rejeitar email duplicado', async () => {
      const body = {
        nome: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'PLAYER'
      }

      mockPrisma.user.findUnique.mockResolvedValue({ id: 'existing-user' })

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      expect(response.status).toBe(409)
    })

    it('deve rejeitar password curta', async () => {
      const body = {
        nome: 'Test User',
        email: 'test@example.com',
        password: '123',
        role: 'PLAYER'
      }

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      expect(response.status).toBe(400)
    })

    it('deve criar VENDEDOR com status PENDENTE', async () => {
      const body = {
        nome: 'Vendedor Test',
        email: 'vendor@example.com',
        password: 'password123',
        role: 'VENDEDOR'
      }

      mockPrisma.user.findUnique.mockResolvedValue(null)
      mockPrisma.organization.findFirst.mockResolvedValue({ id: 'org-123' })
      mockPrisma.user.create.mockResolvedValue({
        id: 'vendor-123',
        ...body,
        status: 'PENDENTE',
        orgId: 'org-123',
        saldo: 0
      })

      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      })

      const data = await response.json()
      expect(response.status).toBe(201)
      expect(data.data.status).toBe('PENDENTE')
    })
  })
})