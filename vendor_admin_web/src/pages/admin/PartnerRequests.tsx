import { useEffect, useState } from 'react';
import { Check, X, MapPin, Phone, Mail, FileText } from 'lucide-react';
import { venueService } from '../../services/api';

export default function PartnerRequests() {
    const [venues, setVenues] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<number | null>(null);

    useEffect(() => {
        loadRequests();
    }, []);

    const loadRequests = async () => {
        try {
            const allVenues = await venueService.getAll();
            // Filter for PRE_REGISTERED only
            // Note: In a real app, backend should provide a filter parameter
            const pending = allVenues.filter((v: any) => v.status === 'PRE_REGISTERED');
            setVenues(pending);
        } catch (error) {
            console.error('Failed to load partner requests', error);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: number, status: 'REGISTERED' | 'REJECTED') => {
        if (!window.confirm(`Are you sure you want to ${status.toLowerCase()} this venue?`)) return;

        setProcessingId(id);
        try {
            await venueService.updateStatus(id.toString(), status);
            // Remove from list or update local state
            setVenues(prev => prev.filter((v: any) => v.id !== id));
            alert(`Venue successfully ${status === 'REGISTERED' ? 'Approved' : 'Rejected'}.`);
        } catch (error) {
            console.error(error);
            alert('Failed to update status');
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Partner Requests</h1>
                    <p className="text-gray-500 mt-1">Review and approve new venue registrations.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium">
                    Pending: {venues.length}
                </div>
            </div>

            <div className="space-y-4">
                {loading ? (
                    <p className="text-center text-gray-500 py-10">Loading requests...</p>
                ) : venues.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <p className="text-gray-400">No pending partner requests.</p>
                    </div>
                ) : (
                    venues.map((venue: any) => (
                        <div key={venue.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6">
                            <div className="flex-1">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold text-xl text-gray-900">{venue.name}</h3>
                                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full font-bold">Pending Review</span>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <MapPin size={16} className="mr-2 text-gray-400" />
                                        {venue.city}, {venue.state}
                                    </div>
                                    <div className="flex items-center">
                                        <Phone size={16} className="mr-2 text-gray-400" />
                                        {venue.phone}
                                    </div>
                                    <div className="flex items-center">
                                        <Mail size={16} className="mr-2 text-gray-400" />
                                        {venue.email}
                                    </div>
                                    <div className="flex items-center">
                                        <FileText size={16} className="mr-2 text-gray-400" />
                                        GST: {venue.gst_number || 'N/A'}
                                    </div>
                                </div>

                                {venue.description && (
                                    <p className="mt-4 text-gray-500 text-sm bg-gray-50 p-3 rounded-lg">
                                        "{venue.description}"
                                    </p>
                                )}
                            </div>

                            <div className="flex flex-row md:flex-col justify-center gap-3 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-6 min-w-[140px]">
                                <button
                                    onClick={() => handleStatusUpdate(venue.id, 'REGISTERED')}
                                    disabled={processingId === venue.id}
                                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                                >
                                    <Check size={18} className="mr-2" />
                                    Approve
                                </button>
                                <button
                                    onClick={() => handleStatusUpdate(venue.id, 'REJECTED')}
                                    disabled={processingId === venue.id}
                                    className="flex-1 bg-white border border-red-200 text-red-600 hover:bg-red-50 py-2 px-4 rounded-lg flex items-center justify-center transition disabled:opacity-50"
                                >
                                    <X size={18} className="mr-2" />
                                    Reject
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
