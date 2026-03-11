# 🏥 Sistema de Gestão de Leitos Hospitalares

Sistema integrado de gerenciamento hospitalar baseado em FHIR (Fast Healthcare Interoperability Resources) com suporte a múltiplos perfis de usuário e comunicação em tempo real.

## 🎨 Design System

A aplicação utiliza a paleta de cores **Luminous** com gradientes do amarelo ao laranja vibrante (#FFB800 → #FF5800), criando uma identidade visual moderna e acessível.

## ✨ Características Principais

- ✅ **Angular 17** com Standalone Components
- ✅ **Autenticação JWT** com refresh tokens
- ✅ **Guards baseados em Roles** (RBAC)
- ✅ **WebSockets** para atualizações em tempo real
- ✅ **FHIR-Compliant** (Location, Patient, Encounter, Task)
- ✅ **Interceptors HTTP** (Auth, Error Handling, Loading)
- ✅ **Sistema de Notificações** (Toasts)
- ✅ **Lazy Loading** de rotas
- ✅ **Responsive Design**
- ✅ **TypeScript Strict Mode**

## 👥 Perfis de Usuário (Roles)

### 1. **Admin** 🔐
- Visão geral do sistema
- Gestão completa de leitos
- Administração de usuários
- Relatórios e análises

### 2. **Médico** 👨‍⚕️
- Lista de pacientes sob cuidado
- Agenda de visitas
- Gerenciamento de previsões de alta (EDD)
- Acesso a prontuários

### 3. **Enfermagem** 👩‍⚕️
- Timeline de cuidados do paciente
- Medicações pendentes
- Registro de sinais vitais
- Alertas e notificações

### 4. **Triagem** 🚑
- Registro de novos pacientes
- Classificação de risco (Protocolo Manchester)
- Gestão de fila de espera
- Solicitação de leitos

### 5. **Limpeza** 🧹
- Chamados de higienização
- Controle de SLA
- Checklist de limpeza
- Histórico de tarefas

### 6. **Acompanhante** 👨‍👩‍👧
- Visualização de status do paciente
- Timeline simplificada (sem dados sensíveis)
- Previsão de alta

## 📁 Estrutura do Projeto

```
src/app/
├── components/              # Componentes reutilizáveis
│   ├── loading/            # Spinner de carregamento
│   ├── notification/       # Sistema de notificações
│   └── status-badge/       # Badge de status
│
├── core/                    # Módulo core da aplicação
│   ├── guards/             # Guards de autenticação e autorização
│   │   ├── auth.guard.ts
│   │   └── role.guard.ts
│   │
│   ├── interceptors/       # Interceptors HTTP
│   │   ├── auth.interceptor.ts
│   │   ├── error.interceptor.ts
│   │   └── loading.interceptor.ts
│   │
│   ├── models/             # Interfaces e Types (FHIR-based)
│   │   ├── user.model.ts
│   │   ├── patient.model.ts
│   │   ├── location.model.ts
│   │   ├── encounter.model.ts
│   │   └── task.model.ts
│   │
│   └── services/           # Serviços da aplicação
│       ├── auth.service.ts
│       ├── api.service.ts
│       ├── websocket.service.ts
│       ├── loading.service.ts
│       └── notification.service.ts
│
├── pages/                   # Páginas da aplicação
│   ├── login/              # Página de login
│   ├── layout/             # Layout principal com sidebar
│   ├── dashboard/          # Dashboard genérico
│   ├── admin/              # Páginas do Admin
│   ├── medico/             # Páginas do Médico
│   ├── enfermagem/         # Páginas da Enfermagem
│   ├── triagem/            # Páginas da Triagem
│   ├── limpeza/            # Páginas da Limpeza
│   └── unauthorized/       # Página de acesso negado
│
├── environments/            # Configurações de ambiente
├── styles/                  # Estilos globais
│   ├── colors.scss         # Paleta de cores Luminous
│   └── variables.scss      # Variáveis SCSS
│
├── app.component.ts
├── app.config.ts           # Configuração da aplicação
└── app.routes.ts           # Definição de rotas
```

## 🚀 Como Executar

### Pré-requisitos

- Node.js 18+ 
- Angular CLI 17+

### Instalação

```bash
cd gestaoDeLeitos
npm install
```

### Desenvolvimento

```bash
ng serve
```

Acesse: `http://localhost:4200`

### Build para Produção

```bash
ng build --configuration production
```

## 🔐 Credenciais de Demonstração

**⚠️ Apenas para ambiente de desenvolvimento**

| Role | E-mail | Senha |
|------|--------|-------|
| Admin | admin@hospital.com | admin123 |
| Médico | medico@hospital.com | medico123 |
| Enfermagem | enfermagem@hospital.com | enfermagem123 |
| Triagem | triagem@hospital.com | triagem123 |
| Limpeza | limpeza@hospital.com | limpeza123 |

## 🎯 Fluxo de Trabalho

### 1. Triagem
```
Chegada do Paciente → Classificação Manchester → Solicitar Leito → Internação
```

### 2. Internação
```
Alocação de Leito → Timeline de Cuidados → Medicações/Exames → Visitas Médicas
```

### 3. Previsão de Alta (Core do Sistema)
```
Melhora Clínica → Definir EDD → Notificar Acompanhante → Confirmar Alta
```

### 4. Giro de Leito
```
Alta do Paciente → Solicitar Limpeza → Executar Limpeza → Validar Checklist → Leito Disponível
```

## 🔧 Configuração

### Backend API

Configure a URL da API em `src/environments/environment.ts`:

```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  wsUrl: 'ws://localhost:3000/ws',
  // ...
};
```

### WebSocket

O WebSocket conecta automaticamente após o login e envia eventos em tempo real:

- `LOCATION_STATUS_CHANGED` - Mudança no status do leito
- `ENCOUNTER_UPDATED` - Atualização na internação
- `TASK_CREATED` / `TASK_UPDATED` - Tarefas criadas/atualizadas
- `EDD_CHANGED` - Alteração na previsão de alta

## 📋 Próximos Passos

### Backend (A implementar)
- [ ] API REST com Node.js/Express ou NestJS
- [ ] Banco de dados PostgreSQL ou MongoDB
- [ ] Implementação dos recursos FHIR
- [ ] Sistema de autenticação JWT
- [ ] WebSocket server
- [ ] Integração com sistemas hospitalares existentes

### Frontend (Expansões)
- [ ] Implementar CRUD completo de leitos
- [ ] Sistema de drag-and-drop para alocação de leitos
- [ ] Gráficos e dashboards interativos (Chart.js/D3.js)
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] Testes unitários e E2E
- [ ] Internacionalização (i18n)

## 📚 Tecnologias Utilizadas

- **Angular 17** - Framework principal
- **TypeScript** - Linguagem
- **SCSS** - Pré-processador CSS
- **RxJS** - Programação reativa
- **WebSocket** - Comunicação em tempo real
- **FHIR** - Padrão de interoperabilidade em saúde

## 📖 Documentação de Referência

- [Documentação FHIR R4](https://www.hl7.org/fhir/)
- [Angular Documentation](https://angular.io/docs)
- [Protocolo Manchester](https://www.gov.br/ebserh/pt-br/hospitais-universitarios/regiao-nordeste/hujm-ufmt/acesso-a-informacao/acoes-e-programas/protocolos/Protocolo%20de%20Manchester.pdf)

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto foi desenvolvido para o Hackathon IA 2026.

## 👨‍💻 Autor

Desenvolvido com ❤️ para o Hackathon IA

---

**🏥 Sistema de Gestão de Leitos - Transformando a gestão hospitalar através da tecnologia**
