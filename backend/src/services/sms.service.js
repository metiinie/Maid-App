const AfricasTalking = require('africastalking');

let sms = null;
if (process.env.AT_API_KEY && process.env.AT_API_KEY !== 'mock_africas_talking_api_key') {
    try {
        const client = AfricasTalking({
            apiKey: process.env.AT_API_KEY,
            username: process.env.AT_USERNAME || 'sandbox'
        });
        sms = client.SMS;
    } catch (err) {
        console.warn('⚠️ Failed to initialize Africa\'s Talking SDK, fallback to mock SMS.');
    }
}

async function sendSMS({ to, message }) {
    const recipients = Array.isArray(to) ? to : [to];

    if (sms) {
        try {
            const response = await sms.send({
                to: recipients,
                message,
                from: process.env.AT_SENDER_ID || 'AGENCY'
            });
            console.log('📲 SMS sent successfully via Africa\'s Talking:', response);
            return { success: true, response };
        } catch (err) {
            console.error('❌ Africa\'s Talking SMS failed:', err.message);
            return { success: false, error: err.message };
        }
    } else {
        console.log(`[MOCK SMS] To: ${recipients.join(', ')} | Message: "${message}"`);
        return { success: true, mock: true };
    }
}

async function sendOTP({ phone, otp, purpose }) {
    const messages = {
        registration: `Your EthioRecruit verification code is: ${otp}. Valid for 10 minutes.`,
        password_reset: `Your EthioRecruit password reset code is: ${otp}. Valid for 10 minutes.`,
        login: `Your EthioRecruit login code is: ${otp}. Valid for 10 minutes.`
    };

    const message = messages[purpose] || `Your EthioRecruit code is: ${otp}`;
    return sendSMS({ to: phone, message });
}

module.exports = { sendSMS, sendOTP };
