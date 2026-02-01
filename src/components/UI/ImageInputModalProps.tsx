import { useState } from 'react';
import { RpgModal } from './RpgModal';

interface ImageInputModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (url: string) => void;
  title: string;
}

export const ImageInputModal = ({ isOpen, onClose, onSave, title }: ImageInputModalProps) => {
  const [url, setUrl] = useState('');

  const handleSave = () => {
    if (url.trim()) {
      onSave(url);
      onClose();
      setUrl('');
    }
  };

  if (!isOpen) return null;

  return (
    <RpgModal isOpen={isOpen} onClose={onClose} title={title}>
      <div className="flex flex-col gap-4">
        <p className="text-sm text-gray-400">
          Como não usamos servidor de arquivos, hospede sua imagem no 
          <strong> Imgur, Discord ou Pinterest</strong>, copie o link direto da imagem (deve terminar em .png ou .jpg) e cole abaixo.
        </p>

        <input 
          type="text" 
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://exemplo.com/imagem.png"
          className="w-full bg-dungeon-dark border border-gold/50 p-3 text-parchment rounded focus:border-gold outline-none"
        />

        {/* Preview da Imagem */}
        {url && (
          <div className="w-full h-48 bg-black/50 rounded flex items-center justify-center border border-gray-700 overflow-hidden">
            <img 
              src={url} 
              alt="Preview" 
              className="h-full object-contain"
              onError={(e) => (e.currentTarget.style.display = 'none')} 
            />
          </div>
        )}

        <button 
          onClick={handleSave}
          className="bg-gold-gradient text-dungeon-dark font-bold py-2 px-4 rounded hover:brightness-110"
        >
          Confirmar Imagem
        </button>
      </div>
    </RpgModal>
  );
};