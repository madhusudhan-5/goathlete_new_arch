import React from 'react';
import { NavLink, useNavigate, Outlet } from 'react-router-dom';
import { LayoutDashboard, Calendar, MapPin, Ticket, LogOut, Menu, List } from 'lucide-react';
import { authService } from '../../services/auth';
import { cn } from '@/lib/utils';

export default function DashboardLayout() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = React.useState(true);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    return (
        <div className="flex h-screen bg-gray-100">
            {/* Sidebar */}
            <aside className={cn(
                "bg-white border-r border-gray-200 transition-all duration-300 flex flex-col fixed h-full z-10 md:relative",
                sidebarOpen ? "w-64" : "w-20"
            )}>
                <div className="p-6 flex items-center justify-between">
                    <h1 className={cn("font-bold text-2xl text-primary truncate", !sidebarOpen && "hidden")}>GoAthlete</h1>
                    <button onClick={() => setSidebarOpen(!sidebarOpen)} className="p-1 rounded hover:bg-gray-100 md:hidden">
                        <Menu size={20} />
                    </button>
                </div>

                <nav className="flex-1 px-4 py-4 space-y-2">
                    <NavItem to="/" icon={<LayoutDashboard size={20} />} label="Dashboard" expanded={sidebarOpen} />
                    <NavItem to="/venues" icon={<MapPin size={20} />} label="Venues" expanded={sidebarOpen} />
                    <NavItem to="/bookings" icon={<Calendar size={20} />} label="Calendar" expanded={sidebarOpen} />
                    <NavItem to="/bookings/manage" icon={<List size={20} />} label="Manage Bookings" expanded={sidebarOpen} />
                    <NavItem to="/tournaments" icon={<Ticket size={20} />} label="Tournaments" expanded={sidebarOpen} />
                </nav>

                <div className="p-4 border-t border-gray-200">
                    <button
                        onClick={handleLogout}
                        className={cn(
                            "flex items-center w-full px-4 py-3 text-red-600 rounded-lg hover:bg-red-50 transition-colors",
                            !sidebarOpen && "justify-center px-2"
                        )}
                    >
                        <LogOut size={20} />
                        <span className={cn("ml-3 font-medium", !sidebarOpen && "hidden")}>Logout</span>
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
            className={({ isActive }) => cn(
                "flex items-center px-4 py-3 rounded-lg transition-colors text-gray-700 hover:bg-gray-50",
                isActive && "bg-primary/10 text-primary font-medium",
                !expanded && "justify-center px-2"
            )}
        >
            {icon}
            <span className={cn("ml-3", !expanded && "hidden")}>{label}</span>
        </NavLink>
    );
}
