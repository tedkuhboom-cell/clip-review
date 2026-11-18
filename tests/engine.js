// Loads pure functions out of index.html so they can be tested in Node without a browser.
// The engine is one inline script; sections are marked "// ===================== name =====================".
const fs = require("fs");
const path = require("path");
const HTML = fs.readFileSync(path.join(__dirname, "..", "index.html"), "utf8").replace(/\r\n/g, "\n");

function section(name) {
  const start = HTML.indexOf("// ===================== " + name + " =====================");
  if (start < 0) throw new Error("Section not found in index.html: " + name);
  const end = HTML.indexOf("// =====================", start + 30);
  return HTML.slice(start, end < 0 ? undefined : end);
}

// key-point grader: gnorm, lev1, stemHit, altHit, gradeAnswer, depthHits
function loadGrader() {
  return new Function(section("key-point grader") + "\nreturn {gnorm:gnorm, altHit:altHit, gradeAnswer:gradeAnswer, depthHits:depthHits};")();
}

// FSRS scheduler: schedule(rev, grade, today, full). It reads the retention target and date helpers from the engine.
function loadScheduler(retention) {
  const src = section("MANUAL");
  const from = src.indexOf("var FW="), to = src.indexOf("function previewGap");
  const helpers = "function pad(n){ return (n<10?'0':'')+n; }\n" +
    "function addDays(s,n){ var q=s.split('-'), d=new Date(Date.UTC(+q[0],+q[1]-1,+q[2]+n)); return d.getUTCFullYear()+'-'+pad(d.getUTCMonth()+1)+'-'+pad(d.getUTCDate()); }\n" +
    "var S={profile:{retention:" + (retention || 0.9) + "}};\n";
  return new Function(helpers + src.slice(from, to) + "\nreturn {schedule:schedule, fR:fR, fIvl:fIvl};")();
}

module.exports = { HTML, section, loadGrader, loadScheduler };

// recoil math: rcScore, rcGrade, rcHint, rcInterval, rcResample
module.exports.loadRecoil = function () {
  return new Function(section("recoil math") + "\nreturn {rcScore:rcScore, rcGrade:rcGrade, rcHint:rcHint, rcInterval:rcInterval, rcResample:rcResample};")();
};
