import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingService, courtService, partnerService } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function CreateBooking() {
    const navigate = useNavigate();
    const [courts, setCourts] = useState([]);
    const [formData, setFormData] = useState({
        court: '',
        booking_type: 'OFFLINE',
        booking_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        duration_hours: 1,
        price_per_hour: 0,
        total_amount: 0,
        customer_name: '',
        customer_phone: '',
        notes: ''
    });

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profileData = await partnerService.getProfile();

            if (profileData.venue?.id) {
                const courtsData = await courtService.getByVenue(profileData.venue.id);
                setCourts(courtsData);
            }
        } catch (error) {
            console.error('Failed to load data', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await bookingService.create(formData);
            alert('Booking created successfully!');
            navigate('/');
        } catch (error: any) {
            console.error('Failed to create booking', error);
            alert(error.response?.data?.detail || 'Failed to create booking');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Create Booking</h1>
                    <p className="text-gray-500 mt-1">Walk-in customer booking</p>
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Court *</label>
                            <select
                                value={formData.court}
                                onChange={(e) => setFormData({ ...formData, court: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            >
                                <option value="">Select Court</option>
                                {courts.map((c: any) => (
                                    <option key={c.id} value={c.id}>{c.name} - {c.sport}</option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Booking Date *</label>
                            <input
                                type="date"
                                value={formData.booking_date}
                                onChange={(e) => setFormData({ ...formData, booking_date: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Name *</label>
                            <input
                                type="text"
                                value={formData.customer_name}
                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Customer Phone *</label>
                            <input
                                type="tel"
                                value={formData.customer_phone}
                                onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Start Time *</label>
                            <input
                                type="time"
                                value={formData.start_time}
                                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">End Time *</label>
                            <input
                                type="time"
                                value={formData.end_time}
                                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Duration (hours) *</label>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Price per Hour *</label>
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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Total Amount</label>
                            <input
                                type="number"
                                value={formData.total_amount}
                                readOnly
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Notes</label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                            />
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            className="px-6 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
                        >
                            Create Booking
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
