const fs = require('fs');

function clearReportFile(fileName) {

    fs.writeFileSync(fileName, '', 'utf8');
}

function appendReport(fileName, title, content) {

    fs.appendFileSync(
        fileName,
        `\n========= ${title} =========\n\n${content}\n`,
        'utf8'
    );

    console.log(`${title} saved`);
}

module.exports = {
    clearReportFile,
    appendReport
};