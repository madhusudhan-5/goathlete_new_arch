import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { venueService } from '../../services/api';
import { Loader2, MapPin, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const SPORTS_OPTIONS = [
    'Badminton', 'Tennis', 'Cricket', 'Football', 'Basketball',
    'Volleyball', 'Table Tennis', 'Squash', 'Hockey', 'Swimming', 'Other'
];
const SURFACE_OPTIONS = ['Wood', 'Concrete', 'Synthetic', 'Grass', 'Clay', 'Rubber', 'Other'];

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const STEPS = [
    { id: 1, label: 'Basic Details' },
    { id: 2, label: 'Documents' },
    { id: 3, label: 'Images' },
    { id: 4, label: 'Courts' },
    { id: 5, label: 'Open Hours' },
    { id: 6, label: 'Review & Submit' },
];

export default function VenueForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Step 1 - Basic Details
    const [details, setDetails] = useState({
        name: '', description: '', address: '', city: '', state: '',
        pincode: '', email: '', phone: '',
        latitude: '', longitude: '',
        aadhar_number: '', pan_number: '', gst_number: '',
    });

    // Step 2 - Documents (base64)
    const [docs, setDocs] = useState<Record<string, { name: string; base64: string; mime: string } | null>>({
        aadhar: null, pan: null, gst: null,
    });

    // Step 3 - Images (exactly 2)
    const [images, setImages] = useState<{ preview: string; base64: string }[]>([]);

    // Step 4 - Courts
    const [courts, setCourts] = useState<any[]>([]);
    const [courtDraft, setCourtDraft] = useState({ name: '', sport_type: '', surface_type: '', count: '1' });

    // Step 5 - Open Hours
    const [openHours, setOpenHours] = useState<Record<string, { open: string; close: string; isOpen: boolean }>>(
        Object.fromEntries(DAYS.map(d => [d, { open: '06:00', close: '22:00', isOpen: d !== 'Sunday' }]))
    );

    // ─── Helpers ───────────────────────────────────────────────
    const updateDetail = (k: string, v: string) => {
        setDetails(p => ({ ...p, [k]: v }));
        setErrors(p => { const e = { ...p }; delete e[k]; return e; });
    };

    const getLocation = () => {
        if (!navigator.geolocation) return alert('Geolocation not supported');
        navigator.geolocation.getCurrentPosition(
            pos => {
                setDetails(p => ({ ...p, latitude: String(pos.coords.latitude), longitude: String(pos.coords.longitude) }));
                setErrors(p => { const e = { ...p }; delete e['location']; return e; });
            },
            () => alert('Failed to get location')
        );
    };

    const fileToBase64 = (file: File): Promise<string> =>
        new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve((reader.result as string).split(',')[1]);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });

    const handleDocUpload = async (type: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const base64 = await fileToBase64(file);
        setDocs(p => ({ ...p, [type]: { name: file.name, base64, mime: file.type } }));
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (images.length + files.length > 2) { alert('Maximum 2 images allowed'); return; }
        const newImgs = await Promise.all(files.map(async f => ({
            preview: URL.createObjectURL(f),
            base64: await fileToBase64(f),
        })));
        setImages(p => [...p, ...newImgs].slice(0, 2));
    };

    const addCourt = () => {
        if (!courtDraft.name.trim() || !courtDraft.sport_type || !courtDraft.surface_type) {
            alert('Please fill in all court fields'); return;
        }
        setCourts(p => [...p, { ...courtDraft }]);
        setCourtDraft({ name: '', sport_type: '', surface_type: '', count: '1' });
    };

    // ─── Validation ────────────────────────────────────────────
    const validate = (s: number): boolean => {
        const e: Record<string, string> = {};
        if (s === 1) {
            if (!details.name.trim()) e.name = 'Required';
            if (!details.description.trim()) e.description = 'Required';
            if (!details.address.trim()) e.address = 'Required';
            if (!details.city.trim()) e.city = 'Required';
            if (!details.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email)) e.email = 'Valid email required';
            if (!details.latitude || !details.longitude) e.location = 'Please pick your location';
            if (!details.aadhar_number.trim() || !/^\d{12}$/.test(details.aadhar_number)) e.aadhar = 'Must be 12 digits';
            if (!details.pan_number.trim() || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(details.pan_number)) e.pan = 'Invalid format (e.g. ABCDE1234F)';
            if (details.gst_number.trim() && !/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/.test(details.gst_number)) e.gst = 'Invalid GST format';
        }
        if (s === 3) { if (images.length !== 2) e.images = 'Exactly 2 images are required'; }
        if (s === 4) { if (courts.length === 0) e.courts = 'At least 1 court is required'; }
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const next = () => { if (validate(step) && step < 6) setStep(s => s + 1); };
    const back = () => { if (step > 1) setStep(s => s - 1); else navigate('/venues'); };

    // ─── Submit ─────────────────────────────────────────────────
    const handleSubmit = async () => {
        setLoading(true);
        try {
            const payload = {
                ...details,
                status: 'PRE_REGISTERED',
                courts,
                open_hours: openHours,
                images: images.map(i => ({ data: i.base64, mimeType: 'image/jpeg' })),
                aadhar_document: docs.aadhar?.base64 || '',
                pan_document: docs.pan?.base64 || '',
                gst_document: docs.gst?.base64 || '',
            };
            await venueService.create(payload);
            navigate('/venues');
        } catch (err: any) {
            alert(err.response?.data?.error || JSON.stringify(err.response?.data) || 'Failed to create venue');
        } finally {
            setLoading(false);
        }
    };

    // ─── Shared input style ──────────────────────────────────────
    const inp = 'w-full px-4 py-2.5 rounded-lg border focus:ring-2 focus:ring-primary outline-none text-sm';
    const inp_err = 'border-red-400 bg-red-50';
    const inp_ok = 'border-gray-300';

    // ─── RENDER ─────────────────────────────────────────────────
    return (
        <div className="max-w-3xl mx-auto">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Add New Venue</h1>
                <p className="text-gray-500 mt-1">Fill in the details to register your sports facility</p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center mb-8 overflow-x-auto pb-2">
                {STEPS.map((s, i) => (
                    <React.Fragment key={s.id}>
                        <div className="flex flex-col items-center shrink-0">
                            <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold transition-colors
                                ${step > s.id ? 'bg-green-500 text-white' : step === s.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                                {step > s.id ? <Check size={16} /> : s.id}
                            </div>
                            <span className={`text-xs mt-1 font-medium ${step === s.id ? 'text-primary' : 'text-gray-400'}`}>{s.label}</span>
                        </div>
                        {i < STEPS.length - 1 && (
                            <div className={`h-0.5 flex-1 mx-2 transition-colors ${step > s.id ? 'bg-green-400' : 'bg-gray-200'}`} />
                        )}
                    </React.Fragment>
                ))}
            </div>

            {/* Card */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">

                {/* STEP 1 */}
                {step === 1 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800 mb-4">📍 Basic Details</h2>preRegisterVenue
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Venue Name *</label>
                                <input className={`${inp} ${errors.name ? inp_err : inp_ok}`} placeholder="e.g. Smash Badminton Academy"
                                    value={details.name} onChange={e => updateDetail('name', e.target.value)} />
                                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Description *</label>
                                <textarea rows={3} className={`${inp} ${errors.description ? inp_err : inp_ok}`} placeholder="Describe your venue..."
                                    value={details.description} onChange={e => updateDetail('description', e.target.value)} />
                                {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description}</p>}
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Address *</label>
                                <input className={`${inp} ${errors.address ? inp_err : inp_ok}`} placeholder="Full street address"
                                    value={details.address} onChange={e => updateDetail('address', e.target.value)} />
                                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">City *</label>
                                <input className={`${inp} ${errors.city ? inp_err : inp_ok}`} placeholder="City"
                                    value={details.city} onChange={e => updateDetail('city', e.target.value)} />
                                {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">State</label>
                                <input className={`${inp} ${inp_ok}`} placeholder="State"
                                    value={details.state} onChange={e => updateDetail('state', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Pincode</label>
                                <input className={`${inp} ${inp_ok}`} placeholder="Pincode" maxLength={6}
                                    value={details.pincode} onChange={e => updateDetail('pincode', e.target.value)} />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-600 mb-1">Phone</label>
                                <input className={`${inp} ${inp_ok}`} placeholder="Phone number"
                                    value={details.phone} onChange={e => updateDetail('phone', e.target.value)} />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-xs font-medium text-gray-600 mb-1">Email *</label>
                                <input type="email" className={`${inp} ${errors.email ? inp_err : inp_ok}`} placeholder="venue@email.com"
                                    value={details.email} onChange={e => updateDetail('email', e.target.value)} />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                            </div>
                        </div>

                        {/* Location */}
                        <div>
                            <button type="button" onClick={getLocation}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition
                                    ${details.latitude ? 'bg-green-50 border-green-400 text-green-700' : 'bg-gray-50 border-gray-300 text-gray-700 hover:bg-gray-100'}`}>
                                <MapPin size={16} />
                                {details.latitude ? `✓ Location Captured (${parseFloat(details.latitude).toFixed(4)}, ${parseFloat(details.longitude).toFixed(4)})` : 'Pick My Location'}
                            </button>
                            {errors.location && <p className="text-red-500 text-xs mt-1">{errors.location}</p>}
                        </div>

                        {/* License numbers */}
                        <div className="pt-2 border-t border-gray-100">
                            <h3 className="text-sm font-semibold text-gray-700 mb-3">🪪 License Numbers</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Aadhar Number * (12 digits)</label>
                                    <input className={`${inp} ${errors.aadhar ? inp_err : inp_ok}`} placeholder="123456789012" maxLength={12}
                                        value={details.aadhar_number} onChange={e => updateDetail('aadhar_number', e.target.value)} />
                                    {errors.aadhar && <p className="text-red-500 text-xs mt-1">{errors.aadhar}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">PAN Number *</label>
                                    <input className={`${inp} ${errors.pan ? inp_err : inp_ok}`} placeholder="ABCDE1234F" maxLength={10}
                                        value={details.pan_number} onChange={e => updateDetail('pan_number', e.target.value.toUpperCase())} />
                                    {errors.pan && <p className="text-red-500 text-xs mt-1">{errors.pan}</p>}
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">GST Number (optional)</label>
                                    <input className={`${inp} ${errors.gst ? inp_err : inp_ok}`} placeholder="29ABCDE1234F1Z5" maxLength={15}
                                        value={details.gst_number} onChange={e => updateDetail('gst_number', e.target.value.toUpperCase())} />
                                    {errors.gst && <p className="text-red-500 text-xs mt-1">{errors.gst}</p>}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* STEP 2 — Documents */}
                {step === 2 && (
                    <div className="space-y-6">
                        <h2 className="text-lg font-semibold text-gray-800">📄 License Documents</h2>
                        <p className="text-sm text-gray-500">Upload supporting documents (PDF or image)</p>
                        {(['aadhar', 'pan', 'gst'] as const).map(type => (
                            <div key={type} className="border border-dashed border-gray-300 rounded-xl p-4 hover:border-primary transition">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="font-medium text-gray-700 capitalize">{type === 'gst' ? 'GST Document (optional)' : `${type.toUpperCase()} Document`}</p>
                                        {docs[type] && <p className="text-xs text-green-600 mt-0.5">✓ {docs[type]!.name}</p>}
                                    </div>
                                    <label className={`cursor-pointer px-4 py-2 rounded-lg text-sm font-medium transition
                                        ${docs[type] ? 'bg-green-100 text-green-700' : 'bg-primary text-white hover:bg-blue-700'}`}>
                                        {docs[type] ? 'Re-upload' : 'Upload'}
                                        <input type="file" className="hidden" accept=".pdf,image/*"
                                            onChange={e => handleDocUpload(type, e)} />
                                    </label>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 3 — Images */}
                {step === 3 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">🖼️ Venue Images</h2>
                        <p className="text-sm text-gray-500">Upload exactly 2 photos of your venue</p>
                        <div className="grid grid-cols-2 gap-4">
                            {images.map((img, i) => (
                                <div key={i} className="relative">
                                    <img src={img.preview} alt={`Venue ${i + 1}`} className="w-full h-40 object-cover rounded-xl border" />
                                    <button type="button" onClick={() => setImages(p => p.filter((_, j) => j !== i))}
                                        className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 text-xs font-bold hover:bg-red-600">✕</button>
                                </div>
                            ))}
                            {images.length < 2 && (
                                <label className="border-2 border-dashed border-gray-300 rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-primary hover:bg-gray-50 transition">
                                    <span className="text-3xl mb-2">📷</span>
                                    <span className="text-sm text-gray-500">Click to upload</span>
                                    <input type="file" className="hidden" accept="image/*" multiple onChange={handleImageUpload} />
                                </label>
                            )}
                        </div>
                        <p className={`text-sm font-medium ${images.length === 2 ? 'text-green-600' : 'text-gray-500'}`}>
                            {images.length}/2 images uploaded {images.length === 2 && '✓'}
                        </p>
                        {errors.images && <p className="text-red-500 text-xs">{errors.images}</p>}
                    </div>
                )}

                {/* STEP 4 — Courts */}
                {step === 4 && (
                    <div className="space-y-4">
                        <h2 className="text-lg font-semibold text-gray-800">🏸 Courts</h2>
                        <p className="text-sm text-gray-500">Add at least one court to your venue</p>

                        {/* Added courts */}
                        {courts.map((c, i) => (
                            <div key={i} className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-4 py-3">
                                <div>
                                    <p className="font-medium text-gray-800">{c.name}</p>
                                    <p className="text-xs text-gray-500">{c.sport_type} · {c.surface_type} · {c.count} court(s)</p>
                                </div>
                                <button type="button" onClick={() => setCourts(p => p.filter((_, j) => j !== i))}
                                    className="text-red-500 hover:text-red-700 text-sm">Remove</button>
                            </div>
                        ))}

                        {/* Add court form */}
                        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
                            <p className="text-sm font-medium text-gray-700">Add a Court</p>
                            <div className="grid grid-cols-2 gap-3">
                                <div className="col-span-2">
                                    <input className={`${inp} ${inp_ok}`} placeholder="Court name (e.g. Court A)"
                                        value={courtDraft.name} onChange={e => setCourtDraft(p => ({ ...p, name: e.target.value }))} />
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Sport Type</label>
                                    <select className={`${inp} ${inp_ok}`}
                                        value={courtDraft.sport_type} onChange={e => setCourtDraft(p => ({ ...p, sport_type: e.target.value }))}>
                                        <option value="">Select sport</option>
                                        {SPORTS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Surface Type</label>
                                    <select className={`${inp} ${inp_ok}`}
                                        value={courtDraft.surface_type} onChange={e => setCourtDraft(p => ({ ...p, surface_type: e.target.value }))}>
                                        <option value="">Select surface</option>
                                        {SURFACE_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                                <div className="col-span-2">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">Number of Courts</label>
                                    <input type="number" min="1" className={`${inp} ${inp_ok}`}
                                        value={courtDraft.count} onChange={e => setCourtDraft(p => ({ ...p, count: e.target.value }))} />
                                </div>
                            </div>
                            <button type="button" onClick={addCourt}
                                className="w-full py-2 bg-primary text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition">
                                + Add Court
                            </button>
                        </div>
                        {errors.courts && <p className="text-red-500 text-xs">{errors.courts}</p>}
                    </div>
                )}

                {/* STEP 5 — Open Hours */}
                {step === 5 && (
                    <div className="space-y-3">
                        <h2 className="text-lg font-semibold text-gray-800">🕐 Operating Hours</h2>
                        <p className="text-sm text-gray-500">Set your venue's opening and closing times</p>
                        {DAYS.map(day => (
                            <div key={day} className={`flex flex-wrap items-center gap-3 p-3 rounded-lg border transition
                                ${openHours[day].isOpen ? 'border-gray-200 bg-white' : 'border-gray-100 bg-gray-50 opacity-60'}`}>
                                <div className="w-24">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded accent-primary"
                                            checked={openHours[day].isOpen}
                                            onChange={e => setOpenHours(p => ({ ...p, [day]: { ...p[day], isOpen: e.target.checked } }))} />
                                        <span className="text-sm font-medium text-gray-700">{day.slice(0, 3)}</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-2 ml-auto">
                                    <input type="time" className="border border-gray-200 rounded-lg px-2 py-1 text-sm" disabled={!openHours[day].isOpen}
                                        value={openHours[day].open}
                                        onChange={e => setOpenHours(p => ({ ...p, [day]: { ...p[day], open: e.target.value } }))} />
                                    <span className="text-gray-400 text-sm">to</span>
                                    <input type="time" className="border border-gray-200 rounded-lg px-2 py-1 text-sm" disabled={!openHours[day].isOpen}
                                        value={openHours[day].close}
                                        onChange={e => setOpenHours(p => ({ ...p, [day]: { ...p[day], close: e.target.value } }))} />
                                </div>
                                {!openHours[day].isOpen && <span className="text-xs text-gray-400 ml-auto">Closed</span>}
                            </div>
                        ))}
                    </div>
                )}

                {/* STEP 6 — Review */}
                {step === 6 && (
                    <div className="space-y-5">
                        <h2 className="text-lg font-semibold text-gray-800">✅ Review & Submit</h2>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Venue</p>
                                <p className="font-semibold">{details.name}</p>
                                <p className="text-gray-600">{details.address}, {details.city} {details.state}</p>
                                <p className="text-gray-600">{details.email} · {details.phone}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Documents</p>
                                <p className={docs.aadhar ? 'text-green-600' : 'text-gray-400'}>Aadhar {docs.aadhar ? '✓' : '✗'}</p>
                                <p className={docs.pan ? 'text-green-600' : 'text-gray-400'}>PAN {docs.pan ? '✓' : '✗'}</p>
                                <p className={docs.gst ? 'text-green-600' : 'text-gray-400'}>GST {docs.gst ? '✓' : 'Not uploaded (optional)'}</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-1">Courts & Images</p>
                                <p>{courts.length} court(s) added</p>
                                <p>{images.length}/2 images uploaded</p>
                            </div>
                            <div className="bg-gray-50 rounded-lg p-3 col-span-2">
                                <p className="text-xs text-gray-500 font-medium uppercase mb-2">Open Hours</p>
                                <div className="flex flex-wrap gap-2">
                                    {DAYS.map(d => (
                                        <span key={d} className={`text-xs px-2 py-0.5 rounded-full font-medium
                                            ${openHours[d].isOpen ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                                            {d.slice(0, 3)} {openHours[d].isOpen ? `${openHours[d].open}–${openHours[d].close}` : 'Closed'}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="flex justify-between pt-6 mt-4 border-t border-gray-100">
                    <button type="button" onClick={back}
                        className="flex items-center gap-1 px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition font-medium text-sm">
                        <ChevronLeft size={16} /> {step === 1 ? 'Cancel' : 'Back'}
                    </button>
                    {step < 6 ? (
                        <button type="button" onClick={next}
                            className="flex items-center gap-1 px-6 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition font-bold text-sm">
                            Next <ChevronRight size={16} />
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading}
                            className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold text-sm disabled:opacity-60">
                            {loading && <Loader2 className="animate-spin" size={16} />}
                            Submit Venue
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
