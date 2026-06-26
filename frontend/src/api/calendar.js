import { api } from '../services/api';

const ENDPOINT = '/calendar';

export const calendarApi = {
    getEvents: async (start, end, ownOnly = false) => {
        const params = new URLSearchParams({ start, end });
        if (ownOnly) {
            params.append('ownOnly', 'true');
        }
        return await api.get(`${ENDPOINT}?${params.toString()}`);
    },

    getEventById: async (id) => {
        return await api.get(`${ENDPOINT}/${id}`);
    },

    createEvent: async (data) => {
        return await api.post(ENDPOINT, data);
    },

    updateEvent: async (id, data) => {
        return await api.put(`${ENDPOINT}/${id}`, data);
    },

    deleteEvent: async (id) => {
        return await api.delete(`${ENDPOINT}/${id}`);
    }
};
