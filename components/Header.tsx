import React from 'react';
import Button from './Button';
import { User } from '../types';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  title: string;
  user: User | null;
  onSave?: () => void;
  onPublish?: () => void;
  onExportPdf?: () => void;
  onLogout: () => void;
  isActionDisabled?: boolean;
  isPublishDisabled?: boolean;
}

const Header: React.FC<HeaderProps> = ({ 
  title, 
  user,
  onSave, 
  onPublish, 
  onExportPdf, 
  onLogout,
  isActionDisabled, 
  isPublishDisabled 
}) => {
  const navigate = useNavigate();

  const handleNavigateToUserManagement = () => {
    navigate('/admin/users');
  };

  return (
    <header className="bg-slate-800 text-white p-4 flex justify-between items-center shadow-md print:hidden">
      <h1 className="text-2xl font-bold">{title}</h1>
      <div className="flex items-center space-x-2">
        {user && onSave && (
          <Button onClick={onSave} variant="secondary" disabled={isActionDisabled}>
            Save
          </Button>
        )}
        {user && onExportPdf && (
          <Button onClick={onExportPdf} variant="secondary" disabled={isActionDisabled}>
            Download PDF
          </Button>
        )}
        {user && onPublish && (
          <Button onClick={onPublish} variant="primary" disabled={isPublishDisabled}>
            Publish Site
          </Button>
        )}
        {user && user.role === 'admin' && (
          <Button onClick={handleNavigateToUserManagement} variant="secondary">
            Manage Users
          </Button>
        )}
        {user && (
          <div className="flex items-center space-x-2">
            <span className="text-sm hidden sm:inline">Welcome, {user.name}</span>
            <Button onClick={onLogout} variant="danger">
              Logout
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;