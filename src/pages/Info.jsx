import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import { Edit, Save, X } from 'lucide-react';

const Info = () => {
    const { isAdmin } = useAuth();
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchContent(); }, []);

    const fetchContent = async () => {
        try {
            const { data } = await supabase.from('site_content').select('content').eq('section', 'info').single();
            const val = data?.content || '<p class="text-gray-400">No information available yet.</p>';
            setContent(val); setEditValue(val);
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            const { error } = await supabase.from('site_content').upsert({ section: 'info', content: editValue, updated_at: new Date() });
            if (error) throw error;
            setContent(editValue); setIsEditing(false);
        } catch (error) { alert('Error: ' + error.message); }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-gray-900 font-sans">
            <div className="text-gray-400 text-lg">Yükleniyor...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
            <Navbar />
            <div className="max-w-5xl mx-auto px-4 py-10 mt-16">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-white tracking-tight">
                        Bilgilendirme
                    </h1>
                    {isAdmin && (
                        <button
                            onClick={() => isEditing ? setIsEditing(false) : setIsEditing(true)}
                            className={`px-4 py-2 rounded text-white text-sm flex items-center shadow transition-colors ${isEditing ? 'bg-gray-600 hover:bg-gray-500' : 'bg-blue-600 hover:bg-blue-700'}`}
                        >
                            {isEditing ? (
                                <>
                                    <X className="w-4 h-4 mr-1" />
                                    İptal
                                </>
                            ) : (
                                <>
                                    <Edit className="w-4 h-4 mr-1" />
                                    Düzenle
                                </>
                            )}
                        </button>
                    )}
                </div>

                <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden">
                    <div className="p-8 md:p-12">
                        {isEditing ? (
                            <div>
                                <div className="p-3 bg-blue-900/30 border border-blue-800 rounded text-sm text-blue-300 mb-4">
                                    <strong>💡 İpucu:</strong> İçeriğinizi HTML etiketleriyle formatlayabilirsiniz (h2, p, ul, img, vb.)
                                </div>
                                <textarea
                                    value={editValue}
                                    onChange={(e) => setEditValue(e.target.value)}
                                    className="w-full min-h-[400px] p-3 bg-gray-900 border border-gray-700 text-gray-100 rounded font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
                                    placeholder="HTML içeriğinizi buraya girin..."
                                />
                                <div className="mt-4 text-right">
                                    <button
                                        onClick={handleSave}
                                        className="px-5 py-2.5 bg-blue-600 text-white rounded shadow flex items-center ml-auto hover:bg-blue-700 transition-all border-none cursor-pointer"
                                    >
                                        <Save className="w-4 h-4 mr-1" />
                                        Kaydet
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div
                                className="prose prose-lg prose-invert max-w-none text-gray-300"
                                dangerouslySetInnerHTML={{ __html: content || '<p class="text-gray-500">Henüz bir bilgilendirme metni girilmedi.</p>' }}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Info;
