/**
 * All algorithm and functions are in the file ScrubsDistribute
 */

const SCRUBS_SHEET = 'Scrubs';
const SCRUBS_RANGE = 'B2:Y';

// 	Reviewer	Assigned Reason	Owner	Subject	Site	Status	Priority	Escalated	Age	Specialization	Case Number	Eng bugs	Flags	HC	LC	RCR	Completed	Driver	Action taken	Comment								
const SCRUBS_HEADER = ['Reviewer', 'Assigned Reason', 'Owner', 'Subject', 'Site', 'Status', 'Priority', 'Escalated', 'Age', 'Specialization', 'Case Number', 'Eng Bugs', 'Flags', 'HC', 'LC', 'Rcr', 'Completed', 'Driver', 'Action Taken', 'Action Taken2', 'Time Taken(min)', 'Notes', 'Scrub Date', 'Version'];
// This could match the schema in Cases Provider
const SCRUBS_SCHEMA = ['reviewer', 'assigned_reason', 'ldap', 'case_subject', 'site', 'case_status_shortened', 'priority', 'escalated', 'case_age', 'specialization', 'case_number', 'eng_bugs_links', 'flags_links', 'hard_consult_count', 'live_consult_count', 'rcr', 'completed', 'driver', 'action_taken1', 'action_taken2', 'time_taken', 'notes', 'scrub_date', 'version'];
const SCRUBS_HEADER_RANGE = 'B1:Y1';

const RCR_STR = 'RCR!';
const RCR_FORM_LINK = 'https://docs.google.com/forms/d/e/1FAIpQLSddBomdt1gh6rBthfzIAXTa3YytvDHufuJHmXo3v2Jwd7QsmA/viewform?&entry.663995774={case_number}&entry.1513035999=';

const ASSIGN_REASON_PRE_SCRUB = 'previous scrub';
const ASSIGN_REASON_ASSIGNED_REVIEWER = 'assigned reviewer';
const ASSIGN_REASON_WORKING_IN_FLAGS = 'worked for flags';
const ASSIGN_REASON_RANDOM = 'random distribute';
const ASSIGN_REASON_SPECIALIZATION = 'specialization match';
const ASSIGN_REASON_RCR = 'rcr assign';

const RANGE_CASE_NUMBER = 'L2:L';
const RANGE_COMPLETED_CB = 'R2:R';
const RANGE_REVIEWER = 'B2:B';
const RANGE_ACTION_TAKEN_1 = 'T2:T';
const RANGE_ACTION_TAKEN_2 = 'U2:U';
const RANGE_DRIVER = 'S2:S';

const CASE_STATUS_IPGS = 'IPGS';
const CASE_STATUS_IPGE = 'IPGE';
const CASE_STATUS_WOC = 'WOC';
const CASE_STATUS_IP = 'IP';

const RANGE_STATUS = 'G2:G';

const COLOUR_SCRUBS_BGS = ['#ccff99', '#99ffcc', '#99ccff', '#cc99ff', '#ff99cc'];
//NINJA TURTLE VERSION #4385f4	#ea4335	#ff00ff	#ffff00
// const COLOUR_SCRUBS_BGS = ['#ccffe5', '#ea4335', '#ff00ff', '#ff8000'];

const COLOUR_STATUS_IPGS = '#ea9999';
const COLOUR_STATUS_IPGE = '#ffe599';
const COLOUR_STATUS_WOC = '#c9daf8';
const COLOUR_STATUS_IP = 'e0e0e0';

const RANGE_RCR = 'Q2:Q';
const RANGE_RCR_CELL = 'Q';
const COLOUR_RCR_CELL = '#ff0000'

const FORMULA_HYPER_LINK = '=HYPERLINK("http://go/sf/{case_number}", "{case_number}")';
const FORMULA_RCR_LINK = '=hyperlink(JOIN("","https://docs.google.com/forms/d/e/1FAIpQLSddBomdt1gh6rBthfzIAXTa3YytvDHufuJHmXo3v2Jwd7QsmA/viewform?","&entry.663995774=",L{row},"&entry.1513035999=",B{row}, "&entry.433957833=", V{row}, "&entry.1814903405=",W{row}, "&entry.2759016=", T{row}, "&entry.2759016=", U{row}), "RCR")';

