const HISTORY_SHEET = 'History';
const HISTORY_RANGE = 'A2:H';

const HISTORY_HEADER = ['Case Number', 'Reviewer', 'Completed', 'Driver', 'Action Taken 1', 'Action Taken 2', 'Notes', 'Last Scrub Date'];
const HISTORY_SCHEMA = ['case_number', 'reviewer', 'completed', 'driver', 'action_taken1', 'action_taken2', 'notes', 'last_scrub_date'];

function convertToHistory_(scrubs) {
  let historys = [];
  scrubs.forEach(
    scrub => {
      let history = {};
      if (isCompleted_(scrub)) {
        history.case_number = scrub.case_number;
        history.reviewer = scrub.reviewer;
        history.completed = scrub.completed;
        history.driver = scrub.driver;
        history.action_taken1 = scrub.action_taken1;
        history.action_taken2 = scrub.action_taken2;
        history.notes = scrub.notes;
        history.last_scrub_date = new Date();
        historys.push(history);
      }
    }
  );
  return historys;
}

function copyScrubsToHistory_() {
  let currents = convertToHistory_(collectCurrentScrubs_());
  let historys = getHitory_();
  historys.push(...currents)
  historys = historys.filter(
    function(element) {
      return Utils.diffDays(element.last_scrub_date, new Date()) <= HISTORY_DURATION;
    }
  );
  if (historys.length != 0 && historys[0].case_number != HISTORY_HEADER[0]) {
    Utils.exportRawDataToSheet(HISTORY_SHEET, HISTORY_RANGE + (historys.length + 1), Utils.convertJsonsToRaws(historys, HISTORY_SCHEMA));
  }
}

function getHitory_() {
  let row = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(HISTORY_SHEET).getLastRow()
  if(row <= 1) {
    return [];
  } else {
    return Utils.convertRawsToJsons(Utils.getValues(HISTORY_SHEET, HISTORY_RANGE + row), HISTORY_SCHEMA);
  }
}

function testHis() {
  copyScrubsToHistory_()
  // let historys = getCurrentHitory_();
  // let s = new Date() - historys[1].last_scrub_date.valueOf();
  // Logger.log(Utils.diffDays(new Date(), historys[1].last_scrub_date));
}
