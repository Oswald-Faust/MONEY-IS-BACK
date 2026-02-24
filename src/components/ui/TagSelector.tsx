'use client';

import React, { useState, useEffect, useRef } from 'react';
import { X, Plus, Hash, Tag as TagIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '@/store';

interface TagSelectorProps {
  value: string[];
  onChange: (tags: string[]) => void;
  className?: string;
  label?: string;
  placeholder?: string;
}

export default function TagSelector({
  value,
  onChange,
  className = '',
  label = 'Tags',
  placeholder = 'Add a tag...'
}: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Get all existing tags from tasks and ideas in the store
  const { tasks, ideas } = useAppStore();
  
  const existingTags = React.useMemo(() => {
    const tagsSet = new Set<string>();
    tasks.forEach(task => task.tags?.forEach(tag => tagsSet.add(tag)));
    ideas.forEach(idea => idea.tags?.forEach(tag => tagsSet.add(tag)));
    return Array.from(tagsSet).sort();
  }, [tasks, ideas]);

  const filteredTags = React.useMemo(() => {
    if (!inputValue.trim()) return existingTags.filter(tag => !value.includes(tag));
    return existingTags.filter(tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase()) && 
      !value.includes(tag)
    );
  }, [existingTags, inputValue, value]);

  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim();
    if (trimmedTag && !value.includes(trimmedTag)) {
      onChange([...value, trimmedTag]);
    }
    setInputValue('');
    setIsDropdownOpen(false);
  };

  const handleRemoveTag = (tag: string) => {
    onChange(value.filter(t => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (inputValue.trim()) {
        handleAddTag(inputValue);
      }
    } else if (e.key === 'Backspace' && !inputValue && value.length > 0) {
      handleRemoveTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`space-y-2 ${className}`}>
      {label && <label className="block text-sm font-medium text-text-muted ml-1">{label}</label>}
      
      <div className="relative" ref={dropdownRef}>
        <div className="
          min-h-[46px] w-full px-3 py-2 flex flex-wrap gap-2
          bg-bg-tertiary border border-glass-border rounded-xl
          focus-within:border-accent-primary/50 focus-within:ring-4 focus-within:ring-accent-primary/10
          transition-all duration-200
        ">
          <AnimatePresence>
            {value.map(tag => (
              <motion.span
                key={tag}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                className="
                  flex items-center gap-1.5 px-2 py-1 rounded-lg
                  bg-accent-primary/10 border border-accent-primary/20
                  text-[10px] font-bold text-accent-primary uppercase tracking-wider
                "
              >
                <Hash className="w-3 h-3" />
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </AnimatePresence>
          
          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setIsDropdownOpen(true);
            }}
            onFocus={() => setIsDropdownOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={value.length === 0 ? placeholder : ''}
            className="flex-1 min-w-[120px] bg-transparent outline-none text-sm text-text-main placeholder:text-text-muted/50"
          />
        </div>

        {/* Dropdown for existing tags */}
        <AnimatePresence>
          {isDropdownOpen && (filteredTags.length > 0 || inputValue.trim()) && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="
                absolute z-[100] mt-2 w-full max-h-60 overflow-y-auto
                bg-bg-card border border-glass-border rounded-2xl
                shadow-2xl backdrop-blur-xl p-2 custom-scrollbar
              "
            >
              {inputValue.trim() && !existingTags.includes(inputValue.trim()) && (
                <button
                  type="button"
                  onClick={() => handleAddTag(inputValue)}
                  className="
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                    hover:bg-glass-hover text-left transition-all group
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent-primary/10 flex items-center justify-center text-accent-primary">
                      <Plus className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-text-main">Create &quot;{inputValue.trim()}&quot;</p>
                      <p className="text-[10px] text-text-dim uppercase font-bold tracking-widest">New Tag</p>
                    </div>
                  </div>
                </button>
              )}

              {filteredTags.map(tag => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => handleAddTag(tag)}
                  className="
                    w-full flex items-center justify-between px-3 py-2.5 rounded-xl
                    hover:bg-glass-hover text-left transition-all group
                  "
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-bg-tertiary border border-glass-border flex items-center justify-center text-text-muted group-hover:text-accent-primary group-hover:bg-accent-primary/10 group-hover:border-accent-primary/30 transition-all">
                      <TagIcon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-text-main">{tag}</span>
                  </div>
                  <Plus className="w-4 h-4 text-text-muted opacity-0 group-hover:opacity-100 transition-all" />
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
