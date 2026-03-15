# Configurações API e Estratégia Offline

## Endpoints de Configuração

- **GET /api/admin/config** - Obter configurações globais (taxas, limites, fees)
- **PATCH /api/admin/config** - Atualizar configurações (ex: taxa de comissão)

## Estratégia Offline (PWA)

- **IndexedDB** para armazenamento local de dados críticos
- **Service Worker** para cache de recursos estáticos
- **Synchronização automática** quando reconectado à rede

**Contexto de Uso:** 
Este documento descreve a arquitetura offline para usuários que acessam a plataforma através de dispositivos móveis ou redes com conectividade intermitente.