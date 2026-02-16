import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { LogOut, Menu, X, LayoutGrid, FileText, FolderOpen, Shield } from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = () => {
    const { user, signOut, isAdmin } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSignOut = async () => {
        await signOut();
        navigate('/login');
    };

    const NavLink = ({ to, icon: Icon, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`flex items-center space-x-2 px-4 py-2 rounded-full transition-all duration-300 ${isActive
                    ? 'bg-white/15 text-white shadow-lg shadow-blue-500/10 border border-white/10'
                    : 'text-gray-300 hover:text-white hover:bg-white/5'
                    }`}
            >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="text-sm font-medium">{children}</span>
            </Link>
        );
    };

    return (
        <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${scrolled ? 'bg-gray-900/80 backdrop-blur-xl border-b border-white/10 py-3' : 'bg-transparent py-5'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center">
                    {/* Logo */}
                    <div className="flex-shrink-0 flex items-center">
                        <Link to="/" className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 tracking-tight">
                            Kamping Planlama ve Tasarımı
                        </Link>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-1">
                        <NavLink to="/" icon={LayoutGrid}>Home</NavLink>
                        <NavLink to="/info" icon={FileText}>Info</NavLink>
                        <NavLink to="/files" icon={FolderOpen}>Files</NavLink>
                        {isAdmin && (
                            <NavLink to="/admin/users" icon={Shield}>Admin</NavLink>
                        )}
                    </div>

                    <div className="hidden md:flex items-center">
                        <button
                            onClick={handleSignOut}
                            className="flex items-center space-x-2 px-5 py-2 rounded-full bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white border border-red-500/20 transition-all duration-300 transform hover:scale-105"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">Sign Out</span>
                        </button>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-gray-300 hover:text-white focus:outline-none p-2 rounded-lg hover:bg-white/10 transition"
                        >
                            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="md:hidden glass border-t border-white/10 overflow-hidden"
                    >
                        <div className="px-4 pt-2 pb-4 space-y-1">
                            <Link to="/" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>Home</Link>
                            <Link to="/info" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>Info</Link>
                            <Link to="/files" className="block px-3 py-3 rounded-lg text-base font-medium text-gray-300 hover:text-white hover:bg-white/10" onClick={() => setIsOpen(false)}>Files</Link>
                            {isAdmin && (
                                <Link to="/admin/users" className="block px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                            )}
                            <button
                                onClick={() => { handleSignOut(); setIsOpen(false); }}
                                className="w-full text-left flex items-center px-3 py-3 rounded-lg text-base font-medium text-red-400 hover:bg-red-500/10"
                            >
                                <LogOut className="w-4 h-4 mr-2" />
                                Sign Out
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </nav>
    );
};

export default Navbar;
