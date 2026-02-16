import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, LogOut, Menu, Clock } from 'lucide-react';
import { authService } from '../../services/api';
import { useState } from 'react';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={`bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-10 md:relative ${sidebarOpen ? 'w-64' : 'w-20'
                }`}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className={`font-bold text-2xl text-primary truncate ${!sidebarOpen && 'hidden'}`}>Partner</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100 md:hidden">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" expanded={sidebarOpen} />
                    <NavItem to="/courts" icon={<MapPin size={20} />} label="Courts" expanded={sidebarOpen} />
                    <NavItem to="/bookings/create" icon={<Calendar size={20} />} label="New Booking" expanded={sidebarOpen} />
                    <NavItem to="/slots/block" icon={<Clock size={20} />} label="Block Slot" expanded={sidebarOpen} />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={`flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors ${!sidebarOpen && 'justify-center px-2'
                            }`}
                    >
                        <LogOut size={20} />
                        <span className={`ml-3 font-medium ${!sidebarOpen && 'hidden'}`}>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-1 overflow-auto">
                <header className="bg-white shadow-sm h-16 flex items-center px-6 justify-between md:hidden">
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-2">
                        <Menu size={24} />
                    </button>
                    <span className="font-bold text-lg">Partner Dashboard</span>
                </header>
                <div className="p-6 md:p-8 max-w-7xl mx-auto">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}

function NavItem({ to, icon, label, expanded }: { to: string, icon: React.ReactNode, label: string, expanded: boolean }) {
    return (
        <NavLink
            to={to}
            end={to === '/'}
            className={({ isActive }) => `flex items-center px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50 ${isActive && 'bg-primary/10 text-primary font-medium'
                } ${!expanded && 'justify-center px-2'}`}
        >
            {icon}
            <span className={`ml-3 ${!expanded && 'hidden'}`}>{label}</span>
        </NavLink>
    );
}
