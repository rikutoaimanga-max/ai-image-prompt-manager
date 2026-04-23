import React from 'react';
import { Image, Plus } from 'lucide-react';

interface NavbarProps {
  onAddClick: () => void;
  isReadOnly?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ onAddClick, isReadOnly = false }) => {
  return (
    <header className="glass-panel" style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 50,
      borderBottom: '1px solid var(--border-subtle)'
    }}>
      <div className="container flex-between" style={{ height: '70px' }}>
        <div className="flex-center" style={{ gap: 'var(--spacing-sm)' }}>
          <div style={{
            color: 'var(--primary)',
            display: 'flex',
            alignItems: 'center'
          }}>
            <Image size={24} />
          </div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: 700,
            letterSpacing: '-0.025em'
          }}>
            <span className="text-gradient">画像プロンプト保管庫</span>
          </h1>
        </div>

        {!isReadOnly && (
          <button
            onClick={onAddClick}
            className="flex-center"
            style={{
              background: 'var(--primary)',
              color: 'white',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              padding: '8px 16px',
              fontSize: '0.9rem',
              fontWeight: 600,
              gap: '8px',
              boxShadow: '0 4px 12px var(--primary-glow)',
              transition: 'transform 0.2s'
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <Plus size={18} />
            <span>新規登録</span>
          </button>
        )}
      </div>
    </header>
  );
};

