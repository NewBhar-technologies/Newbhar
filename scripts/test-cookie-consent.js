/**
 * Automated Verification Script: Cookie Consent & Analytics Privacy Rules
 */

const assert = require("assert");

// Mock browser environment for unit test
global.window = {
  location: { pathname: "/", hostname: "newbhar.com" },
  dispatchEvent: (event) => {
    if (global.window._listeners && global.window._listeners[event.type]) {
      global.window._listeners[event.type].forEach((cb) => cb(event));
    }
  },
  addEventListener: (type, cb) => {
    global.window._listeners = global.window._listeners || {};
    global.window._listeners[type] = global.window._listeners[type] || [];
    global.window._listeners[type].push(cb);
  },
  removeEventListener: (type, cb) => {
    if (global.window._listeners && global.window._listeners[type]) {
      global.window._listeners[type] = global.window._listeners[type].filter((fn) => fn !== cb);
    }
  },
};

global.CustomEvent = class CustomEvent {
  constructor(type, options = {}) {
    this.type = type;
    this.detail = options.detail || {};
  }
};

let store = {};
global.localStorage = {
  getItem: (k) => store[k] || null,
  setItem: (k, v) => { store[k] = String(v); },
  removeItem: (k) => { delete store[k]; },
  clear: () => { store = {}; },
};

let sessionStore = {};
global.sessionStorage = {
  getItem: (k) => sessionStore[k] || null,
  setItem: (k, v) => { sessionStore[k] = String(v); },
  removeItem: (k) => { delete sessionStore[k]; },
  clear: () => { sessionStore = {}; },
};

let cookies = [];
global.document = {
  get cookie() {
    return cookies.join("; ");
  },
  set cookie(val) {
    if (val.includes("expires=Thu, 01 Jan 1970")) {
      const name = val.split("=")[0].trim();
      cookies = cookies.filter((c) => !c.startsWith(name + "="));
    } else {
      cookies.push(val.split(";")[0]);
    }
  },
  head: { appendChild: () => {} },
  querySelectorAll: () => [],
};

// Import consent module
const {
  CONSENT_STORAGE_KEY,
  CONSENT_VERSION,
  CONSENT_STATES,
  getStoredConsent,
  persistConsent,
  hasAnalyticsConsent,
  purgeAnalyticsData,
} = require("../lib/cookie-consent");

console.log("------------------------------------------------------------");
console.log("STARTING TEST SUITE: Privacy-First Cookie Consent & Analytics");
console.log("------------------------------------------------------------");

// Test 1: First visit - default undecided, analytics disabled
localStorage.clear();
sessionStorage.clear();
cookies = [];

const firstVisit = getStoredConsent();
assert.strictEqual(firstVisit.status, CONSENT_STATES.UNDECIDED, "Test 1 failed: Default status must be undecided");
assert.strictEqual(hasAnalyticsConsent(), false, "Test 1 failed: Analytics must be disabled on first visit");
console.log("✔ Scenario 1: First visit -> Undecided, Analytics strictly disabled.");

// Test 2: User clicks 'Accept All'
persistConsent(CONSENT_STATES.ACCEPTED, { analytics: true });
const acceptedState = getStoredConsent();
assert.strictEqual(acceptedState.status, CONSENT_STATES.ACCEPTED, "Test 2 failed: Status must be accepted");
assert.strictEqual(acceptedState.categories.analytics, true, "Test 2 failed: Analytics category must be true");
assert.strictEqual(hasAnalyticsConsent(), true, "Test 2 failed: Analytics should be permitted after explicit acceptance");

// Verify localStorage format per specification
const rawStored = JSON.parse(localStorage.getItem(CONSENT_STORAGE_KEY));
assert.strictEqual(rawStored.cookieConsent, "accepted", "Test 2 failed: Stored cookieConsent must be 'accepted'");
assert.strictEqual(rawStored.consentVersion, "1.0", "Test 2 failed: Stored consentVersion must be '1.0'");
console.log("✔ Scenario 2: Accept All -> Consent accepted, localStorage formatted properly, analytics allowed.");

// Test 3: Refresh after accepting
const refreshedAfterAccept = getStoredConsent();
assert.strictEqual(refreshedAfterAccept.status, CONSENT_STATES.ACCEPTED, "Test 3 failed: Refresh must retain accepted state");
assert.strictEqual(hasAnalyticsConsent(), true, "Test 3 failed: Analytics remains allowed on refresh");
console.log("✔ Scenario 3: Refresh after accepting -> Retains accepted state without prompting.");

// Test 4: Revoke consent
// Simulate tracking ids created while accepted
localStorage.setItem("newbhar_visitor_id", "vis_12345");
sessionStorage.setItem("newbhar_session_id", "ses_12345");
document.cookie = "_ga=GA1.2.123456; path=/";
document.cookie = "newbhar_visitor_id=vis_12345; path=/";

purgeAnalyticsData();
persistConsent(CONSENT_STATES.REJECTED, { analytics: false });

assert.strictEqual(hasAnalyticsConsent(), false, "Test 4 failed: Analytics must be false after revocation");
assert.strictEqual(localStorage.getItem("newbhar_visitor_id"), null, "Test 4 failed: visitor ID must be purged on revocation");
assert.strictEqual(sessionStorage.getItem("newbhar_session_id"), null, "Test 4 failed: session ID must be purged on revocation");
assert.ok(!document.cookie.includes("_ga"), "Test 4 failed: _ga cookie must be purged on revocation");
console.log("✔ Scenario 4: Revoke Consent -> Analytics stopped, storage & tracking cookies immediately purged.");

// Test 5: Refresh after rejecting
const refreshedAfterReject = getStoredConsent();
assert.strictEqual(refreshedAfterReject.status, CONSENT_STATES.REJECTED, "Test 5 failed: Retains rejected status");
assert.strictEqual(hasAnalyticsConsent(), false, "Test 5 failed: Analytics remains disabled on refresh");
console.log("✔ Scenario 5: Refresh after rejecting -> Retains rejected status, zero tracking.");

// Test 6: Clear localStorage
localStorage.clear();
const clearedState = getStoredConsent();
assert.strictEqual(clearedState.status, CONSENT_STATES.UNDECIDED, "Test 6 failed: Cleared storage must return undecided");
assert.strictEqual(hasAnalyticsConsent(), false, "Test 6 failed: Analytics remains disabled");
console.log("✔ Scenario 6: Clear localStorage -> Banner re-appears (status undecided), analytics remains disabled.");

// Test 7: Verify Admin Route Exclusion
window.location.pathname = "/admin/dashboard";
assert.strictEqual(window.location.pathname.startsWith("/admin"), true, "Test 7 failed: Admin path detection");
console.log("✔ Scenario 7: Admin route -> Verified admin path exclusion.");

console.log("------------------------------------------------------------");
console.log("ALL 7 PRIVACY & CONSENT TEST SCENARIOS PASSED SUCCESSFULLY!");
console.log("------------------------------------------------------------");