const VERSION_RCR = 'with_rcr';
const VERSION_NON_RCR = 'non_rcr';
/**
 * 
 * <input type="hidden" name="entry.1513035999" value="jinjun"> - ldap B
<input type="hidden" name="entry.663995774" value="48830062"> - case number L
<input type="hidden" name="entry.433957833" value="15"> - mins - <= 300 V
<input type="hidden" name="entry.1814903405" value=""> - notes W
2759016 - dropdownmenu - at least one U, V
SpreadsheetApp.getUi().alert("Alert message");
 */

const COMPLETED_CB_CHECKED_VALUE = 'completed';


const NOTIFY_MESSAGE = 'Hi, Please check the case {case_number}: \r\n' + '{error_message}';
const ERROR_MESSAGE_WRONG_TIME_TAKEN = 'In Time Taken column, the value must be a number and <= 300';
const ERROR_MESSAGE_NONE_ACTION_TAKEN = 'In Action Taken columns, please choose one.';
const ERROR_MESSAGE_NONE_DRIVER = 'In Driver column, you should choose a driver.';
const ERROR_MESSAGE_NONE_NOTES = 'In Notes column, please add a notes';
const REMIND_RCR_FORM = 'Please do not forget submit RCR form!';


// [nothing 4, changed case status 3], [Added internal 1], [Added public 1], [reached out 1], [reassgin 2], [scheduled call 1], [reviewed PFI 2], [took action on bug 1], [TSESME]

const ACTION_TAKEN_NOTHING = 'Nothing: on track';
const ACTION_TAKEN_TOURBLESHOOTING = 'Troubleshooting';
const ACTION_TAKEN_PROVIDE_DOCUMENTATION = 'Provide Documentation';
const ACTION_TAKEN_NEXT_STEP = 'Provide next steps';
const ACTION_TAKEN_OTHER = 'Other';

const COLOUR_ACTION_TAKEN_NOTHING = '#d4edbc';
const COLOUR_ACTION_TAKEN_TOURBLESHOOTING = '#e6cff2';
const COLOUR_ACTION_TAKEN_PROVIDE_DOCUMENTATION = '#bfe1f6';
const COLOUR_ACTION_TAKEN_NEXT_STEP = '#ffcfc9';
const COLOUR_ACTION_TAKEN_OTHER = '#ffe5a0';

const ACTION_TAKEN_LIST = ['Nothing: on track', 'Nothing: waiting on rollout', 'Nothing: autoclose pending', 'Nothing: already closed at time of review', //1
            'Added internal comment on case / provided feedback to case owner','Added public comment on case', 'Reached out or escalated to PEL/FEL/Owner/Eng directly over email or chat',
            'Changed case status to Closed', 'Changed case status to SO', 'Changed case status - other', 'Reassigned case - case owner availability', 'Reassigned case - case owner expertise',
            'Scheduled / recommended phone call or hangout with customer', 'Reviewed PFI, no change', 'Reviewed PFI, changed tag', 'Took action on bug', 'TSE SME collaboration (#TSESME)',
            'Other'];

const ACTION_TAKEN_LIST_NO_RCR = [
  ACTION_TAKEN_NOTHING, ACTION_TAKEN_TOURBLESHOOTING, ACTION_TAKEN_PROVIDE_DOCUMENTATION, ACTION_TAKEN_NEXT_STEP, ACTION_TAKEN_OTHER
];

const DRIVER_DELAY_WITH_THE_ENG_TEAM = 'Delays with the Engineering team';
const DRIVER_DELAY_WITH_CUSTOMER = 'Customer not getting back to us/requesting keeping the case open';
const DRIVER_DELAY_WITH_TAM = 'Delays on getting TAMs help';
const DRIVER_DELAY_WITH_WRONG_TROUBLESHOOTING = 'Wrong troubleshooting done by the TSRs';
const DRIVER_NORMAL = 'Progressing Normally';
const DRIVER_OTHER = 'Delays on other reasons';

const COLOUR_DRIVER_DEALY_WITH_THE_ENG_TEAM = '#ffe5a0';
const COLOUR_DRIVER_DELAY_WITH_CUSTOMER = '#e6cff2';
const COLOUR_DRIVER_DELAY_WITH_TAM = '#bfe1f6';
const COLOUR_DRIVER_DELAY_WITH_WRONG_TROUBLESHOOTING = '#ffcfc9';
const COLOUR_DRIVER_NORMAL = '#d4edbc';
const COLOUR_DRIVER_OTHER = '#ff6d01';

function generateScrubsHeader_() {
  Utils.exportRawDataToSheet(SCRUBS_SHEET, SCRUBS_HEADER_RANGE, [SCRUBS_HEADER]);
}

