import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, UserPlus, Phone, Mail, ToggleLeft, ToggleRight, AlertCircle } from 'lucide-react';

interface Partner {
    id: number;
    user: { id: number; email: string; first_name: string; last_name: string; role: string };
    phone: string;
    is_active: boolean;
    created_at: string;
}

export default function PartnerManagement() {
    const navigate = useNavigate();
    const [partners, setPartners] = useState<Partner[]>([]);
    const [loading, setLoading] = useState(true);
    const [togglingId, setTogglingId] = useState<number | null>(null);
    const [error, setError] = useState('');

    const fetchPartners = async () => {
        setLoading(true);
        try {
            const res = await api.get('/partners/partners/');
            setPartners(res.data.results || res.data);
        } catch {
            setError('Failed to load partners.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchPartners(); }, []);

    const toggleStatus = async (partner: Partner) => {
        setTogglingId(partner.id);
        try {
            await api.patch(`/partners/partners/${partner.id}/`, { is_active: !partner.is_active });
            setPartners(p => p.map(x => x.id === partner.id ? { ...x, is_active: !x.is_active } : x));
        } catch {
            alert('Failed to update status');
        } finally {
            setTogglingId(null);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Venue Partners</h1>
                    <p className="text-gray-500 mt-1">Manage staff and partners for your venue</p>
                </div>
                <button onClick={() => navigate('/users/new')}
                    className="flex items-center gap-2 px-4 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition shadow-sm">
                    <UserPlus size={16} /> Add Partner
                </button>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-4 text-sm">
                    <AlertCircle size={16} /> {error}
                </div>
            )}

            {/* Content */}
            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : partners.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100 shadow-sm">
                    <div className="text-5xl mb-4">👥</div>
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">No Partners Yet</h3>
                    <p className="text-gray-500 mb-6">Add staff members who can manage bookings at your venue.</p>
                    <button onClick={() => navigate('/users/new')}
                        className="px-6 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
                        Add First Partner
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {partners.map(partner => (
                        <div key={partner.id}
                            className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
                            {/* Avatar */}
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-blue-400 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                {partner.user.first_name?.[0] || partner.user.email[0].toUpperCase()}
                            </div>

                            {/* Info */}
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-gray-800">
                                    {partner.user.first_name} {partner.user.last_name}
                                    {!partner.user.first_name && <span className="text-gray-500">(No name)</span>}
                                </p>
                                <div className="flex flex-wrap gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-gray-500">
                                        <Mail size={12} /> {partner.user.email}
                                    </span>
                                    {partner.phone && (
                                        <span className="flex items-center gap-1 text-xs text-gray-500">
                                            <Phone size={12} /> {partner.phone}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Status badge */}
                            <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0
                                ${partner.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {partner.is_active ? 'Active' : 'Inactive'}
                            </span>

                            {/* Toggle */}
                            <button onClick={() => toggleStatus(partner)} disabled={togglingId === partner.id}
                                className="text-gray-400 hover:text-primary transition shrink-0">
                                {togglingId === partner.id
                                    ? <Loader2 size={22} className="animate-spin" />
                                    : partner.is_active
                                        ? <ToggleRight size={28} className="text-primary" />
                                        : <ToggleLeft size={28} />
                                }
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
