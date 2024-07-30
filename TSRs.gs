const TSRS_SHEET = 'TSRs';
const TSRS_RANGE_WITHOUT_EXTRA_START = 'B2:E';
const TSRS_RANGE_START = 'B2:G';

const TSR_HEADER = [['Name', 'Ldap',	'Site',	'Shard',	'Specialization', 'Reviewer assign']];
const TSR_HEADER_RANGE = 'B1:G1';
const TSR_SCHEMA = ['name', 'ldap', 'site', 'shard', 'specialization', 'reviewer'];

const TSR_SPECIALIZATION_RANGE = 'F2:F';
const TSR_REVIEWER_RANGE = 'G2:G';

function generateTSRs() {
  exportTSRs_();
  generateTSRHeaderAndRules_();
}

function exportTSRs_() {
  let {preMap, externalList} = cachePreTSRSetting_();
  Logger.log(preMap);
  Logger.log(externalList);
  Utils.clear(TSRS_SHEET, Utils.makeRangeWithoutLastRow(TSRS_SHEET, TSRS_RANGE_START));
  tsrs = SchedulesProvider.getTSRs(SITE, SHARD);
  raws = [];
  tsrs.forEach(
    tsr => {
      raw = [];
      raw.push(tsr.name);
      raw.push(tsr.ldap);
      raw.push(tsr.site);
      raw.push(tsr.shard);
      raw.push(getTSRSpecialization_(tsr, preMap));
      raw.push(getTSRReviewer_(tsr, preMap));
      raws.push(raw);
    }
  );
  addExternalList_(raws, externalList);
  Logger.log(raws);
  Utils.exportRawDataToSheet(TSRS_SHEET, TSRS_RANGE_START + (raws.length + 1), raws);
}

function generateTSRHeaderAndRules_() {
  generateTSRHeader_();
  if (SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TSRS_SHEET).getLastRow() > 0) {
    generateTSRSpecializationRules_();
    generateReviewerRules_(SITE, SHARD, TSRS_SHEET, TSR_REVIEWER_RANGE + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TSRS_SHEET).getLastRow());
  }
}

function getTSRSpecialization_(tsr, preMap) {
  if (preMap.has(tsr.ldap)) {
    return preMap.get(tsr.ldap).specialization;
  } else {
    return '';
  }
}

function getTSRReviewer_(tsr, preMap) {
  if (preMap.has(tsr.ldap)) {
    return preMap.get(tsr.ldap).reviewer;
  } else {
    return '';
  }
}

function generateTSRHeader_() {
  Utils.exportRawDataToSheet(TSRS_SHEET, TSR_HEADER_RANGE, TSR_HEADER);
}

function generateTSRSpecializationRules_() {
  Utils.generateRules(TSRS_SHEET, TSR_SPECIALIZATION_RANGE + SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TSRS_SHEET).getLastRow(), SPECIALIZATION_LIST);
}

function generateReviewerRules_(site, shard, sheet, range) {
  smes = SchedulesProvider.getSMEs(site, shard);
  ldap = [];
  smes.forEach(
    sme => {
      ldap.push(sme.ldap);
    }
  );
  Utils.generateRules(sheet, range, ldap);
}

function addExternalList_(raws, externalList) {
  externalList.forEach(
    raw => {
      raws.push(raw);
    }
  );
}

function cachePreTSRSetting_() {
  let preraws = [];
  try {
    preraws = Utils.getValues(TSRS_SHEET, Utils.makeRangeWithoutLastRow(TSRS_SHEET, TSRS_RANGE_START));
  } catch (e) {
    Logger.log('cachePreTSRSetting_:' + e);
  }
  let preMap = new Map();
  let externalList = [];
  preraws.forEach(
    raw => {
      // Logger.log(raw[1] + " " + raw[3] + " " + raw[4]);
      preMap.set(raw[1], {
        specialization: raw[4],
        reviewer: raw[5]
      });
      if (!Utils.compareStrIgnoreCases(raw[2], SITE)) {
        externalList.push(raw);
      } 
    }
  );
  
  return {preMap, externalList};
}

function getTSRs_() {
 return Utils.convertRawsToJsons(Utils.getValues(TSRS_SHEET, Utils.makeRangeWithoutLastRow(TSRS_SHEET, TSRS_RANGE_START)), TSR_SCHEMA);
}



