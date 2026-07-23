window.addEventListener("DOMContentLoaded", function(){
  setTimeout(function(){
    var root=document.getElementById("root");
    if(root && root.childNodes.length>0) return;
    var missing=[];
    if(typeof React==="undefined") missing.push("React");
    if(typeof ReactDOM==="undefined") missing.push("ReactDOM");
    if(typeof Recharts==="undefined") missing.push("Recharts (charts)");
    if(missing.length){
      root.innerHTML='<div style="max-width:640px;margin:60px auto;padding:28px;'+
        'font-family:system-ui,sans-serif;color:#161A22;background:#FFFFFF;'+
        'border:1px solid #E6E9EF;border-radius:16px;line-height:1.6;box-shadow:0 8px 24px -12px rgba(16,24,40,.14)">'+
        '<h2 style="margin-top:0">Couldn\u2019t load required libraries</h2>'+
        '<p style="color:#5A6473">This page loads React and Recharts from a CDN '+
        '(cdnjs / unpkg). Your browser or network blocked: <b>'+missing.join(", ")+'</b>.</p>'+
        '<p style="color:#5A6473">Fixes: open the file on a normal internet connection, '+
        'or allow scripts from cdnjs.cloudflare.com and unpkg.com.</p></div>';
    }
  }, 4000);
});