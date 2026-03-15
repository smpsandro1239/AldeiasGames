import { useFormStatus } from 'next/navigation'
import { useState } from 'react'

export default function LoginPage() {
  const [error, _revalidate] = useFormStatus()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    const response = await fetch('/api/auth/callback/credentials', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: e.submitter!.name as string,
        password: e.submitter!.value as string,
      }),
    })

    const data = await response.json()
    if (!response.ok) {
      // Show error from API response
      // The error field is set by auth.ts
      const errorMessage = data.error || 'Erro ao fazer login'
      // @ts-ignore
      (e.currentTarget as HTMLFormElement).reportValidate(errorMessage)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-4 rounded-xl bg-gray-50 p-6 shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900">Aldeias Games</h1>
        <p className="text-gray-600">Bem-vindo à nossa plataforma de jogos comunitários</p>

        <form 
          className="rounded-md bg-white p-4 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <div>
              <label className="text-sm font-medium text-gray-700">Email</label>
              <input 
                type="email" 
                name="email" 
                type="email" 
                autoComplete="email"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-gray-700">Password</label>
              <input 
                type="password" 
                name="password" 
                autoComplete="current-password"
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              />
            </div>

            {error && (
              <p className="text-sm text-red-600 "{error}" />
            )}

            <button
              type="submit"
              className="inline-flex justify-center py-2 px-4 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Aguardando...' : 'Entrar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
