import React, { useState, useRef } from 'react';

// Types
interface MultiUploadProps {
  files: File[];
  onFilesUpdate: (files: File[]) => void;
  maxFiles?: number;
  maxFileSize?: number;
  title?: string;
  className?: string;
}

// Constants
const EXCEL_CSV_TYPES = [
  'application/vnd.ms-excel', // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'text/csv', // .csv
  'application/csv' // .csv alternativo
];

const MultiUpload: React.FC<MultiUploadProps> = ({
  files,
  onFilesUpdate,
  maxFiles = 15,
  maxFileSize = 100 * 1024 * 1024, // 100MB
  title = "Upload de Planilhas Excel e CSV",
  className = ""
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const getFileIcon = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'csv': return 'fas fa-file-csv';
      case 'xls':
      case 'xlsx': return 'fas fa-file-excel';
      default: return 'fas fa-file';
    }
  };

  const getFileColor = (fileName: string): string => {
    const ext = fileName.toLowerCase().split('.').pop();
    switch (ext) {
      case 'csv': return '#6366F1';
      case 'xls':
      case 'xlsx': return '#059669';
      default: return '#6B7280';
    }
  };

  const validateFile = (file: File): { valid: boolean; error?: string } => {
    if (!EXCEL_CSV_TYPES.includes(file.type) && !file.name.toLowerCase().match(/\.(csv|xls|xlsx)$/)) {
      return {
        valid: false,
        error: 'Apenas arquivos Excel (.xls, .xlsx) ou CSV são permitidos'
      };
    }

    if (file.size > maxFileSize) {
      return {
        valid: false,
        error: `Arquivo muito grande. Máximo: ${formatFileSize(maxFileSize)}`
      };
    }

    if (files.length >= maxFiles) {
      return {
        valid: false,
        error: `Número máximo de arquivos atingido: ${maxFiles}`
      };
    }

    // Verificar duplicatas
    if (files.some(f => f.name === file.name && f.size === file.size)) {
      return {
        valid: false,
        error: 'Arquivo já adicionado'
      };
    }

    return { valid: true };
  };

  const handleFileSelect = (selectedFiles: FileList | null): void => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles: File[] = [];
    const errors: string[] = [];

    fileArray.forEach((file) => {
      const validation = validateFile(file);

      if (validation.valid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    if (errors.length > 0) {
      alert(errors.join('\n'));
    }

    if (validFiles.length > 0) {
      onFilesUpdate([...files, ...validFiles]);
    }
  };

  const handleDragOver = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const removeFile = (index: number): void => {
    const newFiles = files.filter((_, i) => i !== index);
    onFilesUpdate(newFiles);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    handleFileSelect(e.target.files);
    if (e.target) {
      e.target.value = '';
    }
  };

  const handleDropZoneClick = (): void => {
    if (files.length < maxFiles) {
      fileInputRef.current?.click();
    }
  };

  const canAddMore = files.length < maxFiles;

  return (
    <div className={`w-full max-w-4xl mx-auto ${className}`}>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600">
          Planilhas Excel (.xls, .xlsx) e CSV • 
          {files.length}/{maxFiles} arquivos • 
          Tamanho máximo: {formatFileSize(maxFileSize)}
        </p>
      </div>

      {/* Add Files Section */}
      {canAddMore && (
        <div
          className={`border-2 border-dashed rounded-xl p-6 text-center transition-all duration-300 cursor-pointer mb-6 ${
            isDragging
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={handleDropZoneClick}
        >
          <div className="flex flex-col items-center">
            <i 
              className="fas fa-plus-circle text-4xl mb-3"
              style={{ color: isDragging ? '#3B82F6' : '#6B7280' }}
            />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {files.length === 0 ? 'Adicionar planilhas' : 'Adicionar mais planilhas'}
            </h3>
            <p className="text-gray-500 text-sm mb-3">
              Arraste arquivos aqui ou clique para selecionar
            </p>
            <div className="flex flex-wrap justify-center gap-2">
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                .xlsx
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                .xls
              </span>
              <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                .csv
              </span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={handleInputChange}
            accept=".csv,.xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,text/csv"
          />
        </div>
      )}

      {/* Files List */}
      {files.length > 0 ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-700">
              Lista de Planilhas ({files.length})
            </h3>
            <button
              onClick={() => onFilesUpdate([])}
              className="px-4 py-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors duration-200"
            >
              <i className="fas fa-trash mr-2" />
              Limpar Tudo
            </button>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto">
            {files.map((file, index) => (
              <div
                key={`${file.name}-${file.size}-${index}`}
                className="flex items-center p-4 bg-white rounded-lg border border-gray-200 hover:border-gray-300 transition-colors duration-200"
              >
                <i
                  className={`${getFileIcon(file.name)} text-2xl mr-4`}
                  style={{ color: getFileColor(file.name) }}
                />

                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-800 truncate mb-1">
                    {file.name}
                  </p>
                  <p className="text-sm text-gray-600">
                    {formatFileSize(file.size)} • {file.type || 'Tipo desconhecido'}
                  </p>
                </div>

                <button
                  onClick={() => removeFile(index)}
                  className="ml-4 p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
                  title="Remover arquivo"
                >
                  <i className="fas fa-times" />
                </button>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <i className="fas fa-table text-4xl text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-600 mb-2">
            Nenhuma planilha adicionada
          </h3>
          <p className="text-gray-500">
            Use a área acima para adicionar arquivos Excel ou CSV
          </p>
        </div>
      )}

      {!canAddMore && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            <i className="fas fa-info-circle mr-2" />
            Limite de {maxFiles} arquivos atingido. Remova alguns arquivos para adicionar novos.
          </p>
        </div>
      )}
    </div>
  );
};

// Exemplo de uso
function App() {
  const [files, setFiles] = useState<File[]>([]);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <MultiUpload
        files={files}
        onFilesUpdate={setFiles}
        maxFiles={15}
        maxFileSize={100 * 1024 * 1024} // 100MB
        title="Upload de Planilhas Excel e CSV"
      />
      
      {/* Debug info */}
      {files.length > 0 && (
        <div className="mt-8 p-4 bg-white rounded-lg border">
          <h4 className="font-semibold mb-2">Arquivos selecionados:</h4>
          <ul className="text-sm text-gray-600">
            {files.map((file, index) => (
              <li key={index}>{file.name} - {(file.size / 1024 / 1024).toFixed(2)} MB</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;