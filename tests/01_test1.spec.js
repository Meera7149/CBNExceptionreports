const { test, request } = require('@playwright/test');
const { getLastMonthDates } = require('../utils/getLastMonthDates');
const fs = require('fs');

test.setTimeout(600000);

// ========================================
// CONFIG
// ========================================

const WEBHOOK_URL = 'https://lenorasoft360.webhook.office.com/webhookb2/a1f43707-0be6-4cf0-bd61-0ee7ce765902@cb556afa-238c-4722-beee-edc04e7719b0/IncomingWebhook/ab34053429d84af7aabb7ed0cf161166/e87fa38a-df3f-45fc-b026-9645fa7e6448/V289aHmqrf5QvEH4xOlP9S-Ei9rgqla3t3Hia1D---vvM1'; // Teams Webhook URL
const REPORT_FILE = 'ExceptionReport.txt';

// Create report file if not exists
if (!fs.existsSync(REPORT_FILE)) {
    fs.writeFileSync(REPORT_FILE, '', 'utf8');
}

// ========================================
// GET TODAY DATE
// ========================================

function getTodayDate() {
    const today = new Date();

    const day = String(today.getDate()).padStart(2, '0');

    const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr',
        'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();

    return `${day}-${month}-${year}`;
}

// ========================================
// SEND TEAMS MESSAGE
// ========================================

