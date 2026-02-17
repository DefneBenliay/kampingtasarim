import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
        // Check if it's a chunk load error
        if (error.name === 'ChunkLoadError' || error.message?.includes('Loading chunk') || error.message?.includes('Failed to fetch dynamically imported module')) {
            // Optional: force reload logic if desired, but user button is safer
        }
    }

    handleReload = () => {
        window.location.reload();
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
                    <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl p-8 text-center border border-gray-700">
                        <h2 className="text-2xl font-bold mb-4 text-red-400">Bir şeyler ters gitti</h2>
                        <p className="text-gray-300 mb-6">
                            Sayfa yüklenirken bir hata oluştu. Bu durum genellikle yeni bir güncelleme geldiğinde veya internet bağlantısı kesildiğinde yaşanabilir.
                        </p>
                        <button
                            onClick={this.handleReload}
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium w-full"
                        >
                            Sayfayı Yenile
                        </button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
