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

// CorporateList Component com funcionalidade de upload
const CorporateList: React.FC<CorporateListProps> = ({ data, onItemsAdded, isLoading }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
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
    // Só remove o estado se realmente saiu do componente
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

  const triggerFileSelect = () => {
    if (isLoading) return;
    fileInputRef.current?.click();
  };
  
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (isLoading) return;
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      onItemsAdded(files);
    }
    // Limpa o input para permitir selecionar o mesmo arquivo novamente
    if (event.target) event.target.value = "";
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden ${
        isDraggingOver ? 'border-blue-500 border-dashed bg-blue-50' : ''
      } ${isLoading ? 'opacity-60' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
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
      
      {/* Overlay para arrastar arquivos */}
      {isDraggingOver && !isLoading && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500 bg-opacity-10">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-blue-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-xl font-semibold text-blue-600">
              Solte os arquivos aqui
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

      {/* Content - mesma estilização do Table */}
      <div className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <div 
            className="px-6 py-12 text-center cursor-pointer hover:bg-gray-50 transition-colors duration-150" 
            onClick={triggerFileSelect}
          >
            <svg className="mx-auto h-12 w-12 mb-4" style={{ color: '#7D7D7D' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-lg font-medium mb-2" style={{ color: '#404040' }}>
              Arraste e solte seus arquivos aqui
            </p>
            <p className="text-sm" style={{ color: '#7D7D7D' }}>
              ou <span className="font-semibold text-blue-600">clique para selecionar</span>
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

      {/* Botão de adicionar arquivos quando há itens */}
      {data.length > 0 && !isLoading && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={triggerFileSelect}
            className="w-full px-4 py-2 text-sm text-blue-600 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors duration-200 flex items-center justify-center"
          >
            <svg className="w-4 h-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Adicionar mais arquivos
          </button>
        </div>
      )}
    </div>
  );
};

// --- DEMO APP ---

function App() {
  const [listItems, setListItems] = useState<ListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleItemsAdded = (files: File[]): void => {
    // Simula validação de arquivos
    const validFiles = files.filter(file => file.size <= 10 * 1024 * 1024); // Máximo 10MB
    const invalidFiles = files.filter(file => file.size > 10 * 1024 * 1024);

    // Mostra arquivos inválidos
    if (invalidFiles.length > 0) {
      alert(`${invalidFiles.length} arquivo(s) foram rejeitados por exceder 10MB`);
    }

    if (validFiles.length === 0) return;

    // Cria os itens visuais com status 'pending' para feedback imediato
    const newPendingItems: ListItem[] = validFiles.map(file => ({
      name: file.name,
      description: `Aguardando envio (${(file.size / 1024).toFixed(2)} KB)`,
      status: 'pending',
      fileName: file.name
    }));

    setListItems(prevItems => [...prevItems, ...newPendingItems]);
    setIsLoading(true);
    
    console.log('Iniciando upload para:', validFiles.map(f => f.name));

    // Simula processo de upload com diferentes resultados
    setTimeout(() => {
      console.log('Upload concluído');
      
      setListItems(currentItems => 
        currentItems.map(item => {
          const matchingPendingItem = newPendingItems.find(pendingItem => pendingItem.name === item.name);
          if (matchingPendingItem) {
            // 90% de sucesso, 10% de erro simulado
            const isSuccess = Math.random() > 0.1;
            return {
              ...item,
              status: isSuccess ? 'succeed' : 'empty',
              description: isSuccess 
                ? 'Enviado com sucesso' 
                : 'Falha no envio - tente novamente'
            };
          }
          return item;
        })
      );

      setIsLoading(false);
    }, 2000);
  };

  const clearList = () => {
    setListItems([]);
  };

  const retryFailed = () => {
    const failedItems = listItems.filter(item => item.status === 'empty');
    if (failedItems.length === 0) return;

    // Marca como pending novamente
    setListItems(currentItems =>
      currentItems.map(item =>
        item.status === 'empty'
          ? { ...item, status: 'pending', description: 'Tentando novamente...' }
          : item
      )
    );

    setIsLoading(true);

    // Simula novo upload
    setTimeout(() => {
      setListItems(currentItems =>
        currentItems.map(item =>
          failedItems.some(failed => failed.name === item.name)
            ? { ...item, status: 'succeed', description: 'Enviado com sucesso' }
            : item
        )
      );
      setIsLoading(false);
    }, 1500);
  };

  const failedCount = listItems.filter(item => item.status === 'empty').length;
  const successCount = listItems.filter(item => item.status === 'succeed').length;
  const pendingCount = listItems.filter(item => item.status === 'pending').length;

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-2" style={{ color: '#404040' }}>
          Painel de Upload de Arquivos
        </h1>
        <p className="mb-8" style={{ color: '#7D7D7D' }}>
          Arraste arquivos para a lista abaixo ou clique para selecionar. 
          Máximo de 10MB por arquivo.
        </p>

        {/* Estatísticas */}
        {listItems.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-2xl font-bold" style={{ color: '#404040' }}>
                {listItems.length}
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                Total de arquivos
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-green-600">
                {successCount}
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                Enviados com sucesso
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-yellow-600">
                {pendingCount}
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                Aguardando envio
              </p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <p className="text-2xl font-bold text-red-600">
                {failedCount}
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                Falharam
              </p>
            </div>
          </div>
        )}

        {/* Botões de ação */}
        <div className="mb-6 flex gap-4 justify-end">
          {failedCount > 0 && (
            <button
              onClick={retryFailed}
              className="px-4 py-2 text-sm text-yellow-700 bg-yellow-50 border border-yellow-300 rounded-lg hover:bg-yellow-100 transition-colors duration-200 disabled:opacity-50"
              disabled={isLoading}
            >
              Tentar novamente ({failedCount})
            </button>
          )}
          <button
            onClick={clearList}
            className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200 disabled:opacity-50"
            disabled={isLoading || listItems.length === 0}
          >
            Limpar Lista
          </button>
        </div>

        {/* Componente principal */}
        <CorporateList
          data={listItems}
          isLoading={isLoading}
          onItemsAdded={handleItemsAdded}
        />
      </div>
    </div>
  );
}

export default App;