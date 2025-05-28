import React, { useState, useRef } from 'react';

// Types and Interfaces
interface UploadFile {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string | null;
}

interface UploadProgress {
  [fileId: string]: number;
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
  onUploadComplete?: (files: UploadFile[]) => void;
  allowedTypes?: string[];
  maxFileSize?: number;
  maxFiles?: number;
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
  onUploadComplete,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = DEFAULT_MAX_FILES
}) => {
  // Estados internos do componente
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [uploading, setUploading] = useState<boolean>(false);
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [isDragging, setIsDragging] = useState<boolean>(false);
  
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Função para fechar o modal (só funciona se não estiver loading)
  const handleClose = () => {
    if (!isLoading && !uploading) {
      // Limpar estados internos
      setFiles([]);
      setUploadProgress({});
      setUploading(false);
      setIsDragging(false);
      onClose();
    }
  };

  const validateFile = (file: File, currentFilesCount: number = files.length): FileValidation => {
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
    if (!selectedFiles || isLoading || uploading) return;

    const fileArray: File[] = Array.from(selectedFiles);
    const validFiles: UploadFile[] = [];
    const errors: string[] = [];

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
            error: null
          };
          setFiles([uploadFile]);
          setUploadProgress({});
          return;
        } else {
          alert(`${file.name}: ${validation.error}`);
          return;
        }
      }
    }

    fileArray.forEach((file: File) => {
      const validation: FileValidation = validateFile(file, files.length + validFiles.length);
      
      if (validation.valid) {
        const uploadFile: UploadFile = {
          id: generateFileId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          status: 'pending',
          error: null
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
      setFiles((prev: UploadFile[]) => [...prev, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    if (isLoading || uploading) return;
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
    if (isLoading || uploading) return;
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFiles: FileList = e.dataTransfer.files;
    handleFileSelect(droppedFiles);
  };

  const removeFile = (fileId: string): void => {
    if (isLoading || uploading) return;
    
    setFiles((prev: UploadFile[]) => prev.filter(f => f.id !== fileId));
    setUploadProgress((prev: UploadProgress) => {
      const newProgress = { ...prev };
      delete newProgress[fileId];
      return newProgress;
    });
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

  const simulateUpload = async (): Promise<void> => {
    setUploading(true);
    const pendingFiles: UploadFile[] = files.filter(f => f.status === 'pending');
    
    const uploadPromises = pendingFiles.map((file: UploadFile, index: number) => {
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          let progress: number = 0;
          
          setFiles((prev: UploadFile[]) => 
            prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f)
          );

          const interval = setInterval(() => {
            progress += Math.random() * 25 + 5;
            
            if (progress >= 100) {
              progress = 100;
              clearInterval(interval);
              
              setFiles((prev: UploadFile[]) => 
                prev.map(f => f.id === file.id ? { ...f, status: 'completed' } : f)
              );
              
              resolve();
            }
            
            setUploadProgress((prev: UploadProgress) => ({
              ...prev,
              [file.id]: Math.min(progress, 100)
            }));
          }, 150);
        }, index * 300);
      });
    });

    await Promise.all(uploadPromises);
    setUploading(false);
    
    if (onUploadComplete) {
      onUploadComplete(files.filter(f => f.status === 'completed'));
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleFileSelect(e.target.files);
  };

  const handleDropZoneClick = (): void => {
    if (!isLoading && !uploading) {
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
    if (isLoading || uploading) {
      return {
        title: 'Aguarde...',
        subtitle: 'Processamento em andamento'
      };
    }

    if (maxFiles === 1) {
      return {
        title: files.length > 0 ? 'Clique para substituir o arquivo' : 'Arraste um arquivo aqui ou clique para selecionar',
        subtitle: `1 arquivo • Tamanho máximo: ${formatFileSize(maxFileSize)}`
      };
    }
    
    return {
      title: 'Arraste arquivos aqui ou clique para selecionar',
      subtitle: `Máximo ${maxFiles} arquivos • Tamanho máximo: ${formatFileSize(maxFileSize)}`
    };
  };

  if (!isOpen) return null;

  const dropZoneText = getDropZoneText();
  const modalTitle = title || `Upload de Arquivo${maxFiles > 1 ? 's' : ''}${maxFiles === 1 ? ' (Único)' : ''}`;

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
            disabled={isLoading || uploading}
            className={`p-2 rounded-lg transition-colors duration-200 ${
              isLoading || uploading 
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
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <i className="fas fa-spinner fa-spin text-2xl mr-3" style={{ color: '#D04A02' }}></i>
              <span className="text-lg" style={{ color: '#404040' }}>Carregando...</span>
            </div>
          )}

          {/* Drop Zone */}
          {!isLoading && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                uploading || isLoading
                  ? 'opacity-50 cursor-not-allowed'
                  : 'cursor-pointer'
              } ${
                isDragging 
                  ? 'border-orange-500 bg-orange-50' 
                  : 'border-gray-300 hover:border-gray-400'
              } ${files.length >= maxFiles && maxFiles > 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={files.length >= maxFiles && maxFiles > 1 ? undefined : handleDropZoneClick}
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
              {files.length >= maxFiles && maxFiles > 1 && (
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
                disabled={isLoading || uploading}
              />
            </div>
          )}

          {/* File List */}
          {files.length > 0 && !isLoading && (
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-4" style={{ color: '#404040' }}>
                {maxFiles === 1 ? 'Arquivo Selecionado' : `Arquivos Selecionados (${files.length}/${maxFiles})`}
              </h3>
              <div className="space-y-3">
                {files.map((file: UploadFile) => (
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
                        {formatFileSize(file.size)} • {file.type}
                      </p>
                      
                      {/* Progress Bar */}
                      {(file.status === 'uploading' || file.status === 'pending') && 
                       uploadProgress[file.id] !== undefined && (
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
                            {Math.round(uploadProgress[file.id] || 0)}%
                          </p>
                        </div>
                      )}
                      
                      {file.status === 'completed' && (
                        <div className="flex items-center mt-2">
                          <i className="fas fa-check-circle text-green-500 mr-2"></i>
                          <span className="text-sm text-green-600">Upload concluído</span>
                        </div>
                      )}

                      {file.status === 'error' && (
                        <div className="flex items-center mt-2">
                          <i className="fas fa-exclamation-circle text-red-500 mr-2"></i>
                          <span className="text-sm text-red-600">
                            {file.error || 'Erro no upload'}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {!uploading && !isLoading && file.status !== 'uploading' && (
                      <button
                        onClick={() => removeFile(file.id)}
                        className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                        type="button"
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
            onClick={handleClose}
            className={`px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200 ${
              isLoading || uploading
                ? 'text-gray-400 bg-gray-100 cursor-not-allowed'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            disabled={isLoading || uploading}
            type="button"
          >
            Cancelar
          </button>
          <button
            onClick={simulateUpload}
            disabled={files.length === 0 || uploading || isLoading || files.every(f => f.status === 'completed')}
            className="px-6 py-2 text-white rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            style={{ backgroundColor: '#D04A02' }}
            type="button"
          >
            {uploading ? (
              <>
                <i className="fas fa-spinner fa-spin mr-2"></i>
                Enviando...
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

export default UploadModal;