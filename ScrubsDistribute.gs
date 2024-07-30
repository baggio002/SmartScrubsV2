var DAILY_SCRUB_MAX_PER_SME = LIMIT_DAILY_SCRUB;

/**
 * 
 * Main method to distributeCases
 * 
 */
function distributeCases() {
  let scrubMap = initSMEsMAP_();
  let completedCasesMap = getCompletedCases_();
  clearScrubs_();
  let cases = fetchCases_();
  assignCompletedCases_(completedCasesMap, scrubMap);
  mergeCompletedCases_(cases, completedCasesMap);
  // sortScrubs_(cases);
  // caculate the count of max cases to reviewer
  DAILY_SCRUB_MAX_PER_SME = calculateDailyMax_(cases.length / scrubMap.size);
  Logger.log('MAX = ' + DAILY_SCRUB_MAX_PER_SME);
  let { ipgsCases, otherCases, rcrCases } = groupCases_(cases);
  let maxIPGSCasesPerSme = ipgsCases.length / scrubMap.size;
  Logger.log('MAX IPGS = ' + maxIPGSCasesPerSme + ' ipgsCases = ' + ipgsCases.length + ' otherCases = ' + otherCases.length);
  let maxRCRCasesPerSme = rcrCases.length / scrubMap.size;
  Logger.log('MAX RCR = ' + maxRCRCasesPerSme);
  if (ENABLE_ASSIGN_REVIEWER_DISTRUBUTE) {
    distributeCasesToReviewer_(rcrCases, scrubMap);
    distributeCasesToReviewer_(ipgsCases, scrubMap);
    distributeCasesToReviewer_(otherCases, scrubMap);
  }
  if (ENABLE_SPECIALIZATION_DISTIRBUTE) {
    distributeCasesBySpecialization_(rcrCases, scrubMap, maxRCRCasesPerSme);
    distributeCasesBySpecialization_(ipgsCases, scrubMap, maxIPGSCasesPerSme);
    distributeCasesBySpecialization_(otherCases, scrubMap, DAILY_SCRUB_MAX_PER_SME);
  }
  distributeCasesNormally_(rcrCases, ipgsCases, otherCases, scrubMap, maxRCRCasesPerSme, maxIPGSCasesPerSme, DAILY_SCRUB_MAX_PER_SME);
  let scrubCases = collectCasesFromSME_(scrubMap);
  formatScrubs_(scrubCases);
  Utils.exportRawDataToSheet(SCRUBS_SHEET, (SCRUBS_RANGE + (scrubCases.length + 1)), Utils.convertJsonsToRaws(scrubCases, SCRUBS_SCHEMA));
  return scrubMap;
}

function assignCompletedCases_(completedCases, scrubMap) {
  completedCases.forEach(
    caseObj => {
      if (scrubMap.has(caseObj.reviewer)) {
        sme = scrubMap.get(caseObj.reviewer);
        sme.cases.push(caseObj);
        if (caseObj.status == CASE_STATUS_IPGS) {
          sme.ipgs_count = sme.ipgs_count + 1;
        }
        if (isRCRCase_(caseObj)) {
          sme.rcr_count = sme.rcr_count + 1;
        }
        caseObj.has_distribute = true;
      }
    }
  );
}

function calculateDailyMax_(maxCount) {
  if (ENABLE_DAILY_LIMIT && maxCount > LIMIT_DAILY_SCRUB) {
    maxCount = LIMIT_DAILY_SCRUB
  }
  return maxCount;
}

function formatScrubs_(scrubCases) {
  let date = Utilities.formatDate(new Date(), "EST", 'yyyy-MM-dd');
  scrubCases.forEach(
    scrub => {
      scrub.site = scrub.site.toLowerCase().replaceAll(" ", '');
      scrub.scrub_date = date;
      scrub.version = EXPORT_RCR ? VERSION_RCR : VERSION_NON_RCR;
    }
  );
}

