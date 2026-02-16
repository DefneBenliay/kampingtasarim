import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import { Edit, Save, X, ArrowRight, Upload } from 'lucide-react';
import { motion } from 'framer-motion';

const Home = () => {
    const { isAdmin } = useAuth();
    const [content, setContent] = useState({
        title: 'Kamping Planlama ve Tasarımı\'na Hoşgeldiniz',
        description: 'Premium kamp planlama deneyiminiz buradan başlıyor.',
        image_url: 'https://images.unsplash.com/photo-1499951360447-b19be8fe80f5?ixlib=rb-1.2.1&auto=format&fit=crop&w=1500&q=80'
    });
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({ ...content });
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        console.log('Home mounted');
        fetchContent();

        // Safety timeout in case fetch hangs indefinitely
        const timer = setTimeout(() => {
            setLoading(false);
        }, 5000);
        return () => clearTimeout(timer);
    }, []);

    const fetchContent = async () => {
        setLoading(true);
        try {
            console.log('Fetching home content...');
            const { data, error } = await supabase
                .from('site_content')
                .select('*')
                .eq('section', 'home')
                .order('created_at', { ascending: false })
                .limit(1);

            if (error) {
                console.error('Error fetching content:', error);
                // Don't alert here to avoid blocking UI
            }

            console.log('Raw Data:', data);

            let hasData = false;
            if (data && data.length > 0) {
                const row = data[0];
                let contentData = null;

                try {
                    if (row.content) {
                        if (typeof row.content === 'string') {
                            // Only try parsing if it looks like a JSON object/array
                            const trimmed = row.content.trim();
                            if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
                                contentData = JSON.parse(row.content);
                            } else {
                                console.warn('Content is string but not JSON:', row.content);
                            }
                        } else if (typeof row.content === 'object') {
                            contentData = row.content;
                        }
                    }
                } catch (e) {
                    console.error('JSON Parse error:', e);
                }

                if (contentData) {
                    console.log('Parsed Content:', contentData);
                    const mergedContent = {
                        title: String(contentData.title || 'Hoşgeldiniz'),
                        description: String(contentData.description || 'Web sitemize hoş geldiniz.'),
                        image_url: String(contentData.image_url || ''),
                        id: row.id
                    };
                    setContent(mergedContent);
                    setEditForm(mergedContent);
                    hasData = true;
                }
            }

            if (!hasData) {
                console.log('No valid content found, using defaults.');
                const defaultContent = {
                    title: 'Hoşgeldiniz',
                    description: 'Web sitemize hoş geldiniz. Sol üst köşedeki menüden istediğiniz bölüme geçiş yapabilirsiniz.',
                    image_url: ''
                };
                setContent(defaultContent);
                setEditForm(defaultContent);
            }

        } catch (error) {
            console.error('Critical Error in fetchContent:', error);
            // Fallback content on error
            const defaultContent = {
                title: 'Hoşgeldiniz',
                description: 'Web sitemize hoş geldiniz. Sol üst köşedeki menüden istediğiniz bölüme geçiş yapabilirsiniz.',
                image_url: ''
            };
            setContent(defaultContent);
            setEditForm(defaultContent);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            const contentPayload = {
                title: editForm.title || '',
                description: editForm.description || '',
                image_url: editForm.image_url || ''
            };

            const updates = {
                section: 'home',
                content: contentPayload, // Store as JSON/Object in content column
                updated_at: new Date()
            };

            // If we have an ID, update existing row
            if (content.id) {
                updates.id = content.id;
            }

            const { data, error } = await supabase
                .from('site_content')
                .upsert(updates)
                .select();

            if (error) {
                console.error('Supabase error:', error);
                throw error;
            }

            if (data && data.length > 0) {
                const row = data[0];
                const savedContent = typeof row.content === 'string'
                    ? JSON.parse(row.content)
                    : row.content;

                const refinedData = {
                    ...savedContent,
                    id: row.id
                };

                setContent(refinedData);
                setEditForm(refinedData);
                setIsEditing(false);
                alert('Değişiklikler başarıyla kaydedildi!');
            } else {
                await fetchContent();
                setIsEditing(false);
                alert('Değişiklikler kaydedildi!');
            }
        } catch (error) {
            console.error('Error saving content:', error);
            alert('Hata: ' + (error.message || 'Bilinmeyen bir hata oluştu'));
        }
    };

    const handleImageUpload = async (e) => {
        try {
            setUploading(true);
            const file = e.target.files[0];
            if (!file) return;

            // Dosya tipi kontrolü
            if (!file.type.startsWith('image/')) {
                alert('Lütfen bir resim dosyası seçin!');
                return;
            }

            const fileExt = file.name.split('.').pop();
            const fileName = `home-hero-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `${fileName}`;

            // Eski dosyayı sil (eğer varsa)
            if (editForm.image_url && editForm.image_url.includes('supabase')) {
                const oldFileName = editForm.image_url.split('/').pop();
                if (oldFileName) {
                    await supabase.storage.from('images').remove([oldFileName]);
                }
            }

            // Yeni dosyayı yükle
            const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

            if (uploadError) throw uploadError;

            // Public URL'i al
            const { data: urlData } = supabase.storage.from('images').getPublicUrl(filePath);

            if (urlData && urlData.publicUrl) {
                setEditForm(prev => ({ ...prev, image_url: urlData.publicUrl }));
                alert('Resim başarıyla yüklendi!');
            } else {
                throw new Error('Resim URL\'si alınamadı');
            }
        } catch (error) {
            console.error('Image upload error:', error);
            alert('Resim yükleme hatası: ' + (error.message || 'Bilinmeyen bir hata oluştu'));
        } finally {
            setUploading(false);
        }
    };

    if (loading) return (
        <div className="flex justify-center items-center h-screen bg-white font-sans">
            <div className="text-gray-500 text-lg">Yükleniyor...</div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 font-sans text-gray-100">
            <Navbar />

            <div className="max-w-5xl mx-auto px-4 py-10 mt-16">
                {/* Admin Controls */}
                {isAdmin && (
                    <div className="fixed bottom-5 right-5 z-50">
                        {isEditing ? (
                            <div className="flex gap-2 bg-gray-800 p-2 rounded-lg shadow-lg border border-gray-700">
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 bg-gray-700 border border-gray-600 text-gray-200 rounded cursor-pointer text-sm flex items-center hover:bg-gray-600"
                                >
                                    <X className="w-4 h-4 mr-1" />
                                    İptal
                                </button>
                                <button
                                    onClick={handleSave}
                                    className="px-4 py-2 bg-blue-600 text-white rounded cursor-pointer text-sm flex items-center hover:bg-blue-700 border-none"
                                >
                                    <Save className="w-4 h-4 mr-1" />
                                    Kaydet
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => {
                                    setEditForm({ ...content });
                                    setIsEditing(true);
                                }}
                                className="px-5 py-2.5 bg-blue-600 text-white rounded shadow-lg flex items-center cursor-pointer text-sm hover:bg-blue-700 transition-all border-none"
                            >
                                <Edit className="w-4 h-4 mr-1" />
                                Düzenle
                            </button>
                        )}
                    </div>
                )}

                {/* Main Content Card - "Image Template" Style */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden"
                >
                    <div className="p-8 md:p-12">
                        {isEditing ? (
                            <div className="mb-8">
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full text-3xl font-bold p-3 bg-gray-900 border border-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Başlık"
                                />
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    className="w-full text-base p-3 bg-gray-900 border border-gray-700 text-gray-300 rounded min-h-[150px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-inherit"
                                    placeholder="Açıklama"
                                />
                                {isEditing && (
                                    <div className="mt-4">
                                        <label className="block mb-2 text-sm font-medium text-gray-300">
                                            Resim Yükle
                                        </label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="mb-2 w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                                        />
                                        {uploading && <div className="text-gray-400 text-sm">Yükleniyor...</div>}
                                    </div>
                                )}
                            </div>
                        ) : (
                            <>
                                <h1 className="text-4xl font-bold mb-6 text-white tracking-tight">
                                    {content.title || 'Hoşgeldiniz'}
                                </h1>
                                <p className="text-lg leading-relaxed mb-8 text-gray-300">
                                    {content.description || 'Web sitemize hoş geldiniz. Sol üst köşedeki menüden istediğiniz bölüme geçiş yapabilirsiniz.'}
                                </p>
                                {content.image_url && (
                                    <div className="mt-8 rounded-lg overflow-hidden shadow-md">
                                        <img
                                            src={content.image_url}
                                            alt="Hero"
                                            className="w-full h-auto object-cover"
                                        />
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default Home;
