'use client';

import { useState, KeyboardEvent } from 'react';
import { Plus, X, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechnologyInputProps {
  technologies: string[];
  onTechnologiesChange: (techs: string[]) => void;
  className?: string;
  placeholder?: string;
  maxTechnologies?: number;
}

export default function TechnologyInput({
  technologies,
  onTechnologiesChange,
  className,
  placeholder = 'Digite uma tecnologia e pressione Enter...',
  maxTechnologies = 15
}: TechnologyInputProps) {
  const [inputValue, setInputValue] = useState('');

  const addTechnology = (tech: string) => {
    const trimmedTech = tech.trim();
    if (!trimmedTech || technologies.includes(trimmedTech)) return;
    
    if (technologies.length >= maxTechnologies) {
      alert(`Máximo de ${maxTechnologies} tecnologias permitido`);
      return;
    }

    onTechnologiesChange([...technologies, trimmedTech]);
    setInputValue('');
  };

  const removeTechnology = (techToRemove: string) => {
    onTechnologiesChange(technologies.filter(tech => tech !== techToRemove));
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTechnology(inputValue);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    const techs = pastedText.split(/[,;\n]/).map(tech => tech.trim()).filter(tech => tech);
    
    techs.forEach(tech => {
      if (technologies.length < maxTechnologies && !technologies.includes(tech)) {
        onTechnologiesChange([...technologies, tech]);
      }
    });
  };

  return (
    <div className={cn('space-y-3', className)}>
      <label className="block text-sm font-medium text-neutral-300">
        Tecnologias <span className="text-neutral-500 text-xs">({technologies.length}/{maxTechnologies})</span>
      </label>

      <div className="flex flex-wrap gap-2 p-3 bg-neutral-900 border border-neutral-700 rounded-lg min-h-[44px]">
        {technologies.map((tech, index) => (
          <span
            key={`${tech}-${index}`}
            className="inline-flex items-center gap-1 px-3 py-1 bg-primary-500/20 text-primary-300 rounded-full text-sm"
          >
            <Tag className="w-3 h-3" />
            {tech}
            <button
              type="button"
              onClick={() => removeTechnology(tech)}
              className="ml-1 hover:text-red-400 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          onPaste={handlePaste}
          placeholder={technologies.length === 0 ? placeholder : ''}
          className="flex-1 bg-transparent border-0 outline-0 text-white placeholder-neutral-500 min-w-[200px]"
        />
      </div>

      <div className="flex items-center justify-between text-xs text-neutral-500">
        <span>Pressione Enter ou vírgula para adicionar</span>
        <button
          type="button"
          onClick={() => addTechnology(inputValue)}
          className="flex items-center gap-1 px-2 py-1 bg-neutral-800 rounded hover:bg-neutral-700 transition-colors"
        >
          <Plus className="w-3 h-3" />
          Adicionar
        </button>
      </div>
    </div>
  );
}