import React, { useState, useRef, useEffect } from 'react';

// Types and Interfaces
interface UploadFile {
  id: string;
  file: File | null; // null para arquivos fantasma
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error' | 'phantom';
  error?: string | null;
  isPhantom?: boolean; // indica se é um arquivo fantasma
}

interface FileValidation {
  valid: boolean;
  error?: string;
}

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  isLoading: boolean;
  uploadProgress?: number; // 0-100
  uploadStatus?: string; // texto do status
  uploadError?: string; // mensagem de erro
  onUpload: (files: File[]) => void; // chamado quando botão upload é clicado
  onUploadComplete?: () => void; // chamado quando upload é concluído
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
  fileName?: string; // novo parâmetro para arquivo fantasma
  onDeleteFile?: () => void; // callback para deletar arquivo fantasma
}

// Constants
const DEFAULT_ALLOWED_TYPES: string[] = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'application/pdf',
  'text/plain',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

const DEFAULT_MAX_FILE_SIZE: number = 10 * 1024 * 1024; // 10MB
const DEFAULT_MAX_FILES: number = 1;

const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  title,
  isLoading,
  uploadProgress = 0,
  uploadStatus,
  uploadError,
  onUpload,
  onUploadComplete,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
  fileName,
  onDeleteFile
}) => {
  // Estados internos do componente
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Reset do estado quando o modal abre/fecha
  useEffect(() => {
    if (isOpen) {
      // Reset completo do estado quando o modal abre
      setFiles([]);
      setIsDragging(false);
      
      // Se fileName for fornecido, criar arquivo fantasma
      if (fileName) {
        const phantomFile: UploadFile = {
          id: `phantom-${Date.now()}`,
          file: null,
          name: fileName,
          size: 0,
          type: getFileTypeFromName(fileName),
          status: 'phantom',
          error: null,
          isPhantom: true
        };
        setFiles([phantomFile]);
      }
    } else {
      // Limpar estado quando modal fecha
      setFiles([]);
      setIsDragging(false);
    }
  }, [isOpen, fileName]);

  // Função para determinar o tipo do arquivo baseado no nome
  const getFileTypeFromName = (name: string): string => {
    const extension = name.toLowerCase().split('.').pop();
    const typeMap: { [key: string]: string } = {
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
      'gif': 'image/gif',
      'pdf': 'application/pdf',
      'txt': 'text/plain',
      'xls': 'application/vnd.ms-excel',
      'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'doc': 'application/msword',
      'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    return typeMap[extension || ''] || 'application/octet-stream';
  };

  // Atualizar status dos arquivos baseado nas props externas
  useEffect(() => {
    if (files.length > 0) {
      setFiles(prevFiles =>
        prevFiles.map(file => {
          // Não atualizar arquivos fantasma
          if (file.isPhantom) return file;
          
          if (isLoading) {
            return {
              ...file,
              status: 'uploading' as const,
              error: uploadError || null
            };
          } else if (uploadError) {
            return {
              ...file,
              status: 'error' as const,
              error: uploadError
            };
          } else if (uploadProgress === 100 && !isLoading) {
            return {
              ...file,
              status: 'completed' as const,
              error: null
            };
          }
          return file;
        })
      );
    }
  }, [isLoading, uploadProgress, uploadError, files.length]);

  // Chamar onUploadComplete quando upload for concluído
  useEffect(() => {
    const realFiles = files.filter(f => !f.isPhantom);
    if (uploadProgress === 100 && !isLoading && realFiles.length > 0 && realFiles.every(f => f.status === 'completed')) {
      if (onUploadComplete) {
        onUploadComplete();
      }
    }
  }, [uploadProgress, isLoading, files, onUploadComplete]);

  // Função para fechar o modal (só funciona se não estiver loading)
  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const validateFile = (file: File, currentFilesCount: number = files.filter(f => !f.isPhantom).length): FileValidation => {
    if (!allowedTypes.includes(file.type)) {
      return {
        valid: false,
        error: `Tipo de arquivo não permitido: ${file.type}`
      };
    }

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${formatFileSize(maxFileSize)}`
      };
    }

    if (maxFiles === 1) {
      return { valid: true };
    }

    if (currentFilesCount >= maxFiles) {
      return {
        valid: false,
        error: `Número máximo de arquivos atingido: ${maxFiles}`
      };
    }

    return { valid: true };
  };

  const generateFileId = (): string => {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const handleFileSelect = (selectedFiles: FileList | null): void => {
    if (!selectedFiles || isLoading) return;

    const fileArray: File[] = Array.from(selectedFiles);
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];
    const currentRealFiles = files.filter(f => !f.isPhantom);

    if (maxFiles === 1) {
      const file = fileArray[0];
      if (file) {
        const validation: FileValidation = validateFile(file, 0);

        if (validation.valid) {
          const uploadFile: UploadFile = {
            id: generateFileId(),
            file,
            name: file.name,
            size: file.size,
            type: file.type,
            status: 'pending',
            error: null,
            isPhantom: false
          };
          // Substituir todos os arquivos (incluindo fantasmas) por este novo
          setFiles([uploadFile]);
          return;
        } else {
          alert(`${file.name}: ${validation.error}`);
          return;
        }
      }
    }

    fileArray.forEach((file: File) => {
      const validation: FileValidation = validateFile(file, currentRealFiles.length + validFiles.length);

      if (validation.valid) {
        const uploadFile: UploadFile = {
          id: generateFileId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          error: null,
          isPhantom: false
        };
        validFiles.push(uploadFile);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      setFiles((prev: UploadFile[]) => {
        // Remover arquivos fantasma e adicionar novos arquivos reais
        const realFiles = prev.filter(f => !f.isPhantom);
        return [...realFiles, ...validFiles];
      });
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    if (isLoading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles: FileList = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const removeFile = (fileId: string): void => {
    if (isLoading) return;

    const fileToRemove = files.find(f => f.id === fileId);
    
    if (fileToRemove?.isPhantom && onDeleteFile) {
      // Se for arquivo fantasma, chamar callback de delete
      onDeleteFile();
    }

    setFiles((prev: UploadFile[]) => prev.filter(f => f.id !== fileId));
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k: number = 1024;
    const sizes: string[] = ['Bytes', 'KB', 'MB', 'GB'];
    const i: number = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (type: string): string => {
    if (type.startsWith('image/')) return 'fas fa-image';
    if (type === 'application/pdf') return 'fas fa-file-pdf';
    if (type.includes('excel') || type.includes('sheet')) return 'fas fa-file-excel';
    if (type.includes('word')) return 'fas fa-file-word';
    if (type.includes('text')) return 'fas fa-file-alt';
    return 'fas fa-file';
  };

  const getFileColor = (type: string): string => {
    if (type.startsWith('image/')) return '#10B981';
    if (type === 'application/pdf') return '#EF4444';
    if (type.includes('excel') || type.includes('sheet')) return '#059669';
    if (type.includes('word')) return '#3B82F6';
    if (type.includes('text')) return '#6B7280';
    return '#6B7280';
  };

  const handleUploadClick = (): void => {
    const realFiles = files.filter(f => !f.isPhantom && f.file);
    if (realFiles.length > 0 && onUpload) {
      const filesToUpload = realFiles.map(f => f.file!);
      onUpload(filesToUpload);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleFileSelect(e.target.files);
  };

  const handleDropZoneClick = (): void => {
    if (!isLoading) {
      fileInputRef.current?.click();
    }
  };

  const getAcceptString = (): string => {
    const extensions: { [key: string]: string[] } = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
    };

    return allowedTypes
      .flatMap(type => extensions[type] || [])
      .join(',');
  };

  const getDropZoneText = (): { title: string; subtitle: string } => {
    if (isLoading) {
      return {
        title: uploadStatus || 'Processando...',
        subtitle: 'Aguarde o processamento'
      };
    }

    const realFiles = files.filter(f => !f.isPhantom);
    const hasPhantomFile = files.some(f => f.isPhantom);

    if (maxFiles === 1) {
      if (hasPhantomFile && realFiles.length === 0) {
        return {
          title: 'Clique para selecionar um novo arquivo',
          subtitle: `1 arquivo • Tamanho máximo: ${formatFileSize(maxFileSize)}`
        };
      }
      return {
        title: realFiles.length > 0 ? 'Clique para substituir o arquivo' : 'Arraste um arquivo aqui ou clique para selecionar',
        subtitle: `1 arquivo • Tamanho máximo: ${formatFileSize(maxFileSize)}`
      };
    }

    return {
      title: 'Arraste arquivos aqui ou clique para selecionar',
      subtitle: `Máximo ${maxFiles} arquivos • Tamanho máximo: ${formatFileSize(maxFileSize)}`
    };
  };

  const getProgressBarColor = (): string => {
    if (uploadError) return '#EF4444'; // Vermelho para erro
    return '#D04A02'; // Laranja padrão
  };

  if (!isOpen) return null;

  const dropZoneText = getDropZoneText();
  const modalTitle = title || `Upload de Arquivo${maxFiles > 1 ? 's' : ''}${maxFiles === 1 ? ' (Único)' : ''}`;
  const realFiles = files.filter(f => !f.isPhantom);
  const hasUploadableFiles = realFiles.length > 0;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-semibold" style={{ color: '#404040' }}>
            {modalTitle}
          </h2>
          <button
            onClick={handleClose}
            disabled={isLoading}
            className={`p-2 rounded-lg transition-colors duration-200 ${isLoading
                ? 'opacity-50 cursor-not-allowed'
                : 'hover:bg-gray-100'
              }`}
            type="button"
          >
            <i className="fas fa-times text-gray-500"></i>
          </button>
        </div>

        {/* Content */}
        <div className="p-6 max-h-[calc(90vh-200px)] overflow-y-auto">
          {/* Loading Indicator */}
          {isLoading && files.length === 0 && (
            <div className="flex items-center justify-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl mr-3" style={{ color: '#D04A02' }}></i>
              <span className="text-lg" style={{ color: '#404040' }}>
                {uploadStatus || 'Carregando...'}
              </span>
            </div>
          )}

          {/* Drop Zone */}
          {!isLoading && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
                } ${isDragging
                  ? 'border-orange-500 bg-orange-50'
                  : 'border-gray-300 hover:border-gray-400'
                } ${realFiles.length >= maxFiles && maxFiles > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={realFiles.length >= maxFiles && maxFiles > 1 ? undefined : handleDropZoneClick}
            >
              <i
                className="fas fa-cloud-upload-alt text-4xl mb-4"
                style={{ color: isDragging ? '#D04A02' : '#7D7D7D' }}
              ></i>
              <p className="text-lg font-medium mb-2" style={{ color: '#404040' }}>
                {dropZoneText.title}
              </p>
              <p className="text-sm" style={{ color: '#7D7D7D' }}>
                {dropZoneText.subtitle}
              </p>
              {realFiles.length >= maxFiles && maxFiles > 1 && (
                <p className="text-sm text-red-500 mt-2">
                  Limite de arquivos atingido
                </p>
              )}
              <input
                ref={fileInputRef}
                type="file"
                multiple={maxFiles > 1}
                className="hidden"
                onChange={handleInputChange}
                accept={getAcceptString()}
                disabled={isLoading}
              />
            </div>
          )}

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#404040' }}>
                {maxFiles === 1 ? 'Arquivo' : `Arquivos (${files.length}/${maxFiles})`}
              </h3>
              <div className="space-y-3">
                {files.map((file: UploadFile) => (
                  <div
                    key={file.id}
                    className={`flex items-center p-4 rounded-lg border ${
                      file.isPhantom 
                        ? 'bg-blue-50 border-blue-200' 
                        : 'bg-gray-50 border-gray-200'
                    }`}
                  >
                    <i
                      className={`${getFileIcon(file.type)} text-2xl mr-4`}
                      style={{ color: file.isPhantom ? '#3B82F6' : getFileColor(file.type) }}
                    ></i>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="font-medium truncate" style={{ color: '#404040' }}>
                          {file.name}
                        </p>
                        {file.isPhantom && (
                          <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                            Arquivo Existente
                          </span>
                        )}
                      </div>
                      <p className="text-sm" style={{ color: '#7D7D7D' }}>
                        {file.isPhantom ? 'Arquivo no servidor' : `${formatFileSize(file.size)} • ${file.type}`}
                      </p>

                      {/* Progress Bar - controlada externamente */}
                      {(isLoading || file.status === 'uploading') && !file.isPhantom && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full transition-all duration-300"
                              style={{
                                width: `${uploadProgress}%`,
                                backgroundColor: getProgressBarColor()
                              }}
                            ></div>
                          </div>
                          <div className="flex justify-between items-center mt-1">
                            <p className="text-xs" style={{ color: '#7D7D7D' }}>
                              {Math.round(uploadProgress)}%
                            </p>
                            {uploadStatus && (
                              <p className="text-xs" style={{ color: uploadError ? '#EF4444' : '#7D7D7D' }}>
                                {uploadStatus}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {file.status === 'completed' && !isLoading && !file.isPhantom && (
                        <div className="flex items-center mt-2">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span className="text-sm text-green-600">Upload concluído</span>
                        </div>
                      )}

                      {(file.status === 'error' || uploadError) && !isLoading && !file.isPhantom && (
                        <div className="flex items-center mt-2">
                          <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                          <span className="text-sm text-red-600">
                            {uploadError || file.error || 'Erro no upload'}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Botão X para excluir arquivo */}
                    {!isLoading && file.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className={`ml-4 p-2 rounded-full transition-colors duration-200 flex items-center justify-center w-8 h-8 border ${
                          file.isPhantom
                            ? 'text-blue-500 hover:bg-blue-100 border-blue-200 hover:border-blue-300'
                            : 'text-red-500 hover:bg-red-50 border-red-200 hover:border-red-300'
                        }`}
                        type="button"
                        title={file.isPhantom ? "Remover arquivo do servidor" : "Remover arquivo"}
                      >
                        <i className="fas fa-times text-sm"></i>
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
            onClick={handleClose}
            className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${isLoading
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-50'
              }`}
            disabled={isLoading}
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={handleUploadClick}
            disabled={!hasUploadableFiles || isLoading || realFiles.every(f => f.status === 'completed')}
            className="px-6 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            style={{ backgroundColor: '#D04A02' }}
            type="button"
          >
            {isLoading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                {uploadStatus || 'Enviando...'}
              </>
            ) : (
              <>
                <i className="fas fa-upload mr-2"></i>
                Enviar Arquivo{maxFiles > 1 ? 's' : ''}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// Exemplo de uso
function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Simulação de lista de itens
  const items = [
    { id: 1, name: 'Item 1', fileName: 'documento1.pdf' },
    { id: 2, name: 'Item 2', fileName: null },
    { id: 3, name: 'Item 3', fileName: 'planilha.xlsx' },
    { id: 4, name: 'Item 4', fileName: null }
  ];

  const handleItemClick = (item) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleUpload = (files) => {
    setIsLoading(true);
    setUploadProgress(0);
    
    // Simulação de upload
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsLoading(false);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const handleDeleteFile = () => {
    console.log('Deletar arquivo do servidor:', selectedItem?.fileName);
    // Aqui você chamaria a API para deletar o arquivo
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
    setIsLoading(false);
    setUploadProgress(0);
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Lista de Itens</h1>
      
      <div className="space-y-2">
        {items.map(item => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item)}
            className="p-4 border rounded-lg cursor-pointer hover:bg-gray-50 flex justify-between items-center"
          >
            <span className="font-medium">{item.name}</span>
            <div className="flex items-center space-x-2">
              {item.fileName && (
                <span className="text-sm text-green-600 bg-green-100 px-2 py-1 rounded">
                  <i className="fas fa-file mr-1"></i>
                  {item.fileName}
                </span>
              )}
              <i className="fas fa-upload text-gray-400"></i>
            </div>
          </div>
        ))}
      </div>

      <UploadModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={`Upload para ${selectedItem?.name}`}
        isLoading={isLoading}
        uploadProgress={uploadProgress}
        uploadStatus={isLoading ? 'Enviando arquivo...' : undefined}
        onUpload={handleUpload}
        fileName={selectedItem?.fileName}
        onDeleteFile={handleDeleteFile}
        maxFiles={1}
      />
    </div>
  );
}

export default App;