import React, { useRef, useState } from 'react';

// Interfaces (sem alterações)
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

// Props do componente principal atualizadas
interface CorporateListProps {
  data: ListItem[];
  handleClick: (item: ListItem) => void;
  // NOVA PROP: Função para retornar os arquivos adicionados
  onFilesAdded: (files: File[]) => void;
}

// --- COMPONENTES ---

// Badge Component (sem alterações)
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

// Main Corporate List Component (MODIFICADO)
const CorporateList: React.FC<CorporateListProps> = ({ data, handleClick, onFilesAdded }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Previne o comportamento padrão do navegador
  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragEnter = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(true);
  };

  const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
  };

  // Processa os arquivos soltos
  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingOver(false);
    const files = Array.from(event.dataTransfer.files);
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  // Abre a janela de seleção de arquivos
  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };
  
  // Processa os arquivos selecionados pelo input
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length > 0) {
      onFilesAdded(files);
    }
  };

  const handleItemClick = (item: ListItem): void => {
    handleClick(item);
  };

  const handleKeyDown = (event: React.KeyboardEvent, item: ListItem): void => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleItemClick(item);
    }
  };

  return (
    <div
      className={`relative bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group ${isDraggingOver ? 'border-blue-500 border-dashed' : ''}`}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Input de arquivo oculto */}
      <input
        type="file"
        multiple
        ref={fileInputRef}
        onChange={handleFileSelect}
        className="hidden"
      />
      
      {/* Overlay para arrastar arquivos */}
      {isDraggingOver && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-blue-500 bg-opacity-20">
          <p className="text-xl font-semibold text-blue-800">Solte os arquivos aqui</p>
        </div>
      )}

      {/* Overlay de upload que aparece no hover quando a lista NÃO está vazia */}
      {data.length > 0 && (
         <div 
          className="absolute inset-0 z-10 flex-col items-center justify-center bg-black bg-opacity-60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex cursor-pointer"
          onClick={triggerFileSelect}
         >
            <i className="fas fa-upload text-white text-4xl mb-4"></i>
            <p className="text-lg font-semibold text-white">Adicionar mais arquivos</p>
            <p className="text-sm text-gray-300">Arraste e solte ou clique aqui</p>
         </div>
      )}

      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8 md:col-span-5">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Nome</h3>
          </div>
          <div className="hidden md:block md:col-span-5">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Descrição</h3>
          </div>
          <div className="col-span-4 md:col-span-2 text-center">
            <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Status</h3>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="divide-y divide-gray-200">
        {data.length === 0 ? (
          <div 
            className="px-6 py-12 text-center cursor-pointer hover:bg-gray-50"
            onClick={triggerFileSelect}
          >
            <i className="fas fa-cloud-upload-alt text-4xl mb-4" style={{ color: '#7D7D7D' }}></i>
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
              key={index}
              className="grid grid-cols-12 gap-4 px-6 py-4 transition-all duration-150 cursor-pointer hover:bg-gray-50 focus:bg-gray-50 focus:outline-none"
              onClick={() => handleItemClick(item)}
              onKeyDown={(e) => handleKeyDown(e, item)}
              tabIndex={0}
              role="button"
              style={{
                backgroundColor: index % 2 === 1 ? '#F8F9FA' : '#FFFFFF'
              }}
            >
              <div className="col-span-8 md:col-span-5 flex items-center min-w-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: '#404040' }}>{item.name}</p>
                  <p className="text-xs mt-1 truncate md:hidden" style={{ color: '#7D7D7D' }}>{item.description}</p>
                </div>
              </div>
              <div className="hidden md:block md:col-span-5 flex items-center min-w-0">
                <p className="text-sm truncate" style={{ color: '#7D7D7D' }}>{item.description}</p>
              </div>
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

// --- DEMO APP (MODIFICADO) ---

function App() {
  const [selectedItem, setSelectedItem] = React.useState<ListItem | null>(null);
  // NOVO ESTADO: para armazenar os arquivos adicionados
  const [addedFiles, setAddedFiles] = React.useState<File[]>([]);

  const mockData: ListItem[] = [
    { name: 'Relatório de Vendas', description: 'Relatório mensal de vendas do primeiro trimestre', status: 'succeed', fileName: 'vendas_q1_2024.pdf' },
    { name: 'Análise de Performance', description: 'Análise detalhada de performance dos sistemas', status: 'pending', fileName: 'performance_analysis.xlsx' },
    { name: 'Backup de Dados', description: 'Backup completo da base de dados de clientes', status: 'updated', fileName: 'backup_clientes.sql' },
  ];
  
  // NOVA FUNÇÃO: Manipulador para receber os arquivos do componente CorporateList
  const handleFilesAdded = (files: File[]): void => {
    console.log('Arquivos recebidos pela App:', files);
    // Adiciona os novos arquivos à lista existente, evitando duplicatas pelo nome
    setAddedFiles(prevFiles => {
        const newFiles = files.filter(file => !prevFiles.some(pf => pf.name === file.name));
        return [...prevFiles, ...newFiles];
    });
  };

  const handleItemClick = (item: ListItem): void => {
    setSelectedItem(item);
    console.log('Item clicado:', item);
  };

  const clearSelection = (): void => {
    setSelectedItem(null);
  };
  
  const clearAddedFiles = (): void => {
    setAddedFiles([]);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8" style={{ color: '#404040' }}>
          Lista com Upload de Arquivos
        </h1>

        {/* ÁREA PARA EXIBIR ARQUIVOS ADICIONADOS */}
        {addedFiles.length > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
             <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold" style={{ color: '#404040' }}>
                    Arquivos Adicionados para Upload
                </h2>
                <button
                    onClick={clearAddedFiles}
                    className="px-4 py-2 text-sm text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors duration-200"
                >
                    Limpar Lista
                </button>
             </div>
             <ul className="space-y-2">
                {addedFiles.map((file, index) => (
                    <li key={index} className="p-3 bg-gray-50 rounded-md text-sm flex justify-between items-center">
                        <span className="font-medium text-gray-800">{file.name}</span>
                        <span className="text-gray-500">{(file.size / 1024).toFixed(2)} KB</span>
                    </li>
                ))}
             </ul>
          </div>
        )}
        
        {/* Lista Principal */}
        <h3 className="text-lg font-semibold mb-4" style={{ color: '#404040' }}>
          Itens Existentes
        </h3>
        <CorporateList
          data={mockData}
          handleClick={handleItemClick}
          onFilesAdded={handleFilesAdded}
        />

        {/* Lista Vazia para demonstração */}
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#404040' }}>
            Exemplo de Upload em Lista Vazia
          </h3>
          <CorporateList
            data={[]}
            handleClick={handleItemClick}
            onFilesAdded={handleFilesAdded}
          />
        </div>
      </div>
    </div>
  );
}

// Lembre-se de instalar o Font Awesome se quiser usar os ícones, ou substitua por SVGs/outra biblioteca.
// No seu index.html: <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.3/css/all.min.css" />