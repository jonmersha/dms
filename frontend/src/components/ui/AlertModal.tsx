import React from 'react';
import { Modal } from './Modal';
import { CheckCircle, AlertCircle } from 'lucide-react';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  message: string;
  type?: 'success' | 'error' | 'info';
  buttonText?: string;
}

export const AlertModal: React.FC<AlertModalProps> = ({
  isOpen,
  onClose,
  title,
  message,
  type = 'info',
  buttonText = 'OK',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="flex flex-col items-center justify-center pt-2">
        {type === 'success' && <CheckCircle className="h-12 w-12 text-green-500 mb-4" />}
        {type === 'error' && <AlertCircle className="h-12 w-12 text-red-500 mb-4" />}
        {type === 'info' && <AlertCircle className="h-12 w-12 text-blue-500 mb-4" />}
        
        <h3 className="text-lg font-medium leading-6 text-gray-900 mb-2">{title}</h3>
        <p className="text-sm text-gray-500 text-center mb-6">{message}</p>
        
        <button
          type="button"
          onClick={onClose}
          className="inline-flex w-full justify-center rounded-md border border-transparent bg-[#00AEEF] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#0096ce] focus:outline-none focus:ring-2 focus:ring-[#00AEEF] focus:ring-offset-2"
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};
