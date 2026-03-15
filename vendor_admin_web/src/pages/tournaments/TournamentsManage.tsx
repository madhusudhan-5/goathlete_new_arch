import { useState, useEffect } from 'react';
import { X, Plus, Loader2, Trophy } from 'lucide-react';
import { tournamentService } from '../../services/api';

const SPORTS = ['Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball', 'Volleyball', 'Table Tennis', 'Squash', 'Other'];
const TYPES = ['KNOCKOUT', 'ROUND_ROBIN', 'LEAGUE', 'SWISS'];

export default function TournamentsManage() {
    const [tournaments, setTournaments] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const data = await tournamentService.getAll();
            setTournaments(Array.isArray(data) ? data : (data.results || []));
        } catch (error) {
            console.error('Failed to load tournaments', error);
        } finally {
            setLoading(false);
        }
    };

    const statusBadge = (status: string) => {
        const map: Record<string, string> = {
            DRAFT: 'bg-gray-100 text-gray-600',
            REGISTRATION_OPEN: 'bg-blue-100 text-blue-700',
            ONGOING: 'bg-green-100 text-green-700',
            COMPLETED: 'bg-purple-100 text-purple-700',
            CANCELLED: 'bg-red-100 text-red-700',
        };
        return `text-xs font-bold px-2.5 py-1 rounded-full ${map[status] || 'bg-gray-100 text-gray-600'}`;
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-extrabold text-brand-navy">Tournament Management</h1>
                    <p className="text-gray-500 mt-1 font-medium">Create and manage tournaments at your venues</p>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-brand-orange text-white px-5 py-2.5 rounded-xl font-bold flex items-center shadow-lg shadow-brand-orange/20 hover:bg-[#c26226] transition transform hover:-translate-y-0.5"
                >
                    <Plus size={20} className="mr-2" /> New Tournament
                </button>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-48">
                    <Loader2 className="animate-spin text-primary" size={32} />
                </div>
            ) : tournaments.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center shadow-sm flex flex-col items-center justify-center">
                    <div className="w-16 h-16 bg-brand-navy/10 rounded-full flex items-center justify-center text-brand-navy mb-4">
                        <Trophy size={28} />
                    </div>
                    <h3 className="text-xl font-bold text-brand-navy mb-2">No Tournaments Yet</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">Host your first tournament to drive engagement at your venue!</p>
                    <button onClick={() => setShowModal(true)} className="text-brand-orange font-bold hover:underline">
                        Create your first tournament
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {tournaments.map((t: any) => (
                        <div key={t.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="flex justify-between items-start mb-3">
                                <h3 className="text-lg font-bold text-brand-navy">{t.name}</h3>
                                <span className={statusBadge(t.status)}>{t.status?.replace('_', ' ')}</span>
                            </div>
                            <p className="text-sm text-gray-500 mb-4">{t.tournament_type} • {t.sport}</p>
                            <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                                <div>
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Start Date</p>
                                    <p className="font-medium text-brand-navy text-sm">{t.start_date || 'TBD'}</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Entry Fee</p>
                                    <p className="font-bold text-brand-orange">₹{t.entry_fee || 0}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <CreateTournamentModal
                    onClose={() => setShowModal(false)}
                    onSuccess={() => { setShowModal(false); loadData(); }}
                />
            )}
        </div>
    );
}

function CreateTournamentModal({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
    const [form, setForm] = useState({
        name: '', sport: '', tournament_type: 'KNOCKOUT',
        start_date: '', end_date: '', entry_fee: '', max_participants: '',
        description: '',
    });
    const [saving, setSaving] = useState(false);
    const inp = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-primary outline-none';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await tournamentService.create({
                ...form,
                entry_fee: parseFloat(form.entry_fee) || 0,
                max_participants: parseInt(form.max_participants) || 0,
                status: 'DRAFT',
            });
            onSuccess();
        } catch (err: any) {
            alert(JSON.stringify(err.response?.data) || 'Failed to create tournament');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-brand-navy/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl p-8 w-full max-w-lg shadow-xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-extrabold text-brand-navy">Create Tournament</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700"><X size={22} /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Tournament Name *</label>
                        <input className={inp} required placeholder="e.g. GoAthlete Summer Cup 2024"
                            value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Sport *</label>
                            <select className={inp} required value={form.sport} onChange={e => setForm(p => ({ ...p, sport: e.target.value }))}>
                                <option value="">Select sport</option>
                                {SPORTS.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Format *</label>
                            <select className={inp} value={form.tournament_type} onChange={e => setForm(p => ({ ...p, tournament_type: e.target.value }))}>
                                {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ')}</option>)}
                            </select>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Start Date *</label>
                            <input type="date" className={inp} required value={form.start_date} onChange={e => setForm(p => ({ ...p, start_date: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">End Date</label>
                            <input type="date" className={inp} value={form.end_date} onChange={e => setForm(p => ({ ...p, end_date: e.target.value }))} />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Entry Fee (₹)</label>
                            <input type="number" min="0" className={inp} placeholder="0" value={form.entry_fee} onChange={e => setForm(p => ({ ...p, entry_fee: e.target.value }))} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Max Participants</label>
                            <input type="number" min="2" className={inp} placeholder="16" value={form.max_participants} onChange={e => setForm(p => ({ ...p, max_participants: e.target.value }))} />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                        <textarea rows={3} className={inp} placeholder="Describe the tournament rules and prizes..."
                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                    </div>
                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium">Cancel</button>
                        <button type="submit" disabled={saving}
                            className="px-5 py-2 bg-brand-orange text-white rounded-xl font-bold hover:bg-[#c26226] transition disabled:opacity-60 flex items-center gap-2 text-sm">
                            {saving && <Loader2 size={14} className="animate-spin" />} Create Tournament
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
