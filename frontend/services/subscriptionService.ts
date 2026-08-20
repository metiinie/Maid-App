import api from './api';

export const subscriptionService = {
    getSubscriptionPlans: () =>
        api.get('/subscriptions/plans'),

    getAgencySubscription: () =>
        api.get('/admin/subscription'),

    initializeCheckout: (planId: string, paymentProvider = 'chapa') =>
        api.post('/admin/subscription/checkout', { plan_id: planId, payment_provider: paymentProvider }),

    verifyPayment: (txRef: string, provider = 'chapa') =>
        api.post('/admin/subscription/verify', { tx_ref: txRef, provider }),

    getAgencyInvoices: () =>
        api.get('/admin/subscription/invoices'),

    getAgencyTransactions: () =>
        api.get('/admin/subscription/transactions'),
};
