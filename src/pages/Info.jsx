import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import { Edit, Save, X, Upload, Copy, Image as ImageIcon, Trash2 } from 'lucide-react';

const Info = () => {
    const { isAdmin } = useAuth();
    const [content, setContent] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadedImages, setUploadedImages] = useState([]);

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
        } catch (error) { alert('Hata: ' + error.message); }
    };

    const handleImageUpload = async (event) => {
        try {
            setUploading(true);
            const file = event.target.files[0];
            if (!file) return;

            const fileExt = file.name.split('.').pop();
            const fileName = `${Math.random()}.${fileExt}`;
            const filePath = `${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('images')
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            const { data } = supabase.storage.from('images').getPublicUrl(filePath);

            // Add to local list of uploaded images for this session
            setUploadedImages(prev => [{
                name: file.name,
                url: data.publicUrl,
                storagePath: filePath
            }, ...prev]);

            alert('Resim yüklendi!');
        } catch (error) {
            alert('Yükleme hatası: ' + error.message);
        } finally {
            setUploading(false);
        }
    };

    const handleImageDelete = async (image) => {
        if (!window.confirm('Bu resmi silmek istediğinize emin misiniz?')) return;

        try {
            // If storagePath is missing (old uploads), we can't easily delete from storage without parsing URL
            if (image.storagePath) {
                const { error } = await supabase.storage
                    .from('images')
                    .remove([image.storagePath]);

                if (error) throw error;
            }

            setUploadedImages(prev => prev.filter(img => img.url !== image.url));
            alert('Resim silindi.');
        } catch (error) {
            console.error('Silme hatası:', error);
            alert('Resim silinirken hata oluştu: ' + error.message);
        }
    };

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        alert('URL kopyalandı!');
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
                        Tanıtım
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

                                {/* Image Upload Section */}
                                <div className="mb-6 p-4 bg-gray-900 rounded-lg border border-gray-700">
                                    <h3 className="text-sm font-semibold text-gray-300 mb-3 flex items-center">
                                        <ImageIcon className="w-4 h-4 mr-2" />
                                        Resim Yükle
                                    </h3>
                                    <div className="flex items-center gap-4">
                                        <label className={`flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 rounded cursor-pointer transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                            <Upload className="w-4 h-4 text-gray-300" />
                                            <span className="text-sm text-gray-200">{uploading ? 'Yükleniyor...' : 'Dosya Seç'}</span>
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                disabled={uploading}
                                                className="hidden"
                                            />
                                        </label>
                                    </div>

                                    {/* Uploaded Images List */}
                                    {uploadedImages.length > 0 && (
                                        <div className="mt-4 space-y-2">
                                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Son Yüklenenler</p>
                                            {uploadedImages.map((img, idx) => (
                                                <div key={idx} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <img src={img.url} alt="Preview" className="w-8 h-8 object-cover rounded" />
                                                        <span className="text-xs text-gray-400 truncate max-w-[200px]">{img.name}</span>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-xs text-gray-500 font-mono truncate max-w-[150px] hidden sm:block">{img.url}</span>
                                                        <button
                                                            onClick={() => copyToClipboard(`<img src="${img.url}" alt="${img.name}" class="w-full rounded-lg my-4" />`)}
                                                            className="p-1.5 hover:bg-gray-700 rounded text-gray-400 hover:text-white transition-colors"
                                                            title="HTML Kodunu Kopyala"
                                                        >
                                                            <Copy className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleImageDelete(img)}
                                                            className="p-1.5 hover:bg-red-900/30 rounded text-gray-400 hover:text-red-400 transition-colors"
                                                            title="Resmi Sil"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
