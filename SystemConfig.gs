const SYSTEM_CONFIG_SHEET = 'System Config';
const SYSTEM_CONFIG_RANGE = 'B1:C';
const SYSTEM_CONFIG_RANGE_WITH_COMMENT = 'B1:D';

const CONFIG_SITE_NAME = 'Site';
const CONFIG_SHARD_NAME = 'Shard';
const CONFIG_ASSIGN_REVIEWER_NAME = 'Assign Reviewer Distribute';
const CONFIG_SPECIALIZATION_NAME = 'Specialization Group Distribute';
const CONFIG_ABSOLUTE_BALANCE_NAME = 'Absolute Balance Distribute';
const CONFIG_SYNC_SMES_NAME = 'Auto Sync SMEs Sheet Daily';
const CONFIG_SYNC_TSRS_NAME = 'Auto Sync TSRs Sheet Monthly';
const CONFIG_ONLY_TELMON_NAME = 'ONLY Sync TEL - MON';
const CONFIG_EXPORT_RCR = 'Export RCR';
const CONFIG_MAX_CASE_AGE_NAME = 'Max Case Age';
const CONFIG_MIN_CASE_AGE_NAME = 'Min Case Age';
const CONFIG_SCRUB_SITES_NAME = 'Scrub Sites';
const CONFIG_HISTORY_DURATION_NAME = 'History Duration';
const CONFIG_SME_SYNC_HOUR_NAME = 'Daily SMEs Sync at Hour';
const CONFIG_TSR_SYNC_HOUR_NAME = 'Monthly TSRs Sync at Hour';
const CONFIG_SCRUBS_RENEW_HOUR = 'Daily Scrubs renew at Hour';
const CONFIG_DAILY_LIMIT_IGNORE_RCR_NAME = 'Daily Scrub Limit Ignore RCR';
const CONFIG_DAILY_LIMIT_NAME = 'Daily Scrub Limit';
const CONFIG_ENABLE_DAILY_LIMIT_NAME = 'Enable Daily Scrub Limit';

const ENABLE_VALUE = 'Enable';
const COLOUR_ENABLE = '#33ff33';
const DISABLE_VALUE = 'Disable';
const COLOUR_UNABLE = '#ff3333';

const COLOUR_SHARD_DATA = '#00ffff';
const COLOUR_SHARD_PLATFORM = '#00ff00';
const COLOUR_SHARD_INFRA = '#ff0000';
const COLOUR_SHARD_NETWORKING = '#ffff00';

const RANGE_CONFIG_SITE = 'C1';

function loadSystemConfig_() {
  setSystemConfiguration_(Utils.getValues(SYSTEM_CONFIG_SHEET, Utils.makeRangeWithoutLastRow(SYSTEM_CONFIG_SHEET, SYSTEM_CONFIG_RANGE)));
}

function setSystemConfiguration_(configs) {
  Logger.log(configs.length);
  configs.forEach(
    config => {
      if (Utils.compareStrIgnoreCases(config[0], CONFIG_SITE_NAME)) {
        SITE = config[1];
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SHARD_NAME)) {
        SHARD = config[1];
      }  else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SPECIALIZATION_NAME)) {
        Logger.log(config[1] + "========");
        ENABLE_SPECIALIZATION_DISTIRBUTE = isEnable_(config[1]);
        Logger.log(ENABLE_SPECIALIZATION_DISTIRBUTE);
      }  else if (Utils.compareStrIgnoreCases(config[0], CONFIG_ASSIGN_REVIEWER_NAME)) {
        ENABLE_ASSIGN_REVIEWER_DISTRUBUTE = isEnable_(config[1]);
      }  else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SYNC_SMES_NAME)) {
        AUTO_SYNC_SMES_DAILY = isEnable_(config[1]);
      }  else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SYNC_TSRS_NAME)) {
        AUTO_SYNC_TSRS_MONTHLY = isEnable_(config[1]);
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_ABSOLUTE_BALANCE_NAME)) {
        ENABLE_ABSOLUTE_BALANCE_DISTRIBUTE = isEnable_(config[1]);
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_EXPORT_RCR)) {
        EXPORT_RCR = isEnable_(config[1]);
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_ONLY_TELMON_NAME)) {
        ONLY_SYNC_TELMON = isEnable_(config[1]);
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_MAX_CASE_AGE_NAME)) {
        MAX_CASE_AGE = config[1];
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_MIN_CASE_AGE_NAME)) {
        MIN_CASE_AGE = config[1];
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SCRUB_SITES_NAME)) {
        SCRUB_SITES = config[1];
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_HISTORY_DURATION_NAME)) {
        HISTORY_DURATION = config[1];
      }  else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SME_SYNC_HOUR_NAME)) {
        HOUR_SYNC_SMES = config[1];
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_TSR_SYNC_HOUR_NAME)) {
        HOUR_SYNC_TSRS = config[1];
      } /** else if (Utils.compareStrIgnoreCases(config[0], CONFIG_SCRUBS_RENEW_HOUR)) {
        HOUR_RENEW_SCRUBS = config[1];
      } */ 
       else if (Utils.compareStrIgnoreCases(config[0], CONFIG_DAILY_LIMIT_NAME)) {
        LIMIT_DAILY_SCRUB = config[1];
      } else if (Utils.compareStrIgnoreCases(config[0], CONFIG_DAILY_LIMIT_IGNORE_RCR_NAME)) {
        ENABLE_DAILY_LIMIT_IGNORE_RCR = isEnable_(config[1]);
      }  else if (Utils.compareStrIgnoreCases(config[0], CONFIG_ENABLE_DAILY_LIMIT_NAME)) {
        ENABLE_DAILY_LIMIT = isEnable_(config[1]);
      } else {
        Logger.log('unknow configuration' + config[0] + " " + config[1]);
      }
    }
  );

}

