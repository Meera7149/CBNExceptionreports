/*const { test, request } = require('@playwright/test');
test.setTimeout(120000);
const fs = require('fs');
const WEBHOOK_URL = 'https://lenorasoft360.webhook.office.com/webhookb2/a1f43707-0be6-4cf0-bd61-0ee7ce765902@cb556afa-238c-4722-beee-edc04e7719b0/IncomingWebhook/ab34053429d84af7aabb7ed0cf161166/e87fa38a-df3f-45fc-b026-9645fa7e6448/V289aHmqrf5QvEH4xOlP9S-Ei9rgqla3t3Hia1D---vvM1';
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
        console.log(await response.text());

    } catch (error) {

        console.log('Error sending Teams message');
        console.log(error);

    } finally {

        await apiContext.dispose();
    }
}

test('Prod Exception', async ({ page }) => {

    let finalReport = [];
    let finalReport1 = [];

    try {

        await page.goto('http://100.100.60.116:8090/srx/');

        await page.getByRole('textbox', { name: 'Username' }).fill('Naidu_Chaganti');
        await page.getByRole('textbox', { name: 'Password' }).fill('Pwdchgd@123');
        await page.locator('#srm-log-frm').getByText('Sign In').click();
        await page.getByRole('button', { name: 'OK' }).click();
        await page.goto('http://100.100.60.116:8090/srx/reco/recomanage/duplicate_flight_booking_report_issue#!');

        await page.evaluate(() => {
       const input = document.querySelector('input[name="from_date"]');
       input.removeAttribute('readonly');
       input.value = '01-Jan-2023';
       input.dispatchEvent(new Event('change', { bubbles: true }));
       input.dispatchEvent(new Event('input', { bubbles: true }));
       });

       await page.evaluate(() => {
       const input = document.querySelector('input[name="to_date"]');
       input.removeAttribute('readonly');
       input.value = '31-Dec-2026';
       input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
       });

       await page.keyboard.press('Escape');
       await page.waitForTimeout(500);
       await page.getByRole('button', { name: 'SEARCH' }).click();
       await page.waitForTimeout(3000);

        // Report check
        const noData = await page.locator('td.dataTables_empty').count();

        if (noData > 0) {

            finalReport.push('Report 1 ❌ No Data Available');
        } else {

            const rows = page.locator('table tbody tr');
            const count = await rows.count();

            let tickets = [];

            for (let i = 0; i < count; i++) {

                const cols = await rows.nth(i).locator('td').allTextContents();
                tickets.push(cols[1]?.trim());
            }

            finalReport.push(
                `Report 1 ✅ Tickets Found: ${tickets.length}\nIDs: ${tickets.join(', ')}`
            );
        }

       } catch (error) {

        finalReport.push(`❌ Test Failed: ${error.message}`);

       } finally {

        const finalOutput =
            '\n========= FINAL REPORT =========\n\n' +
            finalReport.join('\n');

            fs.writeFileSync(
            'final-report.txt',
            finalOutput,
            'utf8'
        );

        console.log(finalOutput);
       }
       await page.waitForTimeout(3000);
       try{

      
     await page.goto('http://100.100.60.116:8090/srx/reco/recomanage/duplicate_flight_booking_report_issue#!');

        await page.evaluate(() => {
       const input = document.querySelector('input[name="from_date"]');
       input.removeAttribute('readonly');
       input.value = '01-Jan-2025';
       input.dispatchEvent(new Event('change', { bubbles: true }));
       input.dispatchEvent(new Event('input', { bubbles: true }));
       });

       await page.evaluate(() => {
       const input = document.querySelector('input[name="to_date"]');
       input.removeAttribute('readonly');
       input.value = '31-Dec-2026';
       input.dispatchEvent(new Event('change', { bubbles: true }));
        input.dispatchEvent(new Event('input', { bubbles: true }));
       });

       await page.keyboard.press('Escape');
       await page.waitForTimeout(500);
       await page.getByRole('button', { name: 'SEARCH' }).click();
       //await page.waitForTimeout(3000);

        // Report check
        const noData = await page.locator('td.dataTables_empty').count();

        if (noData > 0) {

            finalReport1.push('Report 1 ❌ No Data Available');
        } else {

            const rows = page.locator('table tbody tr');
            const count = await rows.count();

            let tickets = [];

            for (let i = 0; i < count; i++) {

                const cols = await rows.nth(i).locator('td').allTextContents();
                tickets.push(cols[1]?.trim());
            }

            finalReport1.push(
                `Report 1 ✅ Tickets Found: ${tickets.length}\nIDs: ${tickets.join(', ')}`
            );
        }

       } catch (error) {

        finalReport1.push(`❌ Test Failed: ${error.message}`);

    } finally {

        const finalOutput1 =
            '\n========= FINAL REPORT1 =========\n\n' +
            finalReport1.join('\n\n');

        console.log(finalOutput1);
    










        fs.writeSync(
            'final-report.txt',
            finalOutput1,
            'utf8'
        );
    

    




        console.log('Report saved into final-report.txt');

        // ✅ SEND TO TEAMS
        await sendMessage(finaloutput,finalOutput1);
    }
});*/