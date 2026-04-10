import { workOrdersData } from '../data/workOrderData';

let workOrders = [...workOrdersData];

export const workOrderService = {
    getAll: async () => {
        return [...workOrders];
    },

    getById: async (id) => {
        const order = workOrders.find((wo) => wo.id === id || wo.id === Number(id));
        if (order) return { ...order };
        return null;
    },

    create: async (data) => {
        const newWorkOrder = {
            id: Date.now(),
            ...data,
            createdDate: new Date().toISOString().split('T')[0],
        };
        workOrders.unshift(newWorkOrder);
        return { ...newWorkOrder };
    },

    update: async (id, data) => {
        const index = workOrders.findIndex((wo) => wo.id === id || wo.id === Number(id));
        if (index !== -1) {
            workOrders[index] = { ...workOrders[index], ...data };
            return { ...workOrders[index] };
        }
        return null;
    },

    remove: async (id) => {
        const index = workOrders.findIndex((wo) => wo.id === id || wo.id === Number(id));
        if (index !== -1) {
            const removed = workOrders.splice(index, 1)[0];
            return { ...removed };
        }
        return null;
    },
};