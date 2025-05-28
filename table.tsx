import React, { useState, useEffect } from 'react';

// Types and Interfaces
interface ListItem {
    id: string | number;
    name: string;
    description: string;
    status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning';
  }
  
  interface BadgeProps {
    status: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'warning';
    size?: 'sm' | 'md' | 'lg';
  }
  
  interface CorporateListProps {
    items: ListItem[];
    onItemClick?: (item: ListItem) => void;
    loading?: boolean;
    emptyMessage?: string;
    className?: string;
  }
  
  // Badge Component (simulando um componente que já existe)
  const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
    const getStatusConfig = (status: string) => {
      const configs = {
        active: { color: '#10B981', bgColor: '#D1FAE5', text: 'Ativo' },
        inactive: { color: '#6B7280', bgColor: '#F3F4F6', text: 'Inativo' },
        pending: { color: '#F59E0B', bgColor: '#FEF3C7', text: 'Pendente' },
        error: { color: '#EF4444', bgColor: '#FEE2E2', text: 'Erro' },
        success: { color: '#10B981', bgColor: '#D1FAE5', text: 'Sucesso' },
        warning: { color: '#F59E0B', bgColor: '#FEF3C7', text: 'Atenção' }
      };
      return configs[status] || configs.inactive;
    };
  
    const config = getStatusConfig(status);
    const sizeClasses = {
      sm: 'px-2 py-1 text-xs',
      md: 'px-3 py-1 text-sm',
      lg: 'px-4 py-2 text-base'
    };
  
    return (
      <span
        className={`inline-flex items-center font-medium rounded-full ${sizeClasses[size]}`}
        style={{
          color: config.color,
          backgroundColor: config.bgColor
        }}
      >
        {config.text}
      </span>
    );
  };
  
  // Loading Skeleton Component
  const ListSkeleton: React.FC = () => {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div 
            key={index}
            className={`flex items-center px-6 py-4 border-b border-gray-200 ${
              index % 2 === 1 ? 'bg-gray-25' : 'bg-white'
            }`}
          >
            <div className="flex-1">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 hidden md:block"></div>
            </div>
            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
          </div>
        ))}
      </div>
    );
  };
  
  // Main Corporate List Component
  const CorporateList: React.FC<CorporateListProps> = ({
    items,
    onItemClick,
    loading = false,
    emptyMessage = 'Nenhum item encontrado',
    className = ''
  }) => {
    const handleItemClick = (item: ListItem): void => {
      if (onItemClick) {
        onItemClick(item);
      }
    };
  
    const handleKeyDown = (event: React.KeyboardEvent, item: ListItem): void => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handleItemClick(item);
      }
    };
  
    if (loading) {
      return (
        <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#FAFAFA' }}>
            <div className="grid grid-cols-12 gap-4">
              <div className="col-span-12 md:col-span-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Nome
                </h3>
              </div>
              <div className="hidden md:block md:col-span-4">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Descrição
                </h3>
              </div>
              <div className="col-span-12 md:col-span-2 text-right">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                  Status
                </h3>
              </div>
            </div>
          </div>
          <ListSkeleton />
        </div>
      );
    }
  
    return (
      <div className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${className}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="grid grid-cols-12 gap-4">
            <div className="col-span-8 md:col-span-6">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Nome
              </h3>
            </div>
            <div className="hidden md:block md:col-span-4">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Descrição
              </h3>
            </div>
            <div className="col-span-4 md:col-span-2 text-right">
              <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
                Status
              </h3>
            </div>
          </div>
        </div>
  
        {/* Content */}
        <div className="divide-y divide-gray-200">
          {items.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <i className="fas fa-inbox text-4xl mb-4" style={{ color: '#7D7D7D' }}></i>
              <p className="text-lg font-medium mb-2" style={{ color: '#404040' }}>
                Lista Vazia
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                {emptyMessage}
              </p>
            </div>
          ) : (
            items.map((item, index) => (
              <div
                key={item.id}
                className={`grid grid-cols-12 gap-4 px-6 py-4 transition-colors duration-150 ${
                  onItemClick 
                    ? 'cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none' 
                    : ''
                } ${
                  index % 2 === 1 ? 'bg-gray-25' : 'bg-white'
                }`}
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                tabIndex={onItemClick ? 0 : -1}
                role={onItemClick ? 'button' : undefined}
                style={{
                  backgroundColor: index % 2 === 1 ? '#FEFEFE' : '#FFFFFF'
                }}
              >
                {/* Nome */}
                <div className="col-span-8 md:col-span-6 flex items-center min-w-0">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate" style={{ color: '#404040' }}>
                      {item.name}
                    </p>
                    {/* Descrição no mobile */}
                    <p className="text-xs mt-1 truncate md:hidden" style={{ color: '#7D7D7D' }}>
                      {item.description}
                    </p>
                  </div>
                </div>
  
                {/* Descrição - Desktop apenas */}
                <div className="hidden md:block md:col-span-4 flex items-center min-w-0">
                  <p className="text-sm truncate" style={{ color: '#7D7D7D' }}>
                    {item.description}
                  </p>
                </div>
  
                {/* Status */}
                <div className="col-span-4 md:col-span-2 flex items-center justify-end">
                  <Badge status={item.status} size="sm" />
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };
  
  // Demo App
  export function App() {
    const [selectedItem, setSelectedItem] = React.useState<ListItem | null>(null);
    const [loading, setLoading] = React.useState<boolean>(false);
  
    // Mock data
    const mockItems: ListItem[] = [
      {
        id: 1,
        name: 'Sistema de Vendas',
        description: 'Módulo principal para gestão de vendas e clientes',
        status: 'active'
      },
      {
        id: 2,
        name: 'API de Integração',
        description: 'Serviço de integração com sistemas externos via REST API',
        status: 'pending'
      },
      {
        id: 3,
        name: 'Dashboard Analytics',
        description: 'Painel de controle com métricas e relatórios em tempo real',
        status: 'success'
      },
      {
        id: 4,
        name: 'Sistema de Backup',
        description: 'Rotina automatizada de backup e recuperação de dados',
        status: 'error'
      },
      {
        id: 5,
        name: 'Portal do Cliente',
        description: 'Interface web para acesso dos clientes aos serviços',
        status: 'inactive'
      },
      {
        id: 6,
        name: 'Módulo de Pagamentos',
        description: 'Sistema de processamento de pagamentos online',
        status: 'warning'
      },
      {
        id: 7,
        name: 'Central de Notificações',
        description: 'Serviço de envio de emails, SMS e push notifications',
        status: 'active'
      },
      {
        id: 8,
        name: 'Sistema de Logs',
        description: 'Monitoramento e auditoria de ações do sistema',
        status: 'success'
      }
    ];
  
    const handleItemClick = (item: ListItem): void => {
      setSelectedItem(item);
      console.log('Item clicado:', item);
    };
  
    const simulateLoading = (): void => {
      setLoading(true);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
    };
  
    const clearSelection = (): void => {
      setSelectedItem(null);
    };
  
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#404040' }}>
            Lista Corporativa - TypeScript
          </h1>
          
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#404040' }}>
                Demonstração da Lista
              </h2>
              <p className="mb-4" style={{ color: '#7D7D7D' }}>
                Lista responsiva com linhas zebradas, badges de status e clique nas linhas.
                A descrição fica oculta no mobile para melhor usabilidade.
              </p>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={simulateLoading}
                  className="px-4 py-2 text-white rounded-lg transition-colors duration-200 hover:opacity-90 flex items-center"
                  style={{ backgroundColor: '#D04A02' }}
                >
                  <i className="fas fa-spinner mr-2"></i>
                  Simular Loading
                </button>
                
                {selectedItem && (
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                  >
                    Limpar Seleção
                  </button>
                )}
              </div>
  
              {selectedItem && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h3 className="font-semibold text-blue-900 mb-2">
                    Item Selecionado:
                  </h3>
                  <p className="text-blue-800">
                    <strong>Nome:</strong> {selectedItem.name}
                  </p>
                  <p className="text-blue-800">
                    <strong>Descrição:</strong> {selectedItem.description}
                  </p>
                  <p className="text-blue-800">
                    <strong>Status:</strong> {selectedItem.status}
                  </p>
                </div>
              )}
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Recursos da Lista
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Linhas zebradas sutis</li>
                  <li>• Responsiva (mobile-first)</li>
                  <li>• Clique nas linhas</li>
                  <li>• Loading skeleton</li>
                  <li>• Estado vazio</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  TypeScript
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Interfaces tipadas</li>
                  <li>• Props obrigatórias</li>
                  <li>• Callbacks tipados</li>
                  <li>• Enum para status</li>
                  <li>• Type safety</li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Acessibilidade
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Navegação por teclado</li>
                  <li>• Focus visível</li>
                  <li>• Roles ARIA</li>
                  <li>• Semântica adequada</li>
                  <li>• Contrast ratio</li>
                </ul>
              </div>
            </div>
          </div>
  
          {/* Lista Principal */}
          <CorporateList
            items={mockItems}
            onItemClick={handleItemClick}
            loading={loading}
            emptyMessage="Nenhum sistema encontrado"
            className="mb-6"
          />
  
          {/* Lista Vazia para demonstração */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#404040' }}>
              Estado Vazio
            </h3>
            <CorporateList
              items={[]}
              emptyMessage="Esta lista está vazia para demonstração"
            />
          </div>
        </div>
      </div>
    );
  }