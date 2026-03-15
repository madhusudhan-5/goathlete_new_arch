import { useState, useEffect } from 'react';
import { Plus, X } from 'lucide-react';
import { bookingService, venueService, courtService } from '../../services/api';

export default function BookingsManage() {
    const [bookings, setBookings] = useState([]);
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [filters, setFilters] = useState({
        booking_date: '',
        status: '',
        search: ''
    });

    useEffect(() => {
        loadData();
    }, [filters]);

    const loadData = async () => {
        try {
            const [bookingsData, venuesData] = await Promise.all([
                bookingService.getAll(filters),
                venueService.getAll()
            ]);
            setBookings(bookingsData);
            setVenues(venuesData);
        } catch (error) {
            console.error('Failed to load bookings', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (id: number) => {
        if (!window.confirm('Are you sure you want to cancel this booking?')) return;

        try {
            await bookingService.cancel(id.toString());
            loadData();
        } catch (error) {
            console.error('Failed to cancel booking', error);
            alert('Failed to cancel booking');
        }
    };

    const getStatusBadge = (status: string) => {
        const styles: any = {
            PENDING: 'bg-yellow-100 text-yellow-800',
            CONFIRMED: 'bg-green-100 text-green-800',
            CANCELLED: 'bg-red-100 text-red-800',
            COMPLETED: 'bg-blue-100 text-blue-800'
        };
        return (
            <span className={`px-2 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
                {status}
            </span>
        );
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading bookings...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-navy">Booking Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Manage all venue bookings</p>
                </div>
                <button
                    onClick={() => setShowCreateModal(true)}
                    className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-brand-orange/20 hover:bg-[#c26226] transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} className="mr-2" />
                    New Booking
                </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex gap-4">
                <div className="flex-1">
                    <input
                        type="text"
                        placeholder="Search by booking ID or customer..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <input
                        type="date"
                        value={filters.booking_date}
                        onChange={(e) => setFilters({ ...filters, booking_date: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    />
                </div>
                <div>
                    <select
                        value={filters.status}
                        onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                        className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                        <option value="">All Status</option>
                        <option value="PENDING">Pending</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="CANCELLED">Cancelled</option>
                        <option value="COMPLETED">Completed</option>
                    </select>
                </div>
            </div>

            {/* Bookings Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-[#f8f9fa] border-b-2 border-brand-navy/10 text-brand-navy font-bold text-xs uppercase tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Booking ID</th>
                            <th className="px-6 py-4">Customer</th>
                            <th className="px-6 py-4">Court</th>
                            <th className="px-6 py-4">Date & Time</th>
                            <th className="px-6 py-4">Amount</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                                    No bookings found
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking: any) => (
                                <tr key={booking.id} className="hover:bg-gray-50 transition">
                                    <td className="px-6 py-4 font-bold text-brand-navy">{booking.booking_id}</td>
                                    <td className="px-6 py-4 text-sm font-medium text-gray-700">{booking.customer || 'Walk-in'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-700">{booking.court_name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500 font-medium">
                                        {new Date(booking.booking_date).toLocaleDateString()} {booking.start_time} - {booking.end_time}
                                    </td>
                                    <td className="px-6 py-4 text-brand-orange font-bold text-base">${booking.total_amount}</td>
                                    <td className="px-6 py-4">{getStatusBadge(booking.status)}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            {booking.status === 'PENDING' && (
                                                <button
                                                    onClick={() => handleCancel(booking.id)}
                                                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                                                    title="Cancel"
                                                >
                                                    <X size={16} />
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Create Booking Modal */}
            {showCreateModal && (
                <CreateBookingModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={() => {
                        setShowCreateModal(false);
                        loadData();
                    }}
                    venues={venues}
                />
            )}
        </div>
    );
}

function CreateBookingModal({ onClose, onSuccess, venues }: any) {
    const [courts, setCourts] = useState([]);
    const [formData, setFormData] = useState({
        court: '',
        booking_type: 'OFFLINE',
        booking_date: '',
        start_time: '',
        end_time: '',
        duration_hours: 1,
        price_per_hour: 0,
        total_amount: 0,
        customer_name: '',
        customer_phone: '',
        notes: ''
    });
    const [selectedVenue, setSelectedVenue] = useState('');

    useEffect(() => {
        if (selectedVenue) {
            loadCourts(selectedVenue);
        }
    }, [selectedVenue]);

    const loadCourts = async (venueId: string) => {
        try {
            const data = await courtService.getByVenue(venueId);
            setCourts(data);
        } catch (error) {
            console.error('Failed to load courts', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await bookingService.create(formData);
            onSuccess();
        } catch (error: any) {
            console.error('Failed to create booking', error);
            alert(error.response?.data?.detail || 'Failed to create booking');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">Create Offline Booking</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                            <select
                                value={selectedVenue}
                                onChange={(e) => setSelectedVenue(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Select Venue</option>
                                {venues.map((v: any) => (
                                    <option key={v.id} value={v.id}>{v.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Court</label>
                            <select
                                value={formData.court}
                                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Select Court</option>
                                {courts.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Name</label>
                            <input
                                type="text"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Customer Phone</label>
                            <input
                                type="tel"
                                value={formData.customer_phone}
                                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Booking Date</label>
                            <input
                                type="date"
                                value={formData.booking_date}
                                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Duration (hours)</label>
                            <input
                                type="number"
                                step="0.5"
                                value={formData.duration_hours}
                                onChange={(e) => setFormData({ ...formData, duration_hours: parseFloat(e.target.value) })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price per Hour</label>
                            <input
                                type="number"
                                value={formData.price_per_hour}
                                onChange={(e) => setFormData({
                                    ...formData,
                                    price_per_hour: parseFloat(e.target.value),
                                    total_amount: parseFloat(e.target.value) * formData.duration_hours
                                })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Total Amount</label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                        <textarea
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                            rows={3}
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-5 py-2 border-2 border-gray-200 rounded-lg text-gray-700 font-bold hover:bg-gray-50 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-5 py-2 bg-brand-orange text-white rounded-lg font-bold shadow-md shadow-brand-orange/20 hover:bg-[#c26226] transition"
                        >
                            Create Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
