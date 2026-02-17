import { useState, useEffect, useRef } from 'react';
import { supabase } from '../supabaseClient';
import { useAuth } from '../components/AuthProvider';
import Navbar from '../components/Navbar';
import Modal from '../components/Modal';
import { Folder, FileText, Upload, Plus, ArrowLeft, Trash2, Download, GripVertical, Search } from 'lucide-react';
import { Reorder, motion } from 'framer-motion';

const Files = () => {
    const { isAdmin } = useAuth();
    const [currentFolder, setCurrentFolder] = useState(null);
    const [folders, setFolders] = useState([]);
    const [files, setFiles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    // Modal States
    const [isCreateFolderOpen, setIsCreateFolderOpen] = useState(false);
    const [isUploadFileOpen, setIsUploadFileOpen] = useState(false);

    // Form States
    const [newFolderName, setNewFolderName] = useState('');
    const [uploadFile, setUploadFile] = useState(null);
    const [fileDescription, setFileDescription] = useState('');
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        fetchFolders();
    }, []);

    useEffect(() => {
        if (currentFolder) fetchFiles(currentFolder.id);
        else setFiles([]);
    }, [currentFolder]);

    const fetchFolders = async () => {
        setLoading(true);
        // Order by position primarily
        const { data, error } = await supabase
            .from('folders')
            .select('*')
            .order('position', { ascending: true })
            .order('created_at', { ascending: false });

        if (!error && data) setFolders(data);
        setLoading(false);
    };

    const fetchFiles = async (folderId) => {
        setLoading(true);
        const { data, error } = await supabase
            .from('files')
            .select('*')
            .eq('folder_id', folderId)
            .order('position', { ascending: true })
            .order('created_at', { ascending: false });

        if (!error && data) setFiles(data);
        setLoading(false);
    };

    const updatePositions = async (table, items) => {
        // Optimistic UI already updated. This runs in background.
        const updates = items.map((item, index) => ({
            id: item.id,
            position: index,
            updated_at: new Date()
        }));

        try {
            const { error } = await supabase.from(table).upsert(updates);
            if (error) console.error('Error updating positions:', error);
        } catch (err) {
            console.error('Exception updating positions:', err);
        }
    };

    const handleReorderFolders = (newOrder) => {
        setFolders(newOrder);
        // Debounce or immediate? Immediate is fine for local feedback, API call can be async
        updatePositions('folders', newOrder);
    };

    const handleReorderFiles = (newOrder) => {
        setFiles(newOrder);
        updatePositions('files', newOrder);
    };

    const handleCreateFolder = async (e) => {
        e.preventDefault();
        if (!newFolderName.trim()) return;

        // Put new folder at the end or beginning? Standard is usually end or beginning.
        // Let's get max position or just strict insert. 
        // For simplicity, we just insert.

        const { error } = await supabase.from('folders').insert([{
            name: newFolderName,
            position: folders.length // Appending to end
        }]);

        if (error) alert(error.message);
        else {
            setNewFolderName('');
            setIsCreateFolderOpen(false);
            fetchFolders();
        }
    };

    const handleFileUpload = async (e) => {
        e.preventDefault();
        if (!uploadFile || !currentFolder) return;
        setUploading(true);
        try {
            const fileName = `${Date.now()}-${uploadFile.name}`;
            const filePath = `${currentFolder.id}/${fileName}`;
            const { error: uploadError } = await supabase.storage.from('documents').upload(filePath, uploadFile);
            if (uploadError) throw uploadError;
            const { data: { publicUrl } } = supabase.storage.from('documents').getPublicUrl(filePath);

            const fileExt = uploadFile.name.split('.').pop();
            const isImage = ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(fileExt.toLowerCase());

            await supabase.from('files').insert([{
                folder_id: currentFolder.id,
                name: uploadFile.name,
                description: fileDescription,
                file_url: publicUrl,
                thumbnail_url: isImage ? publicUrl : null,
                position: files.length // Append
            }]);

            setUploadFile(null);
            setFileDescription('');
            setIsUploadFileOpen(false);
            fetchFiles(currentFolder.id);
        } catch (error) { alert(error.message); } finally { setUploading(false); }
    };

    const handleDeleteFolder = async (id, e) => {
        e.stopPropagation(); // Prevent drag start if clicking delete
        if (window.confirm('Delete folder?')) {
            await supabase.from('folders').delete().eq('id', id);
            fetchFolders();
        }
    };

    const handleDeleteFile = async (id, e) => {
        e.stopPropagation();
        if (window.confirm('Delete file?')) {
            await supabase.from('files').delete().eq('id', id);
            fetchFiles(currentFolder.id);
        }
    };

    const filteredFolders = folders.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const filteredFiles = files.filter(f =>
        f.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (f.description && f.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Wrapper for reorder item to cleanly separate drag handle
    const FileItem = ({ item, isFolder }) => {
        return (
            <div className="flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow group">
                <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600">
                    <GripVertical className="w-5 h-5" />
                </div>

                <div
                    className="flex-1 flex items-center gap-4 cursor-pointer"
                    onClick={() => isFolder && setCurrentFolder(item)}
                >
                    <div className="p-3 bg-blue-50 rounded-lg">
                        {isFolder ? (
                            <Folder className="w-8 h-8 text-blue-500" />
                        ) : (
                            item.thumbnail_url ? (
                                <img src={item.thumbnail_url} alt="" loading="lazy" className="w-8 h-8 object-cover rounded" />
                            ) : (
                                <FileText className="w-8 h-8 text-orange-500" />
                            )
                        )}
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 break-words">{item.name}</h4>
                        <p className="text-sm text-gray-500 break-words">
                            {isFolder
                                ? new Date(item.created_at).toLocaleDateString('tr-TR')
                                : item.description || 'Açıklama yok'
                            }
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {!isFolder && (
                        <a
                            href={item.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                            title="İndir / Görüntüle"
                        >
                            <Download className="w-5 h-5" />
                        </a>
                    )}
                    {isAdmin && (
                        <button
                            onClick={(e) => isFolder ? handleDeleteFolder(item.id, e) : handleDeleteFile(item.id, e)}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            title="Sil"
                        >
                            <Trash2 className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        );
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
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                    <div className="flex items-center gap-4">
                        {currentFolder && (
                            <button
                                onClick={() => setCurrentFolder(null)}
                                className="p-2 bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-colors"
                                title="Geri"
                            >
                                <ArrowLeft className="w-5 h-5 text-gray-300" />
                            </button>
                        )}
                        <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                            {currentFolder ? (
                                <>
                                    <Folder className="w-8 h-8 text-blue-400" />
                                    {currentFolder.name}
                                </>
                            ) : (
                                'Tasarım Dosyaları'
                            )}
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-500" />
                            <input
                                type="text"
                                placeholder="Ara..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 bg-gray-800 border border-gray-700 text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm placeholder-gray-500"
                            />
                        </div>

                        {isAdmin && (
                            <button
                                onClick={() => currentFolder ? setIsUploadFileOpen(true) : setIsCreateFolderOpen(true)}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center text-sm font-medium whitespace-nowrap border-none cursor-pointer"
                            >
                                {currentFolder ? (
                                    <>
                                        <Upload className="w-4 h-4 mr-2" />
                                        Dosya Yükle
                                    </>
                                ) : (
                                    <>
                                        <Plus className="w-4 h-4 mr-2" />
                                        Yeni Klasör
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-xl border border-gray-700 overflow-hidden min-h-[500px]">
                    <div className="p-6">
                        {!currentFolder ? (
                            // Folders List
                            filteredFolders.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                                    <Folder className="w-16 h-16 text-gray-600 mb-4" />
                                    <p className="text-gray-500">Henüz klasör oluşturulmadı.</p>
                                </div>
                            ) : (
                                <Reorder.Group
                                    axis="y"
                                    values={folders}
                                    onReorder={handleReorderFolders}
                                    className="space-y-3"
                                >
                                    {filteredFolders.map((folder) => (
                                        <Reorder.Item key={folder.id} value={folder} as="div">
                                            <FileItem item={folder} isFolder={true} />
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )
                        ) : (
                            // Files List
                            filteredFiles.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-gray-800/50 rounded-lg border-2 border-dashed border-gray-700">
                                    <FileText className="w-16 h-16 text-gray-600 mb-4" />
                                    <p className="text-gray-500">Bu klasörde henüz dosya yok.</p>
                                </div>
                            ) : (
                                <Reorder.Group
                                    axis="y"
                                    values={files}
                                    onReorder={handleReorderFiles}
                                    className="space-y-3"
                                >
                                    {filteredFiles.map((file) => (
                                        <Reorder.Item key={file.id} value={file} as="div">
                                            <FileItem item={file} isFolder={false} />
                                        </Reorder.Item>
                                    ))}
                                </Reorder.Group>
                            )
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <Modal isOpen={isCreateFolderOpen} onClose={() => setIsCreateFolderOpen(false)} title="Yeni Klasör">
                <form onSubmit={handleCreateFolder} className="flex flex-col gap-4">
                    <input
                        autoFocus
                        type="text"
                        value={newFolderName}
                        onChange={e => setNewFolderName(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 text-gray-100 rounded font-sans focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Klasör Adı"
                        required
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsCreateFolderOpen(false)}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                        >
                            Oluştur
                        </button>
                    </div>
                </form>
            </Modal>
            <Modal isOpen={isUploadFileOpen} onClose={() => setIsUploadFileOpen(false)} title="Dosya Yükle">
                <form onSubmit={handleFileUpload} className="flex flex-col gap-4">
                    <input
                        type="file"
                        onChange={e => setUploadFile(e.target.files[0])}
                        className="w-full p-2 border border-gray-600 rounded text-sm text-gray-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-900 file:text-blue-300 hover:file:bg-blue-800"
                        required
                    />
                    <textarea
                        value={fileDescription}
                        onChange={e => setFileDescription(e.target.value)}
                        className="w-full p-3 bg-gray-800 border border-gray-600 text-gray-100 rounded min-h-[100px] focus:outline-none focus:ring-2 focus:ring-blue-500 font-sans"
                        placeholder="Açıklama"
                    />
                    <div className="flex justify-end gap-2">
                        <button
                            type="button"
                            onClick={() => setIsUploadFileOpen(false)}
                            className="px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600"
                        >
                            İptal
                        </button>
                        <button
                            type="submit"
                            disabled={uploading}
                            className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
                        >
                            {uploading ? 'Yükleniyor...' : 'Yükle'}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
};
export default Files;
