import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { useNavigate, Link } from 'react-router-dom';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        let loginEmail = email;
        if (email === 'admin') {
            const adminEmail = import.meta.env.VITE_ADMIN_EMAIL;
            loginEmail = adminEmail || email;
        }

        try {
            const { error } = await supabase.auth.signInWithPassword({
                email: loginEmail,
                password: password,
            });
            if (error) throw error;
            navigate('/');
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
            <div style={{ width: '100%', maxWidth: '400px', margin: '0 16px' }}>
                <div style={{
                    backgroundColor: '#fff',
                    padding: '32px',
                    borderRadius: '8px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                }}>
                    {/* Header */}
                    <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                        <h1 style={{
                            fontSize: '24px',
                            fontWeight: 'bold',
                            color: '#333',
                            marginBottom: '8px',
                            margin: '0 0 8px 0'
                        }}>
                            Hoşgeldiniz
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                            Devam etmek için giriş yapın
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '12px',
                            borderRadius: '4px',
                            backgroundColor: '#fee',
                            border: '1px solid #fcc',
                            color: '#c33',
                            fontSize: '14px'
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleLogin}>
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="email" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Email Adresi
                            </label>
                            <input
                                type="text"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333', // Explicitly set text color
                                    backgroundColor: '#fff' // Explicitly set background
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="Email veya Kullanıcı Adı"
                            />
                        </div>

                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="password" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Şifre
                            </label>
                            <input
                                type="password"
                                id="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333', // Explicitly set text color
                                    backgroundColor: '#fff'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="••••••••"
                            />
                        </div>

                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            marginBottom: '24px',
                            fontSize: '14px'
                        }}>
                            <label style={{
                                display: 'flex',
                                alignItems: 'center',
                                cursor: 'pointer',
                                color: '#666'
                            }}>
                                <input
                                    type="checkbox"
                                    style={{
                                        width: '16px',
                                        height: '16px',
                                        cursor: 'pointer',
                                        marginRight: '8px'
                                    }}
                                />
                                <span>Beni Hatırla</span>
                            </label>
                            <a
                                href="#"
                                style={{
                                    color: '#007bff',
                                    textDecoration: 'none'
                                }}
                                onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                                onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                            >
                                Şifremi Unuttum?
                            </a>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: '100%',
                                padding: '10px 16px',
                                borderRadius: '4px',
                                backgroundColor: loading ? '#6c757d' : '#007bff',
                                color: '#fff',
                                fontSize: '16px',
                                fontWeight: '600',
                                border: 'none',
                                cursor: loading ? 'not-allowed' : 'pointer',
                                transition: 'background-color 0.2s'
                            }}
                            onMouseEnter={(e) => !loading && (e.target.style.backgroundColor = '#0056b3')}
                            onMouseLeave={(e) => !loading && (e.target.style.backgroundColor = '#007bff')}
                        >
                            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        Hesabınız yok mu?{' '}
                        <Link
                            to="/register"
                            style={{
                                color: '#007bff',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            Kayıt Ol
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
