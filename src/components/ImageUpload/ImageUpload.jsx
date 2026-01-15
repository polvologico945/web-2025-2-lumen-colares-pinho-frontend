import React, { useState, useRef } from "react";
import "./ImageUpload.css";

const ImageUpload = ({
  onImagesChange,
  maxImages = 5,
  maxSizeMB = 5,
  existingImages = [],
}) => {
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState(existingImages);
  const [newPreviews, setNewPreviews] = useState([]);
  const [errors, setErrors] = useState([]);
  const fileInputRef = useRef(null);

  // Tipos permitidos
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  const MAX_SIZE = maxSizeMB * 1024 * 1024;

  // Validar um arquivo
  const validateFile = (file, index) => {
    const errors = [];

    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.push(
        `Arquivo ${index + 1}: Tipo não permitido. Use JPEG, PNG, GIF ou WebP`
      );
    }

    if (file.size > MAX_SIZE) {
      errors.push(`Arquivo ${index + 1}: Muito grande. Máximo: ${maxSizeMB}MB`);
    }

    if (images.length + newPreviews.length >= maxImages) {
      errors.push(`Máximo de ${maxImages} imagens por post`);
    }

    return errors;
  };

  // Processar arquivos selecionados
  const handleFileSelect = (event) => {
    const files = Array.from(event.target.files);
    const newErrors = [];
    const validFiles = [];

    files.forEach((file, index) => {
      const fileErrors = validateFile(file, images.length + index);

      if (fileErrors.length > 0) {
        newErrors.push(...fileErrors);
      } else {
        validFiles.push(file);
      }
    });

    if (newErrors.length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors([]);

    const newImages = [...images, ...validFiles];
    setImages(newImages);

    const newPreviewsArray = [];
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviewsArray.push({
          url: e.target.result,
          name: file.name,
          size: file.size,
          isNew: true,
        });

        if (newPreviewsArray.length === validFiles.length) {
          setNewPreviews((prev) => [...prev, ...newPreviewsArray]);
          onImagesChange(newImages);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remover imagem
  const handleRemoveImage = (index, isExisting) => {
    if (isExisting) {
      const updatedPreviews = previews.filter((_, i) => i !== index);
      setPreviews(updatedPreviews);
      onImagesChange(null, previews[index].url);
    } else {
      const updatedImages = images.filter((_, i) => i !== index);
      const updatedNewPreviews = newPreviews.filter((_, i) => i !== index);

      setImages(updatedImages);
      setNewPreviews(updatedNewPreviews);
      onImagesChange(updatedImages);
    }
  };

  // Drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");

    const files = Array.from(e.dataTransfer.files);
    const event = { target: { files } };
    handleFileSelect(event);
  };

  // Formatar tamanho do arquivo
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Calcular espaço restante
  const remainingSlots = maxImages - (previews.length + newPreviews.length);
  const isMaxReached = remainingSlots <= 0;

  return (
    <div className="image-upload-container">
      <div className="upload-header">
        <h3>Imagens do Post</h3>
        <div className="upload-stats">
          <span className={`slot-counter ${isMaxReached ? "max-reached" : ""}`}>
            {previews.length + newPreviews.length} / {maxImages} imagens
          </span>
          {remainingSlots > 0 && (
            <span className="remaining-slots">
              ({remainingSlots} espaço{remainingSlots !== 1 ? "s" : ""} restante
              {remainingSlots !== 1 ? "s" : ""})
            </span>
          )}
        </div>
      </div>

      {/* Área de Drag & Drop */}
      {!isMaxReached && (
        <div
          className="drop-zone"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !isMaxReached && fileInputRef.current?.click()}
        >
          <div className="drop-content">
            <div className="upload-icon">📁</div>
            <p className="drop-text">
              Arraste imagens aqui ou{" "}
              <span className="browse-link">clique para selecionar</span>
            </p>
            <p className="drop-hint">
              Máximo {maxImages} imagens • {maxSizeMB}MB cada • JPEG, PNG, GIF,
              WebP
            </p>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/jpeg,image/png,image/gif,image/webp"
            onChange={handleFileSelect}
            style={{ display: "none" }}
            disabled={isMaxReached}
          />
        </div>
      )}

      {/* Mensagens de Erro */}
      {errors.length > 0 && (
        <div className="error-messages">
          {errors.map((error, index) => (
            <div key={index} className="error-message">
              ⚠️ {error}
            </div>
          ))}
        </div>
      )}

      {/* Galeria de Previews */}
      {(previews.length > 0 || newPreviews.length > 0) && (
        <div className="image-previews">
          <h4>Imagens selecionadas:</h4>

          {/* Imagens existentes do servidor */}
          {previews.map((preview, index) => (
            <div key={`existing-${index}`} className="preview-item">
              <div className="preview-image-container">
                <img
                  src={preview.url}
                  alt={preview.name || `Imagem ${index + 1}`}
                  className="preview-image"
                />
                <div className="image-info">
                  <span className="image-name">
                    {preview.name || "Imagem do servidor"}
                  </span>
                  {preview.size && (
                    <span className="image-size">
                      {formatFileSize(preview.size)}
                    </span>
                  )}
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveImage(index, true)}
                  title="Remover imagem"
                >
                  ✕
                </button>
              </div>
              <div className="image-status">
                <span className="status-badge existing">Servidor</span>
              </div>
            </div>
          ))}

          {/* Novas imagens (ainda não enviadas) */}
          {newPreviews.map((preview, index) => (
            <div key={`new-${index}`} className="preview-item">
              <div className="preview-image-container">
                <img
                  src={preview.url}
                  alt={preview.name || `Nova imagem ${index + 1}`}
                  className="preview-image"
                />
                <div className="image-info">
                  <span className="image-name">{preview.name}</span>
                  <span className="image-size">
                    {formatFileSize(preview.size)}
                  </span>
                </div>
                <button
                  type="button"
                  className="remove-btn"
                  onClick={() => handleRemoveImage(index, false)}
                  title="Remover imagem"
                >
                  ✕
                </button>
              </div>
              <div className="image-status">
                <span className="status-badge new">Novo</span>
                <span className="upload-progress">Pronto para enviar</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Ações */}
      {!isMaxReached && (
        <div className="upload-actions">
          <button
            type="button"
            className="btn-select"
            onClick={() => fileInputRef.current?.click()}
          >
            + Adicionar Mais Imagens
          </button>
        </div>
      )}

      {/* Dicas */}
      <div className="upload-tips">
        <p>💡 Dicas:</p>
        <ul>
          <li>Você pode selecionar múltiplas imagens de uma vez</li>
          <li>Arraste e solte imagens na área acima</li>
          <li>Clique no ✕ para remover uma imagem</li>
          <li>Imagens muito grandes serão automaticamente rejeitadas</li>
        </ul>
      </div>
    </div>
  );
};

export default ImageUpload;
