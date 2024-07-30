/**
 * Site	TEL - MON
Shard	Data
RCR sheet	<id>
Specialization Group Distribute	Enable
Assign Reviewer Distribute	Enable
Absolute Balance Distribute	Disenable
Auto Sync SMEs Sheet Daily	Enable
Auto Sync TSRs Sheet Monthly	Disenable
ONLY Sync TEL - MON TSRs	Enable
 */


const SHARD_DATA = 'Data';
const SHARD_INFRA = 'Infra';
const SHARD_PLATFORM = 'Platform';
const SHARD_NETWORKING = 'Networking'
// RCR_SHEET = '<rcr sheet id>';
SITE = 'tel-mon';
SHARD = SHARD_DATA;
ENABLE_SPECIALIZATION_DISTIRBUTE = true;
ENABLE_ASSIGN_REVIEWER_DISTRUBUTE = true;
ENABLE_ABSOLUTE_BALANCE_DISTRIBUTE = false;
AUTO_SYNC_SMES_DAILY = true;
AUTO_SYNC_TSRS_MONTHLY = true;
ONLY_SYNC_TELMON = true;
EXPORT_RCR = false;
MAX_CASE_AGE = 3;
MIN_CASE_AGE = 0;

SCRUB_SITES = '<sites>';

HISTORY_DURATION = 3;

HOUR_RENEW_SCRUBS = 9;
HOUR_SYNC_SMES = 8;
HOUR_SYNC_TSRS = 8;

ENABLE_DAILY_LIMIT = true;
ENABLE_DAILY_LIMIT_IGNORE_RCR = false;
LIMIT_DAILY_SCRUB = 15;
