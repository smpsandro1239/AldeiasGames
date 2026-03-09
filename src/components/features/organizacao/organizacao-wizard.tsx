/**
 * OrganizacaoWizard.tsx
 * Wizard de Configuração para Organizações
 * Passos: 1. Info Basic -> 2. Localização -> 3. Documentos Legais -> 4. Preview
 */

'use client';

import React, { useState } from 'react';
import { 
  Building2, 
  MapPin, 
  FileText, 
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Upload,
  Save
} from 'lucide-react';
import { UIButton, UICard, UIInput, UIBadge, UISelect } from '@/components/ui-components';
import { Aldeia } from '@/types/project';

interface OrganizacaoWizardProps {
  organizacao?: Aldeia;
  onComplete?: (data: any) => Promise<void>;
}

const TIPOS_ORGANIZACAO = [
  { value: 'aldeia', label: 'Aldeia/Freguesia' },
  { value: 'escola', label: 'Escola' },
  { value: 'associacao_pais', label: 'Associação de Pais' },
  { value: 'clube', label: 'Clube/Associação' },
];

export function OrganizacaoWizard({ organizacao, onComplete }: OrganizacaoWizardProps) {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    // Passo 1: Info Basic
    nome: organizacao?.nome || '',
    tipoOrganizacao: organizacao?.tipoOrganizacao || 'aldeia',
    descricao: organizacao?.descricao || '',
    
    // Passo 2: Localização
    morada: organizacao?.morada || '',
    codigoPostal: organizacao?.codigoPostal || '',
    locality: organizacao?.localidade || '',
    
    // Passo 3: Documentos
    responsavel: organizacao?.responsavel || '',
    contactoResponsavel: organizacao?.contactoResponsavel || '',
    numeroAlvara: organizacao?.numeroAlvara || '',
    autorizacaoCM: organizacao?.autorizacaoCM || false,
    
    // Escola specific
    nomeEscola: organizacao?.nomeEscola || '',
    codigoEscola: organizacao?.codigoEscola || '',
    nivelEnsino: organizacao?.nivelEnsino || '',
  });

  const steps = [
    { num: 1, title: 'Informações Básicas', icon: Building2 },
    { num: 2, title: 'Localização', icon: MapPin },
    { num: 3, title: 'Documentos Legais', icon: FileText },
    { num: 4, title: 'Revisão', icon: CheckCircle },
  ];

  const handleNext = () => {
    if (step < 4) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async () => {
    if (!onComplete) return;
    
    setLoading(true);
    try {
      await onComplete(formData);
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Informações Básicas</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Organização *</label>
              <UIInput 
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
                placeholder="Ex: Junta de Freguesia de Aldeia Velha"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Tipo de Organização *</label>
              <select 
                className="w-full p-2 border rounded-lg"
                value={formData.tipoOrganizacao}
                onChange={(e) => setFormData({...formData, tipoOrganizacao: e.target.value})}
              >
                {TIPOS_ORGANIZACAO.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea 
                className="w-full p-2 border rounded-lg"
                rows={3}
                value={formData.descricao}
                onChange={(e) => setFormData({...formData, descricao: e.target.value})}
                placeholder="Descreva brevemente a organização..."
              />
            </div>

            {formData.tipoOrganizacao === 'escola' && (
              <div className="p-4 bg-blue-50 rounded-lg space-y-4">
                <h4 className="font-medium text-blue-800">Informações da Escola</h4>
                <div>
                  <label className="block text-sm font-medium mb-1">Nome da Escola</label>
                  <UIInput 
                    value={formData.nomeEscola}
                    onChange={(e) => setFormData({...formData, nomeEscola: e.target.value})}
                    placeholder="Ex: Escola Básica de Aldeia Velha"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Código da Escola</label>
                  <UIInput 
                    value={formData.codigoEscola}
                    onChange={(e) => setFormData({...formData, codigoEscola: e.target.value})}
                    placeholder="Ex: 123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Nível de Ensino</label>
                  <UIInput 
                    value={formData.nivelEnsino}
                    onChange={(e) => setFormData({...formData, nivelEnsino: e.target.value})}
                    placeholder="Ex: 1º Ciclo, 2º/3º Ciclo..."
                  />
                </div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Localização</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Morada *</label>
              <UIInput 
                value={formData.morada}
                onChange={(e) => setFormData({...formData, morada: e.target.value})}
                placeholder="Rua, número, andar..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Código Postal *</label>
                <UIInput 
                  value={formData.codigoPostal}
                  onChange={(e) => setFormData({...formData, codigoPostal: e.target.value})}
                  placeholder="0000-000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Localidade *</label>
                <UIInput 
                  value={formData.locality}
                  onChange={(e) => setFormData({...formData, locality: e.target.value})}
                  placeholder="Cidade/Vila"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Documentos Legais</h3>
            
            <div>
              <label className="block text-sm font-medium mb-1">Responsável pela Organização *</label>
              <UIInput 
                value={formData.responsavel}
                onChange={(e) => setFormData({...formData, responsavel: e.target.value})}
                placeholder="Nome do responsável"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Contacto do Responsável *</label>
              <UIInput 
                value={formData.contactoResponsavel}
                onChange={(e) => setFormData({...formData, contactoResponsavel: e.target.value})}
                placeholder="Telefone ou email"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Número de Alvará (se aplicável)</label>
              <UIInput 
                value={formData.numeroAlvara}
                onChange={(e) => setFormData({...formData, numeroAlvara: e.target.value})}
                placeholder="Número do alvará judicial"
              />
            </div>

            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <label className="flex items-start gap-3 cursor-pointer">
                <input 
                  type="checkbox"
                  checked={formData.autorizacaoCM}
                  onChange={(e) => setFormData({...formData, autorizacaoCM: e.target.checked})}
                  className="mt-1"
                />
                <div>
                  <span className="font-medium text-amber-800">Autorização da Câmara Municipal</span>
                  <p className="text-sm text-amber-700">
                    Confirmo que tenho autorização da Câmara Municipal ou entidade competente 
                    para realizar atividades de angariação de fundos.
                  </p>
                </div>
              </label>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Revisão dos Dados</h3>
            
            <UICard className="p-4 space-y-4">
              <div>
                <h4 className="text-sm text-gray-500">Nome</h4>
                <p className="font-medium">{formData.nome}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Tipo</h4>
                <p className="font-medium">{TIPOS_ORGANIZACAO.find(t => t.value === formData.tipoOrganizacao)?.label}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Localização</h4>
                <p className="font-medium">{formData.morada}, {formData.codigoPostal} {formData.locality}</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Responsável</h4>
                <p className="font-medium">{formData.responsavel} ({formData.contactoResponsavel})</p>
              </div>
              <div>
                <h4 className="text-sm text-gray-500">Autorização CM</h4>
                <UIBadge className={formData.autorizacaoCM ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}>
                  {formData.autorizacaoCM ? 'Confirmada' : 'Pendente'}
                </UIBadge>
              </div>
            </UICard>

            <p className="text-sm text-gray-500">
              Ao guardar, os dados serão submetidos para verificação por um administrador.
            </p>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Progress Steps */}
      <div className="flex justify-between mb-8">
        {steps.map((s, idx) => (
          <div key={s.num} className="flex items-center">
            <div className={`flex items-center gap-2 ${step >= s.num ? 'text-indigo-600' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                step > s.num ? 'bg-green-500 text-white' : 
                step === s.num ? 'bg-indigo-600 text-white' : 'bg-gray-200'
              }`}>
                {step > s.num ? <CheckCircle className="w-5 h-5" /> : <s.icon className="w-4 h-4" />}
              </div>
              <span className="text-sm hidden md:block">{s.title}</span>
            </div>
            {idx < steps.length - 1 && (
              <div className={`w-8 md:w-16 h-0.5 mx-2 ${step > s.num ? 'bg-green-500' : 'bg-gray-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Form Content */}
      <UICard className="p-6">
        {renderStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8 pt-4 border-t">
          <UIButton 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
          </UIButton>
          
          {step < 4 ? (
            <UIButton onClick={handleNext}>
              Próximo <ArrowRight className="w-4 h-4 ml-2" />
            </UIButton>
          ) : (
            <UIButton onClick={handleSubmit} disabled={loading}>
              <Save className="w-4 h-4 mr-2" /> 
              {loading ? 'A guardar...' : 'Submeter para Verificação'}
            </UIButton>
          )}
        </div>
      </UICard>
    </div>
  );
}
