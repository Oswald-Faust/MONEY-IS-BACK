'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { File, FileText, FileImage, FileCode, Trash2, Download, ExternalLink } from 'lucide-react';
import type { DriveFile } from '@/types';
import { useAppStore } from '@/store';

interface FileCardProps {
  file: DriveFile;
}

const getFileIcon = (type: string) => {
  if (type.startsWith('image/')) return <FileImage className="w-8 h-8" />;
  if (type.includes('pdf')) return <FileText className="w-8 h-8" />;
  if (type.includes('javascript') || type.includes('typescript') || type.includes('json')) return <FileCode className="w-8 h-8" />;
  return <File className="w-8 h-8" />;
};

const formatSize = (bytes: number) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

export default function FileCard({ file }: FileCardProps) {
  const { deleteDriveFile } = useAppStore();

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      className="glass-card group p-5 flex flex-col gap-4 relative overflow-hidden"
    >
      {/* Type Badge */}
      <div className="flex items-center justify-between">
        <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
          {getFileIcon(file.type)}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button className="p-2 rounded-xl hover:bg-white/5 text-gray-500 hover:text-white transition-all">
            <Download className="w-5 h-5" />
          </button>
          <button 
            onClick={() => {
              if (confirm('Supprimer ce fichier ?')) {
                deleteDriveFile(file._id);
              }
            }}
            className="p-2 rounded-xl hover:bg-red-500/10 text-gray-600 hover:text-red-400 transition-all"
          >
            <Trash2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold text-white truncate group-hover:text-indigo-400 transition-colors uppercase tracking-tight">
          {file.name}
        </h3>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{file.type.split('/')[1] || 'FILE'}</span>
          <span className="w-1 h-1 rounded-full bg-gray-700" />
          <span className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">{formatSize(file.size)}</span>
        </div>
      </div>

      {/* Footer Link */}
      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
        <span className="text-[9px] font-bold text-gray-600 uppercase tracking-tighter">
          {new Date(file.createdAt).toLocaleDateString()}
        </span>
        <button className="flex items-center gap-1.5 text-[10px] font-bold text-indigo-400 hover:text-indigo-300 uppercase tracking-wider transition-colors">
          Ouvrir <ExternalLink className="w-3 h-3" />
        </button>
      </div>
    </motion.div>
  );
}