function fetchCases_() {
  let today = new Date();
  let date = new Date();
  date.setDate(today.getDate() - MAX_CASE_AGE);
  let maxAge = MAX_CASE_AGE + (MAX_CASE_AGE - Utils.countWorkdays(date.toString(), today.toString()));

  let minAge = MIN_CASE_AGE + (MIN_CASE_AGE - Utils.countWorkdays(date.setDate(today.getDate() - MIN_CASE_AGE), today));
  Logger.log(' min = ' + minAge + ' max = ' + maxAge);
  let cases = CasesProvider.getCasesByAge(SCRUB_SITES, SHARD, minAge, maxAge);
  mergeCases_(cases);
  return cases;
}

function mergeCases_(cases) {
  if (EXPORT_RCR) {
    let rcrCases = RCRProvider.getRcrCasesWithNormalCasesFormat(SITE, SHARD);
    mergeRcrCases_(cases, rcrCases);
  }
}

function mergeRcrCases_(cases, rcrCases) {
  let rcrMap = makeRcrCasesMap_(rcrCases);
  cases.forEach(
    caseObj => {
      if (rcrMap.has(caseObj.case_number.toString())) {
        caseObj.rcr = makeRcrFormValue_(caseObj.case_number);
        rcrMap.get(caseObj.case_number.toString()).has_added = true;
      }
    }
  );
  // add rcr Cases which are not in cases
  rcrCases.forEach(
    rcr => {
      if (!rcrMap.get(rcr.case_number.toString()).has_added) {
        rcr.rcr = makeRcrFormValue_(rcr.case_number.toString());
        cases.push(rcr);
        rcr.has_added = true;
      }
    }
  );
}

function makeRcrFormValue_(value) {
  return RCR_STR;
}

function makeRcrCasesMap_(rcrCases) {
  let rcrMap = new Map();
  rcrCases.forEach(
    rcr => {
      rcrMap.set(rcr.case_number.toString(), rcr);
    }
  );
  return rcrMap;
}

function setBackgroundColour_(scrubMap) {
  let colourIndex = 0;
  let rangeStart = 2;
  let rangeEnd = 0;
  for(let ldap of scrubMap.keys()) {
    if (colourIndex == COLOUR_SCRUBS_BGS.length) {
      colourIndex = 0;
    }
    rangeEnd = rangeStart + scrubMap.get(ldap).cases.length - 1;
    if (ldap == 'ivanasharma') {
      Utils.setBackgroundColour(SCRUBS_SHEET, 'B' + rangeStart + ':X' + rangeEnd, '#e6cff2');
      // ea4335
    } else {
      Utils.setBackgroundColour(SCRUBS_SHEET, 'B' + rangeStart + ':X' + rangeEnd, COLOUR_SCRUBS_BGS[colourIndex]);
    }
    rangeStart = rangeEnd + 1;
    colourIndex++;
  }
}

function setStatusColour_() {
  let range = RANGE_STATUS + Utils.getLastRow(SCRUBS_SHEET, SCRUBS_RANGE);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range, CASE_STATUS_WOC, COLOUR_STATUS_WOC);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range, CASE_STATUS_IPGS, COLOUR_STATUS_IPGS);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range, CASE_STATUS_IPGE, COLOUR_STATUS_IPGE);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range, CASE_STATUS_IP, COLOUR_STATUS_IP);
}

function setCaseNumberLinks_() {
  let caseNumbers = Utils.getValues(SCRUBS_SHEET, Utils.makeRangeWithoutLastRow(SCRUBS_SHEET, RANGE_CASE_NUMBER));
  let formulas = [];
  for (let i = 0; i < caseNumbers.length; i++) {
    let formula = FORMULA_HYPER_LINK.replaceAll('{case_number}', caseNumbers[i][0].toString());
    formulas.push([formula]);
  }
  Utils.exportRawDataToSheet(SCRUBS_SHEET, RANGE_CASE_NUMBER + (caseNumbers.length + 1), formulas);
}

function generateCheckbox_() {
  Utils.generateCheckbox(SCRUBS_SHEET, RANGE_COMPLETED_CB + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCRUBS_SHEET).getLastRow(), COMPLETED_CB_CHECKED_VALUE);
}

