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
    handleClick: (item: ListItem) => void;
  }
  
  // Badge Component
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
  
  // Main Corporate List Component
  const CorporateList: React.FC<CorporateListProps> = ({ data, handleClick }) => {
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
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header */}
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
  
        {/* Content */}
        <div className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <i className="fas fa-inbox text-4xl mb-4" style={{ color: '#7D7D7D' }}></i>
              <p className="text-lg font-medium mb-2" style={{ color: '#404040' }}>
                Lista Vazia
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                Nenhum item encontrado
              </p>
            </div>
          ) : (
            data.map((item, index) => (
              <div
                key={index}
                className="grid grid-cols-12 gap-4 px-6 py-4 transition-all duration-150 cursor-pointer hover:opacity-50 focus:bg-gray-50 focus:outline-none"
                onClick={() => handleItemClick(item)}
                onKeyDown={(e) => handleKeyDown(e, item)}
                tabIndex={0}
                role="button"
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
  
  // Demo App
  function App() {
    const [selectedItem, setSelectedItem] = React.useState<ListItem | null>(null);
  
    // Mock data com o novo formato
    const mockData: ListItem[] = [
      {
        name: 'Relatório de Vendas',
        description: 'Relatório mensal de vendas do primeiro trimestre',
        status: 'succeed',
        fileName: 'vendas_q1_2024.pdf'
      },
      {
        name: 'Análise de Performance',
        description: 'Análise detalhada de performance dos sistemas',
        status: 'pending',
        fileName: 'performance_analysis.xlsx'
      },
      {
        name: 'Backup de Dados',
        description: 'Backup completo da base de dados de clientes',
        status: 'updated',
        fileName: 'backup_clientes.sql'
      },
      {
        name: 'Documentação API',
        description: 'Documentação técnica da API REST v2.0',
        status: 'succeed'
      },
      {
        name: 'Log de Erros',
        description: 'Arquivo de log com erros do sistema',
        status: 'empty',
        fileName: 'error_log.txt'
      },
      {
        name: 'Configurações',
        description: 'Arquivo de configurações do ambiente de produção',
        status: 'pending',
        fileName: 'config.json'
      }
    ];
  
    const handleItemClick = (item: ListItem): void => {
      setSelectedItem(item);
      console.log('Item clicado:', item);
    };
  
    const clearSelection = (): void => {
      setSelectedItem(null);
    };
  
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#404040' }}>
            Lista Corporativa - TypeScript Simplificada
          </h1>
          
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h2 className="text-xl font-semibold mb-4" style={{ color: '#404040' }}>
                Componente Simplificado
              </h2>
              <p className="mb-4" style={{ color: '#7D7D7D' }}>
                Componente com apenas duas props: <code className="bg-gray-100 px-2 py-1 rounded">data</code> e <code className="bg-gray-100 px-2 py-1 rounded">handleClick</code>.
                Suporta os status: pending, succeed, empty, updated.
              </p>
              
              {selectedItem && (
                <div>
                  <button
                    onClick={clearSelection}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200 mb-4"
                  >
                    Limpar Seleção
                  </button>
                  
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">
                      Item Selecionado:
                    </h3>
                    <p className="text-blue-800">
                      <strong>Nome:</strong> {selectedItem.name}
                    </p>
                    <p className="text-blue-800">
                      <strong>Descrição:</strong> {selectedItem.description}
                    </p>
                    {selectedItem.status && (
                      <p className="text-blue-800">
                        <strong>Status:</strong> {selectedItem.status}
                      </p>
                    )}
                    {selectedItem.fileName && (
                      <p className="text-blue-800">
                        <strong>Arquivo:</strong> {selectedItem.fileName}
                      </p>
                    )}
                  </div>
                </div>
              )}
            </div>
  
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Props do Componente
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• <code>data: ListItem[]</code></li>
                  <li>• <code>handleClick: (item: ListItem) => void</code></li>
                </ul>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Interface ListItem
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• <code>name: string</code></li>
                  <li>• <code>description: string</code></li>
                  <li>• <code>status?: 'pending' | 'succeed' | 'empty' | 'updated'</code></li>
                  <li>• <code>fileName?: string</code></li>
                </ul>
              </div>
            </div>
          </div>
  
          {/* Lista Principal */}
          <CorporateList
            data={mockData}
            handleClick={handleItemClick}
          />
  
          {/* Lista Vazia para demonstração */}
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-4" style={{ color: '#404040' }}>
              Estado Vazio
            </h3>
            <CorporateList
              data={[]}
              handleClick={handleItemClick}
            />
          </div>
        </div>
      </div>
    );
  }