function sortScrubs_(cases) {
  cases.sort(
    (case1, case2) => {
      return case1.case_age - case2.case_age;
    }
  );
}

function clearScrubs_() {
  Utils.clear(SCRUBS_SHEET, Utils.makeRangeWithoutLastRow(SCRUBS_SHEET, SCRUBS_RANGE));
}

function getCompletedCases_() {
  let completedCases = [];
  try {
    completedCases = Utils.convertRawsToJsons(Utils.getValues(SCRUBS_SHEET, Utils.makeRangeWithoutLastRow(SCRUBS_SHEET, SCRUBS_RANGE)), SCRUBS_SCHEMA);
  } catch (e) {
    Logger.log('ScrubsDistribute => getCompletedCases_ => ' + e);
  }
  let map = new Map();
  completedCases = completedCases.filter(
    function(element) {
      return isCompleted_(element) || noCheckCompletedBox_(element);
    }
  ).forEach(
    caseObj => {
      map.set(caseObj.case_number.toString(), caseObj);
    }
  );
  return map;
}

function setNoCheckCompletedCases_() {
  let cases = Utils.convertRawsToJsons(Utils.getValues(SCRUBS_SHEET, Utils.makeRangeWithoutLastRow(SCRUBS_SHEET, SCRUBS_RANGE)), SCRUBS_SCHEMA);
  if (cases.length == 0) {
    return;
  }
  cases.forEach(
    caseObj => {
      noCheckCompletedBox_(caseObj);
    }
  );
  Utils.exportRawDataToSheet(SCRUBS_SHEET, (SCRUBS_RANGE + (cases.length + 1)), Utils.convertJsonsToRaws(cases, SCRUBS_SCHEMA));
}

function noCheckCompletedBox_(element) {
  let flag = false;
  if(!Utils.isNull(element.action_taken1) && !Utils.isNull(element.driver) && !Utils.isNull(element.notes)) {
    element.completed = COMPLETED_CB_CHECKED_VALUE;
    flag = true;
  }
  return flag;
}

function test3() {
  getCompletedCases_();
}

function mergeCompletedCases_(cases, completedCasesMap) {
  if (completedCasesMap.size == 0) {
    return;
  }
  cases.forEach(
    caseObj => {
      // Logger.log('============' + caseObj.case_number.toString());
      if (completedCasesMap.has(caseObj.case_number.toString())) {
        caseObj.completed = completedCasesMap.get(caseObj.case_number.toString()).completed;
        caseObj.driver = completedCasesMap.get(caseObj.case_number.toString()).driver;
        caseObj.action_taken1 = completedCasesMap.get(caseObj.case_number.toString()).action_taken1;
        caseObj.action_taken2 = completedCasesMap.get(caseObj.case_number.toString()).action_taken2;
        caseObj.notes = completedCasesMap.get(caseObj.case_number.toString()).notes;
        caseObj.time_taken = completedCasesMap.get(caseObj.case_number.toString()).time_taken;
        caseObj.reviewer = completedCasesMap.get(caseObj.case_number.toString()).reviewer;
        // Logger.log("has_distribute = " + caseObj.has_distribute);
        caseObj.has_distribute = completedCasesMap.get(caseObj.case_number.toString()).has_distribute;
        // Logger.log("has_distribute = " + caseObj.has_distribute);
      }
    }
  );
}

function collectCasesFromSME_(scrubMap) {
  let cases = [];
  for (let sme of scrubMap.values()) {
    sortScrubs_(sme.cases);
    cases.push(...sme.cases);
    Logger.log(sme.ldap + " rcr = " + sme.rcr_count + " ipgs = " + sme.ipgs_count + " cases = " + sme.cases.length + " total cases = " + cases.length);
  }
  return cases;
}

