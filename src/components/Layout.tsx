import React from 'react';
import { Navbar } from './Navbar';

interface LayoutProps {
    children: React.ReactNode;
    onAddClick: () => void;
    sidebar?: React.ReactNode; // Added sidebar prop
    isReadOnly?: boolean;
}

export const Layout: React.FC<LayoutProps> = ({ children, onAddClick, sidebar, isReadOnly = false }) => {
    return (
        <div className="main-layout">
            <Navbar onAddClick={onAddClick} isReadOnly={isReadOnly} />

            <div style={{ display: 'flex', flex: 1, marginTop: '70px' }}>
                {sidebar}
                <main className="container" style={{
                    flex: 1,
                    paddingTop: 'var(--spacing-xl)',
                    paddingBottom: 'var(--spacing-xl)',
                    width: '100%',
                    maxWidth: '1400px', // Ensure max-width is applied to content only
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }}>
                    {children}
                </main>
            </div>
        </div>
    );
};
