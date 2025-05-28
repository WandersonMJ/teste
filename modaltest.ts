function App() {
    const [isModalOpen, setIsModalOpen] = React.useState(false);
    const [files, setFiles] = React.useState([]);
    const [isDragging, setIsDragging] = React.useState(false);
    const [uploading, setUploading] = React.useState(false);
    const [uploadProgress, setUploadProgress] = React.useState({});
  
    const fileInputRef = React.useRef(null);
  
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain', 'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'];
    const maxFileSize = 10 * 1024 * 1024; // 10MB
  
    const validateFile = (file) => {
      if (!allowedTypes.includes(file.type)) {
        return { valid: false, error: 'Tipo de arquivo não permitido' };
      }
      if (file.size > maxFileSize) {
        return { valid: false, error: 'Arquivo muito grande (máx. 10MB)' };
      }
      return { valid: true };
    };
  
    const handleFileSelect = (selectedFiles) => {
      const fileArray = Array.from(selectedFiles);
      const validFiles = [];
  
      fileArray.forEach(file => {
        const validation = validateFile(file);
        if (validation.valid) {
          validFiles.push({
            id: Date.now() + Math.random(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            error: null
          });
        } else {
          alert(`${file.name}: ${validation.error}`);
        }
      });
  
      setFiles(prev => [...prev, ...validFiles]);
    };
  
    const handleDragOver = (e) => {
      e.preventDefault();
      setIsDragging(true);
    };
  
    const handleDragLeave = (e) => {
      e.preventDefault();
      setIsDragging(false);
    };
  
    const handleDrop = (e) => {
      e.preventDefault();
      setIsDragging(false);
      const droppedFiles = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    };
  
    const removeFile = (fileId) => {
      setFiles(prev => prev.filter(f => f.id !== fileId));
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    };
  
    const formatFileSize = (bytes) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };
  
    const getFileIcon = (type) => {
      if (type.startsWith('image/')) return 'fas fa-image';
      if (type === 'application/pdf') return 'fas fa-file-pdf';
      if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
      if (type.includes('word')) return 'fas fa-file-word';
      return 'fas fa-file';
    };
  
    const getFileColor = (type) => {
      if (type.startsWith('image/')) return '#10B981';
      if (type === 'application/pdf') return '#EF4444';
      if (type.includes('excel') || type.includes('sheet')) return '#059669';
      if (type.includes('word')) return '#3B82F6';
      return '#6B7280';
    };
  
    const simulateUpload = () => {
      setUploading(true);
      const pendingFiles = files.filter(f => f.status === 'pending');
      
      pendingFiles.forEach((file, index) => {
        setTimeout(() => {
          let progress = 0;
          const interval = setInterval(() => {
            progress += Math.random() * 30;
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              setFiles(prev => prev.map(f => 
                f.id === file.id ? { ...f, status: 'completed' } : f
              ));
              
              // Verificar se todos os uploads terminaram
              setTimeout(() => {
                const allCompleted = files.every(f => f.status === 'completed');
                if (allCompleted) {
                  setUploading(false);
                }
              }, 100);
            }
            
            setUploadProgress(prev => ({
              ...prev,
              [file.id]: Math.min(progress, 100)
            }));
          }, 200);
        }, index * 500);
      });
    };
  
    const closeModal = () => {
      setIsModalOpen(false);
      setFiles([]);
      setUploadProgress({});
      setUploading(false);
    };
  
    const UploadModal = () => (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: '#404040' }}>
              Upload de Arquivos
            </h2>
            <button
              onClick={closeModal}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
            >
              <i className="fas fa-times text-gray-500"></i>
            </button>
          </div>
  
          {/* Content */}
          <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
            {/* Drop Zone */}
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 cursor-pointer ${
                isDragging 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <i 
                className="fas fa-cloud-upload-alt text-4xl mb-4"
                style={{ color: isDragging ? '#D04A02' : '#7D7D7D' }}
              ></i>
              <p className="text-lg font-medium mb-2" style={{ color: '#404040' }}>
                Arraste arquivos aqui ou clique para selecionar
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                Formatos aceitos: JPG, PNG, GIF, PDF, TXT, XLS, XLSX (máx. 10MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
                accept=".jpg,.jpeg,.png,.gif,.pdf,.txt,.xls,.xlsx"
              />
            </div>
  
            {/* File List */}
            {files.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4" style={{ color: '#404040' }}>
                  Arquivos Selecionados ({files.length})
                </h3>
                <div className="space-y-3">
                  {files.map((file) => (
                    <div 
                      key={file.id}
                      className="flex items-center p-4 bg-gray-50 rounded-lg border border-gray-200"
                    >
                      <i 
                        className={`${getFileIcon(file.type)} text-2xl mr-4`}
                        style={{ color: getFileColor(file.type) }}
                      ></i>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate" style={{ color: '#404040' }}>
                          {file.name}
                        </p>
                        <p className="text-sm" style={{ color: '#7D7D7D' }}>
                          {formatFileSize(file.size)}
                        </p>
                        
                        {/* Progress Bar */}
                        {file.status === 'pending' && uploadProgress[file.id] !== undefined && (
                          <div className="mt-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className="h-2 rounded-full transition-all duration-300"
                                style={{ 
                                  width: `${uploadProgress[file.id]}%`,
                                  backgroundColor: '#D04A02'
                                }}
                              ></div>
                            </div>
                            <p className="text-xs mt-1" style={{ color: '#7D7D7D' }}>
                              {Math.round(uploadProgress[file.id])}%
                            </p>
                          </div>
                        )}
                        
                        {file.status === 'completed' && (
                          <div className="flex items-center mt-2">
                            <i className="fas fa-check-circle text-green-500 mr-2"></i>
                            <span className="text-sm text-green-600">Upload concluído</span>
                          </div>
                        )}
                      </div>
                      
                      {!uploading && (
                        <button
                          onClick={() => removeFile(file.id)}
                          className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        >
                          <i className="fas fa-trash text-sm"></i>
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
  
          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              onClick={closeModal}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              disabled={uploading}
            >
              Cancelar
            </button>
            <button
              onClick={simulateUpload}
              disabled={files.length === 0 || uploading || files.every(f => f.status === 'completed')}
              className="px-6 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              style={{ backgroundColor: '#D04A02' }}
            >
              {uploading ? (
                <>
                  <i className="fas fa-spinner fa-spin mr-2"></i>
                  Enviando...
                </>
              ) : (
                <>
                  <i className="fas fa-upload mr-2"></i>
                  Enviar Arquivos
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#404040' }}>
            Sistema de Upload de Arquivos
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#404040' }}>
              Demonstração do Modal de Upload
            </h2>
            <p className="mb-6" style={{ color: '#7D7D7D' }}>
              Clique no botão abaixo para abrir o modal de upload com drag & drop, 
              validação de arquivos e barra de progresso.
            </p>
            
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-3 text-white rounded-lg transition-colors duration-200 hover:opacity-90 flex items-center"
              style={{ backgroundColor: '#D04A02' }}
            >
              <i className="fas fa-upload mr-2"></i>
              Abrir Modal de Upload
            </button>
  
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Recursos
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Drag & Drop</li>
                  <li>• Seleção múltipla</li>
                  <li>• Validação de tipos</li>
                  <li>• Barra de progresso</li>
                  <li>• Preview de arquivos</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Formatos Aceitos
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Imagens (JPG, PNG, GIF)</li>
                  <li>• Documentos (PDF)</li>
                  <li>• Planilhas (XLS, XLSX)</li>
                  <li>• Texto (TXT)</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Validações
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Tamanho máximo: 10MB</li>
                  <li>• Tipos de arquivo</li>
                  <li>• Upload em lote</li>
                  <li>• Feedback visual</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
  
        {/* Modal */}
        {isModalOpen && <UploadModal />}
      </div>
    );
  }