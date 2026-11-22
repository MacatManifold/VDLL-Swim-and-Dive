if (!window.SEASON) {
function fmt(d) {
  return d.toLocaleDateString('en-US',{month:'short',day:'numeric'});
}
function monOf(wk) { // week 1 = Feb 8 2027 (first allowable practice date)
  const d = new Date(2027,1,8);
  d.setDate(d.getDate() + (wk-1)*7);
  return d;
}
function weekDates(mon) {
  return [0,1,2,3,4].map(i=>{ const d=new Date(mon); d.setDate(d.getDate()+i); return fmt(d); });
}

const DAYS = ['MON','TUE','WED','THU','FRI'];

// type → CSS class
const TYPE_CLASS = {
  tryout:'c-tryout', tech:'c-tech', build:'c-build', refine:'c-refine',
  taper:'c-taper', ff:'c-ff', meet:'c-meet', champs:'c-champs',
  bprac:'c-bprac', bye:'c-bye', off:'c-off',
  secprac:'c-secprac', sections:'c-sections', state:'c-state', banquet:'c-banquet',
};

const PHASE_CLASS = {
  tryout:'ph-tryout', tech:'ph-tech', build:'ph-build',
  refine:'ph-refine', taper:'ph-taper', post:'ph-post',
};

const BAR_COLOR = {
  tryout:'#3a5a9a', tech:'#2255a8', build:'#1a9b5e',
  refine:'#d4691a', taper:'#c04a1a',
};

// ── WEEK DATA ────────────────────────────────────────────
// yardage: Mon–Fri (null = no practice or meet day)
// Fun Friday yardage: ~1000 (warmup) + small set ≈ 1400
const weeks = [
  // WEEK 1 — Feb 1–5 — Tryout + Technique
  { wk:1, phase:'tryout', badge:'Tryout / Technique', mon:monOf(1),
    yds:[2000,2100,2100,2200,1400],
    days:[
      {t:'tryout', title:'Tryout Day 1',        detail:'Timed 200 IM, kick evaluation, stroke observation',
        workout:{
          warmup:{distance:500, sets:['200 swim choice (smooth)','4×50 kick on board (any stroke) @ :15 rest','100 IM drill — 25 of each stroke']},
          mainSet:{distance:1300, sets:['1×200 IM TIMED — your placement swim, all out','200 easy between','4×100 kick (one of each stroke) @ 2:00','8×50 stroke observation (coach watches each) @ 1:00']},
          cooldown:{distance:200, sets:['200 easy swim choice — long & loose']},
          notes:'Bring a water bottle and goggles. Be on deck 10 min early. Don\'t worry about times — just show us your strokes!'
        }
      },
      {t:'tryout', title:'Tryout Day 2',        detail:'Sprint eval: 100 each stroke, relay audition',
        workout:{
          warmup:{distance:500, sets:['300 swim','4×50 build by 25 @ 1:00']},
          mainSet:{distance:1300, sets:['1×100 fly all out @ 4:00','1×100 back all out @ 4:00','1×100 breast all out @ 4:00','1×100 free all out @ 3:00','Relay audition: 4×50 free FROM A DIVE @ 2:00','200 easy between rounds']},
          cooldown:{distance:300, sets:['300 easy — alternate 25 back / 25 free']},
          notes:'Practice your dives in the warmup. Sprint days are about effort — leave nothing in the tank.'
        }
      },
      {t:'tryout', title:'Tryout Day 3',        detail:'Distance eval: 500 free, endurance threshold set',
        workout:{
          warmup:{distance:500, sets:['200 swim','100 IM drill','4×50 kick @ :15 rest']},
          mainSet:{distance:1400, sets:['1×500 free TIMED — pace yourself!','5 min easy walk-around','6×100 free @ 1:40 — hold a strong, even pace','100 easy between']},
          cooldown:{distance:200, sets:['200 easy backstroke / free mix']},
          notes:'The 500 is a pace test. Don\'t blast the first 100 — find a rhythm you can hold for the whole swim.'
        }
      },
      {t:'tryout', title:'Tryout Day 4 — Cuts', detail:'Final assessment, IM & event assignments, roster posted',
        workout:{
          warmup:{distance:500, sets:['300 swim','4×50 IM drill @ 1:00']},
          mainSet:{distance:1500, sets:['4×50 dive starts (one of each stroke) @ 1:30','1×200 of YOUR top event at race pace @ 4:00','8×100 mixed stroke at moderate effort @ 1:45','4×50 turn practice (open & flip) @ 1:00']},
          cooldown:{distance:200, sets:['200 easy swim — shake it out']},
          notes:'Roster will be posted today after practice. Whatever happens, keep your head up — we\'re proud of every one of you for showing up. 🦅'
        }
      },
      {t:'ff',     title:'🎉 Fun Friday',       detail:'Meet warmup 1000 · quick kick set · welcome team relay',
        workout:{
          warmup:{distance:1000, sets:['400 swim — long & loose','200 kick (board)','4×50 drill @ 1:00','4×25 build @ :45']},
          mainSet:{distance:400, sets:['Welcome team relay! 4×50 free, mixed teams','Best 3 of 5 races wins bragging rights']},
          notes:'Wear team colors if you have them. Bring a friend who\'s curious about swim — first Friday is open invite. Pizza after at the picnic tables! 🍕'
        }
      },
    ]},

  // WEEK 2 — Feb 15–19 — Technique  (Presidents' Day Feb 15 = no practice)
  { wk:2, phase:'tech', badge:'Technique Phase', mon:monOf(2),
    yds:[null,2600,2700,2700,1400],
    days:[
      {t:'off',  title:"Presidents' Day",    detail:'No practice — school holiday'},
      {t:'tech', title:'Butterfly Focus',    detail:'Two-kick cycle, undulation, breathing pattern'},
      {t:'tech', title:'IM Transitions',     detail:'Legal turns by stroke, IM order, combo sets'},
      {t:'tech', title:'Starts & Exchanges', detail:'Block starts, flip & touch turns, relay handoffs'},
      {t:'ff',   title:'🎉 Fun Friday',      detail:'Meet warmup 1000 · stroke drill circuit · blind swim game'},
    ]},

  // WEEK 3 — Feb 22–26 — Technique (full week)
  { wk:3, phase:'tech', badge:'Technique Phase', mon:monOf(3),
    yds:[2400,2500,2500,2500,1400],
    days:[
      {t:'tech', title:'Body Position',     detail:'Streamline, balance drills, kick board sets',
        workout:{
          warmup:{distance:600, sets:['200 swim choice','200 kick (50 board / 50 streamline alternate)','4×50 IM by 25 — drill / swim @ 1:00']},
          mainSet:{distance:1500, sets:['8×50 streamline kick OFF THE WALL — count strokes! @ 1:00','4×100 catch-up free @ 1:45 — focus: high hips','6×75 (25 drill / 25 swim / 25 build) @ 1:30','4×50 balance kick on side @ 1:15 — eyes down']},
          cooldown:{distance:300, sets:['300 easy free — breathe every 5']},
          notes:'Today is all about how you SIT in the water. Smaller splash, longer body, no bobbing. Imagine a string pulling your head forward.'
        }
      },
      {t:'tech', title:'Freestyle Catch',   detail:'Early vertical forearm, catch-up drill, EVF paddles',
        workout:{
          warmup:{distance:600, sets:['300 swim','200 kick','4×25 build @ :40']},
          mainSet:{distance:1600, sets:['8×50 catch-up free @ 1:00 — pause at full extension','6×100 EVF drill / swim by 50 @ 1:45','4×50 fingertip drag @ 1:00','8×50 with paddles — focus: early catch @ 1:00']},
          cooldown:{distance:300, sets:['300 easy backstroke / free pattern']},
          notes:'The "catch" happens BEFORE the pull. Get the elbow up high and early. Don\'t just yank water — anchor and pull yourself past it.'
        }
      },
      {t:'tech', title:'Backstroke Focus',  detail:'Rotation, entry angle, high-elbow pull pattern',
        workout:{
          warmup:{distance:600, sets:['200 swim','4×100 IM @ 2:00','200 back kick']},
          mainSet:{distance:1600, sets:['8×50 backstroke @ 1:00 — count strokes, drop one each round','6×100 back drill / swim by 25 @ 2:00 (single arm, double arm, swim, swim)','4×75 back kick on back @ 1:30 — head still!','8×50 back from a flip turn @ 1:00']},
          cooldown:{distance:300, sets:['300 easy choice']},
          notes:'Eyes up at the ceiling. Hips drive rotation, not shoulders. If you\'re looking at your toes, your head is too high.'
        }
      },
      {t:'tech', title:'Breaststroke Focus',detail:'Pullout mechanics, narrow kick, tight timing',
        workout:{
          warmup:{distance:600, sets:['300 swim','200 IM drill','100 breast pullouts only']},
          mainSet:{distance:1600, sets:['8×50 breast PULL only — no kick! @ 1:15','6×50 breast kick on board @ 1:15','4×100 breast — descend 1→4 @ 2:15','8×25 breast pullouts only @ :40','4×75 breast (25 drill / 50 swim) @ 1:45']},
          cooldown:{distance:300, sets:['300 easy free / back alternate']},
          notes:'Narrow kick! Toes flexed and feet OUTSIDE the knees on the recovery. One pull, one kick, one glide — count it out.'
        }
      },
      {t:'ff',   title:'🎉 Fun Friday',     detail:'Meet warmup 1000 · pull set · underwater distance contest',
        workout:{
          warmup:{distance:1000, sets:['400 swim','200 kick','200 pull','4×25 build @ :40','100 easy']},
          mainSet:{distance:400, sets:['4×100 with paddles & buoy — easy effort @ 2:00']},
          notes:'After the set: UNDERWATER DISTANCE CONTEST. Streamline only, no kicks past the flags. Longest distance wins. Lung capacity day — go for it! 🫁'
        }
      },
    ]},

  // WEEK 4 — Mar 1–5 — Build  Meet 1
  { wk:4, phase:'build', badge:'Build Phase', mon:monOf(4),
    yds:[2900,3000,null,3100,1400],
    days:[
      {t:'build', title:'Aerobic Base',    detail:'200s & 400s at easy cruise pace, stroke count focus'},
      {t:'build', title:'Pre-Meet Tune',   detail:'Race-pace 50s, start reps, event visualization'},
      {t:'meet',  title:'🏊 DUAL MEET 1', detail:'Home meet — first race of the season!'},
      {t:'build', title:'Recovery Swim',   detail:'Easy 200s, drill sets, kick focus'},
      {t:'ff',    title:'🎉 Fun Friday',   detail:'Meet warmup 1000 · threshold 50s · noodle relay battle'},
    ]},

  // WEEK 5 — Mar 8–12 — Build  Meet 2
  { wk:5, phase:'build', badge:'Build Phase', mon:monOf(5),
    yds:[3200,3200,null,3300,1400],
    days:[
      {t:'build', title:'Threshold Ladders', detail:'100→200→400→200→100 at CSS pace'},
      {t:'build', title:'Pre-Meet Sharpener',detail:'8×50 at goal pace, relay exchange practice'},
      {t:'meet',  title:'🏊 DUAL MEET 2',   detail:'Away meet — execution & split focus'},
      {t:'build', title:'Active Recovery',   detail:'Drill & kick sets, loosen post-meet'},
      {t:'ff',    title:'🎉 Fun Friday',     detail:'Meet warmup 1000 · pull set · partner towing race'},
    ]},

  // WEEK 6 — Mar 15–19 — Build  Bye
  { wk:6, phase:'build', badge:'Build Phase', mon:monOf(6),
    yds:[3400,3400,3300,3500,1400],
    days:[
      {t:'build', title:'Broken Swims',      detail:'Broken 200s with :10 rest at goal pace'},
      {t:'build', title:'Kick & Pull Focus', detail:'Board sets, pull buoy, lactate threshold work'},
      {t:'bye',   title:'Bye Week — No Meet',detail:'Quality practice, strong aerobic push'},
      {t:'build', title:'Negative Split Sets',detail:'Back-half faster, descend 100s, pace control'},
      {t:'ff',    title:'🎉 Fun Friday',     detail:'Meet warmup 1000 · 200 IM time trial · costume swim'},
    ]},

  // WEEK 7 — Mar 22–26 — Build  Meet 3  (PEAK)
  { wk:7, phase:'build', badge:'Build Phase', mon:monOf(7),
    yds:[3600,3700,null,4000,1400],
    days:[
      {t:'build', title:'Race Simulation',   detail:'Full event swims at race pace, timed trials'},
      {t:'build', title:'Pre-Meet Sharpener',detail:'Fast 50s, relay handoffs, mental prep'},
      {t:'meet',  title:'🏊 DUAL MEET 3',   detail:'Big rival meet — season benchmark'},
      {t:'build', title:'Peak Yardage Day',  detail:'Season-high 4000 yds — long aerobic sets'},
      {t:'ff',    title:'🎉 Fun Friday',     detail:'Meet warmup 1000 · speed 25s · diving rings game'},
    ]},

  // WEEK 8 — Mar 29–Apr 2 — Refine  Meet 4
  { wk:8, phase:'refine', badge:'Refine Phase', mon:monOf(8),
    yds:[3200,3100,null,3000,1400],
    days:[
      {t:'refine', title:'Descend to Race Pace', detail:'Volume drops, intensity climbs — event specificity'},
      {t:'refine', title:'Event-Specific Sets',  detail:'Each swimmer trains primary event at goal pace'},
      {t:'meet',   title:'🏊 DUAL MEET 4',      detail:'Home meet — execute the race plan'},
      {t:'refine', title:'Dive & Turn Polish',   detail:'Block starts, dolphins, touch timing, finish drill'},
      {t:'ff',     title:'🎉 Fun Friday',        detail:'Meet warmup 1000 · pull set · last meet warm-down'},
    ]},

  // WEEK 9 — Apr 5–9 — Refine / SPRING BREAK (Apr 3-9, optional practices, no meet)
  { wk:9, phase:'refine', badge:'Spring Break Week', mon:monOf(9), isBreak:true,
    yds:[2400,2400,2400,2400,1400],
    days:[
      {t:'bprac', title:'Spring Break Practice', detail:'Optional · aerobic refresh, technique tune-up',              note:'⚠ Low attendance'},
      {t:'bprac', title:'Spring Break Practice', detail:'Optional · descending sets, race-pace touch',                note:'⚠ Low attendance'},
      {t:'bprac', title:'Spring Break Practice', detail:'Optional · short sharp sets, feel-good swim',                note:'⚠ Low attendance'},
      {t:'bprac', title:'Spring Break Practice', detail:'Optional · stroke drills, easy aerobic base',                note:'⚠ Low attendance'},
      {t:'ff',    title:'🎉 Fun Friday',         detail:'Meet warmup 1000 · obstacle course · spring break relay',  note:'⚠ Low attendance'},
    ]},

  // WEEK 10 — Apr 12–16 — Refine  Meet 5
  { wk:10, phase:'refine', badge:'Refine Phase', mon:monOf(10),
    yds:[3000,2900,null,2800,1400],
    days:[
      {t:'refine', title:'Welcome Back Set',     detail:'Re-engage post-break · steady aerobic, stroke count focus'},
      {t:'refine', title:'Pre-Meet Sharpener',   detail:'8×50 at goal pace, relay exchange practice'},
      {t:'meet',   title:'🏊 DUAL MEET 5',      detail:'Final dual meet — conference standings on the line'},
      {t:'refine', title:'Dive & Turn Polish',   detail:'Block starts, dolphins, touch timing, finish drill'},
      {t:'ff',     title:'🎉 Fun Friday',        detail:'Meet warmup 1000 · relay carnival · team award votes'},
    ]},

  // WEEK 11 — Apr 19–23 — TAPER + LEAGUE CHAMPS (Champs Thu Apr 22 & Fri Apr 23)
  { wk:11, phase:'taper', badge:'Taper Week', mon:monOf(11),
    yds:[2000,1800,1500,null,null],
    days:[
      {t:'taper',  title:'Taper Monday',   detail:'Short sharp sets, feel fast, low volume'},
      {t:'taper',  title:'Taper Tuesday',  detail:'Race-pace 25s, starts & turns, loosen up'},
      {t:'taper',  title:'Champs Eve',     detail:'Easy 20-min swim, lineup walk-through, early rest'},
      {t:'champs', title:'🏆 LEAGUE CHAMPS', detail:'Day 1 — Thu Apr 22 · Prelims · all individual events'},
      {t:'champs', title:'🏆 LEAGUE CHAMPS', detail:'Day 2 — Fri Apr 23 · Finals & Relay Championships 🦅'},
    ]},

  // ── POST-SEASON ──────────────────────────────────────

  // SECTIONS PREP WEEK — Apr 26–30
  { wk:'S1', phase:'post', badge:'Sections Prep', mon:new Date(2027,3,26),
    yds:[null,null,null,null,null],
    days:[
      {t:'secprac', title:'Sections Practice', detail:'Qualifying heat prep · no yard targets · swimmer-specific'},
      {t:'secprac', title:'Sections Practice', detail:'Event pacing, relay lineups, race-day strategy review'},
      {t:'secprac', title:'Sections Practice', detail:'Tune-up swims, starts, turns, mental walkthrough'},
      {t:'secprac', title:'Sections Practice', detail:'Light sharpening — feel fast, stay confident'},
      {t:'ff',      title:'🎉 Fun Friday',     detail:'Meet warmup 1000 · light set · pep talk & team send-off'},
    ]},

  // SECTIONS WEEK — May 3–7 (Mon–Tue practice, Wed–Fri sections meet)
  { wk:'S2', phase:'post', badge:'Sections Week', mon:new Date(2027,4,3),
    yds:[null,null,null,null,null],
    days:[
      {t:'secprac',  title:'Sections Practice', detail:'Final tune-up — short, sharp, confident'},
      {t:'secprac',  title:'Sections Eve',      detail:'Easy warm-down swim, visualize, rest up'},
      {t:'sections', title:'📍 SECTIONS Day 1', detail:'Wed May 5 — Prelims · fight for state berths'},
      {t:'sections', title:'📍 SECTIONS Day 2', detail:'Thu May 6 — Semifinals & relay heats'},
      {t:'sections', title:'📍 SECTIONS Day 3', detail:'Fri May 7 — Finals 🦅 State qualifiers announced'},
    ]},

  // STATE WEEK — May 10–14 (no practice hosted; state Thu–Fri)
  { wk:'ST', phase:'post', badge:'State Meet Week', mon:new Date(2027,4,10),
    yds:[null,null,null,null,null],
    days:[
      {t:'off',   title:'No Practice',    detail:'Rest & travel prep for state qualifiers'},
      {t:'off',   title:'No Practice',    detail:'State qualifiers: travel & arrival'},
      {t:'off',   title:'No Practice',    detail:'Qualifiers depart — good luck Eagles! 🦅'},
      {t:'state', title:'🏅 STATE DAY 1', detail:'Thu May 13 — Prelims'},
      {t:'state', title:'🏅 STATE DAY 2', detail:'Fri May 14 — Semifinals & Finals'},
    ]},

  // BANQUET WEEK — May 17
  { wk:'BQ', phase:'post', badge:'Season Close', mon:new Date(2027,4,17),
    yds:[null,null,null,null,null],
    days:[
      {t:'banquet', title:'🎉 Team Banquet',  detail:'Mon May 17 — Awards, highlights & celebrating the Eagles!'},
      {t:'off',     title:'Season Complete',  detail:'Fly Eagles Fly 🦅 — see you next year!'},
      {t:'off',     title:'',                 detail:''},
      {t:'off',     title:'',                 detail:''},
      {t:'off',     title:'',                 detail:''},
    ]},
];

// ── DIVIDERS ──────────────────────────────────────────────
const dividers = {
  1:  {label:'— Tryout / Technique Phase —', cls:'pd-tech'},
  4:  {label:'— Build Phase —',              cls:'pd-build'},
  8:  {label:'— Refine Phase —',             cls:'pd-refine'},
  11: {label:'— Taper Week —',               cls:'pd-taper'},
  S1: {label:'— Post-Season —',              cls:'pd-post'},
};


window.SEASON = { weeks, dividers, DAYS, weekDates, fmt };

}
