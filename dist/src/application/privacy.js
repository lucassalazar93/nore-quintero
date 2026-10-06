import {validPreference} from '../domain/messages.js';
/** Storage port: read()/write(value); clock returns milliseconds. */
export function createPrivacyService({storage, clock, retentionDays}) {
  const saved = storage.read();
  let preference = validPreference(saved, clock()) ? saved : {maps:false, expires:0};
  return {
    current: () => ({...preference}),
    save(maps) {
      preference = {maps: Boolean(maps), expires: clock() + retentionDays * 86400000};
      storage.write(preference);
      return {...preference};
    }
  };
}
