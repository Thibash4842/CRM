import { useState, useEffect, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import PageHeader from '../components/ui/PageHeader';
import { Plus } from 'lucide-react';
import { calendarApi } from '../api/calendar';
import EventDrawer from '../components/calendar/EventDrawer';
import CalendarSidebarLeft from '../components/calendar/CalendarSidebarLeft';
import { motion } from 'framer-motion';
import Button from '../components/ui/Button';

export default function Calendar() {
  const calendarRef = useRef(null);
  const [events, setEvents] = useState([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [selectedDateRange, setSelectedDateRange] = useState(null);
  const [filters, setFilters] = useState({
    MEETING: true,
    CALL: true,
    TASK: true,
    FOLLOW_UP: true,
    INTERNAL: true,
  });

  const fetchEvents = async (fetchInfo) => {
    try {
      const start = fetchInfo?.startStr || new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString();
      const end = fetchInfo?.endStr || new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString();

      const data = await calendarApi.getEvents(start, end, false);
      const formatted = data.map(e => ({
        id: e.id,
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        allDay: e.isAllDay,
        extendedProps: { ...e },
        backgroundColor: getEventColor(e.eventType),
        borderColor: getEventColor(e.eventType)
      }));
      setEvents(formatted);
    } catch (error) {
      console.error('Failed to fetch events:', error);
    }
  };

  const getEventColor = (type) => {
    switch (type) {
      case 'MEETING': return '#3b82f6';
      case 'CALL': return '#10b981';
      case 'TASK': return '#f59e0b';
      case 'FOLLOW_UP': return '#8b5cf6';
      default: return '#64748b';
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleEventClick = (clickInfo) => {
    setSelectedEvent(clickInfo.event.extendedProps);
    setIsDrawerOpen(true);
  };

  const handleDateSelect = (selectInfo) => {
    setSelectedDateRange({
      start: selectInfo.startStr,
      end: selectInfo.endStr,
      allDay: selectInfo.allDay
    });
    setSelectedEvent(null);
    setIsDrawerOpen(true);
  };

  const handleEventDrop = async (dropInfo) => {
    const event = dropInfo.event;
    try {
      await calendarApi.updateEvent(event.id, {
        startTime: event.startStr,
        endTime: event.endStr || event.startStr,
      });
    } catch (error) {
      console.error('Failed to update event dates', error);
      dropInfo.revert();
    }
  };

  const filteredEvents = events.filter(e => filters[e.extendedProps.eventType]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col h-[calc(100vh-8rem)] min-h-[600px]"
    >
      <PageHeader
        title="Calendar"
        subtitle="Manage your schedule, team meetings, and activities"
        actionContent={
          <Button
            onClick={() => {
              setSelectedEvent(null);
              setSelectedDateRange(null);
              setIsDrawerOpen(true);
            }}
            className="btn-primary shadow-xl shadow-black-300/20 flex items-center p-4 rounded-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            New Event
          </Button>
        }
      />

      <div className="flex flex-1 overflow-hidden mt-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-xl shadow-slate-200/20 dark:shadow-none transition-all duration-300">
        <CalendarSidebarLeft filters={filters} setFilters={setFilters} />

        <div className="flex-1 p-6 overflow-auto fullcalendar-wrapper relative bg-white dark:bg-slate-900">
          <FullCalendar
            ref={calendarRef}
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            customButtons={{
              today: {
                text: 'today',
                click: () => {
                  const api = calendarRef.current?.getApi();
                  if (api) {
                    api.today();
                  }
                }
              }
            }}
            headerToolbar={{
              left: 'prev,next today',
              center: 'title',
              right: 'dayGridMonth,timeGridWeek,timeGridDay'
            }}
            initialView="timeGridWeek"
            editable={true}
            selectable={true}
            selectMirror={true}
            dayMaxEvents={true}
            events={filteredEvents}
            datesSet={fetchEvents}
            select={handleDateSelect}
            eventClick={handleEventClick}
            eventDrop={handleEventDrop}
            eventResize={handleEventDrop}
            height="100%"
          />
        </div>
      </div>

      <EventDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        event={selectedEvent}
        selectedDateRange={selectedDateRange}
        onSave={() => {
          setIsDrawerOpen(false);
          fetchEvents();
        }}
        onDelete={() => {
          setIsDrawerOpen(false);
          fetchEvents();
        }}
      />
    </motion.div>
  );
}
