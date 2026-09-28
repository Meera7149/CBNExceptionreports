async function generateReport(page, options) {

    const {
        reportName,
        url,
        fromDate,
        toDate
    } = options;

    let result = '';

    try {

        await page.goto(url);

        // Set dates
        await page.evaluate(({ fromDate, toDate }) => {

            const fromInput = document.querySelector('input[name="from_date"]');
            fromInput.removeAttribute('readonly');
            fromInput.value = fromDate;
            fromInput.dispatchEvent(new Event('change', { bubbles: true }));

            const toInput = document.querySelector('input[name="to_date"]');
            toInput.removeAttribute('readonly');
            toInput.value = toDate;
            toInput.dispatchEvent(new Event('change', { bubbles: true }));

        }, { fromDate, toDate });

        await page.keyboard.press('Escape');

        await page.getByRole('button', { name: 'SEARCH' }).click();

        await page.waitForTimeout(3000);

        const noData = await page.locator('td.dataTables_empty').count();

        if (noData > 0) {

            result = `${reportName} ❌ No Data Available`;

        } else {

            const rows = page.locator('table tbody tr');
            const count = await rows.count();

            let tickets = [];

            for (let i = 0; i < count; i++) {

                const cols = await rows.nth(i).locator('td').allTextContents();

                tickets.push(cols[1]?.trim());
            }

            result =
                `${reportName} ✅ Tickets Found: ${tickets.length}\n` +
                `IDs: ${tickets.join(', ')}`;
        }

    } catch (error) {

        result = `${reportName} ❌ Failed\n${error.message}`;
    }

    return result;
}

module.exports = { generateReport };