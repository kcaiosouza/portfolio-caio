import React, { useState } from 'react';
import WindowFrame from './WindowFrame';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  RotateCcw,
  Maximize2,
  Download,
  Image as ImageIcon
} from 'lucide-react';
import { soundEngine } from '../../utils/soundEffects';

export interface ImageViewerAppProps {
  id?: string;
  title?: string;
  imageSrc?: string;
  imageTitle?: string;
  description?: string;
  withFrame?: boolean;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

export const ImageViewerContent: React.FC<{
  imageSrc?: string;
  imageTitle?: string;
  description?: string;
}> = ({
  imageSrc = 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
  imageTitle = 'Setup_Gamer.jpg',
  description = 'Estética retrô & PC Gaming'
}) => {
  const [zoom, setZoom] = useState<number>(100);
  const [rotation, setRotation] = useState<number>(0);

  const handleZoomIn = () => {
    soundEngine.playClick();
    setZoom(prev => Math.min(prev + 25, 250));
  };

  const handleZoomOut = () => {
    soundEngine.playClick();
    setZoom(prev => Math.max(prev - 25, 50));
  };

  const handleZoomReset = () => {
    soundEngine.playClick();
    setZoom(100);
    setRotation(0);
  };

  const handleRotateCw = () => {
    soundEngine.playClick();
    setRotation(prev => (prev + 90) % 360);
  };

  const handleRotateCcw = () => {
    soundEngine.playClick();
    setRotation(prev => (prev - 90 + 360) % 360);
  };

  const handleDownload = () => {
    soundEngine.playClick();
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = imageTitle;
    a.target = '_blank';
    a.rel = 'noreferrer';
    a.click();
  };

  return (
    <div className="flex flex-col flex-1 h-full min-h-0 bg-[#ECE9D8] font-tahoma text-black select-none text-xs">
      {/* Barra de Ferramentas Clássica do Visualizador de Imagens e Fax do Windows XP */}
      <div className="bg-[#ECE9D8] border-b border-[#ACA899] p-1 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleZoomIn}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-800 shadow-xs"
            title="Ampliar (Zoom In)"
          >
            <ZoomIn className="w-3.5 h-3.5 text-blue-600" />
            <span>Ampliar</span>
          </button>

          <button
            type="button"
            onClick={handleZoomOut}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-800 shadow-xs"
            title="Reduzir (Zoom Out)"
          >
            <ZoomOut className="w-3.5 h-3.5 text-blue-600" />
            <span>Reduzir</span>
          </button>

          <button
            type="button"
            onClick={handleZoomReset}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-800 shadow-xs"
            title="Tamanho Real (100%)"
          >
            <Maximize2 className="w-3.5 h-3.5 text-blue-600" />
            <span>Tamanho Real</span>
          </button>

          <div className="h-4 w-[1px] bg-gray-400 mx-1" />

          <button
            type="button"
            onClick={handleRotateCw}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-800 shadow-xs"
            title="Girar no sentido horário (90°)"
          >
            <RotateCw className="w-3.5 h-3.5 text-green-600" />
            <span>Girar 90°</span>
          </button>

          <button
            type="button"
            onClick={handleRotateCcw}
            className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-white border border-[#7F9DB9] hover:bg-gray-100 active:bg-gray-200 text-gray-800 shadow-xs"
            title="Girar no sentido anti-horário (-90°)"
          >
            <RotateCcw className="w-3.5 h-3.5 text-green-600" />
          </button>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          className="flex items-center gap-1 px-2 py-0.5 rounded-[2px] bg-[#245EDC] text-white border border-[#002D96] hover:bg-[#1941A5] font-semibold shadow-xs"
          title="Salvar Imagem"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Salvar</span>
        </button>
      </div>

      {/* Área de Visualização da Imagem */}
      <div className="flex-1 bg-[#1E1E1E] overflow-auto flex items-center justify-center p-4 relative shadow-inner">
        <div
          className="transition-transform duration-200 ease-out flex items-center justify-center"
          style={{
            transform: `scale(${zoom / 100}) rotate(${rotation}deg)`
          }}
        >
          <img
            src={imageSrc}
            alt={imageTitle}
            className="max-h-[380px] max-w-[560px] object-contain shadow-2xl rounded-[2px] select-none pointer-events-none border border-black/40"
          />
        </div>
      </div>

      {/* Barra de Status do Visualizador XP */}
      <div className="bg-[#ECE9D8] border-t border-[#ACA899] px-3 py-1 flex items-center justify-between text-[11px] text-gray-700 shadow-[inset_0_1px_0_#FFF]">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
          <span>{imageTitle} ({description})</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Zoom: <strong>{zoom}%</strong></span>
          {rotation > 0 && <span>Rotação: <strong>{rotation}°</strong></span>}
          <span>Visualizador de Imagens do Windows</span>
        </div>
      </div>
    </div>
  );
};

export const ImageViewerApp: React.FC<ImageViewerAppProps> = ({
  id = 'hobby-setup-window',
  title = 'Setup_Gamer.jpg - Visualizador de imagens do Windows',
  imageSrc,
  imageTitle,
  description,
  withFrame = true,
  isOpen,
  onClose,
  className = ''
}) => {
  const content = (
    <ImageViewerContent
      imageSrc={imageSrc}
      imageTitle={imageTitle}
      description={description}
    />
  );

  if (!withFrame) {
    return content;
  }

  return (
    <WindowFrame
      id={id}
      title={title}
      icon="image"
      isOpen={isOpen}
      onClose={onClose}
      className={className}
      initialPosition={{ x: 190, y: 60, width: 640, height: 480 }}
    >
      {content}
    </WindowFrame>
  );
};

export default ImageViewerApp;
