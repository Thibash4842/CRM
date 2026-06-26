import { useState, useEffect } from 'react';
import Drawer from '../ui/Drawer';
import { Input, Select, Textarea } from '../ui/Input';
import { calendarApi } from '../../api/calendar';
import { Trash2, Save, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '../ui/Button';

export default function EventDrawer({ isOpen, onClose, event, selectedDateRange, onSave, onDelete }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    eventType: 'MEETING',
    startTime: '',
    endTime: '',
    isAllDay: false,
    location: '',
    meetingUrl: '',
    status: 'SCHEDULED',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  useEffect(() => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (event) {
      setFormData({
        title: event.title || '',
        description: event.description || '',
        eventType: event.eventType || 'MEETING',
        startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
        endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
        isAllDay: event.isAllDay || false,
        location: event.location || '',
        meetingUrl: event.meetingUrl || '',
        status: event.status || 'SCHEDULED',
      });
    } else if (selectedDateRange) {
      setFormData({
        title: '',
        description: '',
        eventType: 'MEETING',
        startTime: selectedDateRange.start ? new Date(selectedDateRange.start).toISOString().slice(0, 16) : '',
        endTime: selectedDateRange.end ? new Date(selectedDateRange.end).toISOString().slice(0, 16) : '',
        isAllDay: selectedDateRange.allDay || false,
        location: '',
        meetingUrl: '',
        status: 'SCHEDULED',
      });
    } else {
      const now = new Date();
      now.setMinutes(0, 0, 0);
      const end = new Date(now.getTime() + 60 * 60 * 1000);
      setFormData({
        title: '',
        description: '',
        eventType: 'MEETING',
        startTime: now.toISOString().slice(0, 16),
        endTime: end.toISOString().slice(0, 16),
        isAllDay: false,
        location: '',
        meetingUrl: '',
        status: 'SCHEDULED',
      });
    }
  }, [event, selectedDateRange, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    setErrorMsg(null);
  };

  const formatLocalTime = (timeStr) => {
    if (!timeStr) return null;
    return timeStr.length === 16 ? `${timeStr}:00` : timeStr;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // Validate required fields
    if (!formData.title.trim()) {
      setErrorMsg('Event Title is required.');
      return;
    }
    if (!formData.startTime) {
      setErrorMsg('Start Time is required.');
      return;
    }
    if (!formData.endTime) {
      setErrorMsg('End Time is required.');
      return;
    }
    if (new Date(formData.endTime) < new Date(formData.startTime)) {
      setErrorMsg('End Time cannot be before Start Time.');
      return;
    }

    setIsSubmitting(true);
    try {
      const dataToSubmit = {
        ...formData,
        startTime: formData.isAllDay ? `${formData.startTime.split('T')[0]}T00:00:00` : formatLocalTime(formData.startTime),
        endTime: formData.isAllDay ? `${formData.endTime.split('T')[0]}T23:59:59` : formatLocalTime(formData.endTime),
      };

      if (event?.id) {
        await calendarApi.updateEvent(event.id, dataToSubmit);
        setSuccessMsg('Event updated successfully!');
      } else {
        await calendarApi.createEvent(dataToSubmit);
        setSuccessMsg('Event created successfully!');
      }
      
      setTimeout(() => {
        onSave();
        setSuccessMsg(null);
      }, 1000);
    } catch (error) {
      console.error('Failed to save event:', error);
      setErrorMsg(error.message || 'Failed to save event. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!event?.id) return;
    if (confirm('Are you sure you want to delete this event?')) {
      try {
        await calendarApi.deleteEvent(event.id);
        onDelete();
      } catch (error) {
        console.error('Failed to delete event:', error);
        setErrorMsg('Failed to delete event.');
      }
    }
  };

  return (
    <Drawer isOpen={isOpen} onClose={onClose} title={event?.id ? "Edit Event" : "New Event"}>
      <form onSubmit={handleSubmit} className="flex-1 flex flex-col relative h-full">
        
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6 pb-32">
          
          {errorMsg && (
            <div className="p-3 bg-red-50 text-red-600 rounded-xl flex items-center gap-2 text-sm">
              <AlertCircle className="w-4 h-4" />
              {errorMsg}
            </div>
          )}
          
          {successMsg && (
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4" />
              {successMsg}
            </div>
          )}
          
          <Input
            label="Event Title"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Sync with Acme Corp"
            className="text-base"
          />

          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Type"
              name="eventType"
              value={formData.eventType}
              onChange={handleChange}
              options={[
                { value: 'MEETING', label: 'Meeting' },
                { value: 'CALL', label: 'Call' },
                { value: 'TASK', label: 'Task' },
                { value: 'FOLLOW_UP', label: 'Follow-up' },
                { value: 'INTERNAL', label: 'Internal' }
              ]}
            />
            <Select
              label="Status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              options={[
                { value: 'SCHEDULED', label: 'Scheduled' },
                { value: 'COMPLETED', label: 'Completed' },
                { value: 'CANCELED', label: 'Canceled' }
              ]}
            />
          </div>

          <label className="flex items-center gap-3 cursor-pointer group mt-2">
            <input
              type="checkbox"
              name="isAllDay"
              checked={formData.isAllDay}
              onChange={handleChange}
              className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 transition-all cursor-pointer"
            />
            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
              All Day Event
            </span>
          </label>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Start Time"
              name="startTime"
              type={formData.isAllDay ? "date" : "datetime-local"}
              required
              value={formData.startTime}
              onChange={handleChange}
            />
            <Input
              label="End Time"
              name="endTime"
              type={formData.isAllDay ? "date" : "datetime-local"}
              required
              value={formData.endTime}
              onChange={handleChange}
            />
          </div>

          <Input
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="e.g. Conference Room A"
          />

          <Input
            label="Meeting URL"
            name="meetingUrl"
            type="url"
            value={formData.meetingUrl}
            onChange={handleChange}
            placeholder="e.g. https://zoom.us/j/123"
          />

          <Textarea
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Meeting agenda, discussion points, or notes..."
            className="h-32"
          />

        </div>

        <div className="absolute bottom-0 left-0 right-0 px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
          {event?.id ? (
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleDelete}
              className="!bg-red-50 !text-red-600 hover:!bg-red-100 dark:!bg-red-500/10 dark:hover:!bg-red-500/20 dark:!text-red-400"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          ) : <div />}

          <div className="flex gap-3">
            <Button type="button" variant="ghost" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" loading={isSubmitting}>
              <Save className="w-4 h-4 mr-2" />
              {isSubmitting ? 'Saving...' : 'Save Event'}
            </Button>
          </div>
        </div>

      </form>
    </Drawer>
  );
}
