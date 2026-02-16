import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Plus } from 'lucide-react';

export default function BookingCalendar() {
    const handleDateClick = (arg: any) => {
        alert('Date clicked: ' + arg.dateStr);
    };

    const events = [
        { title: 'Badminton Booking - Slot 1', start: new Date().toISOString().split('T')[0] + 'T10:00:00', end: new Date().toISOString().split('T')[0] + 'T11:00:00', backgroundColor: '#EF4444' }, // Red for booked
        { title: 'Football Training', start: new Date().toISOString().split('T')[0] + 'T14:00:00', end: new Date().toISOString().split('T')[0] + 'T16:00:00', backgroundColor: '#EF4444' }
    ];

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-900">Bookings Calendar</h1>
                <button
                    className="bg-primary text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition"
                >
                    <Plus size={20} className="mr-2" />
                    Block Slot
                </button>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-screen">
                <FullCalendar
                    plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
                    initialView="timeGridWeek"
                    headerToolbar={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'dayGridMonth,timeGridWeek,timeGridDay'
                    }}
                    events={events}
                    dateClick={handleDateClick}
                    height="100%"
                    slotMinTime="06:00:00"
                    slotMaxTime="23:00:00"
                    allDaySlot={false}
                />
            </div>
        </div>
    );
}
