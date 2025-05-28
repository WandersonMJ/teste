import React, { useState, useEffect } from 'react';

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
  
  interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUploadComplete?: (files: UploadFile[]) => void;
    allowedTypes?: string[];
    maxFileSize?: number;
    maxFiles?: number;
  }
  
  interface UploadModalProps extends ModalProps {
    files: UploadFile[];
    setFiles: React.Dispatch<React.SetStateAction<UploadFile[]>>;
    uploading: boolean;
    setUploading: React.Dispatch<React.SetStateAction<boolean>>;
    uploadProgress: UploadProgress;
    setUploadProgress: React.Dispatch<React.SetStateAction<UploadProgress>>;
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
  const DEFAULT_MAX_FILES: number = 1; // Padrão agora é 1 arquivo
  
  function App() {
    const [isModalOpen, setIsModalOpen] = React.useState<boolean>(false);
    const [files, setFiles] = React.useState<UploadFile[]>([]);
    const [uploading, setUploading] = React.useState<boolean>(false);
    const [uploadProgress, setUploadProgress] = React.useState<UploadProgress>({});
  
    const [isModalMultipleOpen, setIsModalMultipleOpen] = React.useState<boolean>(false);
    const [filesMultiple, setFilesMultiple] = React.useState<UploadFile[]>([]);
    const [uploadingMultiple, setUploadingMultiple] = React.useState<boolean>(false);
    const [uploadProgressMultiple, setUploadProgressMultiple] = React.useState<UploadProgress>({});
  
    const handleUploadComplete = (completedFiles: UploadFile[]): void => {
      console.log('Upload completed:', completedFiles);
    };
  
    const closeModal = (): void => {
      setIsModalOpen(false);
      setFiles([]);
      setUploadProgress({});
      setUploading(false);
    };
  
    const closeModalMultiple = (): void => {
      setIsModalMultipleOpen(false);
      setFilesMultiple([]);
      setUploadProgressMultiple({});
      setUploadingMultiple(false);
    };
  
    return (
      <div className="min-h-screen bg-gray-100 p-8">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8" style={{ color: '#404040' }}>
            Sistema de Upload - Limite Configurável
          </h1>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4" style={{ color: '#404040' }}>
              Demonstração com Diferentes Limites
            </h2>
            <p className="mb-6" style={{ color: '#7D7D7D' }}>
              Teste o modal com limite de 1 arquivo (padrão) e com limite de 5 arquivos.
              O limite é configurável via props.
            </p>
            
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 text-white rounded-lg transition-colors duration-200 hover:opacity-90 flex items-center"
                style={{ backgroundColor: '#D04A02' }}
              >
                <i className="fas fa-upload mr-2"></i>
                Upload Único (1 arquivo)
              </button>
  
              <button
                onClick={() => setIsModalMultipleOpen(true)}
                className="px-6 py-3 text-white rounded-lg transition-colors duration-200 hover:opacity-90 flex items-center"
                style={{ backgroundColor: '#7D7D7D' }}
              >
                <i className="fas fa-upload mr-2"></i>
                Upload Múltiplo (5 arquivos)
              </button>
            </div>
  
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Limite Padrão: 1 Arquivo
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Substitui arquivo anterior</li>
                  <li>• Interface simplificada</li>
                  <li>• Ideal para avatars/docs únicos</li>
                  <li>• Input sem "multiple"</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Limite Configurável
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Props maxFiles</li>
                  <li>• Validação automática</li>
                  <li>• Mensagens dinâmicas</li>
                  <li>• Interface adaptável</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2" style={{ color: '#404040' }}>
                  Validações Inteligentes
                </h3>
                <ul className="text-sm space-y-1" style={{ color: '#7D7D7D' }}>
                  <li>• Limite respeitado</li>
                  <li>• Substituição automática</li>
                  <li>• Feedback claro</li>
                  <li>• TypeScript tipado</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
  
        {/* Modal Upload Único */}
        {isModalOpen && (
          <UploadModal
            isOpen={isModalOpen}
            onClose={closeModal}
            onUploadComplete={handleUploadComplete}
            files={files}
            setFiles={setFiles}
            uploading={uploading}
            setUploading={setUploading}
            uploadProgress={uploadProgress}
            setUploadProgress={setUploadProgress}
            allowedTypes={DEFAULT_ALLOWED_TYPES}
            maxFileSize={DEFAULT_MAX_FILE_SIZE}
            maxFiles={1} // Limite de 1 arquivo
          />
        )}
  
        {/* Modal Upload Múltiplo */}
        {isModalMultipleOpen && (
          <UploadModal
            isOpen={isModalMultipleOpen}
            onClose={closeModalMultiple}
            onUploadComplete={handleUploadComplete}
            files={filesMultiple}
            setFiles={setFilesMultiple}
            uploading={uploadingMultiple}
            setUploading={setUploadingMultiple}
            uploadProgress={uploadProgressMultiple}
            setUploadProgress={setUploadProgressMultiple}
            allowedTypes={DEFAULT_ALLOWED_TYPES}
            maxFileSize={DEFAULT_MAX_FILE_SIZE}
            maxFiles={5} // Limite de 5 arquivos
          />
        )}
      </div>
    );
  }
  
  // Upload Modal Component
  const UploadModal: React.FC<UploadModalProps> = ({
    isOpen,
    onClose,
    onUploadComplete,
    files,
    setFiles,
    uploading,
    setUploading,
    uploadProgress,
    setUploadProgress,
    allowedTypes = DEFAULT_ALLOWED_TYPES,
    maxFileSize = DEFAULT_MAX_FILE_SIZE,
    maxFiles = DEFAULT_MAX_FILES
  }) => {
    const [isDragging, setIsDragging] = React.useState<boolean>(false);
    const fileInputRef = React.useRef<HTMLInputElement | null>(null);
  
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
      
      // Para limite de 1 arquivo, sempre permitir (vai substituir)
      if (maxFiles === 1) {
        return { valid: true };
      }
      
      // Para múltiplos arquivos, verificar limite
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
      if (!selectedFiles) return;
  
      const fileArray: File[] = Array.from(selectedFiles);
      const validFiles: UploadFile[] = [];
      const errors: string[] = [];
  
      // Se o limite é 1, pegar apenas o primeiro arquivo e substituir
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
            // Substituir arquivo existente
            setFiles([uploadFile]);
            setUploadProgress({});
            return;
          } else {
            alert(`${file.name}: ${validation.error}`);
            return;
          }
        }
      }
  
      // Para múltiplos arquivos
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
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);
      
      const droppedFiles: FileList = e.dataTransfer.files;
      handleFileSelect(droppedFiles);
    };
  
    const removeFile = (fileId: string): void => {
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
            
            // Update file status to uploading
            setFiles((prev: UploadFile[]) => 
              prev.map(f => f.id === file.id ? { ...f, status: 'uploading' } : f)
            );
  
            const interval = setInterval(() => {
              progress += Math.random() * 25 + 5; // 5-30% increment
              
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
          }, index * 300); // Stagger uploads
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
      fileInputRef.current?.click();
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
  
    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <div 
          className="bg-white rounded-lg shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden"
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h2 className="text-xl font-semibold" style={{ color: '#404040' }}>
              Upload de Arquivo{maxFiles > 1 ? 's' : ''}
              {maxFiles === 1 && ' (Único)'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              type="button"
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
              />
            </div>
  
            {/* File List */}
            {files.length > 0 && (
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
                      
                      {!uploading && file.status !== 'uploading' && (
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
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors duration-200"
              disabled={uploading}
              type="button"
            >
              Cancelar
            </button>
            <button
              onClick={simulateUpload}
              disabled={files.length === 0 || uploading || files.every(f => f.status === 'completed')}
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