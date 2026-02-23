import { createContext, useContext, useEffect, useState, useRef } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showBypass, setShowBypass] = useState(false);
    const loadingRef = useRef(true);

    // Sync ref with state
    useEffect(() => {
        loadingRef.current = loading;
    }, [loading]);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const timeoutId = setTimeout(async () => {
            if (mounted && loadingRef.current) {
                console.warn('Auth session load timed out - showing bypass option');
                setShowBypass(true);

                // After 10 seconds total, force close loading if it's still stuck
                const forceCloseTimeout = setTimeout(() => {
                    if (mounted && loadingRef.current) {
                        console.warn('Forcing app load after 10s hang');
                        setLoading(false);
                    }
                }, 7000);

                return () => clearTimeout(forceCloseTimeout);
            }
        }, 3000);

        // Check active session
        const getSession = async () => {
            try {
                console.time('AuthCheck');
                const { data: { session }, error } = await supabase.auth.getSession();
                console.timeEnd('AuthCheck');

                if (error) throw error;

                if (mounted) {
                    setUser(session?.user ?? null);
                    if (session?.user) {
                        await fetchRole(session.user.id);
                    } else {
                        setLoading(false);
                    }
                }
            } catch (error) {
                console.error('Error checking session:', error);
                if (mounted) {
                    await supabase.auth.signOut(); // Ensure clean state on error
                    setUser(null);
                    setRole(null);
                    setLoading(false);
                }
            }
        };

        getSession();

        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null);
                if (session?.user) {
                    await fetchRole(session.user.id);
                } else {
                    setRole(null);
                    setLoading(false);
                }
            }
        });

        return () => {
            mounted = false;
            clearTimeout(timeoutId);
            subscription.unsubscribe();
        };
    }, []);

    const fetchRole = async (userId) => {
        try {
            const { data, error } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .single();

            if (error) {
                console.error('Error fetching role:', error);
                // If no profile exists yet (should be created on trigger, but handled here for safety)
                setRole('user');
            } else {
                setRole(data?.role || 'user');
            }
        } catch (error) {
            console.error('Error fetching role:', error);
        } finally {
            setLoading(false);
        }
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, role, signOut, loading, isAdmin: role === 'admin' }}>
            {loading ? (
                <div className="flex justify-center items-center h-screen bg-gray-900 font-sans">
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex flex-col items-center gap-4">
                            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                            <div className="text-gray-400 text-sm">Oturum kontrol ediliyor...</div>
                        </div>

                        {showBypass && (
                            <div className="flex flex-col items-center gap-2 animate-fade-in">
                                <p className="text-gray-500 text-xs text-center px-4">
                                    Oturum kontrolü beklenenden uzun sürüyor.
                                </p>
                                <button
                                    onClick={() => setLoading(false)}
                                    className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors underline underline-offset-4"
                                >
                                    Giriş sayfasına geçmek için tıklayın
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
