window.__libsReady.then(function(){
  try{
(() => {
  const { useState, useEffect, useMemo, useRef, useCallback } = React;
  const RC = window.Recharts || window.recharts || {};
  const chartsReady = !!(RC && RC.ResponsiveContainer && RC.Tooltip);
  const SHEET_ID = "1geufMjgX3_PpnBhSKQB2tGmrk2SMhGAEU24BZs5-zSQ";
  // Loan officers manually hidden from the dashboard via Settings. Keyed by
  // lowercased name. Synced from App state so every view (leaderboard, podium,
  // competition, standouts, goals, KPIs) filters them out consistently.
  const HIDDEN_OFFICERS = {};
  const isHidden = (name) => !!HIDDEN_OFFICERS[String(name || "").trim().toLowerCase()];
  // Officers known from Settings (e.g. those with a Pipeline IQ email on file),
  // keyed lowercased -> display name. Synced from App state. Lets the leaderboard
  // include configured LOs even when they have zero production this period.
  const OFFICER_NAMES = {};
  // The Team Roster is the GATE for who appears anywhere: only people on the
  // roster (by lowercased name) are eligible for the leaderboard/dashboard.
  // Synced from App state. When empty (e.g. before settings load), the gate is
  // open so the dashboard isn't blank on first paint.
  const ROSTER_KEYS = {};
  const onRoster = (name) => {
    if (!Object.keys(ROSTER_KEYS).length) return true;   // gate open until roster loads
    return !!ROSTER_KEYS[String(name || "").trim().toLowerCase()];
  };
  // Eligible = on the roster AND not hidden. Single source of truth for display.
  const isEligible = (name) => onRoster(name) && !isHidden(name);
  const TAB_NAME = "Loan Pipeline";

  // ---- Lender Directory (seeded from the Lender Tiers sheet; admin-editable) ----
  // Each lender: { tier, lender, channel, portal, ae, phone, email, buyBox[], notes, servicing }
  const US_STATES = ["AL","AK","AZ","AR","CA","CO","CT","DE","DC","FL","GA","HI","ID","IL","IN","IA","KS","KY","LA","ME","MD","MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ","NM","NY","NC","ND","OH","OK","OR","PA","RI","SC","SD","TN","TX","UT","VT","VA","WA","WV","WI","WY"];
  const LENDER_SEED = [
    { tier: 1, lender: "Pennymac TPO", channel: "Correspondent", portal: "https://power.pennymac.com/#/content/home_362710", ae: "Daniel Schneider", phone: "805.891.6240", email: "Daniel.schneider@pennymac.com", buyBox: ["Jumbo", "Conventional", "Government", "Non-QM", "Quick closes", "VA", "FHA", "TBD UWs", "High Bal", "Construction", "Manufactured", "Asset Depletion"], notes: "Closing hotline - 833.769.3710; 15 bps PE on refis who purchased with Pennymac", servicing: "Yes", epoPolicy: "180 Days from Purchase", disclaimers: "Construction - Std" },
    { tier: 1, lender: "The Loan Store", channel: "Correspondent", portal: "https://theloanstore.encompasstpoconnect.com/#/content/home_196305", ae: "Stephen Colberg", phone: "314.308.9410", email: "Scolberg@theloanstore.com", buyBox: ["Investment Loans", "Non-QM", "Exceptions", "Jumbo", "Quick closes"], notes: "Non-QM Correspondent, lenient on guidelines", servicing: "No", epoPolicy: "", disclaimers: "" },
    { tier: 1, lender: "United Wholesale Mortgage", channel: "Correspondent", portal: "https://www.uwm.com", ae: "Jalen Wade", phone: "800.981.8898 Ext.68161", email: "Jwade@uwm.com", buyBox: ["A-Paper", "Quick closes", "VA", "FHA", "TBD UWs", "DPA Loan", "USDA", "Jumbo", "High Bal", "2nds", "I/O", "Construction", "Manufactured", "DSCR", "Asset Depletion", "Bank Statement", "Close in LLC"], notes: "Quick closes", servicing: "Yes", epoPolicy: "180 Days from Purchase", disclaimers: "2nds - Piggyback, HELOC; Construction - Std, OTC" },
    { tier: 1, lender: "Kind Lending", channel: "Correspondent", portal: "https://kwikie.kindlending.com/home", ae: "Alessandra Ford", phone: "619.818.1518", email: "AFord@kindlending.com", buyBox: ["Non-QM", "DPA Loan", "VA", "FHA", "NO FICO", "USDA", "Jumbo", "High Bal", "2nds", "40 Yr", "I/O", "Manufactured", "Non-Warrantable Condos", "Frgn Ntnls", "DSCR", "STR", "1099", "Asset Depletion", "Bank Statement", "Hobby Farm", "Close in LLC"], notes: "Non-QM Correspondent | VOE Fee Waived On VA Loans In IA, NJ, TX, VA.", servicing: "No", epoPolicy: "180 days from funding", disclaimers: "2nds - Piggyback, HELOC, HELOAN; DSCR - Bkr; STR - Bkr" },
    { tier: 1, lender: "SunWest Mortgage Company", channel: "Correspondent", portal: "https://www.swmc.com/login", ae: "Jeremy Torres", phone: "562.278.0952", email: "jeremy.torres@swmc.com", buyBox: ["ARMs", "Doctor Loan", "VA", "FHA", "TBD UWs", "NO FICO", "DPA Loan", "USDA", "203K", "Jumbo", "High Bal", "2nds", "I/O", "Construction", "Manufactured", "ITIN", "DSCR", "STR", "1099", "Bank Statement", "Close in LLC"], notes: "", servicing: "No", epoPolicy: "6 months", disclaimers: "Construction - Reno" },
    { tier: 2, lender: "Deephaven Mortgage", channel: "Correspondent", portal: "https://haven.deephavenmortgage.com/login", ae: "Tommy Banning", phone: "", email: "tbanning@deephaven.com", buyBox: ["Non-QM", "Jumbo", "I/O", "Non-Warrantable Condos", "DSCR", "STR", "Asset Depletion", "Bank Statement"], notes: "Non-QM Correspondent, lenient on guidelines", servicing: "No", epoPolicy: "180 Days", disclaimers: "" },
    { tier: 2, lender: "Figure HELOC", channel: "Broker", portal: "https://www.figure.com/home-equity-line/", ae: "N/A", phone: "888.493.0452", email: "loans@axenmortgageheloc.com", buyBox: ["AI HELOC"], notes: "Confirm states were available", servicing: "", epoPolicy: "", disclaimers: "" },
    { tier: 2, lender: "eLend", channel: "Correspondent", portal: "https://www.afrloancenter.com/login", ae: "Jess Humphreys", phone: "973.576.4146", email: "jess.humphreys@elend.com", buyBox: ["VA", "FHA", "DPA Loan", "USDA", "203K", "High Bal", "Construction", "Manufactured"], notes: "", servicing: "", epoPolicy: "210 Days or 6 Payments", disclaimers: "Construction - OTC, Reno" },
    { tier: 2, lender: "MLB Wholesale", channel: "Correspondent", portal: "https://1332848460.encompasstpoconnect.com/#/content/vanillalogin", ae: "Maria Parada", phone: "832.423.2365", email: "mparada@mlbmortgage.com", buyBox: ["VA", "FHA", "NO FICO", "USDA", "203K", "High Bal", "I/O", "Construction", "Manufactured", "Frgn Ntnls", "ITIN", "DSCR", "1099", "Asset Depletion", "Bank Statement", "Bridge Loan", "Close in LLC"], notes: "", servicing: "", epoPolicy: "", disclaimers: "Construction - Reno Loans" },
    { tier: 2, lender: "Windsor Mortgage", channel: "Correspondent", portal: "https://1386093445.encompasstpoconnect.com/#/content/home_175158", ae: "Rob Barron", phone: "605.370.3053", email: "rbarron@windsormortgage.com", buyBox: ["Bridge Loan", "Doctor Loan"], notes: "Doctor loan is Broker-only", servicing: "", epoPolicy: "181 Days", disclaimers: "" },
    { tier: 2, lender: "Sierra Pacific", channel: "Broker", portal: "https://www.sierrapacificmortgage.com/net/SPMLogin/", ae: "Bob Yadon", phone: "949.331.0037", email: "Bob.yadon@spmc.com", buyBox: ["VA", "FHA", "DPA Loan", "USDA", "203K", "Jumbo", "High Bal"], notes: "MUST USE SPMC APPROVED AMC LIST: Act Appraisals, Accelerated Appraisal Group (CA Only), APEX Appraisals, AXIS Appraisals, Clear Capital, Inc.,, Core Valuations Managment, First Choice, Nadlan Valuation, NAN, Olde City Lending Solutions, Terra Val, Trimavin, United States Appraisal, Valuation Partners", servicing: "", epoPolicy: "6 months", disclaimers: "" },
    { tier: 2, lender: "Change Wholesale", channel: "Broker", portal: "https://portal.changelendingllc.com/", ae: "Christopher Heston", phone: "949.630.8143", email: "Christopher.heston@changewholesale.com", buyBox: ["Bank Statement", "P&L", "No Ratio"], notes: "", servicing: "", epoPolicy: "", disclaimers: "" },
    { tier: 2, lender: "Plaza Home Mortgage", channel: "Correspondent", portal: "https://breeze.plazahomemortgage.com/epicportal/Default.aspx", ae: "Megan Trigg", phone: "602.910.1949", email: "Megan.Trigg@plazahomemortgage.com", buyBox: ["VA", "FHA", "DPA Loan", "USDA", "203K", "Jumbo", "High Bal", "2nds", "40 Yr", "I/O", "Construction", "Manufactured", "Non-Warrantable Condos", "DSCR", "STR", "1099", "Asset Depletion", "Bank Statement", "Close in LLC"], notes: "AXEN / NEXA Price Specials Only Show Up When Pricing Out In Breeze", servicing: "", epoPolicy: "180 Days", disclaimers: "2nds - HELOAN only; Construction - Reno" },
    { tier: 2, lender: "Equity Prime Mortgage", channel: "Correspondent", portal: "https://www.epmexperience.com/login", ae: "John Burleson", phone: "214.728.6612", email: "john.burleson@epm.net", buyBox: ["FHA", "Low FICO", "VA", "NO FICO", "DPA Loan", "USDA", "203K", "Jumbo", "High Bal", "Construction", "Manufactured", "DSCR", "1099", "Bank Statement", "Close in LLC"], notes: "", servicing: "Mixed", epoPolicy: "180 days", disclaimers: "DPA Loan - BKR; Construction - Reno-conv, fha, va; DSCR - BKR" },
    { tier: 2, lender: "Freedom Mortgage", channel: "Broker", portal: "https://clientcf.freedomwholesale.com/", ae: "Jennifer Concepcion", phone: "856.272.3342", email: "Jennifer.Concepcion@FreedomMortgage.com", buyBox: ["VA", "FHA", "ARMs", "NO FICO", "USDA", "Jumbo", "High Bal", "Manufactured"], notes: "NO Score With AUS Approval, Other Wise 620 Min For Conv. Manufactured In AZ, FL, GA, LA, NC & NV Only. USDA Min FICO 600. Multiwide Manufactured Now Allowed.", servicing: "", epoPolicy: "6 months", disclaimers: "NO FICO - Y FHA & Conv" },
    { tier: 2, lender: "Acra Lending", channel: "Broker", portal: "https://alglide.com/login", ae: "Tony Guidicessi", phone: "727.278.1046", email: "tony.guidicessi@acralending.com", buyBox: ["Non-QM"], notes: "NonQM only", servicing: "", epoPolicy: "", disclaimers: "" },
    { tier: 3, lender: "AD Mortgage", channel: "", portal: "https://admortgage.com/correspondent", ae: "", phone: "", email: "", buyBox: ["VA", "FHA", "NO FICO", "DPA Loan", "Jumbo", "2nds", "ITIN", "DSCR", "1099", "Bank Statement"], notes: "", servicing: "", epoPolicy: "", disclaimers: "" },
    { tier: 3, lender: "Axos Bank", channel: "", portal: "https://thirdpartylending.axosbank.com/index", ae: "Kristin Binkley", phone: "(772) 208-7631", email: "kbinkley@axosbank.com", buyBox: ["Jumbo", "DSCR", "Asset Depletion", "Bank Statement", "Bridge Loan", "Close in LLC"], notes: "Jumbo Super Jumbo Portfolio 5/6 And 7/6 ARM Loans. $500k - $30mm Loan Amount. All NON DEL Correspondent. We Close Loans The Standard Jumbo Lenders Pass On But Are Great Deals At Reduced Ltvs.", servicing: "", epoPolicy: "180 Days", disclaimers: "" },
    { tier: 3, lender: "HomeXpress Mortgage", channel: "", portal: "", ae: "", phone: "", email: "", buyBox: ["Jumbo", "High Bal", "40 Yr", "I/O", "Manufactured", "ITIN", "DSCR", "Commercial", "1099", "Asset Depletion", "Bank Statement", "Bridge Loan", "Hobby Farm", "Close in LLC"], notes: "", servicing: "", epoPolicy: "6 MONTHS", disclaimers: "Close in LLC - LTD" },
    { tier: 3, lender: "JMAC Lending", channel: "", portal: "www.jmaclending.com", ae: "Mike Garland", phone: "(423) 802-0495", email: "mike.garland@jmaclending.com", buyBox: ["VA", "FHA", "NO FICO", "DPA Loan", "USDA", "Jumbo", "High Bal", "2nds", "40 Yr", "I/O", "Manufactured", "Non-Warrantable Condos", "Frgn Ntnls", "ITIN", "DSCR", "STR", "Commercial", "1099", "Asset Depletion", "Bank Statement", "Close in LLC"], notes: "Max JUMBO Loan Amount Up To $4M. We Offer Negative Cash Flow DSCR Loans Down To 0.00 DSCR. Not licensed in Hawaii.", servicing: "", epoPolicy: "6 mos agency & gov & 9 mos NON-QM & Jumbo", disclaimers: "2nds - HELOC" },
    { tier: 3, lender: "Newfi", channel: "", portal: "Portal - Newfi Correspondent", ae: "", phone: "", email: "", buyBox: ["Jumbo", "2nds", "Manufactured", "Non-Warrantable Condos", "Frgn Ntnls", "ITIN", "DSCR", "STR", "1099", "Asset Depletion", "Bank Statement"], notes: "Non -QM Is Their Sole Focus. 90% Of Their Market Is Bank Statement And And DSCR. 10% Is JUMBO That Almost Makes It But Not Quite Fit The Banks And Helocs.", servicing: "", epoPolicy: "180 Days", disclaimers: "2nds - Helocs $75k-$500K 660 min FICO 85% LTV" },
    { tier: 3, lender: "NewRez", channel: "", portal: "https://www.newrezwholesale.com/", ae: "Eric Wynne", phone: "(480) 716-7047", email: "eric.wynne@newrez.com", buyBox: ["VA", "FHA", "TBD UWs", "NO FICO", "USDA", "Jumbo", "High Bal", "2nds", "40 Yr", "I/O", "Manufactured", "Non-Warrantable Condos", "Frgn Ntnls", "DSCR", "STR", "1099", "Asset Depletion", "Bank Statement", "Close in LLC"], notes: "Specializes In Non Warrantable Condo's Across Most Programs", servicing: "", epoPolicy: "180 days", disclaimers: "2nds - Piggyback" },
    { tier: 3, lender: "NexBank", channel: "", portal: "http://mortgage.nexbank.com", ae: "Mark Dombrowski", phone: "602-430-5210", email: "Mark.Dombrowski@NexBank.com", buyBox: ["VA", "FHA", "Jumbo", "High Bal", "I/O", "DSCR", "Asset Depletion", "Bank Statement"], notes: "No Hit 2nd Home, Lower LLPA Investment, 80% Cash Out, $200k Min, 680+, 45%DTI = Mortgage Connect, Full Doc Portfolio. Can Speak Directly To Underwriters.", servicing: "", epoPolicy: "180 Days", disclaimers: "" },
    { tier: 3, lender: "Oaktree", channel: "", portal: "Oaktree", ae: "Hugh Sinclair", phone: "(425) 802-2660", email: "hsinclair@oaktreefunding.com", buyBox: ["NO FICO", "Jumbo", "2nds", "40 Yr", "I/O", "Non-Warrantable Condos", "Frgn Ntnls", "ITIN", "DSCR", "STR", "Commercial", "1099", "Asset Depletion", "Bank Statement", "Bridge Loan", "Close in LLC"], notes: "Professional Investor Products", servicing: "", epoPolicy: "", disclaimers: "" },
    { tier: 3, lender: "REMN Wholesale", channel: "", portal: "https://www.remnwholesale.com/", ae: "Sandra Rodriguez", phone: "(908) 380-1377", email: "srodriguez@remn.com", buyBox: ["VA", "FHA", "TBD UWs", "NO FICO", "USDA", "203K", "Jumbo", "High Bal", "2nds", "40 Yr", "I/O", "Construction", "Manufactured", "Non-Warrantable Condos", "Frgn Ntnls", "DSCR", "STR", "1099", "Asset Depletion", "Bank Statement", "Close in LLC"], notes: "", servicing: "", epoPolicy: "180 Days", disclaimers: "2nds - Piggyback, HELOC; Construction - Reno" },
    { tier: 3, lender: "11 Mortgage", channel: "", portal: "Elevenmortgage.com", ae: "Dina Barreras", phone: "(714) 745-8635", email: "dina.barreras@elevenmortgage.com", buyBox: ["VA", "FHA", "TBD UWs", "NO FICO", "USDA", "High Bal", "Manufactured"], notes: "We Handle All Everything From Disclosures To Docs , Manual Underwrites (product)", servicing: "", epoPolicy: "180 days", disclaimers: "" },
    { tier: 3, lender: "Any Other Correspondent Lender", channel: "Correspondent", portal: "", ae: "", phone: "", email: "", buyBox: [], notes: "", servicing: "", epoPolicy: "", disclaimers: "" },
    { tier: 4, lender: "Any Other Broker-only Lender", channel: "Broker", portal: "", ae: "", phone: "", email: "", buyBox: [], notes: "", servicing: "", epoPolicy: "", disclaimers: "" }
  ];
  // Additional Buy Box tags (admin-supplied). Merged with tags derived from
  // lender data below; near-duplicates are deduped case-insensitively.
  const BUYBOX_EXTRA = [
    "VA", "FHA", "TBD UWs", "NO FICO", "DPA Loan", "USDA", "203K", "Jumbo",
    "High Bal", "2nds", "40 Yr", "I/O", "Construction", "Manufactured",
    "Non-Warrantable Condos", "Frgn Ntnls", "ITIN", "Hard Money", "DSCR",
    "STR", "Commercial", "1099", "Asset Depletion", "Bank Statement",
    "Bridge Loan", "Hobby Farm", "Doctor Loan", "Close in LLC"
  ];
  // Master Buy Box tag list (admin-editable). Seeded from the distinct tags above.
  const BUYBOX_SEED = (() => {
    const s = [];
    const seen = /* @__PURE__ */ new Set();
    const add = (t) => { const k = String(t).trim().toLowerCase(); if (k && !seen.has(k)) { seen.add(k); s.push(String(t).trim()); } };
    LENDER_SEED.forEach((l) => l.buyBox.forEach(add));
    BUYBOX_EXTRA.forEach(add);
    return s.sort((a, b) => a.localeCompare(b));
  })();
  // Split the legacy combined tag into its three parts wherever it appears.
  const COMBINED_BANK = "bank statement / p&l / no ratio";
  const splitCombined = (arr) => {
    const out = [];
    (arr || []).forEach((t) => {
      if (String(t).trim().toLowerCase() === COMBINED_BANK) { out.push("Bank Statement", "P&L", "No Ratio"); }
      else out.push(t);
    });
    return out;
  };
  // Reconcile a saved tag list with the current seed: split the legacy combined
  // tag, then union with BUYBOX_SEED so saved configs can't be missing seed tags.
  const reconcileTags = (saved) => {
    const s = [];
    const seen = /* @__PURE__ */ new Set();
    const add = (t) => { const k = String(t).trim().toLowerCase(); if (k && !seen.has(k)) { seen.add(k); s.push(String(t).trim()); } };
    splitCombined(saved).forEach(add);
    BUYBOX_SEED.forEach(add);
    return s.sort((a, b) => a.localeCompare(b));
  };
  // Reconcile saved lenders: split the combined tag inside each lender's buyBox.
  const reconcileLenders = (saved) => (saved || []).map((l) => ({ ...l, buyBox: splitCombined(l.buyBox) }));
  // Merge saved lender edits with the built-in seed so admin edits ALWAYS endure.
  // Saved entries win for any lender that exists in both (matched by name); only
  // genuinely NEW seed lenders (not present in the saved list) are appended. A
  // seed-version bump therefore only ADDS new defaults — it never overwrites or
  // wipes an admin's saved edits. (Deletions an admin made are preserved too,
  // except a brand-new seed lender of the same name would re-appear.)
  const mergeLenders = (saved, seed) => {
    const reconciled = reconcileLenders(saved);
    const haveByName = {};
    reconciled.forEach((l) => { haveByName[String(l.lender || "").trim().toLowerCase()] = true; });
    const additions = (seed || []).filter((s) => !haveByName[String(s.lender || "").trim().toLowerCase()]);
    return reconciled.concat(additions);
  };
  // Bumped whenever the built-in LENDER_SEED is intentionally re-merged/reset.
  // With merge-preserve behavior, a bump now only ADDS new default lenders to a
  // saved config; existing admin edits are always kept.
  const LENDER_SEED_VERSION = 5;
  const READ_RANGE = "A:Z";
  const DEFAULT_REFRESH_MIN = 15;
  // Live data feed (Apps Script web app /exec URL). Baked in so the dashboard
  // connects automatically on load. Can still be overridden in the gear panel.
  const DEFAULT_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz89TMG-Vjhnzz9zuHyhfS4pZ-nZ_fma7qN3s2iIE0NrRI-apkAmGmPan_pDo2fy8Rf/exec";
  // AInsight: shared Claude Project URL the assistant tab links out to.
  // Paste your Project's share link here once it's created. Leave blank to show
  // a "coming soon" state instead of a broken link.
  const AINSIGHT_PROJECT_URL = "";
  // Official guide landing pages AInsight citations link to (browse pages, which
  // stay current as the guides update and let LOs navigate by section identifier).
  const GUIDE_URLS = {
    fannie: "https://selling-guide.fanniemae.com/",
    freddie: "https://guide.freddiemac.com/app/guide/browse"
  };
  // AInsight gem wordmark: the "A" gem (PNG) extracted from the brand asset.
  const AINSIGHT_AGEM = "data:image/png;base64,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";
  // Admin / settings passcode. Change this to your own before deploying.
  // (Client-side gate: keeps settings and admin out of casual/TV view. For a
  //  hard security boundary, host behind real auth.)
  const LOGO_URI = "data:image/png;base64,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";
  const ADMIN_PASSCODE = "25005";
  const COLS = [
    { k: "loanNumber", L: "LOAN NUMBER" },
    // A
    { k: "officer", L: "LOAN OFFICER" },
    // B  <-- leaderboard dimension
    { k: "assistant", L: "LO ASSISTANT" },
    // C
    { k: "status", L: "STATUS" },
    // D
    { k: "clientName", L: "CLIENT NAME" },
    // E  PII - never on public views
    { k: "borrower2", L: "BORROWER NAME #2" },
    // F PII
    { k: "email", L: "EMAIL" },
    // G  PII
    { k: "phone", L: "PHONE" },
    // H  PII
    { k: "fico", L: "FICO" },
    // I
    { k: "loanAmount", L: "LOAN AMOUNT" },
    // J  "$660,000" -> number
    { k: "loanType", L: "LOAN TYPE" },
    // K
    { k: "term", L: "TERM" },
    // L
    { k: "rate", L: "RATE" },
    // M
    { k: "channel", L: "CHANNEL" },
    // N
    { k: "lender", L: "LENDER" },
    // O
    { k: "address", L: "ADDRESS" },
    // P  PII
    { k: "createdDate", L: "CREATED DATE" },
    // Q
    { k: "preapprovalDate", L: "PREAPPROVAL DATE" },
    //R
    { k: "applicationDate", L: "APPLICATION DATE" },
    //S
    { k: "ctcDate", L: "CTC DATE" },
    // T
    { k: "expectedClose", L: "EXPECTED CLOSE DATE" },
    //U
    { k: "closedDate", L: "CLOSED DATE" },
    // V  presence => funded/won
    { k: "lockExp", L: "LOCK EXP" },
    // W
    { k: "epoDate", L: "EPO DATE" },
    // X
    { k: "clientType", L: "CLIENT TYPE" }
    // Y  Purchase/Refinance/HELOC
  ];
  const money = (s) => {
    if (s == null) return 0;
    const n = parseFloat(String(s).replace(/[^0-9.\-]/g, ""));
    return isFinite(n) ? n : 0;
  };
  const intOr = (s, d = 0) => {
    const n = parseInt(String(s ?? "").replace(/[^0-9\-]/g, ""), 10);
    return isFinite(n) ? n : d;
  };
  // Normalize a REVIEW cell into a review COUNT. The column is a checkbox, so it
  // reads as "TRUE"/"FALSE"; also accept numeric (1, 2, ...) and yes/no text.
  // TRUE = 1 review, FALSE/blank = none.
  const reviewCountOf = (v) => {
    const s = String(v ?? "").trim().toLowerCase();
    if (s === "" || s === "false" || s === "no" || s === "n" || s === "0") return 0;
    if (s === "true" || s === "yes" || s === "y" || s === "x" || s === "\u2713" || s === "\u2714") return 1;
    const n = parseInt(s, 10);
    return isFinite(n) && n > 0 ? n : 0;
  };
  function parseDate(s) {
    if (!s) return null;
    const t = String(s).trim();
    if (!t) return null;
    const m = t.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
    if (m) {
      let [_, mo, d, y] = m;
      y = +y;
      if (y < 100) y += 2e3;
      const dt2 = new Date(y, +mo - 1, +d);
      return isNaN(dt2) ? null : dt2;
    }
    const dt = new Date(t);
    return isNaN(dt) ? null : dt;
  }
  // Strict variant for REVIEW DATE: only returns a date when the value is a
  // COMPLETE date (month, day, AND year all present). Bare years ("2026"),
  // month names, or partial text return null, so the logic falls back to the
  // loan's closed date per the review-dating rule.
  function parseCompleteDate(s) {
    if (!s) return null;
    const t = String(s).trim();
    if (!t) return null;
    // M/D/Y or M-D-Y (2- or 4-digit year)
    let m = t.match(/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})$/);
    if (m) {
      let y = +m[3]; if (y < 100) y += 2e3;
      const dt = new Date(y, +m[1] - 1, +m[2]);
      return isNaN(dt) ? null : dt;
    }
    // Y-M-D (ISO)
    m = t.match(/^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/);
    if (m) {
      const dt = new Date(+m[1], +m[2] - 1, +m[3]);
      return isNaN(dt) ? null : dt;
    }
    // Named month with a day and year, e.g. "June 3, 2026" or "3 Jun 2026"
    if (/\d{1,2}/.test(t) && /\d{4}/.test(t) && /[A-Za-z]{3,}/.test(t)) {
      const dt = new Date(t);
      return isNaN(dt) ? null : dt;
    }
    return null;
  }
  const fmtMoneyShort = (n) => {
    if (n >= 1e9) return "$" + (n / 1e9).toFixed(2) + "B";
    if (n >= 1e6) return "$" + (n / 1e6).toFixed(2) + "M";
    if (n >= 1e3) return "$" + (n / 1e3).toFixed(0) + "K";
    return "$" + Math.round(n);
  };
  const ACTIVE_STAGES = [
    "Lead",
    "Prospect",
    "Prequalified",
    "Preapproved",
    "Application Taken",
    "Registered",
    "Disclosed",
    "Processing",
    "Approved",
    "Clear to Close",
    "Docs Out",
    "Docs Signed",
    "Funded"
  ];
  const DEAD_STAGES = ["Denied", "Withdrawn", "Rescinded", "Not Accepted"];
  const isFunded = (r) => r.status === "Funded" || !!r.closedDate;
  const isDead = (r) => DEAD_STAGES.includes(r.status);
  const isActive = (r) => !isFunded(r) && !isDead(r);
  function rowToObj(cells, reviews) {
    const o = {};
    for (let i = 0; i < COLS.length; i++) {
      o[COLS[i].k] = cells[i] !== void 0 ? cells[i] : "";
    }
    o.loanAmountNum = money(o.loanAmount);
    o.ficoNum = intOr(o.fico, 0);
    o.created = parseDate(o.createdDate);
    o.applied = parseDate(o.applicationDate);
    o.ctc = parseDate(o.ctcDate);
    o.closed = parseDate(o.closedDate);
    // Reviews (optional). reviews = { count, reviewDate, bps }. count = # of
    // 5-star reviews on this loan; reviewDate = the REVIEW DATE column. Only ever
    // populated from header-matched review columns; never from any other field.
    o.reviewCount = reviews ? reviewCountOf(reviews.count) : 0;
    o.reviewDate = reviews ? parseCompleteDate(reviews.reviewDate) : null;
    // Effective date a review is credited to:
    //   1) the loan has a review (count >= 1), AND
    //   2) use REVIEW DATE if it's a valid/complete date, else fall back to the
    //      loan's closed date.
    o.reviewEffDate = o.reviewCount > 0 ? (o.reviewDate || o.closed) : null;
    // BPS (basis points). Exposed by explicit authorization for the avg-bps
    // metric only. Parsed defensively (handles "275", "275 bps", "2.75%").
    o.bps = reviews && reviews.bps != null ? parseFloat(String(reviews.bps).replace(/[^0-9.\-]/g, "")) || 0 : 0;
    return o;
  }
  // JSONP loader: loads data via a <script> tag so it isn't subject to CORS.
  // Apps Script ContentService can't send CORS headers, so a normal fetch is
  // blocked cross-origin; JSONP is the standard way around that. The script
  // returns callback(<json>) which we capture, then we clean up.
  function fetchJSONP(baseUrl, timeoutMs) {
    return new Promise((resolve, reject) => {
      const cbName = "__moxieCb_" + Math.random().toString(36).slice(2) + Date.now();
      const sep = baseUrl.indexOf("?") >= 0 ? "&" : "?";
      const url = baseUrl + sep + "callback=" + cbName + "&t=" + Date.now();
      const script = document.createElement("script");
      let done = false;
      const cleanup = () => {
        try { delete window[cbName]; } catch (e) { window[cbName] = void 0; }
        if (script.parentNode) script.parentNode.removeChild(script);
        clearTimeout(timer);
      };
      const timer = setTimeout(() => {
        if (done) return;
        done = true; cleanup();
        reject(new Error("Timed out waiting for the Apps Script response. Check the URL and that the deployment allows 'Anyone'."));
      }, timeoutMs || 2e4);
      window[cbName] = (data) => {
        if (done) return;
        done = true; cleanup();
        resolve(data);
      };
      script.onerror = () => {
        if (done) return;
        done = true; cleanup();
        reject(new Error("The Apps Script URL couldn't be loaded. Verify the /exec URL and redeploy with 'Who has access: Anyone'."));
      };
      script.src = url;
      document.head.appendChild(script);
    });
  }
  // Turn a raw Apps Script JSON response into row objects (shared by the live
  // fetch and the early prefetch).
  function processFeed(j3) {
    if (!j3 || typeof j3 !== "object") {
      throw new Error("The Apps Script returned an unexpected response. Make sure you deployed the latest script (with JSONP support) and that doGet returns ContentService output.");
    }
    if (j3.error) {
      let msg = "Apps Script reported: " + j3.error;
      if (j3.availableTabs && j3.availableTabs.length) {
        msg += ". Tabs in this sheet: " + j3.availableTabs.join(", ") +
          ". Set TAB_NAME in the script to match one of these exactly.";
      }
      throw new Error(msg);
    }
    const rows3 = j3.values || [];
    if (j3.config) LAST_CONFIG = j3.config;
    if (!rows3.length) return [];
    const header = rows3[0].map((h) => String(h || "").trim().toUpperCase());
    let revIdx = -1, dateIdx = -1, bpsIdx = -1;
    for (let i = 26; i < header.length; i++) {
      if (header[i] === "REVIEW") revIdx = i;
      // The review-date column may be titled "REVIEW DATE" or the legacy
      // "REVIEW YEAR" (now transitioning to hold full dates). Accept either.
      else if (header[i] === "REVIEW DATE" || header[i] === "REVIEW YEAR") dateIdx = i;
      else if (header[i] === "BPS") bpsIdx = i;
    }
    return rows3.slice(1).filter((r) => r && r.length).map((r) => rowToObj(
      r.slice(0, 26),
      { count: revIdx >= 0 ? r[revIdx] : 0, reviewDate: dateIdx >= 0 ? r[dateIdx] : "", bps: bpsIdx >= 0 ? r[bpsIdx] : 0 }
    ));
  }
  async function fetchSheet(cfg) {
    const range = `${TAB_NAME}!${READ_RANGE}`;
    // Option B (recommended): private sheet via a bound Apps Script web app.
    if (cfg.scriptUrl) {
      // Fast path: consume the in-flight prefetch started at page load, if it
      // targets the same URL. This overlaps the slow Apps Script call with the
      // library downloads so data is usually ready by the time React mounts.
      if (typeof window !== "undefined" && window.__prefetch &&
          window.__PREFETCH_URL === cfg.scriptUrl) {
        const pf = window.__prefetch;
        window.__prefetch = null; // one-shot; subsequent refreshes fetch fresh
        const pdata = await pf;
        if (pdata) return processFeed(pdata);
        // prefetch failed/empty -> fall through to a normal JSONP fetch
      }
      // Load via JSONP (<script> tag) to bypass the CORS limitation on Apps
      // Script responses. The script wraps its JSON as callback(<json>).
      const j3 = await fetchJSONP(cfg.scriptUrl, 20000);
      return processFeed(j3);
    }
    // Option A (alternative): link-shared sheet via a Google Sheets API key.
    if (cfg.apiKey) {
      const url = `https://sheets.googleapis.com/v4/spreadsheets/${SHEET_ID}/values/` + encodeURIComponent(range) + `?key=${cfg.apiKey}&majorDimension=ROWS`;
      const res2 = await fetch(url);
      if (!res2.ok) {
        throw new Error("Sheets API " + res2.status);
      }
      const j2 = await res2.json();
      const rows2 = j2.values || [];
      return rows2.slice(1).filter((r) => r && r.length).map((r) => rowToObj(r.slice(0, 26)));
    }
    const gv = `https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?sheet=${encodeURIComponent(TAB_NAME)}&range=${READ_RANGE}&tqx=out:json`;
    const res = await fetch(gv);
    const txt = await res.text();
    const j = JSON.parse(txt.replace(/^[^\(]*\(/, "").replace(/\);?\s*$/, ""));
    const rows = (j.table.rows || []).map((r) => (r.c || []).map((c) => c ? c.f ?? c.v ?? "" : ""));
    return rows.filter((r) => r.length).map((r) => rowToObj(r.slice(0, 26)));
  }
  const OFFICERS = [
    "Ava Romero",
    "Marcus Bell",
    "Priya Shah",
    "Diego Navarro",
    "Hannah Cole",
    "Liam O'Brien",
    "Sofia Greco",
    "Noah Tran",
    "Maya Patel",
    "Caleb Frost",
    "Elena Park",
    "Jonah Reyes",
    "Grace Lin",
    "Owen Walsh"
  ];
  const LO_TYPES = ["Conventional", "FHA", "VA", "USDA Rural Housing", "HELOC", "HELOAN", "NonQM", "Other"];
  const LENDERS = [
    "UWM",
    "Rocket TPO",
    "Pennymac",
    "Newrez",
    "Kind Lending",
    "Homepoint",
    "Caliber",
    "Flagstar",
    "loanDepot WS",
    "AmeriHome",
    "Provident",
    "Plaza",
    "Carrington"
  ];
  const CLIENT_TYPES = ["Purchase", "Purchase", "Purchase", "Refinance", "HELOC"];
  const CHANNELS = ["Broker", "Broker", "Non-Del"];
  function mockData() {
    let seed = 42;
    const rnd = () => {
      seed = seed * 1103515245 + 12345 & 2147483647;
      return seed / 2147483647;
    };
    const pick = (a) => a[Math.floor(rnd() * a.length)];
    const rows = [];
    const start = new Date(2024, 0, 1);
    const today = new Date(2026, 5, 19);
    const span = today - start;
    const weight = OFFICERS.map((_, i) => 1 + (OFFICERS.length - i) * 0.16 + rnd() * 0.3);
    for (let i = 0; i < 1243; i++) {
      const oi = (() => {
        let r = rnd() * weight.reduce((a, b) => a + b, 0);
        for (let k = 0; k < weight.length; k++) {
          if ((r -= weight[k]) <= 0) return k;
        }
        return 0;
      })();
      const created = new Date(start.getTime() + rnd() * span);
      const amt = Math.round((18e4 + rnd() * 82e4) / 1e3) * 1e3;
      const roll = rnd();
      let status, closed = "", applied = "";
      const appOffset = rnd() * 18 * 864e5;
      if (roll < 0.58) {
        status = "Funded";
        const c = new Date(created.getTime() + (30 + rnd() * 55) * 864e5);
        if (c > today) {
          status = "Processing";
        } else {
          closed = `${c.getMonth() + 1}/${c.getDate()}/${c.getFullYear()}`;
        }
        const a = new Date(created.getTime() + appOffset);
        applied = `${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`;
      } else if (roll < 0.84) {
        status = pick(["Processing", "Approved", "Clear to Close", "Disclosed", "Docs Out", "Application Taken", "Preapproved", "Registered"]);
        const a = new Date(created.getTime() + appOffset);
        applied = `${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`;
      } else if (roll < 0.92) {
        status = pick(["Lead", "Prospect", "Prequalified", "Preapproved"]);
      } else {
        status = pick(DEAD_STAGES);
        const a = new Date(created.getTime() + appOffset);
        applied = `${a.getMonth() + 1}/${a.getDate()}/${a.getFullYear()}`;
      }
      const cd = `${created.getMonth() + 1}/${created.getDate()}/${created.getFullYear()}`;
      const cells = [
        "MX" + (1e5 + i),
        // A loan number
        OFFICERS[oi],
        // B officer
        pick(["Sam R.", "Dana K.", "Tess M.", ""]),
        // C assistant
        status,
        // D status
        "REDACTED",
        "",
        "",
        "",
        // E-H PII (synthetic placeholders)
        String(580 + Math.floor(rnd() * 260)),
        // I fico
        "$" + amt.toLocaleString(),
        // J loan amount
        pick(LO_TYPES),
        // K loan type
        pick(["30 yr", "15 yr", "30 yr", "20 yr"]),
        //L term
        (5.5 + rnd() * 2).toFixed(3) + "%",
        // M rate
        pick(CHANNELS),
        // N channel
        pick(LENDERS),
        // O lender
        "REDACTED",
        // P address (PII)
        cd,
        "",
        applied,
        "",
        // Q-T dates
        "",
        // U expected close
        closed,
        // V closed date
        "",
        "",
        // W,X
        pick(CLIENT_TYPES)
        // Y client type
      ];
      // Synthetic reviews: ~45% of funded loans earn a 5-star review. Most have
      // no explicit review date (so they fall back to close date); some carry an
      // explicit REVIEW DATE a bit after closing, to exercise that path.
      let rev = { count: 0, reviewDate: "", bps: 0 };
      if (closed && rnd() < 0.45) {
        rev.count = 1;
        if (rnd() < 0.4) {
          const cd = parseDate(closed);
          if (cd) {
            const rd = new Date(cd.getTime() + Math.round(rnd() * 40) * 864e5);
            rev.reviewDate = (rd.getMonth() + 1) + "/" + rd.getDate() + "/" + rd.getFullYear();
          }
        }
      }
      // synthetic bps on funded loans (200-325 range) for the avg-bps metric
      if (closed) rev.bps = Math.round(200 + rnd() * 125);
      rows.push(rowToObj(cells, rev));
    }
    return rows;
  }
  function periodRange(period) {
    const now = new Date(2026, 5, 19);
    const y = now.getFullYear(), m = now.getMonth();
    if (period === "month") return [new Date(y, m, 1), now];
    if (period === "lastmonth") return [new Date(y, m - 1, 1), new Date(y, m, 0, 23, 59, 59)];
    if (period === "lastyear") return [new Date(y - 1, 0, 1), new Date(y - 1, 11, 31, 23, 59, 59)];
    if (period === "quarter") {
      const q = Math.floor(m / 3) * 3;
      return [new Date(y, q, 1), now];
    }
    return [new Date(y, 0, 1), now];
  }
  // Goals are defined as MONTHLY targets. This scales them to the selected
  // period using months elapsed so progress stays apples-to-apples:
  //   month/lastmonth -> x1
  //   quarter -> months elapsed in the current quarter (1-3)
  //   ytd     -> current month number (1-12)
  function goalMultiplier(period) {
    const now = new Date(2026, 5, 19);
    const m = now.getMonth();           // 0-based
    if (period === "month" || period === "lastmonth") return 1;
    if (period === "quarter") return (m % 3) + 1;
    if (period === "lastyear") return 12;
    return m + 1;                       // ytd
  }
  function priorRange(period) {
    const now = new Date(2026, 5, 19);
    const y = now.getFullYear(), m = now.getMonth();
    if (period === "month") return [new Date(y, m - 1, 1), new Date(y, m, 0, 23, 59)];
    if (period === "lastmonth") return [new Date(y, m - 2, 1), new Date(y, m - 1, 0, 23, 59)];
    if (period === "lastyear") return [new Date(y - 2, 0, 1), new Date(y - 2, 11, 31, 23, 59)];
    if (period === "quarter") {
      const q = Math.floor(m / 3) * 3;
      return [new Date(y, q - 3, 1), new Date(y, q, 0, 23, 59)];
    }
    return [new Date(y - 1, 0, 1), new Date(y - 1, m, now.getDate())];
  }
  const inRange = (d, [a, b]) => d && d >= a && d <= b;
  function leaderboard(rows, period) {
    const [a, b] = periodRange(period);
    const [pa, pb] = priorRange(period);
    const cur = {}, prev = {};
    OFFICERS_present(rows).forEach((o) => {
      cur[o] = { officer: o, vol: 0, units: 0, pipeVol: 0, pipeUnits: 0, reviews: 0, newApps: 0, newPreapps: 0, activity: 0, bpsSum: 0, bpsN: 0, avgBps: 0 };
      prev[o] = { vol: 0, units: 0 };
    });
    rows.forEach((r) => {
      const o = r.officer;
      if (!o || !isEligible(o)) return;
      cur[o] = cur[o] || { officer: o, vol: 0, units: 0, pipeVol: 0, pipeUnits: 0, reviews: 0, newApps: 0, newPreapps: 0, activity: 0, bpsSum: 0, bpsN: 0, avgBps: 0 };
      prev[o] = prev[o] || { vol: 0, units: 0 };
      const preapp = parseDate(r.preapprovalDate);
      // Activity = any loan line item that touches the selected period via any
      // of its key dates. Used to filter out offboarded LOs (no activity = hidden).
      const touches = inRange(r.closed, [a, b]) || inRange(r.applied, [a, b]) ||
                      inRange(r.created, [a, b]) || inRange(preapp, [a, b]) ||
                      inRange(r.reviewEffDate, [a, b]);
      if (touches) cur[o].activity++;
      if (isFunded(r) && inRange(r.closed, [a, b])) {
        cur[o].vol += r.loanAmountNum;
        cur[o].units++;
        if (r.bps > 0) { cur[o].bpsSum += r.bps; cur[o].bpsN++; }
      }
      // Reviews are credited by their effective date (REVIEW DATE, or the loan's
      // closed date when REVIEW DATE is blank/invalid) — NOT by whether the loan
      // funded in this period. A review that arrives this month on a loan that
      // closed this month (or whose review date is this month) counts now.
      if (r.reviewCount > 0 && inRange(r.reviewEffDate, [a, b])) {
        cur[o].reviews += r.reviewCount;
      }
      if (isFunded(r) && inRange(r.closed, [pa, pb])) {
        prev[o].vol += r.loanAmountNum;
        prev[o].units++;
      }
      if (isActive(r) && inRange(r.applied || r.created, [a, b])) {
        cur[o].pipeVol += r.loanAmountNum;
        cur[o].pipeUnits++;
      }
      if (inRange(r.applied, [a, b])) cur[o].newApps++;
      if (inRange(preapp, [a, b])) cur[o].newPreapps++;
    });
    // Show every non-hidden officer, even with no activity in the period
    // (they appear at zero). Hidden officers are already excluded upstream.
    let list = Object.values(cur);
    list.forEach((x) => { x.avgBps = x.bpsN ? Math.round(x.bpsSum / x.bpsN) : 0; });
    const rankBy = (arr, key) => {
      const s = [...arr].sort((x, y) => y[key] - x[key]);
      const map = {};
      s.forEach((x, i) => map[x.officer] = i + 1);
      return map;
    };
    const curRank = rankBy(list, "vol");
    const prevList = Object.entries(prev).map(([officer, v]) => ({ officer, ...v }));
    const prevRank = rankBy(prevList, "vol");
    list.forEach((x) => {
      x.rank = curRank[x.officer];
      x.prevRank = prevRank[x.officer] || null;
      x.delta = x.prevRank ? x.prevRank - x.rank : 0;
      x.prevVol = prev[x.officer]?.vol || 0;
    });
    list.sort((a2, b2) => b2.vol - a2.vol || b2.units - a2.units);
    return list;
  }
  // ---- Standout Performers: up to 3 standouts in the period, excluding
  // Robert Lucido Jr. Returns an array (top standouts by lead score). A daily
  // seed lightly rotates which qualifying standouts surface, so the banner
  // refreshes at least daily without changing more than once a day. ----
  // Person excluded from both the Standout Performers banner and the Monthly
  // Competition leaders (e.g. owner/principal who shouldn't compete).
  // Person excluded from both the Standout Performers banner and the Monthly
  // Competition leaders (owner/principal who shouldn't compete). Matched as a
  // substring so it catches "Robert Lucido", "Robert Lucido Jr", "Jr.", etc.
  const STANDOUT_EXCLUDE = "lucido";
  const isExcluded = (name) => String(name || "").toLowerCase().includes(STANDOUT_EXCLUDE);
  function standoutPerformers(rows, period) {
    const lb = leaderboard(rows, period).filter(
      (o) => !isExcluded(o.officer)
    );
    if (!lb.length) return [];
    const [a, b] = periodRange(period);
    let persist = null;
    rows.forEach((r) => {
      if (isExcluded(r.officer)) return;
      if (isFunded(r) && inRange(r.closed, [a, b]) && r.applied && r.closed) {
        const days = Math.round((r.closed - r.applied) / 864e5);
        if (days >= 120 && (!persist || days > persist.days)) {
          persist = { officer: r.officer, days };
        }
      }
    });
    const cands = [];
    const lead = (key) => {
      const s = [...lb].sort((x, y) => y[key] - x[key]);
      if (s.length < 1 || s[0][key] <= 0) return null;
      const top = s[0][key], second = s[1] ? s[1][key] : 0;
      const avg = lb.reduce((t, o) => t + o[key], 0) / lb.length || 1;
      return { officer: s[0].officer, val: top, score: (top - second) / (avg || 1) + top / (avg || 1) };
    };
    const fmtVol = (v) => fmtMoneyShort(v);
    const push = (key, label) => {
      const r = lead(key);
      if (r) cands.push({ ...r, label: label(r.officer, r.val), kind: key });
    };
    push("vol", (o, v) => `${o} leads the floor with ${fmtVol(v)} funded`);
    push("units", (o, v) => `${o} is out front with ${v} loans funded`);
    push("reviews", (o, v) => `${o} earned ${v} new 5-star review${v > 1 ? "s" : ""}`);
    push("newApps", (o, v) => `${o} brought in ${v} new application${v > 1 ? "s" : ""}`);
    push("newPreapps", (o, v) => `${o} logged ${v} new preapproval${v > 1 ? "s" : ""}`);
    push("avgBps", (o, v) => `${o} is pricing strong at ${v} avg bps`);
    if (persist) {
      cands.push({
        officer: persist.officer,
        score: 1.4 + persist.days / 365,
        label: `${persist.officer} closed a loan ${persist.days} days after application \u2014 textbook follow-up`,
        kind: "persistence"
      });
    }
    if (!cands.length) return [];
    cands.sort((x, y) => y.score - x.score);
    // Daily seed: rotate the qualifying pool so the banner changes at least daily.
    const day = Math.floor(Date.now() / 864e5);
    const pool = cands.slice(0, Math.min(6, cands.length));
    const offset = pool.length > 3 ? day % pool.length : 0;
    const out = [];
    for (let i = 0; i < Math.min(3, pool.length); i++) {
      out.push(pool[(offset + i) % pool.length]);
    }
    // de-dupe by officer+kind
    const seen = {}, uniq = [];
    out.forEach((c) => { const k = c.officer + c.kind; if (!seen[k]) { seen[k] = 1; uniq.push(c); } });
    return uniq;
  }
  function OFFICERS_present(rows) {
    const byKey = /* @__PURE__ */ new Map();   // lowercased name -> display name
    rows.forEach((r) => {
      if (r.officer && isEligible(r.officer)) {
        byKey.set(String(r.officer).trim().toLowerCase(), r.officer);
      }
    });
    // Add roster officers not present in the data (so onboarded LOs show even at
    // zero production), as long as they're eligible (on roster + not hidden).
    Object.keys(OFFICER_NAMES).forEach((k) => {
      if (!byKey.has(k) && isEligible(OFFICER_NAMES[k])) byKey.set(k, OFFICER_NAMES[k]);
    });
    return [...byKey.values()];
  }
  function companyKPIs(rows, period) {
    const [a, b] = periodRange(period);
    let vol = 0, units = 0, pipeUnits = 0, pipeVol = 0, ficoSum = 0, ficoN = 0, sizeSum = 0;
    rows.forEach((r) => {
      if (!isEligible(r.officer)) return;
      if (isFunded(r) && inRange(r.closed, [a, b])) {
        vol += r.loanAmountNum;
        units++;
        sizeSum += r.loanAmountNum;
        if (r.ficoNum > 0) {
          ficoSum += r.ficoNum;
          ficoN++;
        }
      }
      if (isActive(r) && inRange(r.applied || r.created, [a, b])) {
        pipeUnits++;
        pipeVol += r.loanAmountNum;
      }
    });
    return { vol, units, pipeUnits, pipeVol, avgSize: units ? sizeSum / units : 0, avgFico: ficoN ? Math.round(ficoSum / ficoN) : 0 };
  }
  function monthlyTrend(rows) {
    const map = {};
    rows.forEach((r) => {
      if (isFunded(r) && r.closed) {
        const key = `${r.closed.getFullYear()}-${String(r.closed.getMonth() + 1).padStart(2, "0")}`;
        map[key] = map[key] || { key, vol: 0, units: 0 };
        map[key].vol += r.loanAmountNum;
        map[key].units++;
      }
    });
    return Object.values(map).sort((a, b) => a.key.localeCompare(b.key)).map((d) => ({ ...d, label: d.key.slice(2).replace("-", "/"), volM: +(d.vol / 1e6).toFixed(2) }));
  }
  function mixBy(rows, key, period, topN) {
    const [a, b] = periodRange(period);
    const map = {};
    rows.forEach((r) => {
      if (isFunded(r) && inRange(r.closed, [a, b])) {
        const v = r[key] || "Other";
        map[v] = map[v] || { name: v, vol: 0, units: 0 };
        map[v].vol += r.loanAmountNum;
        map[v].units++;
      }
    });
    let arr = Object.values(map).sort((x, y) => y.vol - x.vol);
    if (topN && arr.length > topN) {
      const head = arr.slice(0, topN);
      const rest = arr.slice(topN).reduce((a2, c) => ({ name: "Other", vol: a2.vol + c.vol, units: a2.units + c.units }), { name: "Other", vol: 0, units: 0 });
      head.push(rest);
      arr = head;
    }
    return arr;
  }
  function funnelCounts(rows) {
    const map = {};
    ACTIVE_STAGES.forEach((s) => map[s] = 0);
    rows.forEach((r) => {
      if (map[r.status] !== void 0) map[r.status]++;
      else if (isFunded(r)) map["Funded"]++;
    });
    const order = ACTIVE_STAGES;
    const reached = {};
    let _ = 0;
    for (let i = order.length - 1; i >= 0; i--) {
      _ += map[order[i]];
      reached[order[i]] = _;
    }
    return order.map((s) => ({ stage: s, count: map[s], reached: reached[s] }));
  }
  const PALETTE = ["#0FA672", "#2E74E8", "#FF781D", "#7C5CFC", "#E0A12B", "#14B8A6", "#EC6F3D", "#5B8DEF", "#9333EA", "#E5484D", "#0891B2", "#65A30D"];
  const colorFor = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++) h = h * 31 + name.charCodeAt(i) >>> 0;
    return PALETTE[h % PALETTE.length];
  };
  const initials = (n) => n.split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  function Delta({ d }) {
    if (d > 0) return /* @__PURE__ */ React.createElement("span", { className: "delta up" }, "\u25B2 ", d);
    if (d < 0) return /* @__PURE__ */ React.createElement("span", { className: "delta down" }, "\u25BC ", Math.abs(d));
    return /* @__PURE__ */ React.createElement("span", { className: "delta faint" }, "\u2014 0");
  }
  // Module-level headshot store, kept in sync from App state so every Avatar
  // (used across all views) can render a photo without prop drilling.
  const PHOTOS = {};
  const photoKey = (n) => String(n || "").trim().toLowerCase();
  // Shared config received from the Apps Script feed (settings + headshots,
  // identical for every viewer). Populated on each data load.
  let LAST_CONFIG = null;
  // Write shared config back to the sheet via the Apps Script. Cross-origin
  // POST uses no-cors (fire-and-forget); the value re-reads on next refresh.
  async function postConfig(scriptUrl, token, key, value) {
    if (!scriptUrl) throw new Error("No Apps Script URL configured \u2014 set it in Settings to enable shared saving.");
    const res = await fetch(scriptUrl, {
      method: "POST",
      mode: "no-cors",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify({ token: token, key: key, value: value })
    });
    return true; // no-cors response is opaque; success assumed if no throw
  }
  // Durable key/value store. Prefers the browser's localStorage (persists across
  // refreshes/restarts on real web pages), falls back to the artifact preview's
  // window.storage when localStorage isn't available.
  const STORE = {
    async get(key) {
      try {
        if (typeof localStorage !== "undefined") {
          const v = localStorage.getItem(key);
          return v != null ? { value: v } : null;
        }
      } catch (e) {}
      try {
        if (window.storage && window.storage.get) return await window.storage.get(key);
      } catch (e) {}
      return null;
    },
    async set(key, value) {
      let ok = false;
      try {
        if (typeof localStorage !== "undefined") { localStorage.setItem(key, value); ok = true; }
      } catch (e) {
        // localStorage can throw QuotaExceededError when full
        throw e;
      }
      try {
        if (!ok && window.storage && window.storage.set) { await window.storage.set(key, value); ok = true; }
      } catch (e) {}
      return ok;
    }
  };
  // Resize+compress an uploaded image File to a small square avatar data URL.
  function fileToAvatar(file, size) {
    size = size || 128;
    return new Promise((resolve, reject) => {
      const fr = new FileReader();
      fr.onload = () => {
        const img = new Image();
        img.onload = () => {
          const c = document.createElement("canvas");
          c.width = size; c.height = size;
          const ctx = c.getContext("2d");
          // cover-crop to square
          const s = Math.min(img.width, img.height);
          const sx = (img.width - s) / 2, sy = (img.height - s) / 2;
          ctx.drawImage(img, sx, sy, s, s, 0, 0, size, size);
          resolve(c.toDataURL("image/jpeg", 0.82));
        };
        img.onerror = reject;
        img.src = fr.result;
      };
      fr.onerror = reject;
      fr.readAsDataURL(file);
    });
  }
  function Avatar({ name, size = 30, cls = "chip" }) {
    const photo = PHOTOS[photoKey(name)];
    if (photo) {
      return /* @__PURE__ */ React.createElement("span", { className: cls, style: { width: size, height: size, padding: 0, overflow: "hidden", background: "var(--bg-2)" } },
        /* @__PURE__ */ React.createElement("img", { src: photo, alt: name, style: { width: "100%", height: "100%", objectFit: "cover", display: "block" } }));
    }
    return /* @__PURE__ */ React.createElement("span", { className: cls, style: { background: colorFor(name), width: size, height: size } }, initials(name));
  }
  function Kpi({ label, value, sub, subClass, accent }) {
    return /* @__PURE__ */ React.createElement("div", { className: "card kpi" }, /* @__PURE__ */ React.createElement("div", { className: "accent", style: { background: accent } }), /* @__PURE__ */ React.createElement("div", { className: "lbl" }, label), /* @__PURE__ */ React.createElement("div", { className: "val num" }, value), sub && /* @__PURE__ */ React.createElement("div", { className: "sub " + (subClass || "") }, sub));
  }
  function Leaderboard({ rows, period, metric, setMetric, competition, hiddenKey }) {
    const lb = useMemo(() => leaderboard(rows, period), [rows, period, hiddenKey]);
    const sortKey = metric === "volume" ? "vol" : metric === "units" ? "units" : metric === "pipeVol" ? "pipeVol" : metric === "reviews" ? "reviews" : "pipeUnits";
    const ranked = useMemo(() => [...lb].sort((a, b) => b[sortKey] - a[sortKey]), [lb, sortKey]);
    const top = ranked.slice(0, 3);
    const max = ranked[0]?.[sortKey] || 1;
    const fmt = metric === "volume" || metric === "pipeVol" ? fmtMoneyShort : (n) => n + "";
    const standouts = useMemo(() => standoutPerformers(rows, period), [rows, period, hiddenKey]);
    const podOrder = [top[1], top[0], top[2]];
    const cls = ["p2", "p1", "p3"];
    const medal = ["2", "1", "3"];
    // Monthly competition ALWAYS reflects this month, regardless of the period
    // toggle used for the rest of the dashboard.
    const comp = competition || { name: "Monthly Competition", metric: "volume", prize: "" };
    const compMeta = competitionMetric(comp.metric);
    const compLb = useMemo(() => leaderboard(rows, "month"), [rows, hiddenKey]);
    const compRanked = useMemo(() => [...compLb].filter((o) => !isExcluded(o.officer)).sort((a, b) => b[compMeta.key] - a[compMeta.key]).filter((o) => o[compMeta.key] > 0), [compLb, compMeta.key]);
    const compTop2 = compRanked.slice(0, 2);
    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "The Floor"), /* @__PURE__ */ React.createElement("h2", null, "Leaderboard"), /* @__PURE__ */ React.createElement("div", { className: "seg", style: { marginLeft: "auto" } }, [["volume", "Funded $"], ["units", "Units"], ["pipeVol", "Pipeline $"], ["pipeUnits", "Pipe Units"], ["reviews", "Reviews"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, "aria-pressed": metric === k, onClick: () => setMetric(k) }, l)))),
      /* Monthly Competition box (replaces Most Improved slot) */
      /* @__PURE__ */ React.createElement("div", { className: "compbox" },
        /* @__PURE__ */ React.createElement("div", { className: "comp-top" },
          /* @__PURE__ */ React.createElement("div", { className: "comp-headinfo" },
            /* @__PURE__ */ React.createElement("div", { className: "comp-eyebrow" }, "Monthly Competition"),
            /* @__PURE__ */ React.createElement("div", { className: "comp-title" }, comp.name || "Monthly Competition"),
            /* @__PURE__ */ React.createElement("div", { className: "comp-sub" }, "This month \u00b7 ranked by " + compMeta.label)),
          /* @__PURE__ */ React.createElement("div", { className: "comp-leaders" }, compTop2.length ? compTop2.map((o, i) => /* @__PURE__ */ React.createElement("div", { key: o.officer, className: "comp-leader" + (i === 0 ? " first" : "") },
            /* @__PURE__ */ React.createElement("div", { className: "comp-rank" }, i + 1),
            /* @__PURE__ */ React.createElement(Avatar, { name: o.officer, size: 38 }),
            /* @__PURE__ */ React.createElement("div", { style: { minWidth: 0 } }, /* @__PURE__ */ React.createElement("div", { className: "comp-name" }, o.officer), /* @__PURE__ */ React.createElement("div", { className: "comp-val num" }, compMeta.fmt(o[compMeta.key]))))) : /* @__PURE__ */ React.createElement("div", { className: "comp-empty" }, "No qualifying activity yet this period.")),
          /* @__PURE__ */ React.createElement("div", { className: "comp-trophy" }, "\u{1F3C6}")),
        /* @__PURE__ */ React.createElement("div", { className: "comp-prize" }, /* @__PURE__ */ React.createElement("span", { className: "comp-prize-label" }, "Prize"), /* @__PURE__ */ React.createElement("span", { className: "comp-prize-val" }, comp.prize ? comp.prize : "Set the prize in Settings \u2192 Admin"))),
      /* Podium */
      /* @__PURE__ */ React.createElement("div", { className: "podium" }, podOrder.map((p, i) => p ? /* @__PURE__ */ React.createElement("div", { key: p.officer, className: "pod " + cls[i] }, /* @__PURE__ */ React.createElement("div", { className: "medal" }, medal[i]), /* @__PURE__ */ React.createElement(Avatar, { name: p.officer, size: 62, cls: "ava" }), /* @__PURE__ */ React.createElement("div", { className: "nm" }, p.officer), /* @__PURE__ */ React.createElement("div", { className: "mv" }, /* @__PURE__ */ React.createElement(Delta, { d: p.delta }), " \xA0\xB7\xA0 ", p.units, " funded"), /* @__PURE__ */ React.createElement("div", { className: "big num" }, fmt(p[sortKey]))) : /* @__PURE__ */ React.createElement("div", { key: i }))),
      /* Standout Performer news ticker (below podium) */
      standouts.length > 0 && /* @__PURE__ */ React.createElement("div", { className: "ticker" },
        /* @__PURE__ */ React.createElement("div", { className: "ticker-tag" }, "\u2605 Standout Performer", standouts.length > 1 ? "s" : ""),
        /* @__PURE__ */ React.createElement("div", { className: "ticker-track" }, /* @__PURE__ */ React.createElement("div", { className: "ticker-move" },
          standouts.concat(standouts).map((s, i) => /* @__PURE__ */ React.createElement(React.Fragment, { key: i }, /* @__PURE__ */ React.createElement("span", null, s.label), /* @__PURE__ */ React.createElement("span", { className: "ticker-dot" }, "\u25C6")))))),
      /* Ranked table */
      /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden", marginTop: 18 } }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "Rank"), /* @__PURE__ */ React.createElement("th", null, "Loan Officer"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Funded $"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Units"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Pipeline $"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Reviews"), /* @__PURE__ */ React.createElement("th", null, "Share"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Move"))), /* @__PURE__ */ React.createElement("tbody", null, ranked.map((r, i) => /* @__PURE__ */ React.createElement("tr", { key: r.officer }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "rankcell" }, /* @__PURE__ */ React.createElement("span", { className: "rankno" }, i + 1))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "who" }, /* @__PURE__ */ React.createElement(Avatar, { name: r.officer }), /* @__PURE__ */ React.createElement("b", null, r.officer))), /* @__PURE__ */ React.createElement("td", { className: "r num" }, fmtMoneyShort(r.vol)), /* @__PURE__ */ React.createElement("td", { className: "r num" }, r.units), /* @__PURE__ */ React.createElement("td", { className: "r num faint" }, fmtMoneyShort(r.pipeVol)), /* @__PURE__ */ React.createElement("td", { className: "r num" }, r.reviews > 0 ? /* @__PURE__ */ React.createElement("span", { className: "badge gold", style: { display: "inline-flex" } }, "\u2605 ", r.reviews) : /* @__PURE__ */ React.createElement("span", { className: "faint" }, "\u2014")), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "bar" }, /* @__PURE__ */ React.createElement("i", { style: { width: Math.max(4, r[sortKey] / max * 100) + "%" } }))), /* @__PURE__ */ React.createElement("td", { className: "r" }, /* @__PURE__ */ React.createElement(Delta, { d: r.delta }))))))));
  }
  // Maps a competition metric key to its leaderboard field, label, and formatter.
  function competitionMetric(m) {
    const map = {
      volume: { key: "vol", label: "funded volume", fmt: (v) => fmtMoneyShort(v) },
      units: { key: "units", label: "units funded", fmt: (v) => v + "" },
      reviews: { key: "reviews", label: "5-star reviews", fmt: (v) => v + "" },
      newApps: { key: "newApps", label: "new applications", fmt: (v) => v + "" },
      newPreapps: { key: "newPreapps", label: "new preapprovals", fmt: (v) => v + "" }
    };
    if (map[m]) return map[m];
    // custom category: m is "custom:<key>" -> ranked by closest matching field,
    // default to volume; label carries the custom name after the colon.
    if (m && m.indexOf("custom:") === 0) {
      return { key: "vol", label: m.slice(7), fmt: (v) => fmtMoneyShort(v) };
    }
    return map.volume;
  }
  function Analytics({ rows, period }) {
    const k = useMemo(() => companyKPIs(rows, period), [rows, period]);
    const trend = useMemo(() => monthlyTrend(rows), [rows]);
    const byType = useMemo(() => mixBy(rows, "loanType", period), [rows, period]);
    const byClient = useMemo(() => mixBy(rows, "clientType", period), [rows, period]);
    const byChannel = useMemo(() => mixBy(rows, "channel", period), [rows, period]);
    const byLender = useMemo(() => mixBy(rows, "lender", period, 7), [rows, period]);
    const funnel = useMemo(() => funnelCounts(rows), [rows]);
    const apps = rows.filter((r) => r.applied).length;
    const funded = rows.filter((r) => isFunded(r)).length;
    const pullThrough = apps ? funded / apps * 100 : 0;
    const fmax = funnel[0]?.reached || 1;
    const { Bar, Line, ComposedChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Legend } = RC;
    if (!chartsReady) {
      return React.createElement("div", { className: "card pad", style: { color: "#5A6473" } },        "Charts couldn\u2019t load (the Recharts library was blocked by the network). KPIs and leaderboards still work \u2014 allow scripts from cdnjs.cloudflare.com / unpkg.com to enable charts.");
    }
    const axis = { stroke: "#8A94A4", fontSize: 11 };
    const tip = { contentStyle: { background: "#FFFFFF", border: "1px solid #E6E9EF", borderRadius: 12, color: "#161A22", boxShadow: "0 8px 24px -12px rgba(16,24,40,.2)" } };
    return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Production"), /* @__PURE__ */ React.createElement("h2", null, "Company KPIs"), /* @__PURE__ */ React.createElement("span", { className: "hint" }, "income-free \xB7 derived from A:Z only")), /* @__PURE__ */ React.createElement("div", { className: "grid kpis" }, /* @__PURE__ */ React.createElement(
      Kpi,
      {
        label: "Funded Volume",
        value: fmtMoneyShort(k.vol),
        accent: "var(--mint)",
        sub: /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "muted" }, k.units, " loans closed"))
      }
    ), /* @__PURE__ */ React.createElement(
      Kpi,
      {
        label: "Units Funded",
        value: k.units,
        accent: "var(--sky)",
        sub: /* @__PURE__ */ React.createElement("span", { className: "muted" }, "avg ", fmtMoneyShort(k.avgSize))
      }
    ), /* @__PURE__ */ React.createElement(
      Kpi,
      {
        label: "Active Pipeline",
        value: k.pipeUnits,
        accent: "var(--violet)",
        sub: /* @__PURE__ */ React.createElement("span", { className: "muted" }, fmtMoneyShort(k.pipeVol), " in flight")
      }
    ), /* @__PURE__ */ React.createElement(
      Kpi,
      {
        label: "Avg Loan Size",
        value: fmtMoneyShort(k.avgSize),
        accent: "var(--gold)",
        sub: /* @__PURE__ */ React.createElement("span", { className: "muted" }, "funded this period")
      }
    ), /* @__PURE__ */ React.createElement(
      Kpi,
      {
        label: "Avg FICO",
        value: k.avgFico || "\u2014",
        accent: "var(--sky)",
        sub: /* @__PURE__ */ React.createElement("span", { className: "muted" }, "0/blank ignored")
      }
    )), /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "2024 \u2014 2026"), /* @__PURE__ */ React.createElement("h2", null, "Production Trend")), /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { height: 320 } }, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(ComposedChart, { data: trend, margin: { top: 6, right: 8, left: -8, bottom: 0 } }, /* @__PURE__ */ React.createElement(CartesianGrid, { stroke: "#EEF0F4", vertical: false }), /* @__PURE__ */ React.createElement(XAxis, { dataKey: "label", ...axis, interval: "preserveStartEnd" }), /* @__PURE__ */ React.createElement(YAxis, { yAxisId: "l", ...axis, tickFormatter: (v) => "$" + v + "M" }), /* @__PURE__ */ React.createElement(YAxis, { yAxisId: "r", orientation: "right", ...axis }), /* @__PURE__ */ React.createElement(Tooltip, { ...tip, formatter: (v, n) => n === "Volume" ? ["$" + v + "M", n] : [v, n] }), /* @__PURE__ */ React.createElement(Bar, { yAxisId: "r", dataKey: "units", name: "Units", fill: "#2E74E8", opacity: 0.18, radius: [4, 4, 0, 0] }), /* @__PURE__ */ React.createElement(Line, { yAxisId: "l", dataKey: "volM", name: "Volume", stroke: "#0FA672", strokeWidth: 2.5, dot: false })))), /* @__PURE__ */ React.createElement("div", { className: "three", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card pad" }, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontWeight: 700, fontSize: 12, marginBottom: 10 } }, "BY CLIENT TYPE"), /* @__PURE__ */ React.createElement("div", { style: { height: 200 } }, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(PieChart, null, /* @__PURE__ */ React.createElement(Pie, { data: byClient, dataKey: "vol", nameKey: "name", innerRadius: 48, outerRadius: 78, paddingAngle: 2 }, byClient.map((e, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: PALETTE[i % PALETTE.length] }))), /* @__PURE__ */ React.createElement(Tooltip, { ...tip, formatter: (v) => fmtMoneyShort(v) })))), /* @__PURE__ */ React.createElement("div", { className: "pillrow" }, byClient.map((e, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "badge" }, /* @__PURE__ */ React.createElement("i", { style: { width: 8, height: 8, borderRadius: 9, background: PALETTE[i % PALETTE.length] } }), e.name)))), /* @__PURE__ */ React.createElement("div", { className: "card pad" }, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontWeight: 700, fontSize: 12, marginBottom: 10 } }, "BY LOAN TYPE"), /* @__PURE__ */ React.createElement("div", { style: { height: 248 } }, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(BarChart, { data: byType, layout: "vertical", margin: { left: 18, right: 10 } }, /* @__PURE__ */ React.createElement(XAxis, { type: "number", ...axis, tickFormatter: (v) => fmtMoneyShort(v) }), /* @__PURE__ */ React.createElement(YAxis, { type: "category", dataKey: "name", ...axis, width: 90 }), /* @__PURE__ */ React.createElement(Tooltip, { ...tip, formatter: (v) => fmtMoneyShort(v) }), /* @__PURE__ */ React.createElement(Bar, { dataKey: "vol", radius: [0, 5, 5, 0] }, byType.map((e, i) => /* @__PURE__ */ React.createElement(Cell, { key: i, fill: PALETTE[i % PALETTE.length] }))))))), /* @__PURE__ */ React.createElement("div", { className: "card pad" }, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontWeight: 700, fontSize: 12, marginBottom: 10 } }, "TOP LENDERS"), /* @__PURE__ */ React.createElement("div", { style: { height: 248 } }, /* @__PURE__ */ React.createElement(ResponsiveContainer, { width: "100%", height: "100%" }, /* @__PURE__ */ React.createElement(BarChart, { data: byLender, layout: "vertical", margin: { left: 18, right: 10 } }, /* @__PURE__ */ React.createElement(XAxis, { type: "number", ...axis, tickFormatter: (v) => fmtMoneyShort(v) }), /* @__PURE__ */ React.createElement(YAxis, { type: "category", dataKey: "name", ...axis, width: 82 }), /* @__PURE__ */ React.createElement(Tooltip, { ...tip, formatter: (v) => fmtMoneyShort(v) }), /* @__PURE__ */ React.createElement(Bar, { dataKey: "vol", radius: [0, 5, 5, 0], fill: "#7C5CFC" })))))), /* @__PURE__ */ React.createElement("div", { className: "two", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "card pad" }, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontWeight: 700, fontSize: 12, marginBottom: 14 } }, "PIPELINE FUNNEL \xB7 active stages"), funnel.filter((f) => f.reached > 0).map((f) => /* @__PURE__ */ React.createElement("div", { className: "funnel-row", key: f.stage }, /* @__PURE__ */ React.createElement("div", { className: "fl" }, f.stage), /* @__PURE__ */ React.createElement("div", { className: "funnel-bar", style: { width: Math.max(6, f.reached / fmax * 100) + "%" } }, f.reached), /* @__PURE__ */ React.createElement("div", { className: "fc" }, f.count, " here")))), /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { display: "flex", flexDirection: "column", justifyContent: "center", gap: 18 } }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, fontWeight: 700 } }, "OVERALL PULL-THROUGH"), /* @__PURE__ */ React.createElement("div", { className: "num", style: { fontSize: 52, fontWeight: 700, color: "var(--emerald)" } }, pullThrough.toFixed(1), "%"), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13 } }, funded.toLocaleString(), " funded \xF7 ", apps.toLocaleString(), " applications")), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, fontWeight: 700 } }, "BY CHANNEL"), /* @__PURE__ */ React.createElement("div", { className: "pillrow", style: { marginTop: 8 } }, byChannel.map((c, i) => /* @__PURE__ */ React.createElement("span", { key: i, className: "badge sky" }, c.name, ": ", fmtMoneyShort(c.vol), " \xB7 ", c.units, "u")))))));
  }
  function streakFor(rows, officer) {
    const months = /* @__PURE__ */ new Set();
    rows.forEach((r) => {
      if (r.officer === officer && isFunded(r) && r.closed) {
        months.add(`${r.closed.getFullYear()}-${r.closed.getMonth()}`);
      }
    });
    if (!months.size) return 0;
    let d = new Date(2026, 5, 1), streak = 0;
    for (let i = 0; i < 48; i++) {
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (months.has(key)) {
        streak++;
      } else if (i > 0) {
        break;
      }
      d = new Date(d.getFullYear(), d.getMonth() - 1, 1);
    }
    return streak;
  }
  function personalBest(rows, officer) {
    const m = {};
    rows.forEach((r) => {
      if (r.officer === officer && isFunded(r) && r.closed) {
        const key = `${r.closed.getFullYear()}-${String(r.closed.getMonth() + 1).padStart(2, "0")}`;
        m[key] = (m[key] || 0) + r.loanAmountNum;
      }
    });
    let best = 0, bk = "";
    Object.entries(m).forEach(([k, v]) => {
      if (v > best) {
        best = v;
        bk = k;
      }
    });
    return { best, month: bk };
  }
  function Gamification({ rows, period, goals, officerGoals, weights, hiddenKey }) {
    const lb = useMemo(() => leaderboard(rows, period), [rows, period, hiddenKey]);
    const k = useMemo(() => companyKPIs(rows, period), [rows, period, hiddenKey]);
    const totalReviews = useMemo(() => lb.reduce((a, o) => a + (o.reviews || 0), 0), [lb]);
    const scored = useMemo(() => lb.map((o) => ({
      ...o,
      pts: Math.round(o.vol / 1e6 * weights.vol + o.units * weights.units + (o.reviews || 0) * (weights.reviews || 0) + (o.avgBps || 0) * (weights.bps || 0)),
      streak: streakFor(rows, o.officer),
      pb: personalBest(rows, o.officer)
    })).sort((a, b) => b.pts - a.pts), [lb, rows, weights]);
    const mult = goalMultiplier(period);
    const goalVol = (goals.vol || 0) * mult;
    const goalUnits = (goals.units || 0) * mult;
    const goalReviews = (goals.reviews || 0) * mult;
    const volPct = Math.min(100, k.vol / (goalVol || 1) * 100);
    const unitPct = Math.min(100, k.units / (goalUnits || 1) * 100);
    const revPct = Math.min(100, totalReviews / (goalReviews || 1) * 100);
    const officers = useMemo(() => OFFICERS_present(rows).sort(), [rows, hiddenKey]);
    const nOff = Math.max(1, officers.length);
    const offGoal = (name, field) => {
      // Per-LO monthly goal, scaled to the selected period. Falls back to an
      // even split of the company target if a field isn't set.
      const base = (officerGoals && officerGoals[field]) ? officerGoals[field] : Math.round((goals[field] || 0) / nOff);
      return Math.round(base * mult);
    };
    const byName = {};
    lb.forEach((o) => byName[o.officer] = o);
    const ACH = [
      { ic: "\u{1F48E}", t: "$10M Club", test: (o) => o.vol >= 1e7, n: "$10M+ funded (period)" },
      { ic: "\u{1F525}", t: "On Fire", test: (o) => o.streak >= 3, n: "3+ month funding streak" },
      { ic: "\u26A1", t: "Double Digits", test: (o) => o.units >= 10, n: "10+ units this period" },
      { ic: "\u2B50", t: "Crowd Favorite", test: (o) => (o.reviews || 0) >= 5, n: "5+ five-star reviews" },
      { ic: "\u{1F3C6}", t: "Podium", test: (o) => o.rank <= 3, n: "Top-3 by volume" },
      { ic: "\u{1F3AF}", t: "Goal Met", test: (o) => o.vol >= offGoal(o.officer, "vol"), n: "Hit personal volume goal" }
    ];
    const goalCard = (title, cur, target, pct, grad, fmtFn) => /* @__PURE__ */ React.createElement("div", { className: "card pad goalcard" },
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", justifyContent: "space-between" } },
        /* @__PURE__ */ React.createElement("b", null, title),
        /* @__PURE__ */ React.createElement("span", { className: "muted num" }, fmtFn(cur), " / ", fmtFn(target))),
      /* @__PURE__ */ React.createElement("div", { className: "progress" }, /* @__PURE__ */ React.createElement("i", { style: { width: pct + "%", background: grad } })),
      /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, marginTop: 6 } }, pct.toFixed(0), "% of target ", pct >= 100 && "\xB7 crushed it \u{1F389}"));
    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Goals"), /* @__PURE__ */ React.createElement("h2", null, "Company Targets"), /* @__PURE__ */ React.createElement("span", { className: "hint" }, "set in Admin")),
      /* @__PURE__ */ React.createElement("div", { className: "three" },
        goalCard("Funded Volume", k.vol, goalVol, volPct, "linear-gradient(90deg,var(--mint),var(--sky))", fmtMoneyShort),
        goalCard("Units Funded", k.units, goalUnits, unitPct, "linear-gradient(90deg,var(--gold),var(--gold-deep))", (n) => n + ""),
        goalCard("\u2B50 5-Star Reviews", totalReviews, goalReviews, revPct, "linear-gradient(90deg,var(--violet),var(--sky))", (n) => n + "")),
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Attainment"), /* @__PURE__ */ React.createElement("h2", null, "Per-Officer Goals")),
      /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } },
        /* @__PURE__ */ React.createElement("table", null,
          /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null,
            /* @__PURE__ */ React.createElement("th", null, "Loan Officer"),
            /* @__PURE__ */ React.createElement("th", { className: "r" }, "Volume"),
            /* @__PURE__ */ React.createElement("th", null, "Volume Goal"),
            /* @__PURE__ */ React.createElement("th", { className: "r" }, "Units"),
            /* @__PURE__ */ React.createElement("th", { className: "r" }, "\u2B50"))),
          /* @__PURE__ */ React.createElement("tbody", null, officers.map((name) => {
            const o = byName[name] || { vol: 0, units: 0, reviews: 0 };
            const vg = offGoal(name, "vol"), ug = offGoal(name, "units");
            const p = Math.min(100, o.vol / (vg || 1) * 100);
            return /* @__PURE__ */ React.createElement("tr", { key: name },
              /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "who" }, /* @__PURE__ */ React.createElement(Avatar, { name }), /* @__PURE__ */ React.createElement("b", null, name), o.vol >= vg && vg > 0 && /* @__PURE__ */ React.createElement("span", { className: "badge mint", style: { marginLeft: 6 } }, "\u2713 goal"))),
              /* @__PURE__ */ React.createElement("td", { className: "r num" }, fmtMoneyShort(o.vol)),
              /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "bar", style: { minWidth: 120 } }, /* @__PURE__ */ React.createElement("i", { style: { width: Math.max(3, p) + "%", background: p >= 100 ? "linear-gradient(90deg,var(--mint),var(--gold))" : "linear-gradient(90deg,var(--mint),var(--sky))" } })), /* @__PURE__ */ React.createElement("div", { className: "faint", style: { fontSize: 11, marginTop: 3 } }, p.toFixed(0), "% of ", fmtMoneyShort(vg))),
              /* @__PURE__ */ React.createElement("td", { className: "r num" }, o.units, /* @__PURE__ */ React.createElement("span", { className: "faint" }, " /", ug)),
              /* @__PURE__ */ React.createElement("td", { className: "r num" }, (o.reviews || 0) > 0 ? /* @__PURE__ */ React.createElement("span", { className: "badge gold" }, "\u2B50 ", o.reviews) : /* @__PURE__ */ React.createElement("span", { className: "faint" }, "\u2014")));
          }))),
      ),
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Score"), /* @__PURE__ */ React.createElement("h2", null, "Points Race"), /* @__PURE__ */ React.createElement("span", { className: "hint" }, "vol\xD7", weights.vol, "/M + units\xD7", weights.units)),
      /* @__PURE__ */ React.createElement("div", { className: "card", style: { overflow: "hidden" } }, /* @__PURE__ */ React.createElement("table", null, /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null, /* @__PURE__ */ React.createElement("th", null, "#"), /* @__PURE__ */ React.createElement("th", null, "Loan Officer"), /* @__PURE__ */ React.createElement("th", null, "Achievements"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Streak"), /* @__PURE__ */ React.createElement("th", { className: "r" }, "Points"))), /* @__PURE__ */ React.createElement("tbody", null, scored.map((o, i) => /* @__PURE__ */ React.createElement("tr", { key: o.officer }, /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "rankno" }, i + 1)), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "who" }, /* @__PURE__ */ React.createElement(Avatar, { name: o.officer }), /* @__PURE__ */ React.createElement("b", null, o.officer))), /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("div", { className: "pillrow" }, ACH.filter((a) => a.test(o)).map((a) => /* @__PURE__ */ React.createElement("span", { key: a.t, className: "badge gold", title: a.n }, a.ic, " ", a.t)), ACH.filter((a) => a.test(o)).length === 0 && /* @__PURE__ */ React.createElement("span", { className: "faint", style: { fontSize: 12 } }, "\u2014"))), /* @__PURE__ */ React.createElement("td", { className: "r" }, o.streak > 0 ? /* @__PURE__ */ React.createElement("span", { className: "badge mint" }, "\u{1F525} ", o.streak, "mo") : /* @__PURE__ */ React.createElement("span", { className: "faint" }, "\u2014")), /* @__PURE__ */ React.createElement("td", { className: "r num", style: { fontWeight: 700, fontSize: 16 } }, o.pts.toLocaleString())))))));
  }
  // Deterministic color per Buy Box tag — same tag always gets the same hue.
  // Returns {bg, fg} tints that stay legible and on-palette.
  // Generate a unique, stable color per tag. Tags are assigned evenly-spaced
  // hues by their position in the registered master order, guaranteeing every
  // distinct tag a visually separated color. Unregistered tags fall back to a
  // hashed hue. Saturation/lightness fixed for a legible soft-bg / strong-fg.
  function hslToHex(h, s, l) {
    s /= 100; l /= 100;
    const k = (n) => (n + h / 30) % 12;
    const a = s * Math.min(l, 1 - l);
    const f = (n) => { const c = l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1))); return Math.round(255 * c).toString(16).padStart(2, "0"); };
    return "#" + f(0) + f(8) + f(4);
  }
  let _tagOrder = [];          // ordered list of all known tags (lowercased)
  const _tagColorCache = {};
  function registerTagOrder(tags) {
    const lc = (tags || []).map((t) => String(t).trim().toLowerCase()).filter(Boolean).sort();
    const key = lc.join("|");
    if (key === _tagOrder._key) return;
    _tagOrder = lc; _tagOrder._key = key;
    for (const k in _tagColorCache) delete _tagColorCache[k];   // recompute on change
  }
  function hueFor(tag) {
    const k = String(tag || "").trim().toLowerCase();
    const idx = _tagOrder.indexOf(k);
    if (idx !== -1 && _tagOrder.length > 0) {
      // Even spread, but offset adjacent indices by the golden angle so
      // neighbors aren't merely sequential — maximally distinct yet unique.
      return Math.round(((idx * 360 / _tagOrder.length) + idx * 137.508) % 360);
    }
    let h = 0; for (let i = 0; i < k.length; i++) { h = (h * 31 + k.charCodeAt(i)) >>> 0; }
    return Math.round((h * 137.508) % 360);
  }
  function tagColor(tag) {
    const key = String(tag || "");
    if (_tagColorCache[key]) return _tagColorCache[key];
    const hue = hueFor(key);
    const c = { bg: hslToHex(hue, 70, 93), fg: hslToHex(hue, 62, 38) };
    _tagColorCache[key] = c;
    return c;
  }

  function CopyField({ value, label }) {
    const [copied, setCopied] = React.useState(false);
    if (!value) return /* @__PURE__ */ React.createElement("span", { className: "dir-muted" }, "\u2014");
    const doCopy = () => {
      const txt = String(value).trim();
      const done = () => { setCopied(true); setTimeout(() => setCopied(false), 1400); };
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, done); }
        else {
          const ta = document.createElement("textarea"); ta.value = txt; document.body.appendChild(ta); ta.select();
          try { document.execCommand("copy"); } catch (e) {}
          document.body.removeChild(ta); done();
        }
      } catch (e) { done(); }
    };
    return /* @__PURE__ */ React.createElement("button", { className: "copybtn" + (copied ? " copied" : ""), onClick: doCopy, type: "button" },
      String(value).trim(),
      /* @__PURE__ */ React.createElement("span", { className: "tip" }, copied ? "Copied!" : "Click to Copy"));
  }

  function BuyBoxSelect({ tags, selected, onToggle, onClear, mode, setMode }) {
    const [open, setOpen] = React.useState(false);
    const [q, setQ] = React.useState("");
    const ref = React.useRef(null);
    React.useEffect(() => {
      if (!open) return;
      const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      const onEsc = (e) => { if (e.key === "Escape") setOpen(false); };
      document.addEventListener("mousedown", onDoc);
      document.addEventListener("keydown", onEsc);
      return () => { document.removeEventListener("mousedown", onDoc); document.removeEventListener("keydown", onEsc); };
    }, [open]);
    const shown = (tags || []).filter((t) => t.toLowerCase().indexOf(q.trim().toLowerCase()) !== -1);
    return /* @__PURE__ */ React.createElement("div", { className: "bbsel", ref },
      /* @__PURE__ */ React.createElement("button", { className: "bbsel-btn" + (open ? " open" : ""), type: "button", onClick: () => setOpen((o) => !o) },
        "Filters",
        selected.length ? /* @__PURE__ */ React.createElement("span", { className: "cnt" }, selected.length) : null,
        /* @__PURE__ */ React.createElement("span", { className: "car" }, "\u25BC")),
      open ? /* @__PURE__ */ React.createElement("div", { className: "bbsel-pop" },
        /* @__PURE__ */ React.createElement("input", { className: "bbsel-search", type: "text", placeholder: "Search categories\u2026", value: q, autoFocus: true, onChange: (e) => setQ(e.target.value) }),
        /* @__PURE__ */ React.createElement("div", { className: "bbsel-modebar" },
          /* @__PURE__ */ React.createElement("span", { className: "ml" }, "Match"),
          /* @__PURE__ */ React.createElement("div", { className: "modeseg" },
            /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": mode === "any", onClick: () => setMode("any") }, "Any"),
            /* @__PURE__ */ React.createElement("button", { type: "button", "aria-pressed": mode === "all", onClick: () => setMode("all") }, "All")),
          /* @__PURE__ */ React.createElement("span", { className: "hint", style: { marginLeft: "auto", fontSize: 11 } }, mode === "all" ? "must match every tag" : "match any tag")),
        /* @__PURE__ */ React.createElement("div", { className: "bbsel-list" },
          shown.length ? shown.map((t) => { const on = selected.indexOf(t) !== -1; const c = tagColor(t); return /* @__PURE__ */ React.createElement("div", {
            key: t, className: "bbsel-opt" + (on ? " on" : ""), onClick: () => onToggle(t)
          },
            /* @__PURE__ */ React.createElement("span", { className: "box" }, on ? "\u2713" : ""),
            /* @__PURE__ */ React.createElement("span", { className: "swatch", style: { background: c.fg } }),
            /* @__PURE__ */ React.createElement("span", null, t)); })
            : /* @__PURE__ */ React.createElement("div", { className: "bbsel-empty" }, "No categories match \u201C" + q + "\u201D")),
        /* @__PURE__ */ React.createElement("div", { className: "bbsel-foot" },
          /* @__PURE__ */ React.createElement("button", { className: "clr", type: "button", onClick: onClear }, "Clear (" + selected.length + ")"),
          /* @__PURE__ */ React.createElement("button", { className: "done", type: "button", onClick: () => setOpen(false) }, "Done"))) : null);
  }

  // Business days between two dates inclusive of the end, excluding Sat/Sun.
  // Mirrors Google Sheets NETWORKDAYS(start, end, 1).
  function networkDays(start, end) {
    if (!start || !end) return null;
    let s = new Date(start.getFullYear(), start.getMonth(), start.getDate());
    let e = new Date(end.getFullYear(), end.getMonth(), end.getDate());
    if (e < s) return null;
    let count = 0;
    for (let d = new Date(s); d <= e; d.setDate(d.getDate() + 1)) {
      const wd = d.getDay();
      if (wd !== 0 && wd !== 6) count++;
    }
    return count;
  }
  // Average a set of numbers after dropping significant outliers via the IQR
  // rule (values outside Q1-1.5*IQR .. Q3+1.5*IQR). Returns null if no data.
  function avgNoOutliers(vals) {
    const xs = vals.filter((v) => v != null && isFinite(v) && v > 0).sort((a, b) => a - b);
    if (!xs.length) return null;
    if (xs.length < 4) return Math.round(xs.reduce((a, b) => a + b, 0) / xs.length);
    const q = (p) => { const i = (xs.length - 1) * p; const lo = Math.floor(i), hi = Math.ceil(i); return xs[lo] + (xs[hi] - xs[lo]) * (i - lo); };
    const q1 = q(0.25), q3 = q(0.75), iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr, hi = q3 + 1.5 * iqr;
    const kept = xs.filter((v) => v >= lo && v <= hi);
    const use = kept.length ? kept : xs;
    return Math.round(use.reduce((a, b) => a + b, 0) / use.length);
  }
  // Build a map of lender name (lowercased) -> avg business days app->CTC.
  function buildCtcMap(rows) {
    const buckets = {};
    (rows || []).forEach((r) => {
      const name = String(r.lender || "").trim().toLowerCase();
      if (!name || !r.applied || !r.ctc) return;
      const nd = networkDays(r.applied, r.ctc);
      if (nd == null || nd <= 0) return;
      (buckets[name] = buckets[name] || []).push(nd);
    });
    const out = {};
    Object.keys(buckets).forEach((k) => { out[k] = avgNoOutliers(buckets[k]); });
    return out;
  }

  // Calls the AInsight backend (Apps Script relay) via JSONP, reusing the same
  // CORS-safe mechanism as the data proxy. The relay lives in the same Apps
  // Script web app (action=ainsight). Returns { answer, citations } or
  // { notConnected:true } if the relay has no API key / KB configured yet.
  async function callAInsight(payload) {
    const baseUrl = (window.__PREFETCH_URL || DEFAULT_SCRIPT_URL || "").trim();
    if (!baseUrl) return { notConnected: true };
    const sep = baseUrl.indexOf("?") >= 0 ? "&" : "?";
    const url = baseUrl + sep + "action=ainsight&payload=" + encodeURIComponent(JSON.stringify(payload));
    // Claude calls can take several seconds; allow a generous timeout.
    return await fetchJSONP(url, 45000);
  }

  function AInsightMark({ height }) {
    const h = height || 40;
    const dropA = "drop-shadow(0 5px 9px rgba(20,40,120,0.16))";
    const gemStyle = { height: h + "px", width: "auto", display: "block" };
    // Shimmer band: one continuous diagonal sweep across the A and I gems only,
    // masked to each shape so it never touches the "nsight" text and stops at
    // the I's right edge. Both overlays share the same animation/timeline.
    const sweepBand = /* @__PURE__ */ React.createElement("span", { className: "ai-mark-sweepband" });
    return /* @__PURE__ */ React.createElement("span", { className: "ai-mark", style: { height: h + "px" } },
      /* @__PURE__ */ React.createElement("span", { className: "ai-mark-ai", style: { height: h + "px" } },
        // A gem
        /* @__PURE__ */ React.createElement("span", { className: "ai-mark-gem", style: { filter: dropA } },
          /* @__PURE__ */ React.createElement("img", { src: AINSIGHT_AGEM, alt: "A", style: gemStyle }),
          /* @__PURE__ */ React.createElement("span", { className: "ai-mark-shim", style: { WebkitMaskImage: "url(" + AINSIGHT_AGEM + ")", maskImage: "url(" + AINSIGHT_AGEM + ")", WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" } }, sweepBand)),
        // I gem
        /* @__PURE__ */ React.createElement("span", { className: "ai-mark-gem", style: { marginLeft: Math.round(h * 0.05) + "px", filter: dropA } },
          /* @__PURE__ */ React.createElement("svg", { viewBox: "0 0 86 209", style: { height: h + "px", width: "auto", display: "block", overflow: "visible" }, xmlns: "http://www.w3.org/2000/svg" },
            /* @__PURE__ */ React.createElement("polygon", { points: "16,0 34,0 43,58", fill: "#03eeff" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "34,0 54,0 43,58", fill: "#00cdff" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "54,0 70,0 43,58", fill: "#1f7fe6" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,0 43,58 16,70", fill: "#00dcff" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "70,0 70,72 43,58", fill: "#264aea" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,70 43,58 43,118", fill: "#17a9ee" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,70 43,118 16,112", fill: "#1d49d8" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "43,58 70,72 43,118", fill: "#1e5fe0" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "70,72 70,108 43,118", fill: "#0037a9" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,112 43,118 43,150", fill: "#1233b8" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,112 43,150 16,160", fill: "#001a85" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "43,118 70,108 70,162", fill: "#0b2ea8" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "43,118 70,162 43,150", fill: "#122a9a" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,160 43,150 40,209", fill: "#061a78" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "16,160 40,209 16,209", fill: "#0a1f7a" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "43,150 70,162 40,209", fill: "#4426c6" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "70,162 70,209 40,209", fill: "#2a1b9e" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "24,12 46,66 40,70 22,18", fill: "#bff4ff", opacity: "0.9" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "36,34 50,30 45,56", fill: "#7df0ff", opacity: "0.9" }),
            /* @__PURE__ */ React.createElement("polygon", { points: "64,6 70,6 70,150", fill: "#061a6e", opacity: "0.32" })),
          /* @__PURE__ */ React.createElement("span", { className: "ai-mark-shim ai-mark-shim-i" }, sweepBand))),
      /* @__PURE__ */ React.createElement("span", { className: "ai-mark-text", style: { fontSize: Math.round(h * 0.66) + "px" } }, "nsight"));
  }

  function AInsight() {
    const [agency, setAgency] = React.useState("");
    const [loanType, setLoanType] = React.useState("");
    const [program, setProgram] = React.useState("");
    const [purpose, setPurpose] = React.useState("");
    const [occupancy, setOccupancy] = React.useState("");
    const [units, setUnits] = React.useState("");
    const [propType, setPropType] = React.useState("");
    const [fico, setFico] = React.useState("");
    const [fthb, setFthb] = React.useState("");
    const [question, setQuestion] = React.useState("");
    const [thread, setThread] = React.useState([]); // {role, text, citations?, error?, notConnected?}
    const [busy, setBusy] = React.useState(false);
    const scroller = React.useRef(null);
    React.useEffect(() => { if (scroller.current) scroller.current.scrollTop = scroller.current.scrollHeight; }, [thread, busy]);

    const DD_ROWS = [
      [
        ["Agency", agency, setAgency, ["Fannie", "Freddie", "Both"], true],
        ["Loan purpose", purpose, setPurpose, ["Purchase", "Rate + Term Refi", "Cash-Out Refi"], true],
        ["Loan type", loanType, setLoanType, ["FHA", "VA", "Conv"], true]
      ],
      [
        ["Occupancy", occupancy, setOccupancy, ["Primary", "Second home", "Investment"]],
        ["Property type", propType, setPropType, ["SFR", "Condo", "Manufactured", "PUD"]],
        ["Units", units, setUnits, ["1", "2", "3", "4"]]
      ],
      [
        ["Credit score", fico, setFico, ["<620", "620\u2013639", "640\u2013679", "680\u2013719", "720\u2013759", "760+"]],
        ["First-time buyer", fthb, setFthb, ["Yes", "No"]],
        ["Specialty program", program, setProgram, ["HomeOne", "HomeReady", "Home Possible"]]
      ]
    ];
    const missingRequired = !agency || !purpose || !loanType;

    const contextLine = () => {
      const parts = [];
      if (agency) parts.push(agency);
      if (loanType) parts.push(loanType);
      if (program) parts.push(program);
      if (purpose) parts.push(purpose);
      if (occupancy) parts.push(occupancy);
      if (units) parts.push(units + (units === "1" ? " unit" : " units"));
      if (propType) parts.push(propType);
      if (fico) parts.push(fico + " FICO");
      if (fthb) parts.push(fthb === "Yes" ? "FTHB" : "Not FTHB");
      return parts.join(" \u00b7 ");
    };

    const submit = async () => {
      const q = question.trim();
      if (!q || busy || missingRequired) return;
      const context = { agency, loanType, program, purpose, occupancy, units, propType, fico, fthb };
      const ctxLabel = contextLine();
      setThread((t) => [...t, { role: "user", text: q, ctx: ctxLabel }]);
      setQuestion("");
      setBusy(true);
      try {
        const resp = await callAInsight({ context, question: q });
        if (resp && resp.notConnected) {
          setThread((t) => [...t, { role: "assistant", notConnected: true }]);
        } else {
          setThread((t) => [...t, { role: "assistant", text: resp.answer || "", citations: resp.citations || [] }]);
        }
      } catch (e) {
        setThread((t) => [...t, { role: "assistant", error: "Something went wrong reaching the assistant. Please try again." }]);
      } finally {
        setBusy(false);
      }
    };

    const guideUrlFor = (agencyName) => {
      const a = String(agencyName || "").toLowerCase();
      if (a.indexOf("freddie") !== -1) return GUIDE_URLS.freddie;
      return GUIDE_URLS.fannie;
    };

    // Start a fresh chat: clear the thread and the scenario selections so the
    // LO returns to the dropdown + question view.
    const newChat = () => {
      setThread([]);
      setQuestion("");
      setAgency(""); setLoanType(""); setProgram(""); setPurpose("");
      setOccupancy(""); setUnits(""); setPropType(""); setFico(""); setFthb("");
    };

    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "ai-head ai-head-row" },
        /* @__PURE__ */ React.createElement("div", null,
          /* @__PURE__ */ React.createElement("h2", { className: "ai-title" }, /* @__PURE__ */ React.createElement(AInsightMark, { height: 42 }))),
        /* @__PURE__ */ React.createElement("div", { className: "ai-guidebox" },
          /* @__PURE__ */ React.createElement("span", { className: "ai-guidebox-label" }, "Official guides"),
          /* @__PURE__ */ React.createElement("div", { className: "ai-guidebox-links" },
            /* @__PURE__ */ React.createElement("a", { className: "ai-guidebox-link", href: GUIDE_URLS.fannie, target: "_blank", rel: "noopener noreferrer" }, "Fannie Mae \u2197"),
            /* @__PURE__ */ React.createElement("a", { className: "ai-guidebox-link", href: GUIDE_URLS.freddie, target: "_blank", rel: "noopener noreferrer" }, "Freddie Mac \u2197")))),
      missingRequired ? /* @__PURE__ */ React.createElement("div", { className: "ai-reqhint" }, "Select Agency, Loan Purpose and Loan Type to ask questions about Fannie and Freddie guidelines.") : null,
      (function () {
        var hasConvo = thread.length || busy;
        // Scenario dropdown box (BOX 1) — only before the first question.
        var ddBox = /* @__PURE__ */ React.createElement("div", { className: "card pad ai-box ai-box-dd" },
          DD_ROWS.map((row, ri) => /* @__PURE__ */ React.createElement("div", { key: ri, className: "ai-ddrow" },
            row.map(([label, val, setter, opts, req]) => /* @__PURE__ */ React.createElement("div", { key: label, className: "ai-dd" },
              /* @__PURE__ */ React.createElement("label", null, label, req ? /* @__PURE__ */ React.createElement("span", { className: "ai-req" }, " *") : null),
              /* @__PURE__ */ React.createElement("select", { className: (val ? "is-set" : "") + (req && !val ? " is-missing" : ""), value: val, onChange: (e) => setter(e.target.value) },
                /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014"),
                opts.map((o) => /* @__PURE__ */ React.createElement("option", { key: o, value: o }, o))))))));
        // Conversation thread.
        var threadBox = /* @__PURE__ */ React.createElement("div", { className: "ai-thread", ref: scroller },
          thread.map((m, i) => /* @__PURE__ */ React.createElement("div", { key: i, className: "ai-msg " + m.role },
                m.role === "user"
                  ? /* @__PURE__ */ React.createElement("div", { className: "ai-bubble user" }, m.ctx ? /* @__PURE__ */ React.createElement("div", { className: "ai-bubble-ctx" }, m.ctx) : null, /* @__PURE__ */ React.createElement("div", null, m.text))
                  : m.notConnected
                    ? /* @__PURE__ */ React.createElement("div", { className: "ai-bubble bot ai-bubble-soon" }, /* @__PURE__ */ React.createElement("b", null, "Assistant not connected yet."), /* @__PURE__ */ React.createElement("div", null, "The question box and scenario fields are live, but the guideline assistant backend isn't connected. Once it's wired up, your answer \u2014 with cited sections \u2014 appears here."))
                    : m.error
                      ? /* @__PURE__ */ React.createElement("div", { className: "ai-bubble bot ai-bubble-err" }, m.error)
                      : /* @__PURE__ */ React.createElement("div", { className: "ai-bubble bot" },
                          (m.citations && m.citations.length) ? /* @__PURE__ */ React.createElement("div", { className: "ai-cites-corner" },
                            m.citations.map((c, ci) => /* @__PURE__ */ React.createElement("a", { key: ci, className: "ai-cite", href: guideUrlFor(c.agency), target: "_blank", rel: "noopener noreferrer", title: c.title || "" }, /* @__PURE__ */ React.createElement("b", null, c.section || ""), " \u2197"))) : null,
                          /* @__PURE__ */ React.createElement("div", { className: "ai-answer" }, m.text)))),
          busy ? /* @__PURE__ */ React.createElement("div", { className: "ai-msg assistant" }, /* @__PURE__ */ React.createElement("div", { className: "ai-bubble bot ai-typing" }, /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("span", null), /* @__PURE__ */ React.createElement("span", null))) : null);
        // Question input box (BOX 2, Moxie blue).
        var qBox = /* @__PURE__ */ React.createElement("div", { className: "card pad ai-box ai-box-q" },
          /* @__PURE__ */ React.createElement("div", { className: "ai-inputrow" },
            /* @__PURE__ */ React.createElement("textarea", { className: "ai-input" + (hasConvo ? " ai-input-tall" : ""), rows: hasConvo ? 4 : 2, placeholder: hasConvo ? "Ask a follow-up\u2026" : "Ask a guideline question\u2026", value: question, onChange: (e) => setQuestion(e.target.value), onKeyDown: (e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); submit(); } } }),
            /* @__PURE__ */ React.createElement("button", { className: "iconbtn ai-send", type: "button", onClick: submit, disabled: busy || !question.trim() || missingRequired }, busy ? "\u2026" : "Ask")),
          /* @__PURE__ */ React.createElement("div", { className: "ai-disclaimer" }, "\u26A0 AInsight is a research aid, not an underwriting decision. Always confirm answers against the official Fannie Mae Selling Guide or Freddie Mac Seller/Servicer Guide before relying on them."),
          thread.length ? /* @__PURE__ */ React.createElement("div", { className: "ai-qbox-guides" },
            /* @__PURE__ */ React.createElement("span", { className: "ai-qbox-guides-label" }, "Verify in the official guides:"),
            /* @__PURE__ */ React.createElement("a", { className: "ai-qbox-guide-link", href: GUIDE_URLS.fannie, target: "_blank", rel: "noopener noreferrer" }, "Fannie Mae \u2197"),
            /* @__PURE__ */ React.createElement("a", { className: "ai-qbox-guide-link", href: GUIDE_URLS.freddie, target: "_blank", rel: "noopener noreferrer" }, "Freddie Mac \u2197")) : null);
        // BEFORE first question: dropdowns + question box stacked.
        // AFTER first question: 70/30 split — chat history left, follow-up input right.
        if (!hasConvo) {
          return /* @__PURE__ */ React.createElement("div", null, ddBox, qBox);
        }
        return /* @__PURE__ */ React.createElement("div", null,
          /* @__PURE__ */ React.createElement("div", { className: "ai-split" },
            /* @__PURE__ */ React.createElement("div", { className: "ai-split-left" }, threadBox),
            /* @__PURE__ */ React.createElement("div", { className: "ai-split-right" }, qBox)),
          /* @__PURE__ */ React.createElement("div", { className: "ai-newchat-row" },
            /* @__PURE__ */ React.createElement("button", { className: "ai-newchat", type: "button", onClick: newChat }, "\u21BB Start new chat")));
      })());
  }

  function LenderDirectory({ lenders, buyboxTags, rows }) {
    registerTagOrder(buyboxTags);
    const ctcMap = React.useMemo(() => buildCtcMap(rows), [rows]);
    const [activeTags, setActiveTags] = React.useState([]);
    const [channel, setChannel] = React.useState("Correspondent");
    const [matchMode, setMatchMode] = React.useState("any");
    const [query, setQuery] = React.useState("");
    const toggleTag = (t) => setActiveTags((cur) => cur.indexOf(t) === -1 ? [...cur, t] : cur.filter((x) => x !== t));
    const clearTags = () => setActiveTags([]);
    const clearAll = () => { setActiveTags([]); setChannel("all"); setQuery(""); };

    const q = query.trim().toLowerCase();
    const filtered = lenders.filter((l) => {
      if (channel !== "all" && l.channel !== channel) return false;
      if (q) {
        const name = String(l.lender || "").toLowerCase();
        const ae = String(l.ae || "").toLowerCase();
        if (name.indexOf(q) === -1 && ae.indexOf(q) === -1) return false;
      }
      if (activeTags.length) {
        const bb = l.buyBox || [];
        const ok = matchMode === "all"
          ? activeTags.every((t) => bb.indexOf(t) !== -1)
          : activeTags.some((t) => bb.indexOf(t) !== -1);
        if (!ok) return false;
      }
      return true;
    });
    const tiers = [1, 2, 3, 4];
    const anyResults = filtered.length > 0;

    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "dir-sticky-top dir-sticky-sub" },
        // Filter bar: Channel + searchable Buy Box dropdown + selected chips
        /* @__PURE__ */ React.createElement("div", { className: "dir-filters dir-filters-split", style: { gap: 10 } },
        /* @__PURE__ */ React.createElement("div", { className: "dir-search" },
          /* @__PURE__ */ React.createElement("span", { className: "dir-search-ic" }, "\u{1F50D}"),
          /* @__PURE__ */ React.createElement("input", { className: "dir-search-in", type: "text", placeholder: "Search lender or AE\u2026", value: query, onChange: (e) => setQuery(e.target.value) }),
          query ? /* @__PURE__ */ React.createElement("button", { className: "dir-search-x", type: "button", title: "Clear", onClick: () => setQuery("") }, "\u00D7") : null),
        /* @__PURE__ */ React.createElement("div", { className: "dir-filters-right" },
          /* @__PURE__ */ React.createElement("span", { className: "flabel" }, "Channel"),
          ["all", "Correspondent", "Broker"].map((c) => /* @__PURE__ */ React.createElement("button", {
            key: c, className: "dchip accent", "aria-pressed": channel === c, onClick: () => setChannel(c), type: "button"
          }, c === "all" ? "All" : c)),
          /* @__PURE__ */ React.createElement("span", { style: { width: 1, height: 22, background: "var(--line)", margin: "0 2px" } }),
          /* @__PURE__ */ React.createElement(BuyBoxSelect, { tags: buyboxTags, selected: activeTags, onToggle: toggleTag, onClear: clearTags, mode: matchMode, setMode: setMatchMode }),
          activeTags.length ? /* @__PURE__ */ React.createElement("span", { className: "selchips" },
            activeTags.map((t) => { const c = tagColor(t); return /* @__PURE__ */ React.createElement("span", { key: t, className: "selchip", style: { background: c.bg, color: c.fg, borderColor: c.fg } },
              t, /* @__PURE__ */ React.createElement("button", { title: "Remove", onClick: () => toggleTag(t) }, "\u00D7")); })) : null,
          (activeTags.length || channel !== "all" || query) ? /* @__PURE__ */ React.createElement("button", { className: "dir-clear", onClick: clearAll, type: "button" }, "Clear all") : null))),
      // Tier blocks
      !anyResults ? /* @__PURE__ */ React.createElement("div", { className: "dir-table-wrap", style: { marginTop: 16 } }, /* @__PURE__ */ React.createElement("div", { className: "dir-empty" }, "No lenders match the selected filters.")) :
      tiers.map((tier) => {
        const group = filtered.filter((l) => l.tier === tier);
        if (!group.length) return null;
        return /* @__PURE__ */ React.createElement("div", { className: "tier-block", key: tier },
          /* @__PURE__ */ React.createElement("div", { className: "tier-label" }, /* @__PURE__ */ React.createElement("span", { className: "pip" }, tier), "Tier ", tier),
          /* @__PURE__ */ React.createElement("div", { className: "dir-table-wrap" },
            /* @__PURE__ */ React.createElement("table", { className: "dir" },
              /* @__PURE__ */ React.createElement("thead", null, /* @__PURE__ */ React.createElement("tr", null,
                ["Lender", "Channel", "Portal", "Account Executive", "Phone", "Email", "Avg CTC", "EPO Policy"].map((h) =>
                  /* @__PURE__ */ React.createElement("th", { key: h }, h)))),
              /* @__PURE__ */ React.createElement("tbody", null, group.map((l, idx) => {
                const discParts = l.disclaimers ? String(l.disclaimers).split(";").map((d) => d.trim()).filter(Boolean) : [];
                const isBroker = l.channel === "Broker";
                const hasFooter = !!l.notes || discParts.length || isBroker;
                return /* @__PURE__ */ React.createElement(React.Fragment, { key: l.lender + idx },
                  /* @__PURE__ */ React.createElement("tr", { className: "dir-primary" + (hasFooter ? " has-footer" : "") },
                    /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement("span", { className: "dir-lender" }, l.lender)),
                    /* @__PURE__ */ React.createElement("td", null, l.channel ? /* @__PURE__ */ React.createElement("span", { className: "dir-channel " + (isBroker ? "brok" : "corr") }, l.channel) : /* @__PURE__ */ React.createElement("span", { className: "dir-muted" }, "\u2014")),
                    /* @__PURE__ */ React.createElement("td", null, l.portal ? /* @__PURE__ */ React.createElement("a", { className: "dir-portal", href: l.portal, target: "_blank", rel: "noopener noreferrer" }, "Open Portal \u2197") : /* @__PURE__ */ React.createElement("span", { className: "dir-muted" }, "\u2014")),
                    /* @__PURE__ */ React.createElement("td", null, l.ae && l.ae !== "N/A" ? /* @__PURE__ */ React.createElement("span", { className: "dir-ae" }, l.ae) : /* @__PURE__ */ React.createElement("span", { className: "dir-muted" }, l.ae === "N/A" ? "N/A" : "\u2014")),
                    /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(CopyField, { value: l.phone })),
                    /* @__PURE__ */ React.createElement("td", null, /* @__PURE__ */ React.createElement(CopyField, { value: l.email ? String(l.email).toLowerCase() : l.email })),
                    /* @__PURE__ */ React.createElement("td", null, (() => { const v = ctcMap[String(l.lender || "").trim().toLowerCase()]; return (v != null && isFinite(v)) ? /* @__PURE__ */ React.createElement("span", { className: "dir-ctc" }, v + " days") : /* @__PURE__ */ React.createElement("span", { className: "dir-muted" }, "\u2014"); })()),
                    /* @__PURE__ */ React.createElement("td", null, l.epoPolicy ? /* @__PURE__ */ React.createElement("span", { className: "dir-epo" }, l.epoPolicy) : /* @__PURE__ */ React.createElement("span", { className: "dir-muted" }, "\u2014"))),
                  hasFooter ? /* @__PURE__ */ React.createElement("tr", { className: "dir-footer" },
                    /* @__PURE__ */ React.createElement("td", { colSpan: 8 },
                      /* @__PURE__ */ React.createElement("div", { className: "dir-footer-wrap" },
                        l.notes ? /* @__PURE__ */ React.createElement("div", { className: "dir-footer-notes" }, /* @__PURE__ */ React.createElement("span", { className: "dir-footer-label" }, "Notes"), /* @__PURE__ */ React.createElement("span", null, l.notes)) : null,
                        discParts.length ? /* @__PURE__ */ React.createElement("div", { className: "dir-footer-disc" }, discParts.map((d, di) => /* @__PURE__ */ React.createElement("span", { key: di, className: "disc-line" }, d))) : null,
                        isBroker ? /* @__PURE__ */ React.createElement("div", { className: "broker-note" }, "\u26A0 We only broker this loan if it requires it.") : null))) : null);
              })))));
      }));
  }

  // All-time 5-star review counts per officer (sum of checked REVIEW boxes),
  // keyed by lowercased officer name for matching against team members.
  function buildReviewMap(rows) {
    const m = {};
    (rows || []).forEach((r) => {
      const name = String(r.officer || "").trim().toLowerCase();
      if (!name) return;
      m[name] = (m[name] || 0) + (r.reviewCount || 0);
    });
    return m;
  }

  function MoxieDirectory({ team, rows }) {
    const reviewMap = React.useMemo(() => buildReviewMap(rows), [rows]);
    // Coerce statesLicensed to an array — older data or Zapier may send a string.
    const asStates = (v) => Array.isArray(v) ? v : (typeof v === "string" ? v.split(/[,;]/).map((s) => s.trim()).filter(Boolean) : []);
    const [query, setQuery] = React.useState("");
    const [role, setRole] = React.useState("all");
    const [stateF, setStateF] = React.useState("all");

    // Build role + state option lists from the data.
    const roles = React.useMemo(() => {
      const s = /* @__PURE__ */ new Set();
      (team || []).forEach((t) => { if (t.role) s.add(t.role); });
      return ["all", ...[...s].sort()];
    }, [team]);
    const states = React.useMemo(() => {
      const s = /* @__PURE__ */ new Set();
      (team || []).forEach((t) => asStates(t.statesLicensed).forEach((x) => { if (x) s.add(String(x).toUpperCase()); }));
      return ["all", ...[...s].sort()];
    }, [team]);

    const q = query.trim().toLowerCase();
    const filtered = (team || []).filter((t) => {
      if (t.lbVisible === false) return false;   // hidden members don't show on the directory
      if (role !== "all" && t.role !== role) return false;
      if (stateF !== "all" && !asStates(t.statesLicensed).map((x) => String(x).toUpperCase()).includes(stateF)) return false;
      if (q) {
        const name = ((t.firstName || "") + " " + (t.lastName || "")).toLowerCase();
        if (name.indexOf(q) === -1) return false;
      }
      return true;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const fmtBirthday = (t) => {
      const mo = parseInt(t.birthMonth, 10), d = parseInt(t.birthDay, 10);
      if (!mo || !d || mo < 1 || mo > 12) return null;
      return monthNames[mo - 1] + " " + d;
    };
    const initials = (t) => ((t.firstName || " ")[0] + (t.lastName || " ")[0]).toUpperCase();
    const reviewsFor = (t) => {
      const key = ((t.firstName || "") + " " + (t.lastName || "")).trim().toLowerCase();
      return reviewMap[key] || 0;
    };

    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "mox-filters" },
        /* @__PURE__ */ React.createElement("div", { className: "dir-search" },
          /* @__PURE__ */ React.createElement("span", { className: "dir-search-ic" }, "\u{1F50D}"),
          /* @__PURE__ */ React.createElement("input", { className: "dir-search-in", type: "text", placeholder: "Search by name\u2026", value: query, onChange: (e) => setQuery(e.target.value) }),
          query ? /* @__PURE__ */ React.createElement("button", { className: "dir-search-x", type: "button", title: "Clear", onClick: () => setQuery("") }, "\u00D7") : null),
        /* @__PURE__ */ React.createElement("div", { className: "mox-sel" },
          /* @__PURE__ */ React.createElement("label", null, "Role"),
          /* @__PURE__ */ React.createElement("select", { value: role, onChange: (e) => setRole(e.target.value) },
            roles.map((r) => /* @__PURE__ */ React.createElement("option", { key: r, value: r }, r === "all" ? "All roles" : r)))),
        /* @__PURE__ */ React.createElement("div", { className: "mox-sel" },
          /* @__PURE__ */ React.createElement("label", null, "Licensed state"),
          /* @__PURE__ */ React.createElement("select", { value: stateF, onChange: (e) => setStateF(e.target.value) },
            states.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s === "all" ? "All states" : s)))),
        (role !== "all" || stateF !== "all" || query) ? /* @__PURE__ */ React.createElement("button", { className: "dir-clear", onClick: () => { setQuery(""); setRole("all"); setStateF("all"); }, type: "button" }, "Clear all") : null),
      !filtered.length ? /* @__PURE__ */ React.createElement("div", { className: "dir-empty", style: { marginTop: 16 } }, (team && team.length) ? "No team members match the filters." : "No team members yet. Add them in Settings \u2192 Team Directory, or they'll appear here as they're onboarded.") :
      /* @__PURE__ */ React.createElement("div", { className: "mox-grid" },
        filtered.map((t, i) => {
          const bday = fmtBirthday(t);
          const revs = reviewsFor(t);
          return /* @__PURE__ */ React.createElement("div", { className: "mox-card", key: (t.email || "") + i },
            /* @__PURE__ */ React.createElement("div", { className: "mox-card-top" },
              t.photo
                ? /* @__PURE__ */ React.createElement("img", { className: "mox-avatar", src: t.photo, alt: (t.firstName || "") + " " + (t.lastName || "") })
                : /* @__PURE__ */ React.createElement("div", { className: "mox-avatar mox-avatar-ph" }, initials(t)),
              /* @__PURE__ */ React.createElement("div", { className: "mox-id" },
                /* @__PURE__ */ React.createElement("div", { className: "mox-name" }, (t.firstName || "") + " " + (t.lastName || "")),
                t.role ? /* @__PURE__ */ React.createElement("div", { className: "mox-role" }, t.role) : null,
                /* @__PURE__ */ React.createElement("div", { className: "mox-stars" }, "\u2605 ", revs, " ", revs === 1 ? "five-star review" : "five-star reviews"))),
            /* @__PURE__ */ React.createElement("div", { className: "mox-fields" },
              t.nmls ? /* @__PURE__ */ React.createElement("div", { className: "mox-field" }, /* @__PURE__ */ React.createElement("span", { className: "mox-flabel" }, "NMLS"), /* @__PURE__ */ React.createElement("span", null, t.nmls)) : null,
              t.cell ? /* @__PURE__ */ React.createElement("div", { className: "mox-field" }, /* @__PURE__ */ React.createElement("span", { className: "mox-flabel" }, "Cell"), /* @__PURE__ */ React.createElement(CopyField, { value: t.cell })) : null,
              t.email ? /* @__PURE__ */ React.createElement("div", { className: "mox-field" }, /* @__PURE__ */ React.createElement("span", { className: "mox-flabel" }, "Email"), /* @__PURE__ */ React.createElement(CopyField, { value: String(t.email).toLowerCase() })) : null,
              (asStates(t.statesLicensed).length) ? /* @__PURE__ */ React.createElement("div", { className: "mox-field" }, /* @__PURE__ */ React.createElement("span", { className: "mox-flabel" }, "Licensed"), /* @__PURE__ */ React.createElement("span", { className: "mox-states" }, asStates(t.statesLicensed).map((s, si) => /* @__PURE__ */ React.createElement("span", { key: si, className: "mox-state" }, String(s).toUpperCase())))) : null,
              t.stateResidence ? /* @__PURE__ */ React.createElement("div", { className: "mox-field" }, /* @__PURE__ */ React.createElement("span", { className: "mox-flabel" }, "Resides"), /* @__PURE__ */ React.createElement("span", null, String(t.stateResidence).toUpperCase())) : null,
              bday ? /* @__PURE__ */ React.createElement("div", { className: "mox-field" }, /* @__PURE__ */ React.createElement("span", { className: "mox-flabel" }, "Birthday"), /* @__PURE__ */ React.createElement("span", null, bday)) : null));
        })));
  }

  function Directory({ lenders, buyboxTags, rows, team }) {
    const [sub, setSub] = React.useState("lender");
    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "dir-sticky-top" },
        /* @__PURE__ */ React.createElement("div", { className: "dir-head dir-head-stack" },
          /* @__PURE__ */ React.createElement("div", { className: "dir-subtabs" },
            /* @__PURE__ */ React.createElement("button", { className: "dir-subtab", "aria-pressed": sub === "lender", onClick: () => setSub("lender"), type: "button" }, "Lender"),
            /* @__PURE__ */ React.createElement("button", { className: "dir-subtab", "aria-pressed": sub === "moxie", onClick: () => setSub("moxie"), type: "button" }, "Moxie")))),
      sub === "lender"
        ? /* @__PURE__ */ React.createElement(LenderDirectory, { lenders, buyboxTags, rows })
        : /* @__PURE__ */ React.createElement(MoxieDirectory, { team, rows }));
  }

  // Multi-select dropdown for licensed states (50 + DC, two-letter codes).
  // Reads/writes the same string[] shape the rest of the app + Zapier use.
  function StatesMultiSelect({ selected, onChange }) {
    const [open, setOpen] = React.useState(false);
    const ref = React.useRef(null);
    const sel = selected || [];
    React.useEffect(() => {
      if (!open) return;
      const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
      document.addEventListener("mousedown", h);
      return () => document.removeEventListener("mousedown", h);
    }, [open]);
    const toggle = (st) => {
      const has = sel.indexOf(st) !== -1;
      onChange(has ? sel.filter((x) => x !== st) : [...sel, st].sort());
    };
    return /* @__PURE__ */ React.createElement("div", { className: "stms", ref: ref },
      /* @__PURE__ */ React.createElement("button", { type: "button", className: "stms-btn", onClick: () => setOpen((o) => !o) },
        sel.length ? /* @__PURE__ */ React.createElement("span", { className: "stms-chips" }, sel.map((s) => /* @__PURE__ */ React.createElement("span", { key: s, className: "stms-chip" }, s))) : /* @__PURE__ */ React.createElement("span", { className: "stms-ph" }, "Select states licensed\u2026"),
        /* @__PURE__ */ React.createElement("span", { className: "stms-caret" }, "\u25BE")),
      open ? /* @__PURE__ */ React.createElement("div", { className: "stms-menu" },
        US_STATES.map((st) => {
          const on = sel.indexOf(st) !== -1;
          return /* @__PURE__ */ React.createElement("button", { key: st, type: "button", className: "stms-opt" + (on ? " on" : ""), onClick: () => toggle(st) },
            /* @__PURE__ */ React.createElement("span", { className: "stms-box" }, on ? "\u2713" : ""), st);
        })) : null);
  }

  function AdminPanel({ rows, period, authed, setAuthed, goals, setGoals, officerGoals, setOfficerGoals, weights, setWeights, competition, setCompetition, photos, savePhotos, photoErr, hiddenOfficers, saveHidden, officerEmails, saveEmails, saveSettings, lenders, saveLenders, buyboxTags, saveBuyboxTags, team, saveTeam, dataConnection }) {
    const [secTab, setSecTab] = React.useState("team");
    const [pass, setPass] = useState("");
    const [err, setErr] = useState(false);
    const [saved, setSaved] = useState(false);
    const officers = useMemo(() => OFFICERS_present(rows).sort(), [rows]);
    // Raw list of EVERY officer in the data (including hidden ones), so the
    // hide controls can list and un-hide them. Bypasses the hidden filter.
    const allOfficers = useMemo(() => {
      const set = /* @__PURE__ */ new Set();
      rows.forEach((r) => { if (r.officer) set.add(r.officer); });
      return [...set].sort();
    }, [rows]);
    if (!authed) {
      const tryAuth = () => {
        if (pass === ADMIN_PASSCODE) {
          setAuthed(true);
          setErr(false);
        } else setErr(true);
      };
      return /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { maxWidth: 420, margin: "10px auto" } },
        /* @__PURE__ */ React.createElement("div", { className: "sec-h", style: { margin: "0 0 12px" } },
          /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Restricted"),
          /* @__PURE__ */ React.createElement("h2", null, "Admin")),
        /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13, marginBottom: 10 } }, "Enter the admin passcode to set goals and targets."),
        /* @__PURE__ */ React.createElement("input", { className: "k", type: "password", placeholder: "Passcode", value: pass,
          onChange: (e) => { setPass(e.target.value); setErr(false); },
          onKeyDown: (e) => { if (e.key === "Enter") tryAuth(); } }),
        err && /* @__PURE__ */ React.createElement("div", { className: "badge", style: { marginTop: 10, color: "var(--rose)", borderColor: "rgba(255,107,129,.4)" } }, "Incorrect passcode"),
        /* @__PURE__ */ React.createElement("button", { className: "iconbtn", style: { marginTop: 14 }, onClick: tryAuth }, "Unlock"));
    }
    const flash = () => { setSaved(true); setTimeout(() => setSaved(false), 1800); };
    const [lenderSearch, setLenderSearch] = React.useState("");
    registerTagOrder(buyboxTags);
    const saveCompany = (next) => { setGoals(next); saveSettings({ goals: next }); flash(); };
    const saveWeights = (next) => { setWeights(next); saveSettings({ weights: next }); flash(); };
    const saveComp = (next) => { setCompetition(next); saveSettings({ competition: next }); flash(); };
    const saveStdGoal = (next) => {
      setOfficerGoals(next);
      saveSettings({ officerGoals: next });
      flash();
    };
    const numField = (label, val, onChange, step) => /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 150px" } },
      /* @__PURE__ */ React.createElement("label", { className: "fld" }, label),
      /* @__PURE__ */ React.createElement("input", { className: "k", type: "number", step: step || 1, value: val,
        onChange: (e) => onChange(+e.target.value || 0) }));
    return /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" },
        /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Admin"),
        /* @__PURE__ */ React.createElement("h2", null, "Settings"),
        saved && /* @__PURE__ */ React.createElement("span", { className: "badge mint", style: { marginLeft: "auto" } }, "\u2713 Saved"),
        /* @__PURE__ */ React.createElement("button", { className: "iconbtn", style: { marginLeft: saved ? 10 : "auto" }, onClick: () => setAuthed(false) }, "Lock")),
      // Settings sub-tabs
      /* @__PURE__ */ React.createElement("div", { className: "settabs" },
        [["team", "Moxie Roster"], ["competition", "Monthly Competition"], ["company", "Company Goals"], ["individual", "Individual Goals"], ["directory", "Lenders"], ["analytics", "Company Analytics"], ["connection", "Data Connection"]].map(([k, l]) =>
          /* @__PURE__ */ React.createElement("button", { key: k, "aria-pressed": secTab === k, onClick: () => setSecTab(k) }, l))),
      // ===== DATA CONNECTION =====
      secTab === "connection" ? (dataConnection || /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13 } }, "Data connection settings unavailable.")) : null,
      // ===== COMPANY GOALS =====
      secTab === "company" ? /* @__PURE__ */ React.createElement("div", null,
        /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { marginBottom: 16 } },
          /* @__PURE__ */ React.createElement("b", null, "Company targets (monthly)"),
          /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, margin: "2px 0 8px" } }, "Enter monthly targets. The Goals dashboard scales them to the selected period (\u00d71 month, \u00d7months-elapsed for quarter, \u00d7month-of-year for YTD)."),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap", marginTop: 8 } },
            numField("Funded volume ($)", goals.vol, (v) => saveCompany({ ...goals, vol: v }), 1e6),
            numField("Units funded", goals.units, (v) => saveCompany({ ...goals, units: v })),
            numField("5-star reviews", goals.reviews, (v) => saveCompany({ ...goals, reviews: v })))),
        /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { marginBottom: 16 } },
          /* @__PURE__ */ React.createElement("b", null, "Points weights"),
          /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, margin: "4px 0 8px" } }, "Score = volume(per $M)\u00d7w + units\u00d7w + reviews\u00d7w + avg\u2011bps\u00d7w"),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap" } },
            numField("Weight \u00b7 volume (per $M)", weights.vol, (v) => saveWeights({ ...weights, vol: v })),
            numField("Weight \u00b7 units", weights.units, (v) => saveWeights({ ...weights, units: v })),
            numField("Weight \u00b7 5-star reviews", weights.reviews, (v) => saveWeights({ ...weights, reviews: v })),
            numField("Weight \u00b7 avg bps", weights.bps, (v) => saveWeights({ ...weights, bps: v }), 0.1)))) : null,
      // ===== INDIVIDUAL GOALS =====
      secTab === "individual" ? /* @__PURE__ */ React.createElement("div", null,
        /* @__PURE__ */ React.createElement("div", { className: "card pad" },
          /* @__PURE__ */ React.createElement("b", null, "Per-officer goal (monthly, applies to every LO)"),
          /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, margin: "2px 0 8px" } }, "One standardized monthly goal for all loan officers. Auto-scales to the selected period on the Goals dashboard."),
          /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap" } },
            numField("Volume goal ($)", officerGoals.vol, (v) => saveStdGoal({ ...officerGoals, vol: v }), 1e6),
            numField("Units goal", officerGoals.units, (v) => saveStdGoal({ ...officerGoals, units: v })),
            numField("5-star review goal", officerGoals.reviews, (v) => saveStdGoal({ ...officerGoals, reviews: v }))))) : null,
      // ===== TEAM MEMBERS =====
      secTab === "team" ? /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Team"), /* @__PURE__ */ React.createElement("h2", null, "Team")),
      /* ---- Unified team roster: profile + headshot + Pipeline IQ email + leaderboard visibility ---- */
      /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { marginBottom: 16 } },
        /* @__PURE__ */ React.createElement("div", { className: "sec-sub" }, "Team Roster"),
        /* @__PURE__ */ React.createElement("p", { className: "muted", style: { fontSize: 13, margin: "0 0 14px", lineHeight: 1.5 } }, "The master team roster \u2014 shown under Directory \u2192 Moxie and used by the leaderboard and Pipeline IQ. New hires are added automatically by onboarding; here you can edit anyone, upload each person's headshot (used everywhere), set their Pipeline IQ email, and toggle whether they appear on the leaderboard. The 5-star review count is pulled from the pipeline by name."),
        (team || []).map((t, i) => {
          const upd = (field, val) => { const n = team.map((x, j) => j === i ? { ...x, [field]: val } : x); saveTeam(n); };
          const updStates = (val) => upd("statesLicensed", String(val).split(",").map((s) => s.trim().toUpperCase()).filter(Boolean));
          const visible = t.lbVisible !== false;
          return /* @__PURE__ */ React.createElement("div", { className: "tmemb", key: i },
            /* @__PURE__ */ React.createElement("div", { className: "tmemb-row" },
              /* @__PURE__ */ React.createElement("input", { className: "k", placeholder: "First name", value: t.firstName || "", onChange: (e) => upd("firstName", e.target.value), style: { flex: 1 } }),
              /* @__PURE__ */ React.createElement("input", { className: "k", placeholder: "Last name", value: t.lastName || "", onChange: (e) => upd("lastName", e.target.value), style: { flex: 1 } }),
              /* @__PURE__ */ React.createElement("select", { className: "k", value: t.role || "", onChange: (e) => upd("role", e.target.value), style: { flex: "0 0 150px" } },
                /* @__PURE__ */ React.createElement("option", { value: "" }, "Role\u2026"),
                ["Loan Officer", "Processor", "Manager", "Admin"].map((r) => /* @__PURE__ */ React.createElement("option", { key: r, value: r }, r)))),
            /* @__PURE__ */ React.createElement("div", { className: "tmemb-row" },
              /* @__PURE__ */ React.createElement("input", { className: "k", placeholder: "NMLS #", value: t.nmls || "", onChange: (e) => upd("nmls", e.target.value), style: { flex: 1 } }),
              /* @__PURE__ */ React.createElement("input", { className: "k", placeholder: "Cell phone", value: t.cell || "", onChange: (e) => upd("cell", e.target.value), style: { flex: 1 } }),
              /* @__PURE__ */ React.createElement("input", { className: "k", type: "email", placeholder: "Email (also used for Pipeline IQ)", value: t.email || "", onChange: (e) => upd("email", e.target.value), style: { flex: 1.4 } })),
            /* @__PURE__ */ React.createElement("div", { className: "tmemb-row" },
              /* @__PURE__ */ React.createElement(StatesMultiSelect, { selected: Array.isArray(t.statesLicensed) ? t.statesLicensed : (typeof t.statesLicensed === "string" ? t.statesLicensed.split(/[,;]/).map((s) => s.trim().toUpperCase()).filter(Boolean) : []), onChange: (next) => upd("statesLicensed", next) }),
              /* @__PURE__ */ React.createElement("select", { className: "k", value: t.stateResidence || "", onChange: (e) => upd("stateResidence", e.target.value), style: { flex: "0 0 150px" } },
                /* @__PURE__ */ React.createElement("option", { value: "" }, "Residence\u2026"),
                US_STATES.map((s) => /* @__PURE__ */ React.createElement("option", { key: s, value: s }, s)))),
            /* @__PURE__ */ React.createElement("div", { className: "tmemb-row" },
              /* @__PURE__ */ React.createElement("span", { className: "tmemb-lbl" }, "Birthday"),
              /* @__PURE__ */ React.createElement("select", { className: "k", value: t.birthMonth || "", onChange: (e) => upd("birthMonth", e.target.value), style: { flex: "0 0 120px" } },
                /* @__PURE__ */ React.createElement("option", { value: "" }, "Month"),
                ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map((mo, mi) => /* @__PURE__ */ React.createElement("option", { key: mo, value: String(mi + 1) }, mo))),
              /* @__PURE__ */ React.createElement("select", { className: "k", value: t.birthDay || "", onChange: (e) => upd("birthDay", e.target.value), style: { flex: "0 0 90px" } },
                /* @__PURE__ */ React.createElement("option", { value: "" }, "Day"),
                Array.from({ length: 31 }, (_, di) => /* @__PURE__ */ React.createElement("option", { key: di + 1, value: String(di + 1) }, di + 1))),
              /* @__PURE__ */ React.createElement("label", { className: "iconbtn tmemb-upload", style: { cursor: "pointer", flex: "0 0 auto" } },
                t.photo ? "Replace headshot" : "Upload headshot",
                /* @__PURE__ */ React.createElement("input", { type: "file", accept: "image/*", style: { display: "none" },
                  onChange: async (e) => { const f = e.target.files && e.target.files[0]; if (!f) return; try { const uri = await fileToAvatar(f, 256); upd("photo", uri); flash(); } catch (er) {} e.target.value = ""; } })),
              t.photo ? /* @__PURE__ */ React.createElement("img", { className: "tmemb-thumb", src: t.photo, alt: "" }) : null,
              t.photo ? /* @__PURE__ */ React.createElement("button", { className: "lndr-tx", type: "button", onClick: () => upd("photo", "") }, "Remove photo") : null),
            /* @__PURE__ */ React.createElement("div", { className: "tmemb-row tmemb-foot" },
              /* @__PURE__ */ React.createElement("label", { className: "tmemb-vis" },
                /* @__PURE__ */ React.createElement("button", {
                  className: "lo-toggle" + (visible ? "" : " off"), type: "button",
                  role: "switch", "aria-checked": visible.toString(),
                  title: visible ? "Shown on leaderboard \u2014 click to hide" : "Hidden from leaderboard \u2014 click to show",
                  onClick: () => upd("lbVisible", !visible)
                }, /* @__PURE__ */ React.createElement("span", { className: "lo-knob" })),
                /* @__PURE__ */ React.createElement("span", { className: "tmemb-vis-lbl" }, visible ? "Shown on leaderboard" : "Hidden from leaderboard")),
              /* @__PURE__ */ React.createElement("button", { className: "lndr-tx", title: "Remove member", onClick: () => { saveTeam(team.filter((x, j) => j !== i)); flash(); } }, "Remove")));
        }),
        /* @__PURE__ */ React.createElement("button", { className: "iconbtn", style: { marginTop: 4 }, onClick: () => { saveTeam([...(team || []), { firstName: "", lastName: "", role: "Loan Officer", nmls: "", cell: "", email: "", statesLicensed: [], stateResidence: "", birthMonth: "", birthDay: "", photo: "", lbVisible: true }]); flash(); } }, "+ Add team member"))) : null,
      // ===== DIRECTORY =====
      secTab === "directory" ? /* @__PURE__ */ React.createElement("div", null,
      /* ---- Buy Box tag manager ---- */
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Directory"), /* @__PURE__ */ React.createElement("h2", null, "Lender Tags"), /* @__PURE__ */ React.createElement("span", { className: "hint" }, "the filter tags shown on the Lender Directory")),
      /* @__PURE__ */ React.createElement("div", { className: "card pad" },
        /* @__PURE__ */ React.createElement("div", { className: "tagman" },
          (buyboxTags || []).map((t) => { const c = tagColor(t); return /* @__PURE__ */ React.createElement("span", { className: "tagchip", key: t, style: { background: c.bg, color: c.fg, borderColor: c.fg } }, t,
            /* @__PURE__ */ React.createElement("button", { title: "Remove tag", style: { color: c.fg }, onClick: () => { saveBuyboxTags((buyboxTags || []).filter((x) => x !== t)); flash(); } }, "\u00D7")); }),
          (!buyboxTags || !buyboxTags.length) ? /* @__PURE__ */ React.createElement("span", { className: "faint", style: { fontSize: 12 } }, "No tags yet.") : null),
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 8, marginTop: 8 } },
          /* @__PURE__ */ React.createElement("input", { className: "k", type: "text", placeholder: "Add a lender tag (e.g. Non-QM)", style: { maxWidth: 280 },
            onKeyDown: (e) => { if (e.key === "Enter") { const v = e.target.value.trim(); if (v && (buyboxTags || []).indexOf(v) === -1) { saveBuyboxTags([...(buyboxTags || []), v].sort((a, b) => a.localeCompare(b))); flash(); } e.target.value = ""; } } }),
          /* @__PURE__ */ React.createElement("span", { className: "hint", style: { alignSelf: "center" } }, "press Enter to add"))),
      /* ---- Lenders (one grouped card per lender) ---- */
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Directory"), /* @__PURE__ */ React.createElement("h2", null, "Lenders"), /* @__PURE__ */ React.createElement("span", { className: "hint" }, "all settings for each lender, grouped together")),
      /* @__PURE__ */ React.createElement("div", { className: "dir-search", style: { marginBottom: 14, maxWidth: 320 } },
        /* @__PURE__ */ React.createElement("span", { className: "dir-search-ic" }, "\u{1F50D}"),
        /* @__PURE__ */ React.createElement("input", { className: "dir-search-in", type: "text", placeholder: "Search lender or AE name\u2026", value: lenderSearch, onChange: (e) => setLenderSearch(e.target.value), style: { width: "100%" } }),
        lenderSearch ? /* @__PURE__ */ React.createElement("button", { className: "dir-search-x", type: "button", title: "Clear", onClick: () => setLenderSearch("") }, "\u00D7") : null),
      /* @__PURE__ */ React.createElement("div", null,
        (() => {
          const lq = lenderSearch.trim().toLowerCase();
          const shown = (lenders || []).map((l, i) => [l, i]).filter(([l]) => {
            if (!lq) return true;
            return String(l.lender || "").toLowerCase().indexOf(lq) !== -1 || String(l.ae || "").toLowerCase().indexOf(lq) !== -1;
          });
          if (!shown.length) return /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13, padding: "8px 2px" } }, lq ? "No lenders match \u201C" + lenderSearch + "\u201D." : "No lenders yet.");
          return shown.map(([l, i]) => {
          const upd = (field, val) => { const n = lenders.map((x, j) => j === i ? { ...x, [field]: val } : x); saveLenders(n); };
          const toggleBuy = (t) => { const has = (l.buyBox || []).indexOf(t) !== -1; const arr = has ? l.buyBox.filter((x) => x !== t) : [...(l.buyBox || []), t]; upd("buyBox", arr); };
          const field = (label, key, ph) => /* @__PURE__ */ React.createElement("div", { className: "fwrap" },
            /* @__PURE__ */ React.createElement("label", null, label),
            /* @__PURE__ */ React.createElement("input", { type: "text", value: l[key] || "", placeholder: ph || label, onChange: (e) => upd(key, e.target.value) }));
          return /* @__PURE__ */ React.createElement("div", { className: "lndr-card", key: i },
            // Header: name + tier + channel + remove
            /* @__PURE__ */ React.createElement("div", { className: "lndr-card-top" },
              /* @__PURE__ */ React.createElement("input", { className: "lndr-name", type: "text", value: l.lender, placeholder: "Lender name", onChange: (e) => upd("lender", e.target.value) }),
              /* @__PURE__ */ React.createElement("select", { value: String(l.tier), onChange: (e) => upd("tier", parseInt(e.target.value, 10)), style: { width: "auto", padding: "8px 10px", borderRadius: 9, border: "1px solid var(--line-strong)", background: "var(--surface)", color: "var(--text)", font: "inherit", fontSize: 13, fontWeight: 700 } },
                [1, 2, 3, 4].map((t) => /* @__PURE__ */ React.createElement("option", { key: t, value: String(t) }, "Tier " + t))),
              /* @__PURE__ */ React.createElement("button", { className: "lndr-tx", title: "Remove lender", onClick: () => { saveLenders(lenders.filter((x, j) => j !== i)); flash(); } }, "Remove")),
            // Grid of fields
            /* @__PURE__ */ React.createElement("div", { className: "lndr-grid" },
              /* @__PURE__ */ React.createElement("div", { className: "fwrap" },
                /* @__PURE__ */ React.createElement("label", null, "Channel"),
                /* @__PURE__ */ React.createElement("select", { value: l.channel, onChange: (e) => upd("channel", e.target.value) },
                  /* @__PURE__ */ React.createElement("option", { value: "Correspondent" }, "Correspondent"),
                  /* @__PURE__ */ React.createElement("option", { value: "Broker" }, "Broker"))),
              /* @__PURE__ */ React.createElement("div", { className: "fwrap" },
                /* @__PURE__ */ React.createElement("label", null, "Servicing"),
                /* @__PURE__ */ React.createElement("select", { value: l.servicing || "", onChange: (e) => upd("servicing", e.target.value) },
                  /* @__PURE__ */ React.createElement("option", { value: "" }, "\u2014"),
                  /* @__PURE__ */ React.createElement("option", { value: "Yes" }, "Yes"),
                  /* @__PURE__ */ React.createElement("option", { value: "No" }, "No"),
                  /* @__PURE__ */ React.createElement("option", { value: "Mixed" }, "Mixed"))),
              field("Account Executive", "ae"),
              field("AE Phone", "phone"),
              field("AE Email", "email"),
              /* @__PURE__ */ React.createElement("div", { className: "fwrap full" },
                /* @__PURE__ */ React.createElement("label", null, "EPO Policy"),
                /* @__PURE__ */ React.createElement("input", { type: "text", value: l.epoPolicy || "", placeholder: "e.g. 180 days; LO repays commission if loan pays off early", onChange: (e) => upd("epoPolicy", e.target.value) })),
              /* @__PURE__ */ React.createElement("div", { className: "fwrap full" },
                /* @__PURE__ */ React.createElement("label", null, "Portal URL"),
                /* @__PURE__ */ React.createElement("input", { type: "text", value: l.portal || "", placeholder: "https://\u2026", onChange: (e) => upd("portal", e.target.value) })),
              /* @__PURE__ */ React.createElement("div", { className: "fwrap full" },
                /* @__PURE__ */ React.createElement("label", null, "Notes"),
                /* @__PURE__ */ React.createElement("input", { type: "text", value: l.notes || "", placeholder: "Notes", onChange: (e) => upd("notes", e.target.value) })),
              /* @__PURE__ */ React.createElement("div", { className: "fwrap full" },
                /* @__PURE__ */ React.createElement("label", null, "Disclaimers"),
                /* @__PURE__ */ React.createElement("input", { type: "text", value: l.disclaimers || "", placeholder: "e.g. Construction - OTC, Reno; 2nds - HELOC only", onChange: (e) => upd("disclaimers", e.target.value) })),
              // Buy Box: click tags from the master list to add/remove
              /* @__PURE__ */ React.createElement("div", { className: "fwrap full" },
                /* @__PURE__ */ React.createElement("label", null, "Lender Tags \u2014 click to add/remove"),
                /* @__PURE__ */ React.createElement("div", { className: "lndr-tagsel" },
                  (buyboxTags || []).map((t) => { const on = (l.buyBox || []).indexOf(t) !== -1; const c = tagColor(t); return /* @__PURE__ */ React.createElement("button", {
                    key: t, className: "seltag", type: "button", onClick: () => toggleBuy(t),
                    style: on ? { background: c.bg, color: c.fg, borderColor: c.fg } : null
                  }, (on ? "\u2713 " : "") + t); }),
                  (!buyboxTags || !buyboxTags.length) ? /* @__PURE__ */ React.createElement("span", { className: "faint", style: { fontSize: 11 } }, "Add tags above first.") : null))));
          });
        })(),
        /* @__PURE__ */ React.createElement("button", { className: "iconbtn", style: { marginTop: 4 }, onClick: () => { saveLenders([...(lenders || []), { tier: 1, lender: "New Lender", channel: "Correspondent", portal: "", ae: "", phone: "", email: "", buyBox: [], notes: "", servicing: "", epoPolicy: "", disclaimers: "" }]); flash(); } }, "+ Add lender"))) : null,
      // ===== MONTHLY COMPETITION =====
      secTab === "competition" ? /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { className: "sec-h" }, /* @__PURE__ */ React.createElement("span", { className: "eyebrow" }, "Competition"), /* @__PURE__ */ React.createElement("h2", null, "Monthly Competition")),
      /* @__PURE__ */ React.createElement("div", { className: "card pad" },
        /* @__PURE__ */ React.createElement("div", { style: { display: "flex", gap: 14, flexWrap: "wrap" } },
          /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 200px" } },
            /* @__PURE__ */ React.createElement("label", { className: "fld" }, "Competition name"),
            /* @__PURE__ */ React.createElement("input", { className: "k", type: "text", value: competition.name, placeholder: "e.g. March Madness", onChange: (e) => saveComp({ ...competition, name: e.target.value }) })),
          /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 200px" } },
            /* @__PURE__ */ React.createElement("label", { className: "fld" }, "Ranked by"),
            /* @__PURE__ */ React.createElement("select", { className: "k", value: competition.metric, onChange: (e) => saveComp({ ...competition, metric: e.target.value }) },
              /* @__PURE__ */ React.createElement("option", { value: "volume" }, "Funded volume"),
              /* @__PURE__ */ React.createElement("option", { value: "units" }, "Units funded"),
              /* @__PURE__ */ React.createElement("option", { value: "reviews" }, "5-star reviews"),
              /* @__PURE__ */ React.createElement("option", { value: "newApps" }, "New applications"),
              /* @__PURE__ */ React.createElement("option", { value: "newPreapps" }, "New preapprovals"),
              (competition.customCats || []).map((c, i) => /* @__PURE__ */ React.createElement("option", { key: i, value: "custom:" + c.name }, c.name + " (custom)")))),
          /* @__PURE__ */ React.createElement("div", { style: { flex: "1 1 200px" } },
            /* @__PURE__ */ React.createElement("label", { className: "fld" }, "Prize"),
            /* @__PURE__ */ React.createElement("input", { className: "k", type: "text", value: competition.prize, placeholder: "e.g. $500 + trophy", onChange: (e) => saveComp({ ...competition, prize: e.target.value }) }))),
        /* @__PURE__ */ React.createElement("div", { style: { marginTop: 14 } },
          /* @__PURE__ */ React.createElement("button", { className: "iconbtn", onClick: () => {
            const name = window.prompt("Name this custom competition category (e.g. 'Purchase units', 'VA loans'):");
            if (!name) return;
            const desc = window.prompt("Describe how the winner should be determined (free text \u2014 used as the label):", name) || name;
            const next = { ...competition, customCats: [...(competition.customCats || []), { name, desc }], metric: "custom:" + name };
            saveComp(next);
          } }, "+ Add custom category")),
        (competition.customCats || []).length ? /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, marginTop: 10 } }, "Custom categories: ", (competition.customCats || []).map((c) => c.name).join(", "), ". Note: custom categories display as the competition label; leaders are ranked by funded volume unless one of the built-in metrics is selected.") : null)) : null,
      // ===== COMPANY ANALYTICS =====
      secTab === "analytics" ? /* @__PURE__ */ React.createElement("div", { style: { marginTop: 8 } }, /* @__PURE__ */ React.createElement(Analytics, { rows, period })) : null);
  }
  const PERIODS = [["lastmonth", "Last Month"], ["month", "This Month"], ["quarter", "This Quarter"], ["ytd", "YTD"], ["lastyear", "Last Year"]];
  function App() {
    const [cfg, setCfg] = useState({ scriptUrl: DEFAULT_SCRIPT_URL, apiKey: "", intervalMin: DEFAULT_REFRESH_MIN });
    const [rows, setRows] = useState(() => {
      // Paint the last known data instantly (dates rehydrated), so the page
      // isn't blank/mock while the live pull resolves. Falls back to demo data.
      try {
        const raw = localStorage.getItem("moxie:lastData");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (parsed && parsed.rows && parsed.rows.length) {
            const D = (v) => v ? new Date(v) : null;
            return parsed.rows.map((r) => ({
              ...r,
              created: D(r.created), applied: D(r.applied), closed: D(r.closed),
              reviewDate: D(r.reviewDate), reviewEffDate: D(r.reviewEffDate)
            }));
          }
        }
      } catch (e) {}
      return mockData();
    });
    const [source, setSource] = useState(() => {
      try { return localStorage.getItem("moxie:lastData") ? "cache" : "mock"; } catch (e) { return "mock"; }
    });
    const [status, setStatus] = useState("idle");
    const [errMsg, setErrMsg] = useState("");
    const [lastSync, setLastSync] = useState(/* @__PURE__ */ new Date());
    const [period, setPeriod] = useState("month");
    const [tab, setTab] = useState("leaderboard");
    const [metric, setMetric] = useState("volume");
    const [tv, setTv] = useState(false);
    const [showCfg, setShowCfg] = useState(false);
    const [cfgAuthed, setCfgAuthed] = useState(false);
    const [cfgPass, setCfgPass] = useState("");
    const [cfgErr, setCfgErr] = useState(false);
    const [toast, setToast] = useState(null);
    const [goals, setGoals] = useState({ vol: 4e6, units: 10, reviews: 16 });
    const [officerGoals, setOfficerGoals] = useState({ vol: 15e5, units: 3, reviews: 2 });
    const [photos, setPhotos] = useState({});
    // Loan officers hidden from the dashboard (admin-controlled). Keyed by
    // lowercased name -> true. Mirrored into the module store HIDDEN_OFFICERS.
    const [hiddenOfficers, setHiddenOfficers] = useState({});
    // LO -> email map (keyed by lowercased name) for the weekly Pipeline IQ email.
    const [officerEmails, setOfficerEmails] = useState({});
    // Lender Directory data + Buy Box master tag list (admin-editable).
    const [lenders, setLenders] = useState(LENDER_SEED);
    const [buyboxTags, setBuyboxTags] = useState(BUYBOX_SEED);
    // Moxie team directory (internal) — the MASTER ROSTER. Each member:
    // {firstName,lastName,role,nmls,cell,email,statesLicensed[],stateResidence,
    //  birthMonth,birthDay,photo,lbVisible}. Written by the onboarding Zap;
    // headshots assigned manually here. This single roster now drives the
    // leaderboard's photos, visibility, and Pipeline IQ emails (front-end
    // leaderboard/email code is unchanged — it just reads these derived stores).
    const [team, setTeam] = useState([]);
    const teamName = (t) => ((t.firstName || "") + " " + (t.lastName || "")).trim();
    const teamKey = (t) => teamName(t).toLowerCase();
    // Derived from the team roster (a member is keyed by lowercased full name):
    //  - emails for Pipeline IQ (kept in officerEmails config so the .gs engine works)
    //  - hidden = lbVisible === false
    //  - photo = member.photo
    //  - name presence so zero-production roster members still show
    const teamEmails = {};
    (team || []).forEach((t) => { const k = teamKey(t); if (k && t.email) teamEmails[k] = String(t.email).trim(); });
    // Sync synchronously during render so leaderboard()/OFFICERS_present() (which
    // read the module store) reflect the current roster immediately.
    // ROSTER_KEYS = every team member (the gate for who can appear anywhere).
    Object.keys(ROSTER_KEYS).forEach((k) => delete ROSTER_KEYS[k]);
    (team || []).forEach((t) => { const k = teamKey(t); if (k) ROSTER_KEYS[k] = true; });
    Object.keys(HIDDEN_OFFICERS).forEach((k) => delete HIDDEN_OFFICERS[k]);
    Object.entries(hiddenOfficers).forEach(([k, v]) => { if (v) HIDDEN_OFFICERS[k] = true; });
    (team || []).forEach((t) => { const k = teamKey(t); if (k && t.lbVisible === false) HIDDEN_OFFICERS[k] = true; });
    const hiddenKey = Object.keys(HIDDEN_OFFICERS).sort().join("|") +
      "##" + Object.keys(teamEmails).sort().join("|") +
      "##" + (team || []).map((t) => teamKey(t) + ":" + (t.photo ? "p" : "") + (t.lbVisible === false ? "h" : "")).sort().join("|");
    // Mirror roster names into the module store so the leaderboard roster
    // includes every onboarded LO, even at zero production.
    Object.keys(OFFICER_NAMES).forEach((k) => delete OFFICER_NAMES[k]);
    Object.keys(officerEmails || {}).forEach((k) => { OFFICER_NAMES[k] = k.replace(/\b\w/g, (c) => c.toUpperCase()); });
    (team || []).forEach((t) => { const k = teamKey(t); if (k) OFFICER_NAMES[k] = teamName(t); });
    // Mirror headshots into the module store so every Avatar sees them. The team
    // roster is the single headshot source: each member's photo URL is published
    // under their name key. (Runs after team is declared to avoid a TDZ error.)
    useEffect(() => {
      Object.keys(PHOTOS).forEach((k) => delete PHOTOS[k]);
      (team || []).forEach((t) => {
        const k = ((t.firstName || "") + " " + (t.lastName || "")).trim().toLowerCase();
        if (k && t.photo) PHOTOS[k] = t.photo;
      });
    }, [team]);
    const [weights, setWeights] = useState({ vol: 10, units: 25, reviews: 15, bps: 0.5 });
    // Monthly sales competition. metric is one of the LB metrics or a custom
    // category. customCats lets admin define extra named metrics via a prompt.
    const [competition, setCompetition] = useState({
      name: "Monthly Competition",
      metric: "volume",
      prize: "",
      customCats: []
    });
    const [adminAuthed, setAdminAuthed] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false);
    const cacheRef = useRef(null);
    const recordRef = useRef(0);
    const adminDirtyRef = useRef(false);
    const [photoErr, setPhotoErr] = useState("");
    // Persist admin-set settings + headshots across sessions via durable storage.
    useEffect(() => {
      (async () => {
        try {
          const r = await STORE.get("moxie:settings");
          if (r && r.value) {
            const s = JSON.parse(r.value);
            if (s.goals) setGoals((g) => ({ ...g, ...s.goals }));
            if (s.officerGoals) setOfficerGoals(s.officerGoals);
            if (s.weights) setWeights((w) => ({ ...w, ...s.weights }));
            if (s.competition) setCompetition((c) => ({ ...c, ...s.competition }));
            if (s.hiddenOfficers) setHiddenOfficers(s.hiddenOfficers);
            if (s.officerEmails) setOfficerEmails(s.officerEmails);
            if (s.lenders && Array.isArray(s.lenders) && s.lenders.length) setLenders((s.lenderSeedVersion || 0) >= LENDER_SEED_VERSION ? reconcileLenders(s.lenders) : mergeLenders(s.lenders, LENDER_SEED));
            if (s.buyboxTags && Array.isArray(s.buyboxTags)) setBuyboxTags(reconcileTags(s.buyboxTags));
            if (s.team && Array.isArray(s.team)) setTeam(s.team);
          }
          // Photos live under their own key (they can be large).
          // Old file-based leaderboard photos are retired; the team roster's
          // headshot URL is now the single source. Intentionally not hydrated.
          // const p = await STORE.get("moxie:photos");
          // if (p && p.value) setPhotos(JSON.parse(p.value));
        } catch (e) {
        }
        setSettingsLoaded(true);
      })();
    }, []);
    const savePhotos = useCallback(async (next) => {
      setPhotos(next);
      adminDirtyRef.current = true;
      let localOk = true;
      try { await STORE.set("moxie:photos", JSON.stringify(next)); }
      catch (e) { localOk = false; }
      // Share across all viewers via the sheet.
      try {
        await postConfig(cfg.scriptUrl, ADMIN_PASSCODE, "photos", next);
        setPhotoErr("");
      } catch (e) {
        setPhotoErr(localOk
          ? "Saved on this device, but couldn't sync to the team: " + e.message
          : "Couldn't save headshots \u2014 storage full and team sync failed.");
      }
    }, [cfg.scriptUrl]);
    const saveSettings = useCallback(async (next) => {
      const payload = {
        goals: next.goals || goals,
        officerGoals: next.officerGoals || officerGoals,
        weights: next.weights || weights,
        competition: next.competition || competition,
        hiddenOfficers: next.hiddenOfficers || hiddenOfficers,
        officerEmails: next.officerEmails || officerEmails,
        lenders: next.lenders || lenders,
        lenderSeedVersion: LENDER_SEED_VERSION,
        buyboxTags: next.buyboxTags || buyboxTags,
        team: next.team || team
      };
      adminDirtyRef.current = true;
      try { await STORE.set("moxie:settings", JSON.stringify(payload)); } catch (e) {}
      // Share across all viewers via the sheet.
      try { await postConfig(cfg.scriptUrl, ADMIN_PASSCODE, "settings", payload); } catch (e) {}
    }, [goals, officerGoals, weights, competition, hiddenOfficers, officerEmails, lenders, buyboxTags, cfg.scriptUrl]);
    const saveHidden = useCallback((next) => {
      setHiddenOfficers(next);
      saveSettings({ hiddenOfficers: next });
    }, [saveSettings]);
    const saveEmails = useCallback((next) => {
      setOfficerEmails(next);
      saveSettings({ officerEmails: next });
    }, [saveSettings]);
    const saveLenders = useCallback((next) => {
      setLenders(next);
      saveSettings({ lenders: next });
    }, [saveSettings]);
    const saveBuyboxTags = useCallback((next) => {
      setBuyboxTags(next);
      saveSettings({ buyboxTags: next });
    }, [saveSettings]);
    const saveTeam = useCallback((next) => {
      setTeam(next);
      // Derive the Pipeline IQ email map from the roster so the email engine
      // (which reads officerEmails from config) keeps working off one source.
      const derivedEmails = {};
      (next || []).forEach((t) => {
        const k = ((t.firstName || "") + " " + (t.lastName || "")).trim().toLowerCase();
        if (k && t.email) derivedEmails[k] = String(t.email).trim();
      });
      setOfficerEmails(derivedEmails);
      saveSettings({ team: next, officerEmails: derivedEmails });
    }, [saveSettings]);
    const load = useCallback(async (manual) => {
      if (!cfg.scriptUrl && !cfg.apiKey) {
        setSource("mock");
        setStatus("idle");
        return;
      }
      setStatus("loading");
      try {
        const data = await fetchSheet(cfg);
        if (!data.length) throw new Error("empty");
        setRows(data);
        setSource("live");
        setStatus("ok");
        setLastSync(/* @__PURE__ */ new Date());
        cacheRef.current = { data, at: Date.now() };
        // Stash a copy so the next page load can paint instantly while the
        // fresh pull resolves. Wrapped in try/catch (may exceed quota).
        try { localStorage.setItem("moxie:lastData", JSON.stringify({ at: Date.now(), rows: data })); } catch (e) {}
        // Apply shared settings + headshots from the feed (same for everyone).
        if (LAST_CONFIG) {
          const cfgData = LAST_CONFIG;
          if (cfgData.settings && !adminDirtyRef.current) {
            const s = cfgData.settings;
            if (s.goals) setGoals((g) => ({ ...g, ...s.goals }));
            if (s.officerGoals) setOfficerGoals(s.officerGoals);
            if (s.weights) setWeights((w) => ({ ...w, ...s.weights }));
            if (s.competition) setCompetition((c) => ({ ...c, ...s.competition }));
            if (s.hiddenOfficers) setHiddenOfficers(s.hiddenOfficers);
            if (s.officerEmails) setOfficerEmails(s.officerEmails);
            if (s.lenders && Array.isArray(s.lenders) && s.lenders.length) setLenders((s.lenderSeedVersion || 0) >= LENDER_SEED_VERSION ? reconcileLenders(s.lenders) : mergeLenders(s.lenders, LENDER_SEED));
            if (s.team && Array.isArray(s.team)) setTeam(s.team);
            if (s.buyboxTags && Array.isArray(s.buyboxTags)) setBuyboxTags(reconcileTags(s.buyboxTags));
          }
          // Retired: old shared leaderboard photos (team roster drives headshots now).
          // if (cfgData.photos && !adminDirtyRef.current) setPhotos(cfgData.photos);
        }
        const allTimeVol = data.filter(isFunded).reduce((a, r) => a + r.loanAmountNum, 0);
        if (recordRef.current && allTimeVol > recordRef.current) {
          setToast({ t: "New company record!", s: fmtMoneyShort(allTimeVol) + " all-time funded volume" });
          setTimeout(() => setToast(null), 5200);
        }
        recordRef.current = allTimeVol;
        setErrMsg("");
      } catch (e) {
        if (cacheRef.current) {
          setRows(cacheRef.current.data);
          setSource("cache");
        }
        setStatus("error");
        setErrMsg(e && e.message ? e.message : "Unknown error reaching the data source.");
      }
    }, [cfg]);
    useEffect(() => {
      load(false);
      const ms = Math.max(1, cfg.intervalMin) * 6e4;
      const id = setInterval(() => load(false), ms);
      return () => clearInterval(id);
    }, [load, cfg.intervalMin]);
    useEffect(() => {
      document.body.classList.toggle("tv", tv);
      if (tv) {
        setAdminAuthed(false);
        setCfgAuthed(false);
        setShowCfg(false);
        setTab((t) => t === "admin" ? "leaderboard" : t);
      }
    }, [tv]);
    const dot = status === "error" ? "err" : source === "cache" ? "stale" : source === "mock" ? "stale" : "";
    const srcLabel = source === "live" ? "Live" : source === "cache" ? "Cached" : "Demo data";
    const dataConnEl = /* @__PURE__ */ React.createElement("div", { className: "card pad" }, /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13, margin: "0 0 4px" } }, "Reading ", /* @__PURE__ */ React.createElement("code", null, TAB_NAME, "!", READ_RANGE), " only \u2014 plus REVIEW / REVIEW YEAR / BPS by name. No other income or PII fields (AA\u2013BF) are fetched, stored, or displayed."), /* @__PURE__ */ React.createElement("label", { className: "fld" }, "Apps Script web app URL (private sheet \u2014 recommended)"), /* @__PURE__ */ React.createElement("input", { className: "k", type: "text", placeholder: "https://script.google.com/macros/s/\u2026/exec", value: cfg.scriptUrl, onChange: (e) => setCfg((c) => ({ ...c, scriptUrl: e.target.value.trim() })) }), /* @__PURE__ */ React.createElement("label", { className: "fld" }, "\u2014 or \u2014 Google Sheets API key (link-shared sheet)"), /* @__PURE__ */ React.createElement("input", { className: "k", type: "password", placeholder: "Paste API key to go live\u2026", value: cfg.apiKey, onChange: (e) => setCfg((c) => ({ ...c, apiKey: e.target.value })) }), /* @__PURE__ */ React.createElement("label", { className: "fld" }, "Auto-refresh interval (minutes)"), /* @__PURE__ */ React.createElement("input", { className: "k", type: "number", min: "1", value: cfg.intervalMin, onChange: (e) => setCfg((c) => ({ ...c, intervalMin: +e.target.value || 15 })) }), status === "error" && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 10, padding: "10px 12px", borderRadius: 10, color: "var(--rose)", border: "1px solid rgba(255,107,129,.4)", background: "rgba(255,107,129,.07)", fontSize: 13, lineHeight: 1.5 } }, /* @__PURE__ */ React.createElement("b", null, "Connection failed \u2014 showing last cached pull."), /* @__PURE__ */ React.createElement("br", null), errMsg || "Check the URL and the deployment's access settings."), source === "mock" && /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 12, marginTop: 10 } }, "Demo data shown. Add your Apps Script web app URL above to connect the live, private Loan Pipeline tab."));
    const settingsPanel = showCfg && !cfgAuthed ? /* @__PURE__ */ React.createElement("div", { className: "card pad", style: { marginTop: 18, maxWidth: 420 } }, /* @__PURE__ */ React.createElement("b", null, "\u{1F512} Settings locked"), /* @__PURE__ */ React.createElement("div", { className: "muted", style: { fontSize: 13, margin: "6px 0 10px" } }, "Enter the passcode to open settings and admin."), /* @__PURE__ */ React.createElement("input", { className: "k", type: "password", placeholder: "Passcode", value: cfgPass, autoFocus: true, onChange: (e) => { setCfgPass(e.target.value); setCfgErr(false); }, onKeyDown: (e) => { if (e.key === "Enter") { if (cfgPass === ADMIN_PASSCODE) { setCfgAuthed(true); setAdminAuthed(true); setCfgErr(false); } else setCfgErr(true); } } }), cfgErr && /* @__PURE__ */ React.createElement("div", { className: "badge", style: { marginTop: 10, color: "var(--rose)", borderColor: "rgba(255,107,129,.4)" } }, "Incorrect passcode"), /* @__PURE__ */ React.createElement("button", { className: "iconbtn", style: { marginTop: 14 }, onClick: () => { if (cfgPass === ADMIN_PASSCODE) { setCfgAuthed(true); setAdminAuthed(true); setCfgErr(false); } else setCfgErr(true); } }, "Unlock")) : showCfg && cfgAuthed ? /* @__PURE__ */ React.createElement("div", null,
      /* @__PURE__ */ React.createElement("div", { style: { display: "flex", alignItems: "center", marginTop: 18, marginBottom: 4 } }, /* @__PURE__ */ React.createElement("button", { className: "iconbtn", style: { marginLeft: "auto" }, onClick: () => { setShowCfg(false); } }, "Close settings")),
      /* @__PURE__ */ React.createElement(AdminPanel, { rows, period, authed: adminAuthed, setAuthed: setAdminAuthed, goals, setGoals, officerGoals, setOfficerGoals, weights, setWeights, competition, setCompetition, photos, savePhotos, photoErr, hiddenOfficers, saveHidden, officerEmails, saveEmails, saveSettings, lenders, saveLenders, buyboxTags, saveBuyboxTags, team, saveTeam, dataConnection: dataConnEl })) : null;
    return /* @__PURE__ */ React.createElement("div", { className: "wrap" },
      /* @__PURE__ */ React.createElement("div", { className: "topbar" },
        /* @__PURE__ */ React.createElement("div", { className: "brand" }, /* @__PURE__ */ React.createElement("img", { className: "brand-logo", src: LOGO_URI, alt: "Moxie" }), /* @__PURE__ */ React.createElement("div", { className: "divider" }), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("small", null, "Funding Floor"))),
        /* @__PURE__ */ React.createElement("div", { className: "spacer" }),
        /* @__PURE__ */ React.createElement("div", { className: "seg" }, PERIODS.map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, "aria-pressed": period === k, onClick: () => setPeriod(k) }, l))),
        /* @__PURE__ */ React.createElement("button", { className: "iconbtn " + (source === "live" ? "live" : ""), onClick: () => load(true), title: "Refresh now" }, /* @__PURE__ */ React.createElement("span", { className: "dot " + dot }), " ", srcLabel),
        /* @__PURE__ */ React.createElement("div", { className: "lastsync" }, "Last sync ", lastSync.toLocaleTimeString())),
      !tv && !showCfg && /* @__PURE__ */ React.createElement("div", { className: "tabs" }, [["leaderboard", "Leaderboards"], ["game", "Goals"], ["directory", "Directory"], ["ainsight", "__AINSIGHT__"]].map(([k, l]) => /* @__PURE__ */ React.createElement("button", { key: k, "aria-pressed": tab === k, onClick: () => setTab(k) }, l === "__AINSIGHT__" ? /* @__PURE__ */ React.createElement("span", { className: "ainsight-label" }, /* @__PURE__ */ React.createElement("b", null, "AI"), /* @__PURE__ */ React.createElement("i", null, "nsight")) : l))),
      showCfg ? settingsPanel : tab === "ainsight" ? /* @__PURE__ */ React.createElement(AInsight, null) : tab === "directory" ? /* @__PURE__ */ React.createElement(Directory, { lenders, buyboxTags, rows, team }) : rows.length === 0 ? /* @__PURE__ */ React.createElement("div", { className: "card empty" }, "No loan data available.") : tab === "leaderboard" ? /* @__PURE__ */ React.createElement(Leaderboard, { rows, period, metric, setMetric, competition, hiddenKey }) : /* @__PURE__ */ React.createElement(Gamification, { rows, period, goals, setGoals, officerGoals, weights, setWeights, hiddenKey }),
      tv && /* @__PURE__ */ React.createElement("div", { style: { marginTop: 18 } }, /* @__PURE__ */ React.createElement(Leaderboard, { rows, period, metric, setMetric, competition, hiddenKey })),
      /* @__PURE__ */ React.createElement("div", { className: "foot" },
        /* @__PURE__ */ React.createElement("div", { className: "foot-actions" },
          /* @__PURE__ */ React.createElement("button", { className: "iconbtn", onClick: () => setTv((v) => !v) }, tv ? "Exit TV Mode" : "TV Mode"),
          !tv && /* @__PURE__ */ React.createElement("button", { className: "iconbtn cfgbtn", onClick: () => { setCfgErr(false); setShowCfg((s) => !s); } }, showCfg ? "Close Settings" : "\u2699 Settings & Admin")),
        !tv && /* @__PURE__ */ React.createElement("div", { className: "foot-meta" }, "Moxie Funding Floor \xB7 reads ", /* @__PURE__ */ React.createElement("code", null, READ_RANGE), " + REVIEW / REVIEW YEAR / BPS by name only.")),
      /* @__PURE__ */ React.createElement("div", { className: "toast " + (toast ? "show" : "") }, toast && /* @__PURE__ */ React.createElement(React.Fragment, null, /* @__PURE__ */ React.createElement("span", { className: "t-ic" }, "\u{1F389}"), /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("b", null, toast.t), /* @__PURE__ */ React.createElement("small", null, toast.s)))));
  }
  try {
    ReactDOM.createRoot(document.getElementById("root")).render(/* @__PURE__ */ React.createElement(App, null));
  } catch (err) {
    document.getElementById("root").innerHTML = '<div style="padding:30px;font-family:sans-serif;color:#161A22"><h2>Dashboard failed to start</h2><pre style="white-space:pre-wrap;color:#FF6B81">' + (err && err.stack ? err.stack : err) + "</pre></div>";
  }
})();
  }catch(err){
    document.getElementById("root").innerHTML=
      '<div style="padding:30px;font-family:sans-serif;color:#161A22">'+
      '<h2>Dashboard failed to start</h2><pre style="white-space:pre-wrap;color:#FF6B81">'+
      (err && err.stack ? err.stack : err)+'</pre></div>';
  }
});