import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft, Trash2 } from 'lucide-react';
import { courtService, venueService } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function CourtsList() {
    const { id } = useParams<{ id: string }>();
    const [venue, setVenue] = useState<any>(null);
    const [courts, setCourts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        loadData();
    }, [id]);

    const loadData = async () => {
        try {
            if (!id) return;
            const [venueData, courtsData] = await Promise.all([
                venueService.getById(id),
                courtService.getByVenueId(id)
            ]);
            setVenue(venueData);
            setCourts(courtsData);
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const refreshCourts = async () => {
        if (!id) return;
        const courtsData = await courtService.getByVenueId(id);
        setCourts(courtsData);
    };

    return (
        <div className="space-y-6">
            <button
                onClick={() => navigate('/venues')}
                className="flex items-center text-gray-500 hover:text-gray-900 transition mb-4"
            >
                <ArrowLeft size={20} className="mr-2" />
                Back to Venues
            </button>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Manage Courts</h1>
                    <p className="text-gray-500 mt-1">{venue?.name ? `for ${venue.name}` : 'Loading...'}</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                >
                    <Plus size={20} className="mr-2" />
                    Add Court
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <p className="col-span-3 text-center text-gray-500 py-10">Loading courts...</p>
                ) : courts.length === 0 ? (
                    <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <p className="text-gray-400 mb-4">No courts found for this venue.</p>
                        <button
                            onClick={() => setShowAddModal(true)}
                            className="text-primary font-bold hover:underline"
                        >
                            Add your first court
                        </button>
                    </div>
                ) : (
                    courts.map((court: any) => (
                        <div key={court.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                            <div className="flex justify-between">
                                <div>
                                    <h3 className="font-bold text-lg text-gray-900">{court.name}</h3>
                                    <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-1 rounded-full">{court.sport_type}</span>
                                </div>
                                <span className={`h-3 w-3 rounded-full mt-2 ${court.is_active ? 'bg-green-500' : 'bg-red-500'}`} />
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Price</p>
                                    <p className="font-bold text-gray-900">${court.price_per_hour}/hr</p>
                                </div>
                                {court.surface_type && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Surface</p>
                                        <p className="font-medium text-gray-700">{court.surface_type}</p>
                                    </div>
                                )}
                            </div>

                            <button className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-full">
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))
                )}
            </div>

            {showAddModal && (
                <AddCourtModal
                    venueId={id!}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => {
                        setShowAddModal(false);
                        refreshCourts();
                    }}
                />
            )}
        </div>
    );
}

function AddCourtModal({ venueId, onClose, onSuccess }: { venueId: string, onClose: () => void, onSuccess: () => void }) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        venue: parseInt(venueId),
        name: '',
        sport_type: 'Badminton',
        price_per_hour: '',
        surface_type: '',
        count: 1
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await courtService.create(formData);
            onSuccess();
        } catch (error) {
            console.error(error);
            alert('Failed to add court');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
                <h2 className="text-xl font-bold mb-4">Add Court</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Court Name</label>
                        <input name="name" required value={formData.name} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Court 1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                            <select name="sport_type" value={formData.sport_type} onChange={handleChange} className="w-full border p-2 rounded-lg">
                                <option value="Badminton">Badminton</option>
                                <option value="Cricket">Cricket</option>
                                <option value="Football">Football</option>
                                <option value="Tennis">Tennis</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Hr</label>
                            <input type="number" name="price_per_hour" required value={formData.price_per_hour} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="0.00" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Surface Type</label>
                        <input name="surface_type" value={formData.surface_type} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Synthetic, Grass" />
                    </div>

                    <div className="flex justify-end pt-4 space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-primary text-white rounded-lg font-medium">{loading ? 'Adding...' : 'Add Court'}</button>
                    </div>
                </form>
            </div>
        </div>
    )
}
