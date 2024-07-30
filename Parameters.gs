const PARAMETERS_SHEET = 'Parameters';
const PARAMETERS_RANGE_START = 'A2:C';

const SEPCIALIZATION_ALL = 'all';
const SPECIALIZATION_LIST = [SEPCIALIZATION_ALL];
const SPECIALIZATION_SECTION = 'specialization';

const SHIFT_MAP = new Map();
const SHIFT_SECTION = 'shift';
const SHIFT_NO_SCRUBS = 'no_scrub';
const SHIFT_NEVER_SCRUBS = 'never_scrub';
const SHIFT_NORMAL_SCRUBS = 'normal';
const SHIFT_SCRUBS_LIST = [SHIFT_NO_SCRUBS, SHIFT_NEVER_SCRUBS, SHIFT_NORMAL_SCRUBS];

function reloadParameters() {
  generateTSRSpecializationRules_();
  generateSMESpecializationRules_();
}

function loadParameters_() {
  parameters = Utils.getValues(PARAMETERS_SHEET, PARAMETERS_RANGE_START);
  parameters.forEach(
    parameter => {
      if (parameter[0].toLowerCase() == SPECIALIZATION_SECTION) {
        loadSpecialization_(parameter);
      } else if (parameter[0].toLowerCase() == SHIFT_SECTION) {
        loadShiftMap_(parameter);
      } else {
        // do nothing now
      }
    }
  );
}

function loadSpecialization_(parameter) {
  SPECIALIZATION_LIST.push(parameter[1].trim());
}

function loadShiftMap_(parameter) {
  Logger.log(parameter[1] + " " + parameter[2]);
  SHIFT_MAP.set(parameter[1], parameter[2].trim());
}

loadParameters_();
