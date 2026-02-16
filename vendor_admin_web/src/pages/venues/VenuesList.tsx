import { useEffect, useState } from 'react';
import { Plus, Search, MapPin, Edit2, Trash2 } from 'lucide-react';
import { venueService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

export default function VenuesList() {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        loadVenues();
    }, []);

    const loadVenues = async () => {
        try {
            const data = await venueService.getAll();
            setVenues(data);
        } catch (error) {
            console.error('Failed to load venues', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">My Venues</h1>
                <button
                    onClick={() => navigate('/venues/new')}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                >
                    <Plus size={20} className="mr-2" />
                    Add Venue
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search/Filter (Placeholder) */}
                <div className="p-4 border-b border-gray-200">
                    <div className="relative max-w-sm">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search venues..."
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-3">Venue Name</th>
                                <th className="px-6 py-3">Location</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Courts</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-4 text-center text-gray-500">Loading...</td>
                                </tr>
                            ) : venues.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">No venues found. Add your first venue to get started.</td>
                                </tr>
                            ) : (
                                venues.map((venue: any) => (
                                    <tr key={venue.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{venue.name}</div>
                                            <div className="text-xs text-gray-500">{venue.phone}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">
                                            <div className="flex items-center">
                                                <MapPin size={14} className="mr-1" />
                                                {venue.city}, {venue.state}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-bold ${venue.status === 'REGISTERED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                                                }`}>
                                                {venue.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500">{venue.courts_count || 0} Courts</td>
                                        <td className="px-6 py-4 text-right">
                                            <button className="text-gray-400 hover:text-primary mr-3">
                                                <Edit2 size={18} />
                                            </button>
                                            <button className="text-gray-400 hover:text-red-600">
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
