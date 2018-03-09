const DEVICE_ID_KEY = 'device-id';
const DEVICE_PASSCODE_KEY = 'device-passcode';

class ConfigStore {
  get deviceId() {
    return window.localStorage.getItem(DEVICE_ID_KEY);
  }

  set deviceId(newId) {
    window.localStorage.setItem(DEVICE_ID_KEY, newId);
  }

  get passcode() {
    return window.localStorage.getItem(DEVICE_PASSCODE_KEY) || "0000";
  }

  set passcode(newPasscode) {
    window.localStorage.setItem(DEVICE_PASSCODE_KEY, newPasscode);
  }
}

module.exports = new ConfigStore;

window._config = module.exports;
