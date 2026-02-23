import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { Link } from 'react-router-dom';

const Register = () => {
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ type: '', content: '' });

    const handleRegister = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage({ type: '', content: '' });

        if (password !== confirmPassword) {
            setMessage({ type: 'error', content: 'Şifreler eşleşmiyor!' });
            setLoading(false);
            return;
        }

        try {
            const { error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName
                    }
                }
            });

            if (error) throw error;
            setMessage({ type: 'success', content: 'Hesap oluşturuldu! Lütfen e-postanızı doğrulayın.' });
            setEmail('');
            setPassword('');
            setConfirmPassword('');
            setFullName('');
        } catch (error) {
            setMessage({ type: 'error', content: error.message });
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
                            Kayıt Ol
                        </h1>
                        <p style={{ color: '#666', fontSize: '14px', margin: 0 }}>
                            Yeni bir hesap oluşturun
                        </p>
                    </div>

                    {/* Message */}
                    {message.content && (
                        <div style={{
                            marginBottom: '16px',
                            padding: '12px',
                            borderRadius: '4px',
                            backgroundColor: message.type === 'success' ? '#d4edda' : '#f8d7da',
                            border: `1px solid ${message.type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
                            color: message.type === 'success' ? '#155724' : '#721c24',
                            fontSize: '14px'
                        }}>
                            {message.content}
                        </div>
                    )}

                    {/* Form */}
                    <form onSubmit={handleRegister}>
                        <div style={{ marginBottom: '16px' }}>
                            <label htmlFor="fullName" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Ad Soyad
                            </label>
                            <input
                                type="text"
                                id="fullName"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333',
                                    backgroundColor: '#fff'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="Adınız ve Soyadınız"
                                required
                            />
                        </div>

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
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333',
                                    backgroundColor: '#fff'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="ornek@email.com"
                                required
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
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333',
                                    backgroundColor: '#fff'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="En az 6 karakter"
                                minLength={6}
                                required
                            />
                        </div>

                        <div style={{ marginBottom: '24px' }}>
                            <label htmlFor="confirmPassword" style={{
                                display: 'block',
                                marginBottom: '8px',
                                color: '#333',
                                fontSize: '14px',
                                fontWeight: '500'
                            }}>
                                Şifre Tekrar
                            </label>
                            <input
                                type="password"
                                id="confirmPassword"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #ddd',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box',
                                    color: '#333',
                                    backgroundColor: '#fff'
                                }}
                                onFocus={(e) => e.target.style.borderColor = '#007bff'}
                                onBlur={(e) => e.target.style.borderColor = '#ddd'}
                                placeholder="Şifrenizi tekrar girin"
                                minLength={6}
                                required
                            />
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
                            {loading ? 'Kayıt Olunuyor...' : 'Kayıt Ol'}
                        </button>
                    </form>

                    <div style={{
                        marginTop: '24px',
                        textAlign: 'center',
                        fontSize: '14px',
                        color: '#666'
                    }}>
                        Zaten hesabınız var mı?{' '}
                        <Link
                            to="/login"
                            style={{
                                color: '#007bff',
                                textDecoration: 'none',
                                fontWeight: '500'
                            }}
                            onMouseEnter={(e) => e.target.style.textDecoration = 'underline'}
                            onMouseLeave={(e) => e.target.style.textDecoration = 'none'}
                        >
                            Giriş Yap
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Register;
