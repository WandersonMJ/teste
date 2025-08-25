import React, { useRef, useState } from 'react';

// --- INTERFACES ---

interface ListItem {
  name: string;
  description: string;
  status?: 'pending' | 'succeed' | 'empty' | 'updated';
  fileName?: string;
}

interface BadgeProps {
  status: 'pending' | 'succeed' | 'empty' | 'updated';
  size?: 'sm' | 'md' | 'lg';
}

interface CorporateListProps {
  data: ListItem[];
  onItemsAdded: (files: File[]) => void;
  isLoading: boolean;
}

// --- COMPONENTES ---

// Badge Component (mesma estilização do Table)
const Badge: React.FC<BadgeProps> = ({ status, size = 'md' }) => {
  const getStatusConfig = (status: string) => {
    const configs = {
      pending: { color: '#F59E0B', bgColor: '#FEF3C7', text: 'Pendente' },
      succeed: { color: '#10B981', bgColor: '#D1FAE5', text: 'Sucesso' },
      empty: { color: '#6B7280', bgColor: '#F3F4F6', text: 'Vazio' },
      updated: { color: '#3B82F6', bgColor: '#DBEAFE', text: 'Atualizado' }
    };
    return configs[status] || configs.empty;
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

// CorporateList Component - Lista com Drag & Drop
const CorporateList: React.FC<CorporateListProps> = ({ data, onItemsAdded, isLoading }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    setIsDraggingOver(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (!event.currentTarget.contains(event.relatedTarget as Node)) {
      setIsDraggingOver(false);
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    event.stopPropagation();
    if (isLoading) return;
    
    setIsDraggingOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onItemsAdded(files);
    }
  };

  const handleClick = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      onItemsAdded(files);
    }
    if (event.target) event.target.value = "";
  };

  const handleMouseEnter = () => {
    if (!isLoading) setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden cursor-pointer transition-all duration-200 ${
        isDraggingOver ? 'border-blue-500 border-dashed' : ''
      } ${isLoading ? 'opacity-60 cursor-not-allowed' : 'hover:shadow-md'}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <input 
        type="file" 
        multiple 
        ref={fileInputRef} 
        onChange={handleFileSelect} 
        className="hidden"
        accept="*/*"
      />

      {/* Overlay de Carregamento */}
      {isLoading && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-white bg-opacity-90">
          <svg className="animate-spin h-8 w-8 text-blue-600 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-lg font-semibold" style={{ color: '#404040' }}>
            Enviando arquivos...
          </p>
        </div>
      )}
      
      {/* Overlay de Hover */}
      {(isHovering || isDraggingOver) && !isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500 bg-opacity-10">
          <div className="text-center bg-white bg-opacity-95 px-8 py-6 rounded-lg shadow-lg">
            <svg className="mx-auto h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-semibold text-blue-600 mb-2">
              {isDraggingOver ? 'Solte os arquivos aqui' : 'Clique aqui para realizar o upload das planilhas'}
            </p>
            <p className="text-sm text-gray-600">
              {isDraggingOver ? '' : 'ou arraste e solte os arquivos'}
            </p>
          </div>
        </div>
      )}

      {/* Header - mesma estilização do Table */}
      <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 md:col-span-5">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Nome
            </h3>
          </div>
          <div className="hidden md:block md:col-span-5">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Descrição
            </h3>
          </div>
          <div className="col-span-4 md:col-span-2 text-center">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">
              Status
            </h3>
          </div>
        </div>
      </div>

      {/* Content - Lista dos arquivos */}
      <div className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#7D7D7D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium mb-2" style={{ color: '#404040' }}>
              Nenhum arquivo na lista
            </p>
            <p className="text-sm" style={{ color: '#7D7D7D' }}>
              Clique ou arraste arquivos para fazer upload
            </p>
          </div>
        ) : (
          data.map((item, index) => (
            <div
              key={`${item.name}-${index}`}
              className="grid grid-cols-12 gap-4 px-6 py-4"
              style={{
                backgroundColor: index % 2 === 1 ? '#F8F9FA' : '#FFFFFF'
              }}
            >
              {/* Nome */}
              <div className="col-span-8 md:col-span-5 flex items-center min-w-0">
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
              <div className="hidden md:block md:col-span-5 flex items-center min-w-0">
                <p className="text-sm truncate" style={{ color: '#7D7D7D' }}>
                  {item.description}
                </p>
              </div>

              {/* Status */}
              <div className="col-span-4 md:col-span-2 flex items-center justify-center">
                {item.status && <Badge status={item.status} size="sm" />}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

// --- DEMO APP ---

function App() {
  const [listItems, setListItems] = useState<ListItem[]>([
    {
      name: 'Relatório de Vendas Q1',
      description: 'Planilha com dados de vendas do primeiro trimestre',
      status: 'empty'
    },
    {
      name: 'Análise de Performance',
      description: 'Dados de performance dos sistemas',
      status: 'succeed'
    },
    {
      name: 'Backup de Clientes',
      description: 'Base completa de dados de clientes',
      status: 'pending'
    },
    {
      name: 'Documentação API',
      description: 'Especificações técnicas da API REST',
      status: 'updated'
    },
    {
      name: 'Log de Erros',
      description: 'Arquivo de log do sistema',
      status: 'empty'
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleItemsAdded = (files: File[]): void => {
    console.log('Arquivos recebidos:', files.map(f => f.name));
    
    setIsLoading(true);

    // Simula processo de upload
    setTimeout(() => {
      // Atualiza alguns itens para simular o resultado do upload
      setListItems(currentItems =>
        currentItems.map((item, index) => {
          if (index < files.length) {
            return {
              ...item,
              status: Math.random() > 0.2 ? 'succeed' : 'updated',
              description: `${item.description} - Atualizado com sucesso`
            };
          }
          return item;
        })
      );

      setIsLoading(false);
      console.log('Upload concluído');
    }, 2500);
  };

  const resetList = () => {
    setListItems(prevItems =>
      prevItems.map(item => ({
        ...item,
        status: 'empty',
        description: item.description.replace(' - Atualizado com sucesso', '')
      }))
    );
  };

  const successCount = listItems.filter(item => item.status === 'succeed').length;
  const updatedCount = listItems.filter(item => item.status === 'updated').length;
  const pendingCount = listItems.filter(item => item.status === 'pending').length;
  const emptyCount = listItems.filter(item => item.status === 'empty').length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#404040' }}>
          Sistema de Upload de Planilhas
        </h1>
        <p className="mb-8" style={{ color: '#7D7D7D' }}>
          Lista dos arquivos esperados pelo sistema. Clique na lista ou arraste arquivos para fazer upload.
        </p>

        {/* Estatísticas */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-green-600">
              {successCount}
            </p>
            <p className="text-sm" style={{ color: '#7D7D7D' }}>
              Sucesso
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-blue-600">
              {updatedCount}
            </p>
            <p className="text-sm" style={{ color: '#7D7D7D' }}>
              Atualizados
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-yellow-600">
              {pendingCount}
            </p>
            <p className="text-sm" style={{ color: '#7D7D7D' }}>
              Pendentes
            </p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <p className="text-2xl font-bold text-gray-600">
              {emptyCount}
            </p>
            <p className="text-sm" style={{ color: '#7D7D7D' }}>
              Vazios
            </p>
          </div>
        </div>

        {/* Botão de reset */}
        <div className="mb-6 flex justify-end">
          <button
            onClick={resetList}
            className="px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 disabled:opacity-50"
            disabled={isLoading}
          >
            Reset Status
          </button>
        </div>

        {/* Componente principal - Lista interativa */}
        <CorporateList
          data={listItems}
          isLoading={isLoading}
          onItemsAdded={handleItemsAdded}
        />

        {/* Instruções */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Como usar:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• <strong>Hover:</strong> Passe o mouse sobre a lista para ver a mensagem de upload</li>
            <li>• <strong>Click:</strong> Clique em qualquer lugar da lista para abrir o seletor de arquivos</li>
            <li>• <strong>Drag & Drop:</strong> Arraste arquivos diretamente para a lista</li>
            <li>• <strong>Loading:</strong> Durante o upload, a lista fica opaca com loading</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;