function generateActionTakenValidation_() {
  if (EXPORT_RCR) {
    Utils.generateRules(SCRUBS_SHEET, RANGE_ACTION_TAKEN_1 + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCRUBS_SHEET).getLastRow(), ACTION_TAKEN_LIST);
    Utils.generateRules(SCRUBS_SHEET, RANGE_ACTION_TAKEN_2 + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCRUBS_SHEET).getLastRow(), ACTION_TAKEN_LIST); 
  } else {
    Utils.generateRules(SCRUBS_SHEET, RANGE_ACTION_TAKEN_1 + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCRUBS_SHEET).getLastRow(), ACTION_TAKEN_LIST_NO_RCR);
  }
}

function generateRCRCell_() {
  let cases = Utils.convertRawsToJsons(Utils.getValues(SCRUBS_SHEET, Utils.makeRangeWithoutLastRow(SCRUBS_SHEET, SCRUBS_RANGE)), SCRUBS_SCHEMA);
  let formulas = [];
  for (let i = 0; i < cases.length; i++) {
    let formula = '';
    if (cases[i].rcr) {
       formula = FORMULA_RCR_LINK.replaceAll('{row}', (i + 2));
       Utils.setCellBGColour(SCRUBS_SHEET, RANGE_RCR_CELL + (i + 2), COLOUR_RCR_CELL);
    } 
    formulas.push([formula]);
  }
  Utils.exportRawDataToSheet(SCRUBS_SHEET, RANGE_RCR + (cases.length + 1), formulas);
}

function generateDriverRules_() {
  Utils.generateRules(SCRUBS_SHEET, RANGE_DRIVER + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCRUBS_SHEET).getLastRow(),
          [DRIVER_NORMAL, DRIVER_DELAY_WITH_THE_ENG_TEAM, DRIVER_DELAY_WITH_CUSTOMER, DRIVER_DELAY_WITH_TAM, DRIVER_DELAY_WITH_WRONG_TROUBLESHOOTING, DRIVER_OTHER]);
}

function setDriverBGColours_() {
  let range = RANGE_DRIVER + Utils.getLastRow(SCRUBS_SHEET, SCRUBS_RANGE);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          DRIVER_DELAY_WITH_THE_ENG_TEAM, COLOUR_DRIVER_DEALY_WITH_THE_ENG_TEAM);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          DRIVER_DELAY_WITH_CUSTOMER, COLOUR_DRIVER_DELAY_WITH_CUSTOMER);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          DRIVER_DELAY_WITH_TAM, COLOUR_DRIVER_DELAY_WITH_TAM);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          DRIVER_DELAY_WITH_WRONG_TROUBLESHOOTING, COLOUR_DRIVER_DELAY_WITH_WRONG_TROUBLESHOOTING);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          DRIVER_NORMAL, COLOUR_DRIVER_NORMAL);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          DRIVER_OTHER, COLOUR_DRIVER_OTHER);
}

function setActionTakenBGColours_() {
  let range = RANGE_ACTION_TAKEN_1 + Utils.getLastRow(SCRUBS_SHEET, SCRUBS_RANGE);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          ACTION_TAKEN_NOTHING, COLOUR_ACTION_TAKEN_NOTHING);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          ACTION_TAKEN_TOURBLESHOOTING, COLOUR_ACTION_TAKEN_TOURBLESHOOTING);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          ACTION_TAKEN_PROVIDE_DOCUMENTATION, COLOUR_ACTION_TAKEN_PROVIDE_DOCUMENTATION);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          ACTION_TAKEN_NEXT_STEP, COLOUR_ACTION_TAKEN_NEXT_STEP);
  Utils.setBGBasedOnText(SCRUBS_SHEET, range,
          ACTION_TAKEN_OTHER, COLOUR_ACTION_TAKEN_OTHER);
}

/**
 * Main method for Scrubs SHEET
 */
function generateScrubsSheet() {
  if (Utils.isWeekendToday()) {
    clearScrubs_();
    generateScrubsHeader_();
    return;
  }
  let scrubMap = distributeCases();
  generateScrubsHeader_();
  setBackgroundColour_(scrubMap);
  setCaseNumberLinks_();
  generateCheckbox_();
  generateReviewerRules_(SITE, SHARD, SCRUBS_SHEET, RANGE_REVIEWER + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SCRUBS_SHEET).getLastRow());
  setStatusColour_();
  generateActionTakenValidation_();
  generateRCRCell_();
  generateDriverRules_();
  setDriverBGColours_();
  setActionTakenBGColours_();
  hideCols_();
}