function isEnable_(value) {
  return Utils.compareStrIgnoreCases(ENABLE_VALUE, value);
}

function generateSystemConfigSheet() {
  Utils.clear(SYSTEM_CONFIG_SHEET, Utils.makeRangeWithoutLastRow(SYSTEM_CONFIG_SHEET, SYSTEM_CONFIG_RANGE_WITH_COMMENT))
  configuration = [];
  configuration.push([CONFIG_SITE_NAME, SITE, '']);
  configuration.push([CONFIG_SHARD_NAME, SHARD, '']);
  configuration.push([CONFIG_SPECIALIZATION_NAME, ENABLE_VALUE, 'Suggest: enable']);
  configuration.push([CONFIG_ASSIGN_REVIEWER_NAME, ENABLE_VALUE, 'Suggest: enable']);
  // configuration.push([CONFIG_ABSOLUTE_BALANCE_NAME, 'Unable', 'Suggest: unable']);
  configuration.push([CONFIG_SYNC_SMES_NAME, ENABLE_VALUE, '']);
  configuration.push([CONFIG_SYNC_TSRS_NAME, ENABLE_VALUE, '']);
  configuration.push([CONFIG_EXPORT_RCR, DISABLE_VALUE, '']);
  configuration.push([CONFIG_ENABLE_DAILY_LIMIT_NAME, ENABLE_VALUE, '']);
  configuration.push([CONFIG_DAILY_LIMIT_IGNORE_RCR_NAME, DISABLE_VALUE, '']);
  configuration.push([CONFIG_DAILY_LIMIT_NAME, LIMIT_DAILY_SCRUB, '']);
  configuration.push([CONFIG_MAX_CASE_AGE_NAME, MAX_CASE_AGE, '']);
  configuration.push([CONFIG_MIN_CASE_AGE_NAME, MIN_CASE_AGE, '']);
  configuration.push([CONFIG_SCRUB_SITES_NAME, SCRUB_SITES, '']);
  configuration.push([CONFIG_HISTORY_DURATION_NAME, HISTORY_DURATION, '']);
  configuration.push([CONFIG_SME_SYNC_HOUR_NAME, HOUR_SYNC_SMES, 'Better to set this value earlier than 8 AM, and do not forget to refresh schedulers']);
  configuration.push([CONFIG_TSR_SYNC_HOUR_NAME, HOUR_SYNC_TSRS, 'Do not forget to refresh schedulers']);
  // configuration.push([CONFIG_SCRUBS_RENEW_HOUR, HOUR_RENEW_SCRUBS, '']);
  Utils.exportRawDataToSheet(SYSTEM_CONFIG_SHEET, SYSTEM_CONFIG_RANGE_WITH_COMMENT + configuration.length, configuration);
  generateShardRules_();
  addCloursForShard_();
  generateSystemConfigValidations_();
  addColorsForSystemConfigValidations_();
}

function generateShardRules_() {
  Utils.generateRules(SYSTEM_CONFIG_SHEET, 'C2', [SHARD_DATA, SHARD_INFRA, SHARD_PLATFORM, SHARD_NETWORKING]);
}

function addCloursForShard_() {
  Utils.setBGBasedOnText(SYSTEM_CONFIG_SHEET, 'C2', SHARD_DATA, COLOUR_SHARD_DATA);
  Utils.setBGBasedOnText(SYSTEM_CONFIG_SHEET, 'C2', SHARD_INFRA, COLOUR_SHARD_INFRA);
  Utils.setBGBasedOnText(SYSTEM_CONFIG_SHEET, 'C2', SHARD_PLATFORM, COLOUR_SHARD_PLATFORM);
  Utils.setBGBasedOnText(SYSTEM_CONFIG_SHEET, 'C2', SHARD_NETWORKING, COLOUR_SHARD_NETWORKING);
  
}

function generateSystemConfigValidations_() {
  Utils.generateRules(SYSTEM_CONFIG_SHEET, 'C3:C9', [ENABLE_VALUE, DISABLE_VALUE]);
}

function addColorsForSystemConfigValidations_() {
  Utils.setBGBasedOnText(SYSTEM_CONFIG_SHEET, 'C3:C9', DISABLE_VALUE, COLOUR_UNABLE);
  Utils.setBGBasedOnText(SYSTEM_CONFIG_SHEET, 'C3:C9', ENABLE_VALUE, COLOUR_ENABLE);
}

loadSystemConfig_();
