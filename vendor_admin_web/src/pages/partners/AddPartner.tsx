import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { Loader2, ArrowLeft, UserPlus } from 'lucide-react';

export default function AddPartner() {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [form, setForm] = useState({
        first_name: '', last_name: '', email: '', password: '', phone: '',
    });
    const [success, setSuccess] = useState(false);

    const inp = 'w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary outline-none text-sm';

    const validate = () => {
        const e: Record<string, string> = {};
        if (!form.first_name.trim()) e.first_name = 'Required';
        if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Valid email required';
        if (!form.password.trim() || form.password.length < 6) e.password = 'Minimum 6 characters';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            await api.post('/partners/partners/', form);
            setSuccess(true);
        } catch (err: any) {
            const data = err.response?.data;
            if (data?.email) setErrors(p => ({ ...p, email: data.email[0] }));
            else alert(JSON.stringify(data) || 'Failed to create partner');
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="max-w-lg mx-auto text-center py-20">
                <div className="text-6xl mb-4">🎉</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Partner Added!</h2>
                <p className="text-gray-500 mb-2">
                    <span className="font-medium">{form.first_name || form.email}</span> can now login at:
                </p>
                <code className="block bg-gray-100 rounded-lg px-4 py-2 text-sm text-gray-700 mb-2">
                    https://vendor.goathlete.in/
                </code>
                <p className="text-xs text-gray-400 mb-8">
                    Email: {form.email} · Password: {form.password}
                </p>
                <div className="flex gap-3 justify-center">
                    <button onClick={() => { setSuccess(false); setForm({ first_name: '', last_name: '', email: '', password: '', phone: '' }); }}
                        className="px-5 py-2.5 border border-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-50 transition">
                        Add Another
                    </button>
                    <button onClick={() => navigate('/users')}
                        className="px-5 py-2.5 bg-primary text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition">
                        View All Partners
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-lg mx-auto">
            <button onClick={() => navigate('/users')}
                className="flex items-center gap-1 text-gray-500 hover:text-gray-800 text-sm mb-6 transition">
                <ArrowLeft size={16} /> Back to Partners
            </button>

            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Add Venue Partner</h1>
                <p className="text-gray-500 mt-1">Create a staff account that can manage bookings at your venue</p>
            </div>

            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">First Name *</label>
                            <input className={`${inp} ${errors.first_name ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                                placeholder="First name" value={form.first_name}
                                onChange={e => setForm(p => ({ ...p, first_name: e.target.value }))} />
                            {errors.first_name && <p className="text-red-500 text-xs mt-1">{errors.first_name}</p>}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Last Name</label>
                            <input className={`${inp} border-gray-300`} placeholder="Last name" value={form.last_name}
                                onChange={e => setForm(p => ({ ...p, last_name: e.target.value }))} />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                        <input type="email" className={`${inp} ${errors.email ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="partner@email.com" value={form.email}
                            onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                        {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Password *</label>
                        <input type="password" className={`${inp} ${errors.password ? 'border-red-400 bg-red-50' : 'border-gray-300'}`}
                            placeholder="Minimum 6 characters" value={form.password}
                            onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
                        {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    </div>

                    <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">Phone (optional)</label>
                        <input className={`${inp} border-gray-300`} placeholder="+91 98765 43210" value={form.phone}
                            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>

                    <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-xs text-blue-700">
                        ℹ️ The partner will be automatically assigned to <strong>your venue</strong>. They can log in at <strong>vendor.goathlete.in</strong> using the credentials you set here.
                    </div>

                    <div className="flex justify-end pt-2 border-t border-gray-100 gap-3">
                        <button type="button" onClick={() => navigate('/users')}
                            className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition text-sm font-medium">
                            Cancel
                        </button>
                        <button type="submit" disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm disabled:opacity-60">
                            {loading ? <Loader2 className="animate-spin" size={16} /> : <UserPlus size={16} />}
                            Create Partner
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
