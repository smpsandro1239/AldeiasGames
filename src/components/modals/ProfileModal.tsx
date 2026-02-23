import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  X, User, Bell, BellOff, Clock, Loader2, Shield, Download, Trash2, AlertTriangle
} from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  profileForm: any;
  setProfileForm: (form: any) => void;
  handleUpdateProfile: () => void;
  profileLoading: boolean;
  profileData: any;
  handleExportData: () => void;
  exportLoading: boolean;
  deleteAccountModalOpen: boolean;
  setDeleteAccountModalOpen: (open: boolean) => void;
  deleteConfirmText: string;
  setDeleteConfirmText: (text: string) => void;
  handleDeleteAccount: () => void;
  deleteLoading: boolean;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({
  isOpen,
  onClose,
  user,
  profileForm,
  setProfileForm,
  handleUpdateProfile,
  profileLoading,
  profileData,
  handleExportData,
  exportLoading,
  deleteAccountModalOpen,
  setDeleteAccountModalOpen,
  deleteConfirmText,
  setDeleteConfirmText,
  handleDeleteAccount,
  deleteLoading,
}) => {
  return (
    <>
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
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Editar Perfil
                  </CardTitle>
                  <CardDescription>
                    Atualize as suas informações pessoais
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-nome">Nome *</Label>
                      <Input
                        id="profile-nome"
                        placeholder="O seu nome"
                        value={profileForm.nome}
                        onChange={(e) => setProfileForm({ ...profileForm, nome: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-telefone">Telefone</Label>
                      <Input
                        id="profile-telefone"
                        placeholder="Ex: 912345678"
                        value={profileForm.telefone}
                        onChange={(e) => setProfileForm({ ...profileForm, telefone: e.target.value })}
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {profileForm.notificacoesEmail ? (
                          <Bell className="h-5 w-5 text-green-600" />
                        ) : (
                          <BellOff className="h-5 w-5 text-muted-foreground" />
                        )}
                        <div>
                          <Label htmlFor="notificacoes-email" className="cursor-pointer">
                            Receber notificações por email
                          </Label>
                          <p className="text-xs text-muted-foreground">
                            Alertas sobre sorteios e resultados
                          </p>
                        </div>
                      </div>
                      <Switch
                        id="notificacoes-email"
                        checked={profileForm.notificacoesEmail}
                        onCheckedChange={(checked) => setProfileForm({ ...profileForm, notificacoesEmail: checked })}
                      />
                    </div>

                    {profileData?.ultimoLogin && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                        <Clock className="h-4 w-4" />
                        <span>Último login: {new Date(profileData.ultimoLogin).toLocaleString('pt-PT')}</span>
                      </div>
                    )}

                    <Button
                      className="w-full"
                      onClick={handleUpdateProfile}
                      disabled={profileLoading}
                    >
                      {profileLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          A guardar...
                        </>
                      ) : (
                        'Guardar Alterações'
                      )}
                    </Button>

                    {user && ['user', 'vendedor'].includes(user.role) && (
                      <>
                        <div className="border-t pt-4 mt-4">
                          <div className="flex items-center gap-2 mb-3">
                            <Shield className="h-5 w-5 text-blue-600" />
                            <h3 className="font-semibold">Privacidade e Dados (RGPD)</h3>
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            Gerencie os seus dados pessoais de acordo com o RGPD
                          </p>

                          <div className="space-y-3">
                            <Button
                              variant="outline"
                              className="w-full justify-start gap-2"
                              onClick={handleExportData}
                              disabled={exportLoading}
                            >
                              {exportLoading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                              Exportar Meus Dados
                            </Button>

                            <Button
                              variant="destructive"
                              className="w-full justify-start gap-2"
                              onClick={() => {
                                setDeleteConfirmText('');
                                setDeleteAccountModalOpen(true);
                              }}
                            >
                              <Trash2 className="h-4 w-4" />
                              Apagar Minha Conta
                            </Button>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AlertDialog open={deleteAccountModalOpen} onOpenChange={setDeleteAccountModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Tem a certeza que deseja apagar a sua conta?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-4 pt-2">
              <p className="text-destructive font-medium">
                Esta ação é irreversível. Todos os seus dados pessoais serão permanentemente eliminados.
              </p>
              <div className="space-y-2">
                <Label htmlFor="delete-confirm" className="text-sm font-medium">
                  Digite <span className="font-bold text-destructive">APAGAR</span> para confirmar:
                </Label>
                <Input
                  id="delete-confirm"
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                  placeholder="APAGAR"
                  className="border-destructive/50 focus:border-destructive"
                />
              </div>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleteConfirmText !== 'APAGAR' || deleteLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  A apagar...
                </>
              ) : (
                'Apagar Conta'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
