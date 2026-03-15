import React, { useEffect, useState } from 'react';
import { Plus, ArrowLeft, Trash2, Loader2 } from 'lucide-react';
import { courtService, venueService } from '../../services/api';
import { useNavigate, useParams } from 'react-router-dom';

export default function CourtsList() {
    const { id } = useParams<{ id: string }>();
    const [venue, setVenue] = useState<any>(null);
    const [courts, setCourts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAddModal, setShowAddModal] = useState(false);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => { loadData(); }, [id]);

    const loadData = async () => {
        try {
            if (!id) return;
            const [venueData, courtsData] = await Promise.all([
                venueService.getById(id),
                courtService.getByVenueId(id)
            ]);
            setVenue(venueData);
            setCourts(Array.isArray(courtsData) ? courtsData : (courtsData.results || []));
        } catch (error) {
            console.error('Failed to load data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (courtId: number) => {
        if (!window.confirm('Delete this court? This cannot be undone.')) return;
        setDeletingId(courtId);
        try {
            await courtService.delete(String(courtId));
            setCourts(p => p.filter(c => c.id !== courtId));
        } catch {
            alert('Failed to delete court');
        } finally {
            setDeletingId(null);
        }
    };

    const refreshCourts = async () => {
        if (!id) return;
        const courtsData = await courtService.getByVenueId(id);
        setCourts(Array.isArray(courtsData) ? courtsData : (courtsData.results || []));
    };

    return (
        <div className="space-y-6">
            <button onClick={() => navigate('/venues')} className="flex items-center text-gray-500 hover:text-gray-900 transition mb-4">
                <ArrowLeft size={20} className="mr-2" /> Back to Venues
            </button>

            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-navy">Manage Courts</h1>
                    <p className="text-gray-500 mt-1 font-medium">{venue?.name ? `for ${venue.name}` : 'Loading...'}</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-brand-orange/20 hover:bg-[#c26226] transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} className="mr-2" /> Add Court
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {loading ? (
                    <div className="col-span-3 flex justify-center py-10">
                        <Loader2 className="animate-spin text-primary" size={28} />
                    </div>
                ) : courts.length === 0 ? (
                    <div className="col-span-3 text-center py-12 bg-white rounded-xl border border-gray-100 border-dashed">
                        <p className="text-gray-400 mb-4">No courts found for this venue.</p>
                        <button onClick={() => setShowAddModal(true)} className="text-primary font-bold hover:underline">
                            Add your first court
                        </button>
                    </div>
                ) : (
                    courts.map((court) => (
                        <div key={court.id} className="bg-white p-6 rounded-2xl shadow-sm border-0 relative group hover:shadow-md transition">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-extrabold text-xl text-brand-navy mb-1">{court.name}</h3>
                                    <span className="text-xs font-bold text-brand-orange bg-brand-orange/10 px-3 py-1 rounded-full uppercase tracking-wider">
                                        {court.sport_type}
                                    </span>
                                </div>
                                <span className={`h-3 w-3 rounded-full mt-2 shadow-sm ${court.is_active ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 flex justify-between items-end">
                                <div>
                                    <p className="text-xs text-gray-400 font-bold uppercase">Price</p>
                                    <p className="font-bold text-gray-900">₹{court.price_per_hour}/hr</p>
                                </div>
                                {court.surface_type && (
                                    <div className="text-right">
                                        <p className="text-xs text-gray-400 font-bold uppercase">Surface</p>
                                        <p className="font-medium text-gray-700">{court.surface_type}</p>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => handleDelete(court.id)}
                                disabled={deletingId === court.id}
                                className="absolute top-4 right-4 text-red-500 opacity-0 group-hover:opacity-100 transition p-2 hover:bg-red-50 rounded-full disabled:opacity-50"
                            >
                                {deletingId === court.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {showAddModal && (
                <AddCourtModal
                    venueId={id!}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={() => { setShowAddModal(false); refreshCourts(); }}
                />
            )}
        </div>
    );
}

function AddCourtModal({ venueId, onClose, onSuccess }: { venueId: string; onClose: () => void; onSuccess: () => void }) {
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
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-md shadow-xl">
                <h2 className="text-2xl font-extrabold text-brand-navy mb-6">Add New Court</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Court Name</label>
                        <input name="name" required value={formData.name} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Court 1" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Sport</label>
                            <select name="sport_type" value={formData.sport_type} onChange={handleChange} className="w-full border p-2 rounded-lg">
                                {['Badminton', 'Cricket', 'Football', 'Tennis', 'Basketball', 'Volleyball', 'Squash', 'Other'].map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Price/Hr (₹)</label>
                            <input type="number" name="price_per_hour" required value={formData.price_per_hour} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="0.00" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Surface Type</label>
                        <input name="surface_type" value={formData.surface_type} onChange={handleChange} className="w-full border p-2 rounded-lg" placeholder="e.g. Synthetic, Grass" />
                    </div>

                    <div className="flex justify-end pt-6 space-x-3 border-t border-gray-100 mt-6">
                        <button type="button" onClick={onClose} className="px-5 py-2.5 text-gray-600 font-bold hover:bg-gray-100 rounded-xl transition">Cancel</button>
                        <button type="submit" disabled={loading} className="px-5 py-2.5 bg-brand-orange text-white rounded-xl font-bold shadow-md shadow-brand-orange/20 hover:bg-[#c26226] transition flex items-center gap-2">
                            {loading && <Loader2 size={14} className="animate-spin" />}
                            {loading ? 'Adding...' : 'Add Court'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
