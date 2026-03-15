import { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, Legend, Tooltip, ResponsiveContainer } from 'recharts';
import { DollarSign, Ticket, MapPin, Users } from 'lucide-react';
import api from '../../services/api';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444'];

export default function Dashboard() {
    const [stats, setStats] = useState<any>(null);
    const [bookings, setBookings] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { loadAll(); }, []);

    const loadAll = async () => {
        try {
            const [statsRes, bookingsRes] = await Promise.all([
                api.get('/partners/admins/dashboard_stats/').catch(() => ({ data: null })),
                api.get('/bookings/').catch(() => ({ data: [] })),
            ]);
            setStats(statsRes.data);
            const items = Array.isArray(bookingsRes.data) ? bookingsRes.data : (bookingsRes.data?.results || []);
            setBookings(items.slice(0, 5));
        } catch (err) {
            console.error('Dashboard load error', err);
        } finally {
            setLoading(false);
        }
    };

    // Group bookings by status for pie chart
    const statusGroups = bookings.reduce((acc: any, b: any) => {
        acc[b.status] = (acc[b.status] || 0) + 1;
        return acc;
    }, {});
    const pieData = Object.entries(statusGroups).map(([name, value]) => ({ name, value }));

    const kpis = [
        { label: 'Today\'s Revenue', value: `₹${(stats?.today_earnings || 0).toLocaleString()}`, icon: <DollarSign size={24} />, color: '#6366f1' },
        { label: 'Today\'s Bookings', value: stats?.today_bookings ?? 0, icon: <Ticket size={24} />, color: '#22c55e' },
        { label: 'Active Partners', value: stats?.active_partners ?? 0, icon: <Users size={24} />, color: '#f59e0b' },
        { label: 'Upcoming (7d)', value: stats?.upcoming_bookings ?? 0, icon: <MapPin size={24} />, color: '#ef4444' },
    ];

    if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-4 border-primary border-t-transparent" /></div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-extrabold text-brand-navy mb-1">Dashboard</h1>
                <p className="text-gray-500 font-medium">
                    {stats?.venue_name ? `Venue: ${stats.venue_name}` : 'Welcome back!'}
                    {stats?.venue_status && <span className="ml-2 text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-bold">{stats.venue_status}</span>}
                </p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {kpis.map((kpi, i) => (
                    <div key={i} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
                        <div className="p-3 rounded-xl" style={{ background: `${kpi.color}18`, color: kpi.color }}>
                            {kpi.icon}
                        </div>
                        <div>
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{kpi.label}</p>
                            <p className="text-2xl font-extrabold text-brand-navy">{kpi.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Booking Status Pie */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-brand-navy mb-4">Booking Status Breakdown</h3>
                    {pieData.length === 0 ? (
                        <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No booking data yet</div>
                    ) : (
                        <div className="h-48">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label>
                                        {pieData.map((_, idx) => <Cell key={idx} fill={COLORS[idx % COLORS.length]} />)}
                                    </Pie>
                                    <Tooltip />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Recent Bookings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-bold text-brand-navy">Recent Bookings</h3>
                        <span className="text-xs text-gray-400">Last 5</span>
                    </div>
                    {bookings.length === 0 ? (
                        <div className="py-10 text-center text-gray-400 text-sm">No bookings found</div>
                    ) : (
                        <div className="space-y-3">
                            {bookings.map((b: any) => (
                                <div key={b.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                    <div>
                                        <p className="font-semibold text-sm text-gray-800">{b.customer_name || b.customer || 'Walk-in'}</p>
                                        <p className="text-xs text-gray-400">{b.court_name} · {b.booking_date}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-brand-orange text-sm">₹{b.total_amount || 0}</p>
                                        <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full ${b.status === 'CONFIRMED' ? 'bg-green-100 text-green-700' :
                                            b.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-gray-100 text-gray-500'
                                            }`}>{b.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
