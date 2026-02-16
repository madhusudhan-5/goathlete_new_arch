import { useState, useEffect } from 'react';
import { courtService, partnerService } from '../../services/api';
import { MapPin, Clock } from 'lucide-react';

export default function CourtsList() {
    const [courts, setCourts] = useState([]);
    const [profile, setProfile] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const profileData = await partnerService.getProfile();
            setProfile(profileData);

            if (profileData.venue?.id) {
                const courtsData = await courtService.getByVenue(profileData.venue.id);
                setCourts(courtsData);
            }
        } catch (error) {
            console.error('Failed to load courts', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading courts...</div>;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-gray-900">Courts</h1>
                <p className="text-gray-500 mt-1">{profile?.venue?.name}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {courts.length === 0 ? (
                    <div className="col-span-full text-center py-12 text-gray-400">
                        No courts available
                    </div>
                ) : (
                    courts.map((court: any) => (
                        <div key={court.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between mb-4">
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">{court.name}</h3>
                                    <p className="text-sm text-gray-500">{court.sport}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${court.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                                    }`}>
                                    {court.is_active ? 'Active' : 'Inactive'}
                                </span>
                            </div>

                            <div className="space-y-2 text-sm text-gray-600">
                                <div className="flex items-center">
                                    <MapPin size={16} className="mr-2" />
                                    <span>{court.location || 'No location'}</span>
                                </div>
                                <div className="flex items-center">
                                    <Clock size={16} className="mr-2" />
                                    <span>Available for booking</span>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-xs text-gray-400">Court ID: {court.id}</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