async function sendMessage(content) {

    if (!WEBHOOK_URL) {
        console.log('Teams Webhook URL is empty');
        return;
    }

    const apiContext = await request.newContext();

    try {

        const payload = {
            "@type": "MessageCard",
            "@context": "https://schema.org/extensions",
            "summary": "Automation Report",
            "themeColor": "FF0000",
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

        if (!response.ok()) {
            console.log('Teams Error Response:');
            console.log(await response.text());
        }

    } catch (error) {

        console.log('Error sending Teams message');
        console.log(error.message);

    } finally {

        await apiContext.dispose();
    }
}

// ========================================
// SAVE REPORT
// ========================================

function saveReport(title, content) {

    fs.appendFileSync(
        REPORT_FILE,
        `\n========= ${title} =========\n\n${content}\n`,
        'utf8'
    );

    console.log(`${title} saved into ${REPORT_FILE}`);
}

// ========================================
// GET TICKETS
// ========================================

async function getTickets(page, reportName) {

    let result = '';

    const excludedTickets = [
    '176-3902305547',
    '141-5512147100-1',
    'GG8Z22-1',
    'LW7J2W-1'
    ];

    const reportColumnMap = {
        'Duplicate in Flight booking Report-Issue': 3,
        'Ticket in Flight Booking but missing in Sold Report-Issue':5,
        "Ticket Number with Wrong Format in NDC's Report": 3,
        'Amount mismatch between Flight Booking and Sold Report': 3,
        
        'Supplier mismatch between Issue & Void in Flight booking report':2
        
        

    };

    const tdIndex = reportColumnMap[reportName] || 3;

    try {

        const noData = await page
            .locator('td.dataTables_empty')
            .count();

        if (noData > 0) {

            result =
                `${reportName}--- 0`;

        } else {

            const rows = page.locator('table tbody tr');

            const rowCount = await rows.count();

            let remainingTickets = [];

            for (let i = 0; i < rowCount; i++) {

                const ticketRaw = await rows
                    .nth(i)
                    .locator(`td:nth-child(${tdIndex})`)
                    .innerText();

                const cleanTicket = ticketRaw
                    .replace(/\s+/g, '')
                    .trim();

                if (
                    cleanTicket &&
                    !excludedTickets.includes(cleanTicket)
                ) {
                    remainingTickets.push(cleanTicket);
                }
            }

            remainingTickets = [...new Set(remainingTickets)];

            const finalCount = remainingTickets.length;

            result = `${reportName} ------ ${finalCount}<br>${remainingTickets.join(', ')}`;
        }

    } catch (error) {

        result =
            `${reportName} ❌ ERROR: ${error.message}`;
    }

    return result;
}

// ========================================
// GENERATE REPORT
// ========================================

async function generateReport(page, options) {

    const {
        reportName,
        url,
        fromDate,
        toDate
    } = options;

    try {

        await page.goto(url);

        await page.evaluate((fromDate) => {

            const input =
                document.querySelector('input[name="from_date"]');

            input.removeAttribute('readonly');
            input.value = fromDate;

            input.dispatchEvent(
                new Event('input', { bubbles: true })
            );

            input.dispatchEvent(
                new Event('change', { bubbles: true })
            );

        }, fromDate);

        await page.evaluate((toDate) => {

            const input =
                document.querySelector('input[name="to_date"]');

            input.removeAttribute('readonly');
            input.value = toDate;

            input.dispatchEvent(
                new Event('input', { bubbles: true })
            );

            input.dispatchEvent(
                new Event('change', { bubbles: true })
            );

        }, toDate);

        await page.keyboard.press('Escape');

        await page.getByRole('button', {
            name: 'SEARCH'
        }).click();

        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        await page.waitForTimeout(5000);
        await page.waitForTimeout(5000);

        return await getTickets(page, reportName);

    } catch (error) {

        return `${reportName} ❌ ERROR: ${error.message}`;
    }
}

// ========================================
// LOGIN
// ========================================

async function login(page) {

    await page.goto('http://100.100.50.14/srx/');

    await page.getByRole('textbox', {
        name: 'Username'
    }).fill('BT_SUPPORT');

    await page.getByRole('textbox', {
        name: 'Password'
    }).fill('OTA@#$2024');

    await page.locator('#srm-log-frm')
        .getByText('Sign In')
        .click();

    await page.waitForTimeout(3000);

    await page.getByRole('button', {
        name: 'OK'
    }).click();

    await page.waitForTimeout(5000);
}

// ========================================
// TEST 1
// ========================================

test('Prod Exception', async ({ page }) => {

    let allReports = [];
    const todayDate = getTodayDate();

    try {

        await login(page);

        const report1 = await generateReport(page, {
            reportName: 'Duplicate in Flight booking Report-Issue',
            url: 'http://100.100.50.14/srx/reco/recomanage/duplicate_flight_booking_report_issue#!',
            fromDate: '01-Jan-2025',
            toDate: todayDate
        });

        allReports.push(report1);
        await page.goto('http://100.100.50.14/srx/reco/sold_report#!');
        await page.waitForLoadState('networkidle');
        await page.waitForTimeout(5000);
        const report2 = await generateReport(page, {
              reportName: 'Ticket in Flight Booking but missing in Sold Report-Issue',
            url: 'http://100.100.50.14/srx/reco/recomanage/ticket_flight_booking_butmissing_in_sold_report_issue#!',
            fromDate: '01-Jan-2025',
            toDate: todayDate

            
        });

        allReports.push(report2);

        const report3 = await generateReport(page, {


            reportName: "Ticket Number with Wrong Format in NDC's Report",
            url: 'http://100.100.50.14/srx/reco/recomanage/ndc_ticket_number_with_wrong_format#!',
            fromDate: '01-Jan-2025',
            toDate: todayDate
        });

        allReports.push(report3);
        const report4 = await generateReport(page, {


            reportName: "Amount mismatch between Flight Booking and Sold Report",
            url: 'http://100.100.50.14/srx/reco/recomanage/amount_mismatch_between_flight_booking_and_sold_report#!',
            fromDate: '01-Jan-2025',
            toDate: todayDate
        });

        allReports.push(report4);




    } catch (error) {

        allReports.push(`❌ TEST FAILED\n${error.message}`);
    }

    const finalMessage = `
# Travel Project Exception Ticket

### Jan-2025 to Till Today :

${allReports.join('<br><br>')}
`;

    console.log(finalMessage);

   await saveReport('FINAL SUMMARY', finalMessage);

    await sendMessage(finalMessage);

    console.log('Teams notification sent');
});

