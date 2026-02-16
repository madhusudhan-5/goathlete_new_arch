import React, { useState } from 'react';
import { ArrowLeft, Save, AlertCircle, Clock, DollarSign } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { venueService } from '../../services/api';

export default function SlotRules() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    const [formData, setFormData] = useState({
        start_time: '06:00',
        end_time: '22:00',
        duration_minutes: 60,
        base_price: 100,
        days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],

        // Peak config
        has_peak: false,
        peak_start_time: '18:00',
        peak_end_time: '21:00',
        peak_price: 150
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const payload: any = {
                start_time: formData.start_time,
                end_time: formData.end_time,
                duration_minutes: parseInt(formData.duration_minutes.toString()),
                days: formData.days,
                base_price: parseFloat(formData.base_price.toString()),
            };

            if (formData.has_peak) {
                payload.peak_start_time = formData.peak_start_time;
                payload.peak_end_time = formData.peak_end_time;
                payload.peak_price = parseFloat(formData.peak_price.toString());
            }

            const result = await venueService.generateSlots(id!, payload);
            setSuccess(result.message || 'Slots generated successfully!');

            // Redirect to calendar or courts list after short delay?
            setTimeout(() => {
                navigate('/bookings');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            setError(err.response?.data?.error || 'Failed to generate slots. Please check your inputs.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button
                onClick={() => navigate('/venues')}
                className="flex items-center text-gray-500 hover:text-gray-900 transition"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Venues
            </button>

            <div>
                <h1 className="text-3xl font-bold text-gray-900">Slot & Pricing Rules</h1>
                <p className="text-gray-500 mt-1">Configure operating hours and automated pricing for your venue.</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-8">
                {success && (
                    <div className="mb-6 bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg flex items-center">
                        <Clock className="mr-2" size={20} />
                        {success}
                    </div>
                )}

                {error && (
                    <div className="mb-6 bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg flex items-center">
                        <AlertCircle className="mr-2" size={20} />
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-8">
                    {/* Operating Hours */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <Clock className="mr-2 text-primary" size={20} />
                            Operating Hours
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Open Time</label>
                                <input type="time" name="start_time" value={formData.start_time} onChange={handleChange} className="w-full border p-2 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Close Time</label>
                                <input type="time" name="end_time" value={formData.end_time} onChange={handleChange} className="w-full border p-2 rounded-lg" required />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Slot Duration (mins)</label>
                                <select name="duration_minutes" value={formData.duration_minutes} onChange={handleChange} className="w-full border p-2 rounded-lg">
                                    <option value={30}>30 Minutes</option>
                                    <option value={60}>60 Minutes (1 Hour)</option>
                                    <option value={90}>90 Minutes</option>
                                    <option value={120}>120 Minutes (2 Hours)</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Pricing */}
                    <div>
                        <h3 className="text-lg font-bold text-gray-800 mb-4 border-b pb-2 flex items-center">
                            <DollarSign className="mr-2 text-primary" size={20} />
                            Pricing Rules
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Base Price / Slot</label>
                                <div className="relative">
                                    <span className="absolute left-3 top-2 text-gray-500">$</span>
                                    <input type="number" name="base_price" value={formData.base_price} onChange={handleChange} className="w-full border pl-8 p-2 rounded-lg" required />
                                </div>
                                <p className="text-xs text-gray-500 mt-1">Default price for all slots</p>
                            </div>
                        </div>

                        <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-200">
                            <div className="flex items-center mb-4">
                                <input
                                    type="checkbox"
                                    id="has_peak"
                                    name="has_peak"
                                    checked={formData.has_peak}
                                    onChange={handleChange}
                                    className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary"
                                />
                                <label htmlFor="has_peak" className="ml-2 block text-sm font-bold text-gray-900">
                                    Enable Peak Hour Pricing
                                </label>
                            </div>

                            {formData.has_peak && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-in fade-in slide-in-from-top-2">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Peak Start</label>
                                        <input type="time" name="peak_start_time" value={formData.peak_start_time} onChange={handleChange} className="w-full border p-2 rounded-lg bg-white" required={formData.has_peak} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Peak End</label>
                                        <input type="time" name="peak_end_time" value={formData.peak_end_time} onChange={handleChange} className="w-full border p-2 rounded-lg bg-white" required={formData.has_peak} />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Peak Price</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                                            <input type="number" name="peak_price" value={formData.peak_price} onChange={handleChange} className="w-full border pl-8 p-2 rounded-lg bg-white" required={formData.has_peak} />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="pt-6 border-t border-gray-100 flex justify-end">
                        <button
                            type="button"
                            onClick={() => navigate('/venues')}
                            className="px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 rounded-lg mr-4 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-8 py-3 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center shadow-lg shadow-blue-900/20"
                        >
                            {loading ? (
                                <>Generating...</>
                            ) : (
                                <>
                                    <Save size={20} className="mr-2" />
                                    Generate Slots
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