function distributeCasesNormally_(rcrCases, ipgsCases, otherCases, scrubMap, maxRCRCount, maxIpgsCount, maxCasesCount) {
  assignCasesByPreScrub_(rcrCases, scrubMap, maxRCRCount);
  assignCasesByWorkedFlags_(rcrCases, scrubMap, maxRCRCount);
  assignCasesRandom_(rcrCases, scrubMap, maxRCRCount);
  assignCasesByPreScrub_(ipgsCases, scrubMap, maxIpgsCount);
  assignCasesByPreScrub_(otherCases, scrubMap, maxCasesCount);
  assignCasesByWorkedFlags_(ipgsCases, scrubMap, maxIpgsCount);
  assignCasesByWorkedFlags_(otherCases, scrubMap, maxCasesCount);
  assignCasesRandom_(ipgsCases, scrubMap, maxIpgsCount);
  assignCasesRandom_(otherCases, scrubMap, maxCasesCount);
}

function assignCases_(cases, scrubMap, condition, assign_reason, maxCount, smeLdapLoop=Array.from(scrubMap.keys()), historyMap) {
  let smeUnableAssigned = 0;
  let loopIndex = 0;
  let smeUnableAssignedForCurrentCase = 0;
  let sme = scrubMap.get(smeLdapLoop[loopIndex]);
  for (let i = 0; i < cases.length;) {
    if (smeUnableAssigned == smeLdapLoop.length) {
      break;
    }
    if (checkIfCanAssign_(cases[i], sme, maxCount) && condition(cases[i], sme, historyMap)) {
      assignCasesToSME_(sme, cases[i], assign_reason);
      i++;
    } else {
      smeUnableAssignedForCurrentCase++;
      if (smeUnableAssignedForCurrentCase >= smeLdapLoop.length) {
        i++;
        smeUnableAssignedForCurrentCase = 0;
      }
    }
    if (i == cases.length) {
      break;
    }
    if (ifSmeUnableAssign_(cases[i], sme, maxCount)) {
      smeUnableAssigned++;
    }
    if (assign_reason == ASSIGN_REASON_RANDOM) {
      sme = findNextSMEByLeastCases_(cases[i], sme, smeLdapLoop, scrubMap);
    } else {
      [loopIndex, sme] = findNextSMEBySort_(smeLdapLoop, loopIndex, scrubMap);
    }
  }
}

function findNextSMEBySort_(smeLdapLoop, loopIndex, scrubMap) {
  if (loopIndex == smeLdapLoop.length - 1) {
    loopIndex = 0;
  } else {
    loopIndex++;
  }
  let sme = scrubMap.get(smeLdapLoop[loopIndex]);
  return [loopIndex, sme];
}

function findNextSMEByLeastCases_(caseObj, sme, smeLdapLoop, scrubMap) {
  smeLdapLoop.forEach(
    ldap => {
      if (isRCRCase_(caseObj)) {
        if (scrubMap.get(ldap).rcr_count < sme.rcr_count) {
          sme = scrubMap.get(ldap);
        }
      } else if (caseObj.case_status_shortened == CASE_STATUS_IPGS) {
        if (scrubMap.get(ldap).ipgs_count < sme.ipgs_count) {
          sme = scrubMap.get(ldap);
        }
      } else {
        if (scrubMap.get(ldap).cases.length < sme.cases.length) {
          sme = scrubMap.get(ldap);
        }
      }
    }
  );
  return sme;
}

function isRCRCase_(caseObj) {
  return !Utils.isNull(caseObj.rcr);
}

function ifSmeUnableAssign_(caseObj, sme, maxCount) {
  let flag = false;
  if (isRCRCase_(caseObj)) {
    if (sme.rcr_count >= maxCount) {
      flag = true;
    }
  } else if (caseObj.case_status_shortened == CASE_STATUS_IPGS) {
    if (sme.ipgs_count >= maxCount) {
      flag = true;
    }
  } else {
    if (sme.cases.length >= maxCount) {
      flag = true;
    }
  }
  return flag;
}

