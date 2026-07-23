function loadScript(urls, cb){
  var i=0;
  (function next(){
    if(i>=urls.length){ cb && cb(new Error("all sources failed")); return; }
    var s=document.createElement("script");
    s.src=urls[i++];
    s.onload=function(){ cb && cb(null); };
    s.onerror=next;
    document.head.appendChild(s);
  })();
}
function loadOne(urls){ return new Promise(function(res){ loadScript(urls, function(){ res(); }); }); }

// ---- EARLY DATA PREFETCH ----------------------------------------------------
// Kick off the Apps Script JSONP call the instant the page parses, in PARALLEL
// with the library downloads below. By the time React mounts, the data is
// usually already here, so the dashboard paints live numbers almost immediately
// instead of waiting libraries-then-data in series.
window.__PREFETCH_URL = "https://script.google.com/macros/s/AKfycbz89TMG-Vjhnzz9zuHyhfS4pZ-nZ_fma7qN3s2iIE0NrRI-apkAmGmPan_pDo2fy8Rf/exec";
window.__prefetch = (function(){
  try {
    if (!window.__PREFETCH_URL) return null;
    return new Promise(function(resolve){
      var cbName = "__moxiePrefetch_" + Date.now();
      var done = false;
      window[cbName] = function(data){ done = true; resolve(data); try{ delete window[cbName]; }catch(e){} };
      var s = document.createElement("script");
      s.src = window.__PREFETCH_URL + "?callback=" + cbName + "&_=" + Date.now();
      s.onerror = function(){ if(!done){ resolve(null); } };
      document.head.appendChild(s);
      // safety timeout so a hung request can't block forever
      setTimeout(function(){ if(!done){ resolve(null); } }, 12000);
    });
  } catch(e){ return null; }
})();

// ---- LIBRARIES (parallelized) ----------------------------------------------
// React must arrive before ReactDOM/Recharts. react-is and prop-types are
// independent, so load them alongside React rather than in a long chain.
window.__libsReady = (function(){
  var react = loadOne([
    "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
    "https://unpkg.com/react@18.2.0/umd/react.production.min.js"
  ]);
  var reactIs = loadOne([
    "https://cdnjs.cloudflare.com/ajax/libs/react-is/18.2.0/umd/react-is.production.min.js",
    "https://unpkg.com/react-is@18.2.0/umd/react-is.production.min.js"
  ]);
  var propTypes = loadOne([
    "https://cdnjs.cloudflare.com/ajax/libs/prop-types/15.8.1/prop-types.min.js",
    "https://unpkg.com/prop-types@15.8.1/prop-types.min.js"
  ]);
  // ReactDOM depends on React; Recharts depends on React + react-is + prop-types.
  var reactDom = react.then(function(){ return loadOne([
    "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
    "https://unpkg.com/react-dom@18.2.0/umd/react-dom.production.min.js"
  ]); });
  var recharts = Promise.all([react, reactIs, propTypes, reactDom]).then(function(){ return loadOne([
    "https://cdnjs.cloudflare.com/ajax/libs/recharts/2.12.7/Recharts.min.js",
    "https://unpkg.com/recharts@2.12.7/umd/Recharts.min.js"
  ]); });
  return Promise.all([react, reactIs, propTypes, reactDom, recharts]).then(function(){});
})();
