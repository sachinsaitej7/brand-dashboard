import { logEvent } from "firebase/analytics";
import { getFirebase } from "./index";

export function logAnalyticsEvent(name, params) {
    const { analytics } = getFirebase();
    logEvent(analytics, name, params);
}
    
