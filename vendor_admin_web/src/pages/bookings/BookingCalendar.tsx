import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { bookingService } from '../../services/api';
import { Loader2 } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
    CONFIRMED: '#22c55e',
    PENDING: '#f59e0b',
    CANCELLED: '#ef4444',
    COMPLETED: '#6366f1',
};

export default function BookingCalendar() {
    const [events, setEvents] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadBookings();
    }, []);

    const loadBookings = async () => {
        try {
            const data = await bookingService.getAll();
            const items = Array.isArray(data) ? data : (data.results || []);
            const calEvents = items.map((b: any) => ({
                id: String(b.id),
                title: `${b.court_name || 'Court'} — ${b.customer_name || b.customer || 'Walk-in'}`,
                start: `${b.booking_date}T${b.start_time || '00:00'}`,
                end: `${b.booking_date}T${b.end_time || '01:00'}`,
                backgroundColor: STATUS_COLORS[b.status] || '#94a3b8',
                borderColor: STATUS_COLORS[b.status] || '#94a3b8',
                extendedProps: { status: b.status, amount: b.total_amount },
            }));
            setEvents(calEvents);
        } catch (err) {
            console.error('Failed to load bookings', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEventClick = (info: any) => {
        const { status, amount } = info.event.extendedProps;
        alert(`Booking: ${info.event.title}\nStatus: ${status}\nAmount: ₹${amount || 0}`);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Bookings Calendar</h1>
                    <p className="text-gray-500 mt-1">View all venue bookings across time</p>
                </div>
                <div className="flex gap-3 text-xs">
                    {Object.entries(STATUS_COLORS).map(([status, color]) => (
                        <span key={status} className="flex items-center gap-1 font-medium text-gray-600">
                            <span style={{ background: color }} className="w-3 h-3 rounded-full inline-block" />
                            {status}
                        </span>
                    ))}
                </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                {loading ? (
                    <div className="flex items-center justify-center h-96">
                        <Loader2 className="animate-spin text-primary" size={32} />
                    </div>
                ) : (
                    <FullCalendar
                        plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                        initialView="timeGridWeek"
                        headerToolbar={{
                            left: 'prev,next today',
                            center: 'title',
                            right: 'dayGridMonth,timeGridWeek,timeGridDay'
                        }}
                        events={events}
                        eventClick={handleEventClick}
                        height="650px"
                        slotMinTime="06:00:00"
                        slotMaxTime="23:00:00"
                        allDaySlot={false}
                        nowIndicator
                    />
                )}
            </div>
        </div>
    );
}
