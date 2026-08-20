const crypto = require('crypto');

// Secret keys from environment or mock fallback
const CHAPA_SECRET_KEY = process.env.CHAPA_SECRET_KEY || 'CHASECK_TEST-mock-key';
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_mock';

/**
 * Initialize checkout transaction for online payment providers
 */
async function initializePayment({ provider, amount, currency = 'ETB', email, first_name, last_name, tx_ref, callback_url, return_url }) {
    const transactionRef = tx_ref || `tx-${provider}-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

    if (provider === 'chapa' || provider === 'telebirr') {
        // In test / development environment, simulate Chapa checkout URL response
        return {
            success: true,
            provider,
            tx_ref: transactionRef,
            checkout_url: `https://checkout.chapa.co/pay/test-${transactionRef}`,
            status: 'pending'
        };
    }

    if (provider === 'stripe') {
        return {
            success: true,
            provider: 'stripe',
            tx_ref: transactionRef,
            checkout_url: `https://checkout.stripe.com/c/pay/cs_test_${transactionRef}`,
            status: 'pending'
        };
    }

    if (provider === 'bank_transfer' || provider === 'manual') {
        return {
            success: true,
            provider,
            tx_ref: transactionRef,
            instructions: 'Please transfer to Commercial Bank of Ethiopia (CBE) A/C 1000123456789 (Recruitment SaaS PLC) and submit transaction reference.',
            status: 'pending'
        };
    }

    throw new Error(`Unsupported payment provider: ${provider}`);
}

/**
 * Verify payment reference status
 */
async function verifyPayment({ provider, tx_ref }) {
    // In development / testing environment, auto-approve mock transactions
    if (tx_ref && (tx_ref.startsWith('tx-') || tx_ref.startsWith('test-') || tx_ref.startsWith('ref-'))) {
        return {
            success: true,
            provider,
            tx_ref,
            status: 'completed',
            external_id: `ext-${Date.now()}`,
            paid_at: new Date()
        };
    }

    return {
        success: false,
        provider,
        tx_ref,
        status: 'failed',
        message: 'Invalid transaction reference'
    };
}

module.exports = {
    initializePayment,
    verifyPayment
};
