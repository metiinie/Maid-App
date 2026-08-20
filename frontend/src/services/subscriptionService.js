import api from './api';

export const subscriptionService = {
    // Public Plans Listing
    getSubscriptionPlans: () =>
        api.get('/subscriptions/plans'),

    // Admin Get Agency Active Subscription & Usage Limits
    getAgencySubscription: () =>
        api.get('/admin/subscription'),

    // Admin Initialize Checkout Session (Chapa / Telebirr / Stripe / CBE Transfer)
    initializeCheckout: (planId, paymentProvider = 'chapa') =>
        api.post('/admin/subscription/checkout', { plan_id: planId, payment_provider: paymentProvider }),

    // Admin Verify Payment Reference & Activate Subscription
    verifyPayment: (txRef, provider = 'chapa') =>
        api.post('/admin/subscription/verify', { tx_ref: txRef, provider }),

    // Admin Invoices List
    getAgencyInvoices: () =>
        api.get('/admin/subscription/invoices'),

    // Admin Payment Transactions List
    getAgencyTransactions: () =>
        api.get('/admin/subscription/transactions')
};
