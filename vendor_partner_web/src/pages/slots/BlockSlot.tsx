import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { slotBlockService, courtService, partnerService } from '../../services/api';
import { ArrowLeft } from 'lucide-react';

export default function BlockSlot() {
    const navigate = useNavigate();
    const [courts, setCourts] = useState([]);
    const [formData, setFormData] = useState({
        court: '',
        block_date: new Date().toISOString().split('T')[0],
        start_time: '',
        end_time: '',
        reason: ''
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
            await slotBlockService.create(formData);
            alert('Slot blocked successfully!');
            navigate('/');
        } catch (error: any) {
            console.error('Failed to block slot', error);
            alert(error.response?.data?.detail || 'Failed to block slot');
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center gap-4">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-lg">
                    <ArrowLeft size={20} />
                </button>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Block Slot</h1>
                    <p className="text-gray-500 mt-1">Mark court unavailable for maintenance or events</p>
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">Block Date *</label>
                            <input
                                type="date"
                                value={formData.block_date}
                                onChange={(e) => setFormData({ ...formData, block_date: e.target.value })}
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

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-2">Reason *</label>
                            <textarea
                                value={formData.reason}
                                onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                                rows={3}
                                placeholder="e.g., Maintenance, Private Event, etc."
                                required
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
                            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                            Block Slot
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
