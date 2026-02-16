import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { venueService } from '../../services/api';
import { Loader2 } from 'lucide-react';

export default function VenueForm() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        phone: '',
        email: '',
        description: '',
        pincode: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await venueService.create(formData);
            navigate('/venues');
        } catch (error) {
            console.error('Failed to create venue', error);
            alert('Failed to create venue');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Add New Venue</h1>
                <p className="text-gray-500">Enter the details of your sports facility</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Venue Name</label>
                            <input
                                name="name"
                                required
                                value={formData.name}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                                placeholder="e.g. Smash Badminton Academy"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                name="email"
                                required
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                            <input
                                name="phone"
                                required
                                value={formData.phone}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div className="col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                            <textarea
                                name="address"
                                required
                                rows={3}
                                value={formData.address}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                            <input
                                name="city"
                                required
                                value={formData.city}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                            <input
                                name="state"
                                value={formData.state}
                                onChange={handleChange}
                                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={() => navigate('/venues')}
                            className="px-4 py-2 text-gray-700 font-medium hover:bg-gray-100 rounded-lg mr-4 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-2 bg-primary text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center"
                        >
                            {loading && <Loader2 className="animate-spin mr-2" size={18} />}
                            Create Venue
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
