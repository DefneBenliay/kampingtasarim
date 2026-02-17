import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [role, setRole] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;

        // Safety timeout to prevent infinite loading
        const timeoutId = setTimeout(() => {
            if (mounted && loading) {
                console.warn('Auth session load timed out. Forcing app load.');
                setLoading(false);
            }
        }, 5000); // 5 seconds timeout

        // Check active session
        const getSession = async () => {
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
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
            {!loading && children}
        </AuthContext.Provider>
    );
};
