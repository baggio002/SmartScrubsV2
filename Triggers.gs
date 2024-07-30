const COLOUR_ERROR_ACTION = '#ff0000';

function onEdit(e) {
  const range = e.range;
  const value = e.value;
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  const COL_ACTION_TAKEN_1 = 20; // T
  const COL_ACTION_TAKEN_2 = 21; // U
  const COL_COMPLETED = 18; // R

  const lastRow = ss.getSheetByName(SCRUBS_SHEET).getLastRow();

  // this block is for remove duplicate values in Action Taken1 and Action Taken2
  if (ss.getActiveSheet().getName() == SCRUBS_SHEET && (ss.getActiveCell().getRow() > 1 && ss.getActiveCell().getRow() <= lastRow)
          && ss.getActiveCell().getColumn() == COL_ACTION_TAKEN_1) {
    // range.setValue((COL_U + ss.getActiveCell().getRow()) + " ");
    if (value == ss.getRange('U' + ss.getActiveCell().getRow()).getCell(1, 1).getValue()) {
      ss.getRange('U' + ss.getActiveCell().getRow()).getCell(1, 1).setValue(null);
    }
  }
  if (ss.getActiveSheet().getName() == SCRUBS_SHEET && (ss.getActiveCell().getRow() > 1 && ss.getActiveCell().getRow() <= lastRow) 
          && ss.getActiveCell().getColumn() == COL_ACTION_TAKEN_2) {
    if (value == ss.getRange('T' + ss.getActiveCell().getRow()).getCell(1, 1).getValue()) {
      ss.getRange('U' + ss.getActiveCell().getRow()).getCell(1, 1).setValue(null);
    }
  }
  //==========================
  // below is for varify input when check completed
  if (ss.getActiveSheet().getName() == SCRUBS_SHEET && (ss.getActiveCell().getRow() > 1 && ss.getActiveCell().getRow() <= lastRow)
          && ss.getActiveCell().getColumn() == COL_COMPLETED) {
    if (value == COMPLETED_CB_CHECKED_VALUE) {
      // ss.getRange('W' + ss.getActiveCell().getRow()).getCell(1, 1).setValue("=========");
      verify = verifyInput_(ss.getActiveCell().getRow());
      // ss.getRange('W' + ss.getActiveCell().getRow()).getCell(1, 1).setValue((verify.valid_mins && verify.has_action_taken && verify.has_driver && verify.has_notes));
      if (!(verify.valid_mins && verify.has_action_taken && verify.has_driver && verify.has_notes)) {
        // ss.getRange('X' + ss.getActiveCell().getRow()).getCell(1, 1).setValue(JSON.stringify(verify));
        ss.getRange('R' + ss.getActiveCell().getRow()).getCell(1, 1).setValue(null);
        SpreadsheetApp.getUi().alert(makeErrorMessage_(verify));
      }
    }
  }
}

function dailyScrubTrigger_() {
    ScriptApp.newTrigger("dailyScrubPrepare")
    .timeBased().everyDays(1).atHour(HOUR_RENEW_SCRUBS)
    .create();
}

function dailySMEsTrigger_() {
    ScriptApp.newTrigger("syncSMEsSheet")
    .timeBased().everyDays(1).atHour(HOUR_SYNC_SMES)
    .create();
}

function monthlyTSRsTrigger_() {
    ScriptApp.newTrigger("syncTSRsSheet")
    .timeBased().onMonthDay(1).atHour(HOUR_SYNC_TSRS)
    .create();
}
