import { Outlet, Link } from 'react-router-dom';

const AdminLayout = () => {
    return (
        <div className="flex h-screen bg-gray-100">
            <aside className="w-64 bg-gray-800 text-white p-4">
                <h2 className="text-xl font-bold mb-4">Admin Panel</h2>
                <nav>
                    <ul className="space-y-2">
                        <li><Link to="/admin/users" className="block p-2 hover:bg-gray-700">Users</Link></li>
                        <li><Link to="/" className="block p-2 hover:bg-gray-700">Back to Site</Link></li>
                    </ul>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
export default AdminLayout;
