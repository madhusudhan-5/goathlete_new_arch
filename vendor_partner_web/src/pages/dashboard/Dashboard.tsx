import { useState, useEffect } from 'react';
import { partnerService } from '../../services/api';
import { Calendar, DollarSign, Users, Clock } from 'lucide-react';

export default function Dashboard() {
    const [stats, setStats] = useState({
        today_bookings: 0,
        my_bookings_today: 0,
        venue_name: ''
    });
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [statsData, profileData] = await Promise.all([
                partnerService.getDashboardStats(),
                partnerService.getProfile()
            ]);
            setStats(statsData);
            setProfile(profileData);
        } catch (error) {
            console.error('Failed to load dashboard data', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-500 mt-1">Welcome back, {profile?.user?.first_name || 'Partner'}!</p>
                <p className="text-sm text-gray-400 mt-1">{stats.venue_name}</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-blue-50 text-blue-600 mr-4">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Today's Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.today_bookings}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-green-50 text-green-600 mr-4">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">My Bookings</p>
                        <h3 className="text-2xl font-bold text-gray-900">{stats.my_bookings_today}</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-purple-50 text-purple-600 mr-4">
                        <Clock size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Active Now</p>
                        <h3 className="text-2xl font-bold text-gray-900">-</h3>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center">
                    <div className="p-3 rounded-full bg-orange-50 text-orange-600 mr-4">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Today's Revenue</p>
                        <h3 className="text-2xl font-bold text-gray-900">-</h3>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <a
                        href="/bookings/create"
                        className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-center"
                    >
                        <Calendar className="mx-auto mb-2 text-primary" size={32} />
                        <p className="font-medium text-gray-900">Create Booking</p>
                    </a>
                    <a
                        href="/courts"
                        className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-center"
                    >
                        <Users className="mx-auto mb-2 text-primary" size={32} />
                        <p className="font-medium text-gray-900">View Courts</p>
                    </a>
                    <a
                        href="/slots/block"
                        className="p-4 border-2 border-dashed border-gray-200 rounded-lg hover:border-primary hover:bg-primary/5 transition text-center"
                    >
                        <Clock className="mx-auto mb-2 text-primary" size={32} />
                        <p className="font-medium text-gray-900">Block Slot</p>
                    </a>
                </div>
            </div>
        </div>
    );
}