var isPreReviewer_ = function inScrubHistory_(caseObj, sme, historyMap) {
  let flag = false;
  // Logger.log(" ======= " + sme.ldap);
  if (historyMap.has(caseObj.case_number.toString()) && scrubedInHistory_(historyMap.get(caseObj.case_number.toString()), sme)) {
    flag = true;
  }
  return flag;
}

function scrubedInHistory_(historys, sme) {
  let flag = false;
  for (let i = 0; i < historys.length; i++) {
    if (historys[i].reviewer == sme.ldap) {
      flag = true;
      return flag;
    }
  }
  return flag;
}

var canWorkOnFlags_ = function workedOnFlags_(caseObj, sme) {
  return caseObj.flags_ccs.includes(sme.ldap) || caseObj.flags_assignees.includes(sme.ldap);
}

var isMatchedSpec_ = function matchSpecialization_(caseObj, sme) {
  return Utils.compareStrIgnoreCases(caseObj.specialization, sme.specialization)
}

function assignCasesByPreScrub_(cases, scrubMap, maxCount) {
  assignCases_(cases, scrubMap, isPreReviewer_, ASSIGN_REASON_PRE_SCRUB, maxCount, Array.from(scrubMap.keys()), historyMap=makeHistorysMap_());
}

function assignCasesByWorkedFlags_(cases, scrubMap, maxCount) {
  assignCases_(cases, scrubMap, canWorkOnFlags_, ASSIGN_REASON_WORKING_IN_FLAGS, maxCount);
}

function assignCasesRandom_(cases, scrubMap, maxCount) {
  assignCases_(cases, scrubMap, function (caseObj, sme) { return true }, ASSIGN_REASON_RANDOM, maxCount);
}

function distributeCasesBySpecialization_(cases, scrubMap, maxCount) {
  let specializationMap = getSMESpecializationMap_(scrubMap);
  for (let spec of specializationMap.keys()) {
    let smeLdapLoop = specializationMap.get(spec);
    assignCasesBySpecialization_(cases, smeLdapLoop, scrubMap, maxCount)
  }
}

function assignCasesBySpecialization_(cases, smeLdapLoop, scrubMap, maxCount) {
  assignCases_(cases, scrubMap, isMatchedSpec_, ASSIGN_REASON_SPECIALIZATION, maxCount, smeLdapLoop);
}

function isAssigneeOrCC_(ldap, caseObj) {
  return Utils.includes(caseObj.flags_ccs, ldap) || Utils.includes(caseObj.flags_assignees, ldap)
}

function hasAssigenedMax_(caseObj, sme, maxCount) {
  let flag = false;
  // DAILY_SCRUB_MAX_PER_SME
  if (isRCRCase_(caseObj)) {
    flag = isOverDailyLimit_(sme.rcr_count, sme, maxCount, true);
  } else if (Utils.compareStrIgnoreCases(caseObj.case_status_shortened, CASE_STATUS_IPGS)) {
    flag = isOverDailyLimit_(sme.ipgs_count, sme, maxCount, false);
  } else {
    flag = isOverDailyLimit_(sme.cases.length, sme, maxCount, false);
  }
  // Logger.log(sme.ldap + " " + caseObj.case_status_shortened + " " + sme.ipgs_count + " " + sme.cases.length + " " + maxCount);
  return flag;
}

function isOverDailyLimit_(count, sme, maxCount, is_rcr) {
  let flag = false;
  if (ENABLE_DAILY_LIMIT && (!is_rcr || ENABLE_DAILY_LIMIT_IGNORE_RCR)) {
    flag = sme.cases.length >= DAILY_SCRUB_MAX_PER_SME;
  } else {
    flag = count >= maxCount;
  }
  return flag;
}


function checkIfCanAssign_(caseObj, sme, maxCount) {
  return !caseObj.has_distribute && !hasAssigenedMax_(caseObj, sme, maxCount);
}

