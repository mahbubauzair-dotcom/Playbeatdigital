import React from 'react';
import {
  Files,
  FileArchive,
  ImageDown,
  FileImage,
  Contact,
  QrCode,
  Calendar,
  FileText,
  Scaling,
  Keyboard,
  Wrench,
} from 'lucide-react';

interface ToolIconProps {
  name: string;
  className?: string;
}

export const ToolIcon: React.FC<ToolIconProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Files':
      return <Files className={className} aria-hidden="true" />;
    case 'FileArchive':
      return <FileArchive className={className} aria-hidden="true" />;
    case 'ImageDown':
      return <ImageDown className={className} aria-hidden="true" />;
    case 'FileImage':
      return <FileImage className={className} aria-hidden="true" />;
    case 'Contact':
      return <Contact className={className} aria-hidden="true" />;
    case 'QrCode':
      return <QrCode className={className} aria-hidden="true" />;
    case 'Calendar':
      return <Calendar className={className} aria-hidden="true" />;
    case 'FileText':
      return <FileText className={className} aria-hidden="true" />;
    case 'Scaling':
      return <Scaling className={className} aria-hidden="true" />;
    case 'Keyboard':
      return <Keyboard className={className} aria-hidden="true" />;
    default:
      return <Wrench className={className} aria-hidden="true" />;
  }
};
