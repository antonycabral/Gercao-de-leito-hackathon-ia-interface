/**
 * Arquivo de configuração de ambiente para desenvolvimento
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api/v1',
  wsUrl: 'ws://localhost:3000',

  // Configurações de autenticação
  tokenExpirationTime: 3600000, // 1 hora em ms
  refreshTokenExpirationTime: 604800000, // 7 dias em ms

  // Configurações de WebSocket
  wsReconnectInterval: 5000, // 5 segundos
  wsMaxReconnectAttempts: 5,

  // Configurações de paginação
  defaultPageSize: 20,
  pageSizeOptions: [10, 20, 50, 100],

  // Configurações de upload
  maxFileSize: 10485760, // 10MB em bytes
  allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'],

  // Configurações de notificação
  notificationDuration: 5000, // 5 segundos

  // Feature flags
  features: {
    enableWebSocket: true,
    enableNotifications: true,
    enableOfflineMode: false,
    enableDarkMode: true
  }
};