function hideCols_() {
  // 17 21 22 24
  if (!EXPORT_RCR) {
    Utils.hideCol(SCRUBS_SHEET, 17);
    Utils.hideCol(SCRUBS_SHEET, 21);
    Utils.hideCol(SCRUBS_SHEET, 22);
  } else {
    Utils.showCol(SCRUBS_SHEET, 17);
    Utils.showCol(SCRUBS_SHEET, 21);
    Utils.showCol(SCRUBS_SHEET, 22);
  }
  Utils.hideCol(SCRUBS_SHEET, 24);
  Utils.hideCol(SCRUBS_SHEET, 25);
}

function verifyInput_(row) {
  let record = Utils.convertRawsToJsons(Utils.getValues(SCRUBS_SHEET, 'B' + row + ':W' + row), SCRUBS_SCHEMA)[0];
  let verify = {};
  verify.case_number = record.case_number.toString();

  verify.valid_mins = verifyMinutes_(record);
  verify.has_action_taken = hasActionTaken_(record);
  verify.has_driver = hasDriver_(record);
  verify.is_rcr = isRcr_(record);
  verify.has_notes = hasNotes_(record);
  return verify;
}

function hasNotes_(record) {
  return !Utils.isNull(record.notes);
}

function isRcr_(record) {
  return !Utils.isNull(record.rcr);
}

function makeErrorMessage_(verify) {
  let message = NOTIFY_MESSAGE.replaceAll('{case_number}', verify.case_number.toString());
  let errorMessage = '';
  if (!verify.valid_mins) {
    errorMessage = errorMessage + '\r\n' + ERROR_MESSAGE_WRONG_TIME_TAKEN;
  }
  if (!verify.has_action_taken) {
    errorMessage = errorMessage + '\r\n' + ERROR_MESSAGE_NONE_ACTION_TAKEN;
  }
  if (!verify.has_driver) {
    errorMessage = errorMessage + '\r\n' + ERROR_MESSAGE_NONE_DRIVER;
  }
  if (!verify.has_notes) {
    errorMessage = errorMessage + '\r\n' + ERROR_MESSAGE_NONE_NOTES;
  }
  if (verify.is_rcr) {
    errorMessage = errorMessage + '\r\n\r\n' + REMIND_RCR_FORM;
  }
  return message.replaceAll('{error_message}', errorMessage);
}

function verifyMinutes_(record) {
  if (EXPORT_RCR) { 
    return record.time_taken <= 300 && record.time_taken > 0;
  } else {
    return true;
  }
}

function hasActionTaken_(record) {
  return !(Utils.isNull(record.action_taken1) && Utils.isNull(record.action_taken2));
}

function hasDriver_(record) {
  return !Utils.isNull(record.driver);
}

function makeTestData_() {
  let raws = Utils.convertJsonsToRaws(fetchCases_(), SCRUBS_SCHEMA);
  Utils.setFormula(SCRUBS_SHEET, SCRUBS_RANGE + (raws.length + 1), raws);
}

function isCompleted_(scrub) {
  return Utils.compareStrIgnoreCases(scrub.completed, COMPLETED_CB_CHECKED_VALUE);
}

function collectCurrentScrubs_() {
  let scrubs = [];
  try {
    scrubs = Utils.convertRawsToJsons(Utils.getValues(SCRUBS_SHEET, Utils.makeRangeWithoutLastRow(SCRUBS_SHEET, SCRUBS_RANGE)), SCRUBS_SCHEMA);
  } catch (e) {
    Logger.log('Scrub => collectCurrentScrubs_ => ' + e);
  }
  return scrubs;
}

function testScurbs() {
  // makeTSRReviewerMap_(initSMEsMAP_());
  // distributeCases();
  //makeTestData_();
  //fetchCases_();
  let scrubs = collectCurrentScrubs_();
  Logger.log(scrubs[0]);
  let raws = Utils.convertJsonsToRaws(scrubs, SCRUBS_SCHEMA);

  raws.forEach(
    raw => {
      // set true/false for rcr
      raw[15] = !Utils.isNull((raw[15]));
      raw[16] = !Utils.isNull((raw[16]));
      // format scrub date
      if (!Utils.isNull(raw[22])) {
        let date = new Date(raw[22]);
        date.setHours(date.getHours() + 6);
        raw[22] = Utilities.formatDate(date, 'EST','yyyy-MM-dd HH:mm:ss');
      }
    }
  );

  Logger.log(raws[0]);

}
