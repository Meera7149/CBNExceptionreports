const ExcelJS = require('exceljs');

async function createFiles() {

    // =========================
    // 📁 CREATE FIL
    // =========================
    const wb1 = new ExcelJS.Workbook();
    const ws1 = wb1.addWorksheet('Sheet1');

    ws1.addRow(['EmpID', 'Name', 'Dept']);
    ws1.addRow([1001, 'John', 'IT']);
    ws1.addRow([1002, 'David', 'HR']);
    ws1.addRow([1003, 'Sam', 'Finance']);
    ws1.addRow([1001, 'John', 'IT']); // duplicate
    ws1.addRow([1004, 'Alex', 'Sales']);

    await wb1.xlsx.writeFile('File1.xlsx');

    // =========================
    // 📁 CREATE FILE2 (LOOKUP)
    // =========================
    const wb2 = new ExcelJS.Workbook();
    const ws2 = wb2.addWorksheet('Sheet1');

    ws2.addRow(['EmpID', 'Location']);
    ws2.addRow([1001, 'Abu Dhabi']);
    ws2.addRow([1002, 'Dubai']);
    ws2.addRow([1003, 'Sharjah']);
    ws2.addRow([1004, 'Ajman']);

    await wb2.xlsx.writeFile('File2.xlsx');
}

async function processExcel() {

    const wb1 = new ExcelJS.Workbook();
    await wb1.xlsx.readFile('File1.xlsx');

    const sheet1 = wb1.getWorksheet('Sheet1');

    let sheet2 = wb1.getWorksheet('Sheet2');
    if (!sheet2) sheet2 = wb1.addWorksheet('Sheet2');

    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.readFile('File2.xlsx');

    const lookupSheet = wb2.getWorksheet('Sheet1');

    // =========================
    // 🔍 Build lookup map
    // =========================
    const map = {};
    lookupSheet.eachRow((row, i) => {
        if (i === 1) return;
        map[row.getCell(1).value] = row.getCell(2).value;
    });

    // =========================
    // 🔍 Find duplicates + copy
    // =========================
    const countMap = {};
    const rows = [];

    sheet1.eachRow((row, i) => {
        if (i === 1) return;

        const id = row.getCell(1).value;

        countMap[id] = (countMap[id] || 0) + 1;

        rows.push(row.values);
    });

    // write header
    sheet2.addRow(['EmpID', 'Name', 'Dept', 'Location']);

    // =========================
    // 📌 Filter duplicates + VLOOKUP
    // =========================
    rows.forEach(r => {
        const id = r[1];

        if (countMap[id] > 1) {
            sheet2.addRow([
                r[1],
                r[2],
                r[3],
                map[id] || 'Not Found'
            ]);
        }
    });

    await wb1.xlsx.writeFile('Output.xlsx');

    console.log('✅ Done! Output.xlsx created');
}

(async () => {
    await createFiles();
    await processExcel();
})();