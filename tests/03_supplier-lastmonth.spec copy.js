const { test, request } = require('@playwright/test');
const { getLastMonthDates } = require('../utils/getLastMonthDates');
const { getCurrentMonthDates } = require('../utils/getCurrentMonthDates');
const fs = require('fs');

test.setTimeout(600000);

// ========================================
// CONFIG
// ========================================

const WEBHOOK_URL = 'https://lenorasoft360.webhook.office.com/webhookb2/a1f43707-0be6-4cf0-bd61-0ee7ce765902@cb556afa-238c-4722-beee-edc04e7719b0/IncomingWebhook/ab34053429d84af7aabb7ed0cf161166/e87fa38a-df3f-45fc-b026-9645fa7e6448/V289aHmqrf5QvEH4xOlP9S-Ei9rgqla3t3Hia1D---vvM1'; // Teams Webhook URL
const REPORT_FILE = 'ExceptionReport2.txt';

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
            'LW7J2W-1',
            '607-5512313739',
    	    '607-5512343682',
    	    '607-5512213690',
    	    '607-5512289800',
    	    '607-5512289802',
    	    '607-5512278740',
    	    '607-5512289775',
    	    '607-5512353231',
    	    '607-5512334677',
    	    '607-5512317237',
    	    '607-5512313740',
    	    '607-5512368171',
    	    '607-5512353199',
    	    '001-0820159946',
    	    '001-0820159944',
    	    '001-0820159945',
    	    '607-5512289826',
    	    '176-5512716706',
    	    '176-5512716710',
    	    '607-5512335764',
    	    '607-5512334841',
    	    '607-5512387573',
    	    '607-5512387574',
    	    '607-5512387575'
    ];

    const reportColumnMap = {
        'Duplicate in Flight booking Report-Issue': 3,
        'Ticket in Flight Booking but missing in Sold Report-Issue':5,
        "Ticket Number with Wrong Format in NDC's Report": 3,
        'Amount mismatch between Flight Booking and Sold Report': 3,
        'Duplicate in Flight booking Report-Refund':2,
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

         await page.locator('xpath=//*[@id="example_wrapper"]/div[1]/button[4]/span').click();

// Wait for page/network to finish loading
        await page.waitForLoadState('networkidle');

// Replace Thread.sleep(9000)
       await page.waitForTimeout(9000);

      await page.locator('xpath=//*[@id="example_wrapper"]/div[1]/div/button[4]/span').click();

       await page.waitForLoadState('networkidle');

        await page.waitForTimeout(9000);

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

test('Prod Exception - Previous Month & Current Month', async ({ page }) => {

    const allReports = [];
    const todayDate = getTodayDate();

    try {

        await login(page);

        // =========================
        // PREVIOUS MONTH REPORT
        // =========================
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
         const finalMessage = `
### Jan-2025 to Till Today :

${allReports.join('<br><br>')}
`;

const report5 = await generateReport(page, {
            reportName: 'Duplicate in Flight booking Report-Refund',
            url: 'http://100.100.50.14/srx/reco/recomanage/duplicate_flight_booking_report_refund#!',
            fromDate: '01-Jan-2026',
            toDate: todayDate
        });

        //allReports.push(report5);

                allReports.push(`
### Jan-2026 to Till Today :

${report5}
`);

        const lastMonthDates = getLastMonthDates();

        const previousMonth = new Date();
        previousMonth.setMonth(previousMonth.getMonth() - 1);

        const previousMonthName = previousMonth.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const previousMonthReport = await generateReport(page, {
            reportName: 'Supplier mismatch between Issue & Void in Flight booking report',
            url: 'http://100.100.50.14/srx/reco/recomanage/supplier_mismatch_between_void_and_flight_booking_report#!',
            fromDate: lastMonthDates.startDate,
            toDate: lastMonthDates.endDate
        });

        allReports.push(`
### ${previousMonthName}

${previousMonthReport}
`);

        // =========================
        // CURRENT MONTH REPORT
        // =========================

        const currentMonthDates = getCurrentMonthDates();

        const currentMonth = new Date();

        const currentMonthName = currentMonth.toLocaleString('en-US', {
            month: 'long',
            year: 'numeric'
        });

        const currentMonthReport = await generateReport(page, {
            reportName: 'Supplier mismatch between Issue & Void in Flight booking report',
            url: 'http://100.100.50.14/srx/reco/recomanage/supplier_mismatch_between_void_and_flight_booking_report#!',
            fromDate: currentMonthDates.startDate,
            toDate: currentMonthDates.endDate
        });

        allReports.push(`
### ${currentMonthName}

${currentMonthReport}
`);

    } catch (error) {

        allReports.push(`
❌ TEST FAILED

${error.message}
`);
    }

    const finalMessage = `
# Travel Project Exception Ticket

### Jan-2025 to Till Today :

${allReports.join('<br><br>')}
`;

    console.log(finalMessage);

    saveReport('FINAL SUMMARY', finalMessage);

    await sendMessage(finalMessage);

    console.log('Teams notification sent successfully');
});
