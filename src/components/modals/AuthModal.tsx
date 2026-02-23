import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { X, Users, MapPin, School, Building, Loader2, CheckCircle2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  authMode: 'login' | 'register';
  setAuthMode: (mode: 'login' | 'register') => void;
  authForm: any;
  setAuthForm: (form: any) => void;
  handleAuth: (e: React.FormEvent) => void;
  authLoading: boolean;
  handleQuickLogin: (role: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  authMode,
  setAuthMode,
  authForm,
  setAuthForm,
  handleAuth,
  authLoading,
  handleQuickLogin
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md"
          >
            <Card>
              <CardHeader className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-2 top-2"
                  onClick={onClose}
                >
                  <X className="h-4 w-4" />
                </Button>
                <CardTitle>{authMode === 'login' ? 'Entrar' : 'Criar Conta'}</CardTitle>
                <CardDescription>
                  {authMode === 'login'
                    ? 'Entre para participar nos jogos'
                    : 'Crie uma conta e comece a jogar'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleAuth} className="space-y-4">
                  {authMode === 'register' && (
                    <div className="space-y-2">
                      <Label htmlFor="nome">Nome</Label>
                      <Input
                        id="nome"
                        placeholder="O seu nome"
                        value={authForm.nome}
                        onChange={(e) => setAuthForm({ ...authForm, nome: e.target.value })}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="exemplo@email.com"
                      value={authForm.email}
                      onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      value={authForm.password}
                      onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                      required
                    />
                  </div>
                  {authMode === 'register' && (
                    <div className="space-y-2">
                      <Label>Tipo de Conta</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          variant={authForm.role === 'user' ? 'default' : 'outline'}
                          onClick={() => setAuthForm({ ...authForm, role: 'user' })}
                        >
                          <Users className="h-4 w-4 mr-2" />
                          Jogador
                        </Button>
                        <Button
                          type="button"
                          variant={authForm.role === 'aldeia_admin' ? 'default' : 'outline'}
                          onClick={() => setAuthForm({ ...authForm, role: 'aldeia_admin' })}
                        >
                          <MapPin className="h-4 w-4 mr-2" />
                          Organização
                        </Button>
                      </div>
                    </div>
                  )}
                  {authMode === 'register' && authForm.role === 'aldeia_admin' && (
                    <div className="space-y-2">
                      <Label>Tipo de Organização</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <Button
                          type="button"
                          size="sm"
                          variant={authForm.tipoOrganizacao === 'aldeia' ? 'default' : 'outline'}
                          onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'aldeia' })}
                          className="text-xs"
                        >
                          <MapPin className="h-3 w-3 mr-1" />
                          Aldeia
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={authForm.tipoOrganizacao === 'escola' ? 'default' : 'outline'}
                          onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'escola' })}
                          className="text-xs"
                        >
                          <School className="h-3 w-3 mr-1" />
                          Escola
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={authForm.tipoOrganizacao === 'associacao_pais' ? 'default' : 'outline'}
                          onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'associacao_pais' })}
                          className="text-xs"
                        >
                          <Users className="h-3 w-3 mr-1" />
                          Assoc. Pais
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={authForm.tipoOrganizacao === 'clube' ? 'default' : 'outline'}
                          onClick={() => setAuthForm({ ...authForm, tipoOrganizacao: 'clube' })}
                          className="text-xs"
                        >
                          <Building className="h-3 w-3 mr-1" />
                          Clube
                        </Button>
                      </div>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      authMode === 'login' ? 'Entrar' : 'Criar Conta'
                    )}
                  </Button>
                </form>
                <div className="mt-4 text-center text-sm">
                  <button
                    className="text-green-600 hover:underline"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                  >
                    {authMode === 'login'
                      ? 'Não tem conta? Registe-se'
                      : 'Já tem conta? Entre'}
                  </button>
                </div>

                {/* Quick Login Buttons (Test Mode) */}
                {authMode === 'login' && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-xs text-muted-foreground text-center mb-3">
                      🔑 Login rápido para testes:
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px]"
                        onClick={() => handleQuickLogin('super_admin')}
                      >
                        Super Admin
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px]"
                        onClick={() => handleQuickLogin('aldeia_admin')}
                      >
                        Admin Aldeia
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px]"
                        onClick={() => handleQuickLogin('vendedor')}
                      >
                        Vendedor
                      </Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        className="text-[10px]"
                        onClick={() => handleQuickLogin('user')}
                      >
                        Jogador
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
