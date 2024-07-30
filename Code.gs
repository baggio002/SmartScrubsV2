/**
 * Smart Scrubs V2
 * 
 * Created by Hu Zhao
 * zhaohu@google.com
 * 
 */

/**
 * All trigger functions for time-driven triggers are here.
 */

function createTimeDrivenTriggers() {
  ScriptApp.getProjectTriggers().forEach(
    trigger => {
      ScriptApp.deleteTrigger(trigger);
    }
  );
  createTriggers_();
}

function createTriggers_() {
  dailyScrubTrigger_();
  dailySMEsTrigger_();
  monthlyTSRsTrigger_();
}

function dailyScrubPrepare() {
  let recipients = ["zhaohu@google.com"];
  try {
    setNoCheckCompletedCases_();
    report_();
    copyScrubsToHistory_();
    clearScrubs_();
    generateScrubsSheet();
  } catch(e) {
    MailApp.sendEmail(recipients.join(","),
      "SMART SCRUBS FAILURE",
      e);
    Logger.log(e);
    throw e;
  }
}

function syncSMEsSheet() {
  if (AUTO_SYNC_SMES_DAILY) {
    generateSMEs();
  }
}

function syncTSRsSheet() {
  if (AUTO_SYNC_TSRS_MONTHLY) {
    generateTSRs();
  }
}
