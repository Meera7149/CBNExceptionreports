const ExcelJS = require('exceljs');

async function processExcel() {
    const wb1 = new ExcelJS.Workbook();
    await wb1.xlsx.readFile('File11.xlsx');

    const sheet1 = wb1.getWorksheet('Sheet1');

    let sheet2 = wb1.getWorksheet('Sheet2');
    if (!sheet2) {
        sheet2 = wb1.addWorksheet('Sheet2');
    }

    const duplicates = {};
    const duplicateRows = [];

    // Find duplicates in Column A
    sheet1.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const value = row.getCell(1).value;

        if (duplicates[value]) {
            duplicateRows.push(row.values);
        } else {
            duplicates[value] = true;
        }
    });

    // Copy duplicates to Sheet2
    duplicateRows.forEach(row => {
        sheet2.addRow(row);
    });

    // Open second Excel file
    const wb2 = new ExcelJS.Workbook();
    await wb2.xlsx.readFile('File22.xlsx');

    const lookupSheet = wb2.getWorksheet('Sheet1');

    // Create lookup map
    const lookupMap = {};

    lookupSheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        lookupMap[row.getCell(1).value] = row.getCell(2).value;
    });

    // VLOOKUP result in Column C of Sheet2
    sheet2.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;

        const key = row.getCell(1).value;
        row.getCell(3).value = lookupMap[key] || 'Not Found';
    });

    await wb1.xlsx.writeFile('Output.xlsx');

    console.log('Completed Successfully');
}

processExcel();