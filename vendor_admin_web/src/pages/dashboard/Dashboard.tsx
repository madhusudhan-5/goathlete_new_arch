import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Ticket, MapPin } from 'lucide-react';
import { bookingService } from '../../services/api';

export default function Dashboard() {
    const [stats, setStats] = useState({
        total_revenue: 0,
        total_bookings: 0,
        trends: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            const data = await bookingService.getAnalytics();
            setStats(data);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    // Transform backend trends for Recharts
    const chartData = stats.trends.map((t: any) => ({
        name: new Date(t.date).toLocaleDateString('en-US', { weekday: 'short' }),
        revenue: t.revenue || 0
    }));

    if (loading) return <div className="p-8 text-center text-gray-500">Loading dashboard...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="text-gray-500 mt-1">Welcome back, here's what's happening today.</p>
                </div>
                <button className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50 transition">
                    Last 30 Days
                </button>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">${(stats.total_revenue || 0).toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                        <Ticket size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.total_bookings}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
                        <MapPin size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Venues</p>
                        <h3 className="text-2xl font-bold text-gray-900">1</h3>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900 mb-6">Revenue Trend</h3>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF', fontSize: 12 }} tickFormatter={(val) => `$${val}`} />
                                <Tooltip cursor={{ fill: '#F3F4F6' }} contentStyle={{ border: 'none', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }} />
                                <Bar dataKey="revenue" fill="#4F46E5" radius={[4, 4, 0, 0]} barSize={32} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                        <button className="text-sm text-primary font-medium hover:underline">View All</button>
                    </div>

                    <div className="space-y-4">
                        <div className="py-12 text-center text-gray-400 text-sm">
                            Recent booking activity will appear here.
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
