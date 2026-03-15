import React, { useState } from 'react';
import { NavLink, useNavigate, Outlet, useLocation } from 'react-router-dom';
import {
    LayoutDashboard, MapPin, Calendar, List, Trophy,
    Users, LogOut, Menu, ChevronRight, Bell,
    Building2, ShieldCheck
} from 'lucide-react';
import { authService } from '../../services/auth';

// ─── Nav structure ─────────────────────────────────────────────────────────
type NavItemType = { to: string; label: string; icon: React.ReactNode; exact?: boolean };
type NavGroupType = { label: string; items: NavItemType[] };

const NAV_GROUPS: NavGroupType[] = [
    {
        label: 'Overview',
        items: [
            { to: '/', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
        ],
    },
    {
        label: 'Venue',
        items: [
            { to: '/venues', label: 'My Venues', icon: <MapPin size={18} /> },
        ],
    },
    {
        label: 'Bookings',
        items: [
            { to: '/bookings', label: 'Calendar View', icon: <Calendar size={18} /> },
            { to: '/bookings/manage', label: 'Manage Bookings', icon: <List size={18} /> },
        ],
    },
    {
        label: 'People',
        items: [
            { to: '/users', label: 'Partners', icon: <Users size={18} /> },
        ],
    },
    {
        label: 'More',
        items: [
            { to: '/tournaments', label: 'Tournaments', icon: <Trophy size={18} /> },
            { to: '/requests', label: 'Requests', icon: <ShieldCheck size={18} /> },
        ],
    },
];

export default function DashboardLayout() {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);
    const [mobileOpen, setMobileOpen] = useState(false);
    const user = authService.getUser?.() || JSON.parse(localStorage.getItem('user') || '{}');

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    // Active page title
    const allItems = NAV_GROUPS.flatMap(g => g.items);
    const activeItem = allItems.find(item =>
        item.exact ? location.pathname === item.to : location.pathname.startsWith(item.to) && item.to !== '/'
    ) || allItems.find(i => i.exact && location.pathname === '/');
    const pageTitle = activeItem?.label || 'Venue Admin';

    const sidebarClasses = `
        bg-gradient-to-b from-[#0A1F35] to-[#0d2847]
        flex flex-col h-full transition-all duration-300 ease-in-out
        ${collapsed ? 'w-[72px]' : 'w-64'}
    `;

    const SidebarContent = () => (
        <div className={sidebarClasses}>
            {/* Logo */}
            <div className={`flex items-center px-4 py-5 border-b border-white/10 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                {!collapsed && (
                    <div>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                                <Building2 size={16} className="text-white" />
                            </div>
                            <span className="text-white font-extrabold text-lg tracking-wide">GoAthlete</span>
                        </div>
                        <span className="text-[10px] text-brand-orange font-bold uppercase tracking-widest mt-0.5 ml-10">Venue Admin</span>
                    </div>
                )}
                {collapsed && (
                    <div className="w-8 h-8 bg-brand-orange rounded-lg flex items-center justify-center">
                        <Building2 size={16} className="text-white" />
                    </div>
                )}
                <button
                    onClick={() => setCollapsed(c => !c)}
                    className="hidden md:flex w-7 h-7 bg-white/10 hover:bg-white/20 rounded-lg items-center justify-center transition text-white"
                >
                    {collapsed ? <ChevronRight size={14} /> : <Menu size={14} />}
                </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 py-4 px-2 overflow-y-auto space-y-1 scrollbar-thin">
                {NAV_GROUPS.map((group) => (
                    <div key={group.label} className="mb-2">
                        {!collapsed && (
                            <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-white/30 px-3 mb-1.5 mt-3 first:mt-0">
                                {group.label}
                            </p>
                        )}
                        {group.items.map((item) => (
                            <NavLink
                                key={item.to}
                                to={item.to}
                                end={item.exact}
                                onClick={() => setMobileOpen(false)}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 group
                                    ${isActive
                                        ? 'bg-brand-orange text-white shadow-lg shadow-brand-orange/30'
                                        : 'text-white/60 hover:bg-white/10 hover:text-white'
                                    }
                                    ${collapsed ? 'justify-center px-0 mx-1' : ''}`
                                }
                                title={collapsed ? item.label : undefined}
                            >
                                <span className="shrink-0">{item.icon}</span>
                                {!collapsed && <span className="truncate">{item.label}</span>}
                            </NavLink>
                        ))}
                    </div>
                ))}
            </nav>

            {/* User Profile */}
            <div className={`border-t border-white/10 p-3 ${collapsed ? 'items-center flex flex-col gap-2' : ''}`}>
                {!collapsed && (
                    <div className="flex items-center gap-3 px-2 py-2 mb-1">
                        <div className="w-9 h-9 rounded-xl bg-brand-orange/20 border border-brand-orange/30 flex items-center justify-center text-brand-orange font-bold text-sm shrink-0">
                            {(user?.email?.[0] || 'V').toUpperCase()}
                        </div>
                        <div className="min-w-0">
                            <p className="text-white text-sm font-semibold truncate">{user?.email || 'Venue Admin'}</p>
                            <p className="text-white/40 text-xs truncate">Venue Admin</p>
                        </div>
                    </div>
                )}
                <button
                    onClick={handleLogout}
                    className={`flex items-center gap-3 w-full px-3 py-2 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition text-sm font-medium
                        ${collapsed ? 'justify-center px-0' : ''}`}
                    title={collapsed ? 'Logout' : undefined}
                >
                    <LogOut size={17} />
                    {!collapsed && <span>Logout</span>}
                </button>
            </div>
        </div>
    );

    return (
        <div className="flex h-screen bg-[#f0f2f5] overflow-hidden">
            {/* Desktop Sidebar */}
            <aside className="hidden md:block h-full shrink-0">
                <SidebarContent />
            </aside>

            {/* Mobile Overlay */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 flex md:hidden">
                    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
                    <aside className="relative z-50 h-full w-64">
                        <SidebarContent />
                    </aside>
                </div>
            )}

            {/* Main */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {/* Top Header */}
                <header className="bg-white border-b border-gray-200 h-14 flex items-center px-4 md:px-6 shrink-0 shadow-sm">
                    <button
                        className="md:hidden mr-3 p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition"
                        onClick={() => setMobileOpen(true)}
                    >
                        <Menu size={20} />
                    </button>

                    {/* Breadcrumb */}
                    <div className="flex items-center gap-2">
                        <span className="text-gray-400 text-sm hidden sm:block">Venue Admin</span>
                        <span className="text-gray-300 hidden sm:block">/</span>
                        <span className="font-semibold text-gray-800 text-sm">{pageTitle}</span>
                    </div>

                    {/* Right side */}
                    <div className="ml-auto flex items-center gap-3">
                        <button className="relative p-2 rounded-lg hover:bg-gray-100 text-gray-500 transition">
                            <Bell size={18} />
                        </button>

                        <div className="hidden sm:flex items-center gap-2 pl-3 border-l border-gray-200">
                            <div className="w-8 h-8 rounded-lg bg-brand-navy/10 border border-brand-navy/20 flex items-center justify-center text-brand-navy font-bold text-sm">
                                {(user?.email?.[0] || 'V').toUpperCase()}
                            </div>
                            <div className="text-right">
                                <p className="text-sm font-semibold text-gray-800 leading-tight truncate max-w-[140px]">{user?.email || 'Venue Admin'}</p>
                                <p className="text-[10px] text-brand-orange font-bold">Venue Admin</p>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto">
                    <div className="p-4 md:p-7 max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
