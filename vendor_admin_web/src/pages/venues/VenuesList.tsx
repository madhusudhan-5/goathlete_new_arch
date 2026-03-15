import { useEffect, useState } from 'react';
import { Plus, Search, MapPin, Edit2, Trash2, X, Loader2 } from 'lucide-react';
import { venueService } from '../../services/api';
import { useNavigate } from 'react-router-dom';

interface Venue {
    id: number; name: string; city: string; state: string;
    phone: string; email: string; status: string; courts_count?: number;
    address?: string; description?: string;
}

export default function VenuesList() {
    const [venues, setVenues] = useState<Venue[]>([]);
    const [filtered, setFiltered] = useState<Venue[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [editVenue, setEditVenue] = useState<Venue | null>(null);
    const [deletingId, setDeletingId] = useState<number | null>(null);
    const navigate = useNavigate();

    useEffect(() => { loadVenues(); }, []);

    useEffect(() => {
        const q = search.toLowerCase();
        setFiltered(q
            ? venues.filter(v =>
                v.name.toLowerCase().includes(q) ||
                v.city.toLowerCase().includes(q) ||
                v.state?.toLowerCase().includes(q) ||
                v.status.toLowerCase().includes(q)
            )
            : venues
        );
    }, [search, venues]);

    const loadVenues = async () => {
        setLoading(true);
        try {
            const data = await venueService.getAll();
            const items = Array.isArray(data) ? data : (data.results || []);
            setVenues(items);
            setFiltered(items);
        } catch (error) {
            console.error('Failed to load venues', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this venue? This cannot be undone.')) return;
        setDeletingId(id);
        try {
            await venueService.delete(String(id));
            setVenues(p => p.filter(v => v.id !== id));
        } catch {
            alert('Failed to delete venue');
        } finally {
            setDeletingId(null);
        }
    };

    const handleEditSave = async (id: number, data: Partial<Venue>) => {
        try {
            await venueService.update(String(id), data);
            setVenues(p => p.map(v => v.id === id ? { ...v, ...data } : v));
            setEditVenue(null);
        } catch {
            alert('Failed to update venue');
        }
    };

    const statusBadge = (status: string) => {
        const styles: Record<string, string> = {
            REGISTERED: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            PRE_REGISTERED: 'bg-amber-50 text-amber-700 border-amber-200',
            REJECTED: 'bg-red-50 text-red-700 border-red-200',
        };
        return `px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide border ${styles[status] || 'bg-gray-100 text-gray-600 border-gray-200'}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-extrabold text-brand-navy">My Venues</h1>
                <button
                    onClick={() => navigate('/venues/new')}
                    className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-brand-orange/20 hover:bg-[#c26226] transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} className="mr-2" /> Add Venue
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Search */}
                <div className="p-4 border-b border-gray-200 flex items-center gap-3">
                    <div className="relative max-w-sm flex-1">
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Search by name, city, status…"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent outline-none"
                        />
                    </div>
                    {search && (
                        <button onClick={() => setSearch('')} className="text-gray-400 hover:text-gray-700 transition">
                            <X size={18} />
                        </button>
                    )}
                    <span className="text-sm text-gray-500">{filtered.length} venue{filtered.length !== 1 ? 's' : ''}</span>
                </div>

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-[#f8f9fa] border-b-2 border-brand-navy/10 text-brand-navy font-bold text-xs uppercase tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Venue Name</th>
                                <th className="px-6 py-4">Location</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Courts</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {loading ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center">
                                    <Loader2 className="animate-spin mx-auto text-primary" size={24} />
                                </td></tr>
                            ) : filtered.length === 0 ? (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                                    {search ? `No venues match "${search}"` : 'No venues found. Add your first venue to get started.'}
                                </td></tr>
                            ) : (
                                filtered.map((venue) => (
                                    <tr key={venue.id} className="hover:bg-gray-50 transition">
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-brand-navy text-base mb-1">{venue.name}</div>
                                            <div className="text-xs text-gray-500 flex items-center">
                                                <span className="w-2 h-2 rounded-full bg-brand-orange mr-2" />{venue.phone || venue.email || '—'}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-500 font-medium">
                                            <div className="flex items-center">
                                                <MapPin size={16} className="mr-2 text-brand-orange" />
                                                {venue.city}{venue.state ? `, ${venue.state}` : ''}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={statusBadge(venue.status)}>{venue.status}</span>
                                        </td>
                                        <td className="px-6 py-4 text-brand-navy font-bold">{venue.courts_count ?? 0} Courts</td>
                                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => setEditVenue(venue)}
                                                className="text-gray-400 hover:text-primary transition p-1 rounded hover:bg-blue-50"
                                                title="Edit venue"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(venue.id)}
                                                disabled={deletingId === venue.id}
                                                className="text-gray-400 hover:text-red-600 transition p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                                title="Delete venue"
                                            >
                                                {deletingId === venue.id ? <Loader2 size={18} className="animate-spin" /> : <Trash2 size={18} />}
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal */}
            {editVenue && (
                <EditVenueModal
                    venue={editVenue}
                    onClose={() => setEditVenue(null)}
                    onSave={handleEditSave}
                />
            )}
        </div>
    );
}

function EditVenueModal({ venue, onClose, onSave }: { venue: Venue; onClose: () => void; onSave: (id: number, data: Partial<Venue>) => void }) {
    const [form, setForm] = useState({ name: venue.name, address: venue.address || '', city: venue.city, state: venue.state || '', phone: venue.phone || '', email: venue.email || '' });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        await onSave(venue.id, form);
        setSaving(false);
    };

    const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none';

    return (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-brand-navy">Edit Venue</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Venue Name</label>
                        <input className={inp} value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} required />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Address</label>
                        <input className={inp} value={form.address} onChange={e => setForm(p => ({ ...p, address: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">City</label>
                            <input className={inp} value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                            <input className={inp} value={form.state} onChange={e => setForm(p => ({ ...p, state: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                            <input className={inp} value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Email</label>
                            <input type="email" className={inp} value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={saving} className="px-5 py-2 bg-brand-orange text-white rounded-xl font-bold hover:bg-[#c26226] transition disabled:opacity-60 flex items-center gap-2">
                            {saving && <Loader2 size={14} className="animate-spin" />} Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
