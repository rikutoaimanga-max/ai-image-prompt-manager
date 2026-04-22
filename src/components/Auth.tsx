import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Button } from './Button';
import { Input } from './Input';
import { Lock } from 'lucide-react';

export const Auth: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError(error.message);
        }
        setLoading(false);
    };

    return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--bg-main)' }}>
            <div className="glass-panel" style={{ width: '400px', padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', borderRadius: 'var(--radius-lg)' }}>
                <div style={{ textAlign: 'center' }}>
                    <div className="flex-center" style={{ margin: '0 auto 1rem', width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--primary)' }}>
                        <Lock size={32} />
                    </div>
                    <h2 className="text-xl font-bold font-heading text-glow">管理者ログイン</h2>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.5rem' }}>画像の追加・管理を行うにはログインが必要です。</p>
                </div>

                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {error && <div style={{ color: '#ef4444', fontSize: '0.9rem', padding: '0.5rem', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '4px' }}>{error}</div>}
                    
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>メールアドレス</label>
                        <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.85rem', color: 'var(--text-main)' }}>パスワード</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    </div>

                    <Button type="submit" disabled={loading} style={{ marginTop: '0.5rem' }}>
                        {loading ? 'ログイン処理中...' : 'ログイン'}
                    </Button>
                </form>
            </div>
        </div>
    );
};