function makeHistorysMap_() {
  let historys = getHitory_();
  let map = new Map();
  historys.forEach(
    history => {
      if (map.has(history.case_number.toString())) {
        map.get(history.case_number.toString()).push(history);
      } else {
        map.set(history.case_number.toString(), [history]);
      }
    }
  );

  Logger.log(Array.from(map.keys()));
  return map;
}


function isSpecialazation_(caseObj, sme) {
  return Utils.compareStrIgnoreCases(sme.specialization.replaceAll(' ', ''), caseObj.specialization.replaceAll(' ', ''));
}

function getSMESpecializationMap_(scrubMap) {
  let specializationMap = new Map();
  for (let ldap of scrubMap.keys()) {
    let sme = scrubMap.get(ldap);
    if (!Utils.compareStrIgnoreCases(sme.specialization, SEPCIALIZATION_ALL) && SPECIALIZATION_LIST.includes(sme.specialization)) {
      if (specializationMap.has(sme.specialization)) {
        specializationMap.get(sme.specialization).push(sme.ldap);
      } else {
        specializationMap.set(sme.specialization, [sme.ldap]);
      }
    }
  }
  return specializationMap;
}

function distributeCasesToReviewer_(cases, scrubMap) {
  let reviewerMap = makeTSRReviewerMap_(scrubMap);
  cases.forEach(
    caseObj => {
      if (reviewerMap.has(caseObj.ldap) && scrubMap.has(reviewerMap.get(caseObj.ldap))) {
        let sme = assignCasesToSME_(scrubMap.get(reviewerMap.get(caseObj.ldap)), caseObj, ASSIGN_REASON_ASSIGNED_REVIEWER);
        scrubMap.set(sme.ldap, sme);
      }
    }
  );
}

function assignCasesToSME_(sme, caseObj, reason) {
  caseObj.has_distribute = true;
  if (!caseObj.reviewer) {
    caseObj.reviewer = sme.ldap;
  }
  caseObj.assigned_reason = reason;
  sme.cases.push(caseObj);
  if (isRCRCase_(caseObj)) {
    sme.rcr_count = sme.rcr_count + 1;
  }
  if (Utils.compareStrIgnoreCases(caseObj.case_status_shortened, CASE_STATUS_IPGS)) {
    sme.ipgs_count = sme.ipgs_count + 1;
  };
  // Logger.log(" assign == " + caseObj.case_number + " sme = " + sme.ldap);
  return sme
}

function groupCases_(cases) {
  let ipgsCases = [];
  let otherCases = [];
  let rcrCases = [];
  cases.forEach(
    caseObj => {
      if (!caseObj.has_distribute) {
        caseObj.has_distribute = false;
      }
      if (isRCRCase_(caseObj)) {
        rcrCases.push(caseObj);
      } else if (Utils.compareStrIgnoreCases(caseObj.case_status_shortened, CASE_STATUS_IPGS)) {
        ipgsCases.push(caseObj);
      } else {
        otherCases.push(caseObj);
      }
    }
  );
  // Logger.log('rcrCases ' + rcrCases.length + ' ipgsCases ' + ipgsCases.length + ' otherCases ' + otherCases.length);
  return { ipgsCases, otherCases, rcrCases }
}

function initSMEsMAP_() {
  let smes = getScrubsSMEs_();
  let smeMap = new Map();
  smes.forEach(
    sme => {
      sme.cases = [];
      sme.rcr_count = 0;
      sme.ipgs_count = 0;
      smeMap.set(sme.ldap, sme);
    }
  );
  return smeMap;
}

function makeTSRReviewerMap_(smeMap) {
  let tsrs = getTSRs_();
  let reviewMap = new Map();
  tsrs.forEach(
    tsr => {
      if (tsr.reviewer && smeMap.has(tsr.reviewer)) {
        reviewMap.set(tsr.ldap, tsr.reviewer);
      }
    }
  );
  return reviewMap;
}
