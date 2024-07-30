const SMES_SHEET = 'SMEs';
const SMES_RANGE_WITHOUT_EXTRA_START = 'B2:D';
const SMES_RANGE_START = 'B2:F';

const SME_SPECIALIZATION_RANGE = 'E2:E';
const SME_SCRUBS_RANGE = 'F2:F';

const SME_HEADER = [['Name', 'Ldap',	'Shift',	'Specialization',	'Scrubs']];
const SME_HEADER_RANGE = 'B1:F1';
const SME_SCHEMA = ['name', 'ldap', 'shift', 'specialization', 'scrubs'];

/**
 * 
const SHIFT_NO_SCRUBS = 'no_scrub';
const SHIFT_NEVER_SCRUBS = 'never_scrub';
const SHIFT_NORMAL_SCRUBS = 'normal';
 */

const COLOUR_NO_SCRUBS = '#ff3333';
const COLOUR_NORMAL_SCRUBS = '#33ff33';
const COLOUR_NEVER_SCRUBS = '#3333ff';

function generateSMEs() {
  exportSMEs_();
  generateSMEHeaderAndRules_();
}

function exportSMEs_() {
  preMap = cachePreSMESetting_();
  Utils.clear(SMES_SHEET, Utils.makeRangeWithoutLastRow(SMES_SHEET, SMES_RANGE_START));
  // Logger.log(" key = " + SHIFT_MAP.keys().next().value);
  smes = SchedulesProvider.getSMEs(SITE, SHARD);
  raws = [];
  smes.forEach(
    sme => {
      raw = [];
      raw.push(sme.name);
      raw.push(sme.ldap);
      raw.push(sme.shift);
      raw.push(getSpecialization_(sme, preMap));
      raw.push(getScrubsStates_(sme, preMap));
      raws.push(raw);
    }
  );
  Utils.exportRawDataToSheet(SMES_SHEET, SMES_RANGE_START + (raws.length + 1), raws);
}

function generateSMEHeaderAndRules_() {
  generateSMEHeader_();
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SMES_SHEET).getLastRow() > 0) {
    generateSMESpecializationRules_();
    generateSMEScrubsRules_();
    addShiftColour_();
  }
}

function generateSMEHeader_() {
  Utils.exportRawDataToSheet(SMES_SHEET, SME_HEADER_RANGE, SME_HEADER);
}

function generateSMESpecializationRules_() {
  Utils.generateRules(SMES_SHEET, SME_SPECIALIZATION_RANGE + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SMES_SHEET).getLastRow(), SPECIALIZATION_LIST);
}

function generateSMEScrubsRules_() {
  Utils.generateRules(SMES_SHEET, Utils.makeRangeWithoutLastRow(SMES_SHEET, SME_SCRUBS_RANGE), SHIFT_SCRUBS_LIST);
}

function addShiftColour_() {
  Utils.setBGBasedOnText(SMES_SHEET, Utils.makeRangeWithoutLastRow(SMES_SHEET, SME_SCRUBS_RANGE), SHIFT_NO_SCRUBS, COLOUR_NO_SCRUBS);
  Utils.setBGBasedOnText(SMES_SHEET, Utils.makeRangeWithoutLastRow(SMES_SHEET, SME_SCRUBS_RANGE), SHIFT_NORMAL_SCRUBS, COLOUR_NORMAL_SCRUBS);
  Utils.setBGBasedOnText(SMES_SHEET, Utils.makeRangeWithoutLastRow(SMES_SHEET, SME_SCRUBS_RANGE), SHIFT_NEVER_SCRUBS, COLOUR_NEVER_SCRUBS);
}

function getSpecialization_(sme, preMap) {
  if (preMap.has(sme.ldap)) {
    return preMap.get(sme.ldap).specialization;
  } else {
    return SEPCIALIZATION_ALL;
  }
}

function getScrubsStates_(sme, preMap) {
  let state = SHIFT_NORMAL_SCRUBS;
  if (preMap.has(sme.ldap) && preMap.get(sme.ldap).no_scrubs == SHIFT_NEVER_SCRUBS) {
    state = SHIFT_NEVER_SCRUBS;
  } else if (SHIFT_MAP.get(sme.shift) == SHIFT_NO_SCRUBS) {
    state = SHIFT_NO_SCRUBS;
  } else {
    state = SHIFT_NORMAL_SCRUBS;
  }
  return state;
}

function cachePreSMESetting_() {
  preraws = Utils.getValues(SMES_SHEET, SMES_RANGE_START);
  map = new Map();
  preraws.forEach(
    raw => {
      // Logger.log(raw[1] + " " + raw[3] + " " + raw[4]);
      map.set(raw[1], {
        specialization: raw[3],
        no_scrubs: raw[4]
      });
    }
  );
  // Logger.log(map);
  return map;
}

function getSMEs_() {
  return Utils.convertRawsToJsons(Utils.getValues(SMES_SHEET, Utils.makeRangeWithoutLastRow(SMES_SHEET, SMES_RANGE_START)), SME_SCHEMA);
}

function getScrubsSMEs_() {
  return getSMEs_().filter(
    function (element, index, array) {
      return Utils.compareStrIgnoreCases(element.scrubs, SHIFT_NORMAL_SCRUBS);
    }
  );
}

