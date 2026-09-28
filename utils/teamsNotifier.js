const { request } = require('@playwright/test');

const WEBHOOK_URL = 'YOUR_TEAMS_WEBHOOK_URL';

async function sendTeamsMessage(content) {

    const apiContext = await request.newContext();

    try {

        const payload = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": "Automation Report",
            "themeColor": "0076D7",
            "title": "🚨 Playwright Automation Report",
            "text": content
        };

        const response = await apiContext.post(WEBHOOK_URL, {
            data: payload,
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Teams Status:', response.status());

    } catch (error) {

        console.log('Teams Notification Failed');
        console.log(error);

    } finally {

        await apiContext.dispose();
    }
}

module.exports = { sendTeamsMessage };