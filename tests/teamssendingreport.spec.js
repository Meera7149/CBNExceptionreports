/*const { test, request } = require('@playwright/test');
const fs = require('fs');

test.setTimeout(600000);

const WEBHOOK_URL = 'https://lenorasoft360.webhook.office.com/webhookb2/a1f43707-0be6-4cf0-bd61-0ee7ce765902@cb556afa-238c-4722-beee-edc04e7719b0/IncomingWebhook/ab34053429d84af7aabb7ed0cf161166/e87fa38a-df3f-45fc-b026-9645fa7e6448/V289aHmqrf5QvEH4xOlP9S-Ei9rgqla3t3Hia1D---vvM1';
const REPORT_FILE = 'final-report.txt';

// ========================================
// GET TODAY DATE DYNAMICALLY
// FORMAT: 27-May-2026
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
// WRITE REPORT TO FILE
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

    // Excluded tickets
    const excludedTickets = new Set([
     '176-3902305547","141-5512147100-1","GG8Z22-1","LW7J2W-1',
        
        
    ]);

    // Column mapping based on report
    const reportColumnMap = {
        'Report 1': 3,
        'Report 2': 3,
        'Report 3': 3
    };

    const tdIndex = reportColumnMap[reportName] || 3;

    try {

        const noData = await page.locator('td.dataTables_empty').count();

        if (noData > 0) {

            result = `${reportName} ❌ No Data Available`;

        } else {

            const rows = page.locator('table tbody tr');

            const count = await rows.count();

            let tickets = [];

            for (let i = 0; i < count; i++) {

                const ticket = await rows
                    .nth(i)
                    .locator(`td:nth-child(${tdIndex})`)
                    .innerText();

                const cleanTicket = ticket.trim();

                if (
                    cleanTicket &&
                    !excludedTickets.has(cleanTicket)
                ) {
                    tickets.push(cleanTicket);
                }
            }

            result =
                `${reportName} ✅ Tickets Found: ${tickets.length}\n` +
                `IDs: ${tickets.join(', ')}`;
        }

    } catch (error) {

        result = `${reportName} ❌ ERROR: ${error.message}`;
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

        // FROM DATE
        await page.evaluate((fromDate) => {

            const input = document.querySelector('input[name="from_date"]');

            input.removeAttribute('readonly');
            input.value = fromDate;

            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

        }, fromDate);

        // TO DATE
        await page.evaluate((toDate) => {

            const input = document.querySelector('input[name="to_date"]');

            input.removeAttribute('readonly');
            input.value = toDate;

            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));

        }, toDate);

        await page.keyboard.press('Escape');

        // SEARCH
        await page.getByRole('button', {
            name: 'SEARCH'
        }).click();
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        // Better wait
        await page.waitForLoadState('networkidle');

        // Small stability wait
        await page.waitForTimeout(3000);

        // GET TICKETS
        return await getTickets(page, reportName);

    } catch (error) {

        return `${reportName} ❌ ERROR: ${error.message}`;
    }
}

// ========================================
// MAIN TEST
// ========================================

test('Prod Exception', async ({ page }) => {

    // Clear old report
    fs.writeFileSync(REPORT_FILE, '', 'utf8');

    let allReports = [];

    // Dynamic today's date
    const todayDate = getTodayDate();

    try {

        // ========================================
        // LOGIN
        // ========================================

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

        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        await page.waitForTimeout(3000);
        // ========================================
        // REPORT 1
        // ========================================

        const report1 = await generateReport(page, {
            reportName: 'Report 1',
            url: 'http://100.100.50.14/srx/reco/recomanage/duplicate_flight_booking_report_issue#!',
            fromDate: '01-Jan-2026',
            toDate: todayDate
        });

        saveReport('REPORT 1', report1);

        allReports.push(report1);

        // ========================================
        // REPORT 2
        // ========================================

        const report2 = await generateReport(page, {
            reportName: 'Report 2',
            url: 'http://100.100.50.14/srx/reco/recomanage/ndc_ticket_number_with_wrong_format#!',
            fromDate: '01-Jan-2023',
            toDate: todayDate
        });

        saveReport('REPORT 2', report2);

        allReports.push(report2);

        // ========================================
        // REPORT 3
        // ========================================

        const report3 = await generateReport(page, {
            reportName: 'Report 3',
            url: 'http://100.100.50.14/srx/reco/recomanage/amount_mismatch_between_flight_booking_and_sold_report#!',
            fromDate: '01-Jan-2023',
            toDate: todayDate
        });

        saveReport('REPORT 3', report3);

        allReports.push(report3);

    } catch (error) {

        const failMessage =
            `❌ TEST FAILED\n${error.message}`;

        saveReport('ERROR', failMessage);

        allReports.push(failMessage);

    } finally {

        // ========================================
        // FINAL REPORT
        // ========================================

        const finalMessage =
            '========= FINAL REPORT =========\n\n' +
            allReports.join('\n\n');

        console.log(finalMessage);

        saveReport('FINAL SUMMARY', finalMessage);

        await sendMessage(finalMessage);

        console.log('Teams notification sent');
    }
});*/