const REPORT_SHEET = 'Report';
const REPORT_RANGE = 'A2:X';

function report_() {
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REPORT_SHEET) == null) {
    SpreadsheetApp.getActiveSpreadsheet().insertSheet().setName(REPORT_SHEET);
  }
  SpreadsheetApp.getActiveSpreadsheet().getSheetByName(REPORT_SHEET).hideSheet();
  let reports = collectCurrentScrubs_();

  if (reports.length <= 2) {
    return;
  }
  // let backlogs = getBacklogReports_();
  // reports = mergeBacklogs_(backlogs, reports);
  // Utils.clear(REPORT_SHEET, REPORT_RANGE);
  let raws = Utils.convertJsonsToRaws(reports, SCRUBS_SCHEMA);
  formatReport_(raws) 
  // Logger.log(raws.length);
  Utils.appendRawsToSheet(REPORT_SHEET, raws)
  // Utils.exportRawDataToSheet(REPORT_SHEET, REPORT_RANGE + (raws.length + 1), raws);
  
}

function formatReport_(raws) {
  raws.forEach(
    raw => {
      // set true/false for rcr
      raw[15] = !Utils.isNull((raw[15]));
      raw[16] = !Utils.isNull((raw[16]));
      // format scrub date
      if (!Utils.isNull(raw[22])) {
        // Utilities.formatDate will cause the date miss one day(ex. Jul 25, after format it becomes Jul 24)
        let date = new Date(raw[22]);
        date.setHours(date.getHours() + 6);
        raw[22] = Utilities.formatDate(date, 'EST','yyyy-MM-dd');
      }
    }
  );
}

/**
 * this is to avoid report miss collect records for some unknow reason.
 * 
 * And merge records if collect multiple times.
 */
function mergeBacklogs_(backlogs, reports) {
  let finalReports = [];
  let date = getScrubDate_(reports).toString();
  backlogs.forEach(
    backlog => {
      // Only need histroy records, exclude dupliate same day records
      if (backlog.scrub_date != date)  {
        finalReports.push(backlog);
      }
    }
  );
  // collect all current day reports
  finalReports.push(...reports);
  return finalReports;
}

// find the first scrub date from data, that avoid someone delete remove date from the sheet.
function getScrubDate_(reports) {
  let date = new Date();
  for (let i = 0; i < reports.length; i++) {
    if (!Utils.isNull(reports[i].scrub_date)) {
      date = reports[i].scrub_date;
      break;
    } 
  }
  return date;
}

function getBacklogReports_() {
  let reports = [];
  if (Utils.getLastRow(REPORT_SHEET) < 2) {
    return reports;
  }
  try {
    reports = Utils.convertRawsToJsons(Utils.getValuesWithNonLastRow(REPORT_SHEET, REPORT_RANGE), SCRUBS_SCHEMA);
  } catch (e) {
    Logger.log('Report => mergeDuplicate_ => ' + e);
  }
  return reports;
}

function testReport() {
  report_();
}
