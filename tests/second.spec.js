/*const { test, request } = require('@playwright/test');
const { getLastMonthDates } = require('../utils/getLastMonthDates');
//clsconst { getCurrentMonthDates} = require('../utils/dateUtils');
const fs = require('fs');

test.setTimeout(600000);

const WEBHOOK_URL = 'https://lenorasoft360.webhook.office.com/webhookb2/a1f43707-0be6-4cf0-bd61-0ee7ce765902@cb556afa-238c-4722-beee-edc04e7719b0/IncomingWebhook/ab34053429d84af7aabb7ed0cf161166/e87fa38a-df3f-45fc-b026-9645fa7e6448/V289aHmqrf5QvEH4xOlP9S-Ei9rgqla3t3Hia1D---vvM1';
const REPORT_FILE = 'final-report.txt';

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
// TEAMS NOTIFICATION
// ========================================

async function sendMessage(content) {

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

    // ========================================
    // EXCLUDED TICKETS
    // ========================================

    const excludedTickets = [
        '176-3902305547',
        '141-5512147100-1',
        'GG8Z22-1',
        'LW7J2W-1'
    ];

    // ========================================
    // COLUMN MAPPING
    // ========================================

    const reportColumnMap = {
        'Duplicate in Flight booking Report-Issue': 3,
        "Ticket Number with Wrong Format in NDC's Report": 3,
        'Amount mismatch between Flight Booking and Sold Report': 3
    };

    const tdIndex = reportColumnMap[reportName] || 3;

    try {

        const noData = await page
            .locator('td.dataTables_empty')
            .count();

        if (noData > 0) {

            result =
`${reportName} Ticket Count ------ 0 Tickets ------`;

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

                // ========================================
                // EXCLUDE TICKETS
                // ========================================

                if (
                    cleanTicket &&
                    !excludedTickets.includes(cleanTicket)
                ) {

                    remainingTickets.push(cleanTicket);
                }
            }

            // ========================================
            // REMOVE DUPLICATES
            // ========================================

            remainingTickets =
                [...new Set(remainingTickets)];

            const finalCount = remainingTickets.length;

            result =
`${reportName} Ticket Count ------ ${finalCount} Tickets ------ ${remainingTickets.join(', ')}`;
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

        // ========================================
        // OPEN URL
        // ========================================

        await page.goto(url);

        // ========================================
        // FROM DATE
        // ========================================

        await page.evaluate((fromDate) => {

            const input =
                document.querySelector(
                    'input[name="from_date"]'
                );

            input.removeAttribute('readonly');

            input.value = fromDate;

            input.dispatchEvent(
                new Event('input', { bubbles: true })
            );

            input.dispatchEvent(
                new Event('change', { bubbles: true })
            );

        }, fromDate);

        // ========================================
        // TO DATE
        // ========================================

        await page.evaluate((toDate) => {

            const input =
                document.querySelector(
                    'input[name="to_date"]'
                );

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

        // ========================================
        // SEARCH
        // ========================================

        await page.getByRole('button', {
            name: 'SEARCH'
        }).click();

        await page.waitForLoadState('networkidle');

        await page.waitForTimeout(5000);

        // ========================================
        // GET REPORT DATA
        // ========================================

        return await getTickets(page, reportName);

    } catch (error) {

        return `${reportName} ❌ ERROR: ${error.message}`;
    }
}

// ========================================
// MAIN TEST
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

test('Prod Exception', async ({ page }) => {

    // CLEAR OLD REPORT
    fs.writeFileSync(REPORT_FILE, '', 'utf8');

    let allReports = [];

    const todayDate = getTodayDate();

    try {

        // ========================================
        // LOGIN
        // ========================================

      await login(page);

        // ========================================
        // REPORT 1
        // ========================================

        const report1 = await generateReport(page, {

            reportName:
                'Duplicate in Flight booking Report-Issue',

            url: 'http://100.100.50.14/srx/reco/recomanage/duplicate_flight_booking_report_issue#!',

            fromDate: '01-Jan-2026',

            toDate: todayDate
        });

        allReports.push(report1);

        // ========================================
        // REPORT 2
        // ========================================

        const report2 = await generateReport(page, {

            reportName:
                "Ticket Number with Wrong Format in NDC's Report",

            url: 'http://100.100.50.14/srx/reco/recomanage/ndc_ticket_number_with_wrong_format#!',

            fromDate: '01-Jan-2023',

            toDate: todayDate
        });

        allReports.push(report2);

        // ========================================
        // REPORT 3
        // ========================================

        const report3 = await generateReport(page, {

            reportName:
                'Amount mismatch between Flight Booking and Sold Report',

            url: 'http://100.100.50.14/srx/reco/recomanage/amount_mismatch_between_flight_booking_and_sold_report#!',

            fromDate: '01-Jan-2023',

            toDate: todayDate
        });

        allReports.push(report3);

    } catch (error) {

        allReports.push(
            `❌ TEST FAILED\n${error.message}`
        );

    } finally {

        // ========================================
        // FINAL FORMAT
        // ========================================

        const finalMessage = `
# Travel Project Exception Ticket

### Jan-23-to-CurrentMonth :

${allReports.join('<br><br>')}
`;

        console.log(finalMessage);

        // SAVE REPORT
        saveReport('FINAL SUMMARY', finalMessage);

        // SEND TO TEAMS
        await sendMessage();

        console.log('Teams notification sent');
    }
})
 test('Prod Exception1', async ({ page }) => {
  const dates = getLastMonthDates();
  
    // CLEAR OLD REPORT
    fs.writeFileSync(REPORT_FILE, '', 'utf8');

    let allReports = [];

    const todayDate = getTodayDate();

    try {

        // ========================================
        // LOGIN
        // ========================================

      await login(page);

        // ========================================
        // REPORT 1
        // ========================================

        const report1 = await generateReport(page, {

            reportName:
                'Duplicate in Flight booking Report-Issue',

            url: 'http://100.100.50.14/srx/reco/recomanage/duplicate_flight_booking_report_issue#!',

            fromDate: dates.startDate ,

            toDate: dates.endDate 
        });

        allReports.push(report1);

        // ========================================
        // REPORT 2
        // ========================================

        const report2 = await generateReport(page, {

            reportName:
                "Ticket Number with Wrong Format in NDC's Report",

            url: 'http://100.100.50.14/srx/reco/recomanage/ndc_ticket_number_with_wrong_format#!',

            fromDate: dates.startDate,

            toDate: dates.endDate
        });

        allReports.push(report2);

        // ========================================
        // REPORT 3
        // ========================================

        const report3 = await generateReport(page, {

            reportName:
                'Amount mismatch between Flight Booking and Sold Report',

            url: 'http://100.100.50.14/srx/reco/recomanage/amount_mismatch_between_flight_booking_and_sold_report#!',

            fromDate: dates.startDate,

            toDate: dates.endDate
        });

        allReports.push(report3);

    } catch (error) {

        allReports.push(
            `❌ TEST FAILED\n${error.message}`
        );

    } finally {

        // ========================================
        // FINAL FORMAT
        // ========================================

        const finalMessage = `
# Travel Project Exception Ticket

### Jan-23-to-CurrentMonth1 :

${allReports.join('<br><br>')}
`;

        console.log(finalMessage);

        // SAVE REPORT
        saveReport('FINAL SUMMARY', finalMessage);

        // SEND TO TEAMS
        await sendMessage(finalMessage);

        console.log('Teams notification sent');
    }
});
;*/