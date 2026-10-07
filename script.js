/* SkillSwap demo - frontend only (localStorage) */
const students = [
  {name:'Arun Kumar',  dept:'Information Technology', teach:['HTML','CSS'],           want:['Python'],          match:90, availability:'evening'},
  {name:'Priya Sharma',dept:'Computer Science',       teach:['Python','Java'],        want:['Web Development'], match:85, availability:'available'},
  {name:'Divya R',     dept:'AI & Data Science',      teach:['Machine Learning','Python'], want:['JavaScript'], match:82, availability:'weekend'},
  {name:'Kavin',       dept:'Electronics',            teach:['React','JavaScript'],   want:['Python'],          match:75, availability:'available'},
  {name:'Rahul S',     dept:'Computer Science',       teach:['Java','SQL'],           want:['HTML'],            match:68, availability:'busy'}
];
const $ = id => document.getElementById(id);
const get = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } };
const set = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };
const page = document.body.dataset.page;

/* ---------- Navbar (same on every page) ---------- */
const links = [['index.html','Home','index'],['dashboard.html','Dashboard','dashboard'],['profile.html','My Profile','profile'],
  ['matches.html','Find Matches','matches'],['requests.html','Requests','requests'],['sessions.html','Sessions','sessions'],['chat.html','Chat','chat'],['notifications.html','Notifications','notifications']];
$('navbar').innerHTML = `
<nav class="navbar navbar-expand-lg navbar-dark sticky-top"><div class="container">
  <a class="navbar-brand fw-bold" href="index.html"><i class="bi bi-arrow-left-right"></i> SkillSwap</a>
  <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#nav"><span class="navbar-toggler-icon"></span></button>
  <div class="collapse navbar-collapse" id="nav"><ul class="navbar-nav ms-auto">
    ${links.map(l => `<li class="nav-item"><a class="nav-link ${page===l[2]?'active':''}" href="${l[0]}">${l[1]}</a></li>`).join('')}
    <li class="nav-item"><a class="nav-link" href="index.html" id="logoutLink">Logout</a></li>
  </ul></div>
</div></nav>`;
$('logoutLink').addEventListener('click', () => { try { localStorage.removeItem('ss_loggedIn'); } catch (e) {} });

/* ---------- Helpers ---------- */
function showAlert(msg, type = 'success') {
  const box = $('alertBox'); if (!box) return;
  box.innerHTML = `<div class="alert alert-${type} alert-dismissible fade show" role="alert">${msg}<button type="button" class="btn-close" data-bs-dismiss="alert"></button></div>`;
}
const badges = (arr, c) => arr.map(s => `<span class="badge bg-${c} skill-badge">${s}</span>`).join('');
const initial = n => n.charAt(0).toUpperCase();
const notify = (text, type='info') => { const a=get('ss_notifications',[]); a.unshift({text,type,time:new Date().toLocaleString(),read:false}); set('ss_notifications',a); };
const availabilityText = a => ({available:'Available Now',evening:'Available in Evening',weekend:'Available on Weekends',busy:'Currently Busy'})[a] || 'Available Now';
function openReport(name){ const reason=prompt('Why do you want to report '+name+'?'); if(!reason) return; const reports=get('ss_reports',[]); reports.push({name,reason,time:new Date().toLocaleString()}); set('ss_reports',reports); notify('Report submitted for '+name,'warning'); showAlert('Report submitted. Our team will review it.','warning'); }
function blockUser(name){ const blocked=get('ss_blocked',[]); if(!blocked.includes(name)) blocked.push(name); set('ss_blocked',blocked); notify(name+' was blocked.','danger'); showAlert(name+' has been blocked.','warning'); }
function studentCard(s, withRequest) {
  return `<div class="col-md-6 col-lg-4 student-item" data-skills="${(s.teach.concat(s.want)).join(' ').toLowerCase()}">
  <div class="card student-card h-100 p-3">
    <div class="d-flex align-items-center gap-3 mb-2"><div class="avatar">${initial(s.name)}</div>
      <div><h5 class="mb-0">${s.name}</h5><small class="text-muted">${s.dept}</small></div></div>
    <div class="mb-1"><strong>Can Teach:</strong><br>${badges(s.teach,'primary')}</div>
    <div class="mb-2"><strong>Wants to Learn:</strong><br>${badges(s.want,'success')}</div>
    <div class="mb-3">Match: <span class="match-pill">${s.match}%</span></div>
    <div class="small mb-2"><i class="bi bi-circle-fill text-${s.availability==='busy'?'secondary':'success'}"></i> ${availabilityText(s.availability || 'available')}</div>
    ${withRequest
      ? `<div class="d-grid gap-2 mt-auto"><button class="btn btn-primary send-req" data-name="${s.name}"><i class="bi bi-send"></i> Send Exchange Request</button><button class="btn btn-outline-success book-session" data-name="${s.name}"><i class="bi bi-calendar-plus"></i> Book Learning Session</button><div class="btn-group"><button class="btn btn-outline-danger report-user" data-name="${s.name}"><i class="bi bi-flag"></i> Report</button><button class="btn btn-outline-secondary block-user" data-name="${s.name}"><i class="bi bi-person-x"></i> Block</button></div></div>`
      : `<a href="profile.html" class="btn btn-outline-primary mt-auto">View Profile</a>`}
  </div></div>`;
}

/* ---------- Login / Register ---------- */
if (page === 'login') $('loginForm').addEventListener('submit', e => {
  e.preventDefault(); set('ss_loggedIn', true); window.location.href = 'dashboard.html';
});
if (page === 'register') $('registerForm').addEventListener('submit', e => {
  e.preventDefault();
  if ($('password').value !== $('confirm').value) return showAlert('Passwords do not match!', 'danger');
  set('ss_user', {name:$('name').value, dept:$('dept').value, year:$('year').value});
  set('ss_loggedIn', true); window.location.href = 'dashboard.html';
});

/* ---------- Dashboard ---------- */
if (page === 'dashboard') {
  const u = get('ss_user'); if (u && u.name) $('userName').textContent = u.name;
  $('recommended').innerHTML = students.slice(0, 3).map(s => studentCard(s, false)).join('');
}

/* ---------- Profile ---------- */
if (page === 'profile') {
  const p = get('ss_profile', {name:'Miruthula', bio:'Web development enthusiast interested in learning new technologies.',
    teach:['HTML','CSS','JavaScript'], want:['Python','Machine Learning'], availability:'available'});
  const u = get('ss_user');
  if (u && u.name && !get('ss_profile')) { p.name = u.name; $('pDept').textContent = u.dept; $('pYear').textContent = u.year; }
  const draw = () => {
    $('pName').textContent = p.name; $('pBio').textContent = p.bio;
    document.querySelector('.avatar').textContent = initial(p.name);
    $('teachList').innerHTML = badges(p.teach, 'primary'); $('wantList').innerHTML = badges(p.want, 'success');
    if($('availability')) $('availability').value=p.availability||'available';
    const reviews=get('ss_reviews',[]); const avg=reviews.length?(reviews.reduce((a,r)=>a+Number(r.rating),0)/reviews.length).toFixed(1):null; if($('myRating')) $('myRating').textContent=avg?('⭐ '+avg+' / 5 ('+reviews.length+' review'+(reviews.length>1?'s':'')+')'):'No ratings yet';
  };
  draw();
  $('editModal').addEventListener('show.bs.modal', () => { $('eName').value = p.name; $('eBio').value = p.bio; });
  $('saveProfile').addEventListener('click', () => {
    p.name = $('eName').value.trim() || p.name; p.bio = $('eBio').value.trim() || p.bio;
    set('ss_profile', p); draw(); showAlert('Profile updated!');
  });
  if($('saveAvailability')) $('saveAvailability').addEventListener('click', () => { p.availability=$('availability').value; set('ss_profile',p); notify('Availability updated to '+availabilityText(p.availability)); showAlert('Availability updated!'); });
  $('saveSkill').addEventListener('click', () => {
    const n = $('skillName').value.trim(); if (!n) return;
    p[$('skillType').value].push(n); $('skillName').value = '';
    set('ss_profile', p); draw(); showAlert('Skill added!');
  });
}

/* ---------- Matches ---------- */
if (page === 'matches') {
  const blocked=get('ss_blocked',[]); $('matchList').innerHTML = students.filter(s=>!blocked.includes(s.name)).map(s => studentCard(s, true)).join('');
  $('matchList').addEventListener('click', e => {
    const b=e.target.closest('button'); if(!b) return; const name=b.dataset.name; if(!name) return;
    if(b.classList.contains('send-req')) { b.disabled=true; b.innerHTML='<i class="bi bi-check2"></i> Request Sent'; notify('Exchange request sent to '+name); showAlert('Exchange request sent successfully!'); }
    if(b.classList.contains('book-session')) { const date=prompt('Enter session date (YYYY-MM-DD):'); if(!date) return; const time=prompt('Enter session time (e.g. 6:00 PM):'); if(!time) return; const topic=prompt('What skill will you learn/teach?','Python'); if(!topic) return; const sessions=get('ss_sessions',[]); const id='SS'+Date.now().toString().slice(-6); sessions.push({id,partner:name,topic,date,time,status:'Booked'}); set('ss_sessions',sessions); notify('Learning session booked with '+name+' on '+date+' at '+time); showAlert('Session booked! Open Sessions to join it.'); }
    if(b.classList.contains('report-user')) openReport(name);
    if(b.classList.contains('block-user')) blockUser(name);
  });
  $('searchInput').addEventListener('input', e => {
    const q = e.target.value.trim().toLowerCase(); let shown = 0;
    document.querySelectorAll('.student-item').forEach(c => {
      const ok = c.dataset.skills.includes(q) || c.textContent.toLowerCase().includes(q);
      c.classList.toggle('d-none', !ok); if (ok) shown++;
    });
    $('noResult').classList.toggle('d-none', shown > 0);
  });
}

/* ---------- Requests ---------- */
if (page === 'requests') {
  const reqs = [
    {name:'Arun Kumar',  msg:'I can teach you HTML and CSS if you can help me learn Python.'},
    {name:'Priya Sharma',msg:'I can teach you Python and Java if you can help me with Web Development.'}
  ];
  const status = get('ss_reqStatus', {});
  const draw = () => {
    $('requestList').innerHTML = reqs.map((r, i) => `
    <div class="card student-card mb-3 p-3"><div class="d-flex align-items-center flex-wrap gap-3">
      <div class="avatar">${initial(r.name)}</div>
      <div class="flex-grow-1"><h5 class="mb-1">${r.name}</h5><p class="mb-0 text-muted">"${r.msg}"</p></div>
      <div>${status[i]
        ? `<span class="badge bg-${status[i]==='accepted'?'success':'danger'} fs-6">${status[i]==='accepted'?'Accepted':'Rejected'}</span>`
        : `<button class="btn btn-success me-2" data-i="${i}" data-a="accepted">Accept</button><button class="btn btn-outline-danger" data-i="${i}" data-a="rejected">Reject</button>`}</div>
    </div></div>`).join('');
  };
  draw();
  $('requestList').addEventListener('click', e => {
    const b = e.target.closest('button[data-a]'); if (!b) return;
    status[b.dataset.i] = b.dataset.a; set('ss_reqStatus', status); draw();
    b.dataset.a === 'accepted' ? showAlert('Request Accepted!') : showAlert('Request Rejected!', 'danger');
  });
}

/* ---------- Chat ---------- */
if (page === 'chat') {
  const chats = get('ss_chats', {
    'Arun Kumar':[{from:'them',text:'Hi! I can help you learn HTML.'},{from:'me',text:'Great! I can help you with Python basics.'}],
    'Priya Sharma':[{from:'them',text:'Hello! Ready for our Python session?'}],
    'Kavin':[{from:'them',text:'Hey, can you teach me some Python?'}]
  });
  let current = 'Arun Kumar';
  const drawContacts = () => {
    $('contactList').innerHTML = Object.keys(chats).map(n =>
      `<a href="#" class="list-group-item list-group-item-action ${n===current?'active':''}" data-n="${n}">${n}</a>`).join('');
  };
  const drawChat = () => {
    $('chatTitle').textContent = 'Chat with ' + current;
    $('chatBox').innerHTML = chats[current].map(m =>
      `<div class="bubble ${m.from}"><small>${m.from==='me'?'You':current.split(' ')[0]}</small>${m.text.replace(/</g,'&lt;')}</div>`).join('');
    $('chatBox').scrollTop = $('chatBox').scrollHeight;
  };
  const send = () => {
    const t = $('msgInput').value.trim(); if (!t) return;
    chats[current].push({from:'me', text:t}); set('ss_chats', chats);
    $('msgInput').value = ''; drawChat();
  };
  $('contactList').addEventListener('click', e => {
    const a = e.target.closest('a[data-n]'); if (!a) return; e.preventDefault();
    current = a.dataset.n; drawContacts(); drawChat();
  });
  $('sendBtn').addEventListener('click', send);
  $('msgInput').addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
  drawContacts(); drawChat();
}

/* ---------- Learning Sessions ---------- */
if(page==='sessions'){
  const list=()=>{ const sessions=get('ss_sessions',[]); $('sessionList').innerHTML=sessions.length?sessions.map(x=>`<div class="card p-3 mb-3 shadow-sm"><div class="d-flex flex-wrap gap-3 align-items-center"><div class="flex-grow-1"><h5 class="mb-1">${x.topic} with ${x.partner}</h5><div class="text-muted"><i class="bi bi-calendar"></i> ${x.date} &nbsp; <i class="bi bi-clock"></i> ${x.time}</div><span class="badge bg-${x.status==='Completed'?'success':'primary'} mt-2">${x.status}</span></div>${x.status!=='Completed'?`<div class="d-flex gap-2"><button class="btn btn-success join-video" data-id="${x.id}"><i class="bi bi-camera-video"></i> Join Video Session</button><button class="btn btn-outline-primary complete-session" data-id="${x.id}">Mark Completed</button></div>`:`<button class="btn btn-warning review-session" data-id="${x.id}"><i class="bi bi-star"></i> Rate & Feedback</button>`}</div></div>`).join(''):'<div class="alert alert-light border">No sessions yet. Find a skill partner and book your first learning session.</div>'; };
  list(); $('sessionList').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;const id=b.dataset.id;let ss=get('ss_sessions',[]);const x=ss.find(a=>a.id===id);if(!x)return;if(b.classList.contains('complete-session')){x.status='Completed';set('ss_sessions',ss);notify('Session with '+x.partner+' marked completed.');list();}else if(b.classList.contains('join-video')){window.open('https://meet.jit.si/SkillSwap-'+id,'_blank','noopener');notify('Video session opened for '+x.partner);}else if(b.classList.contains('review-session')){$('reviewSessionId').value=id;new bootstrap.Modal($('reviewModal')).show();}});
  $('submitReview').addEventListener('click',()=>{const id=$('reviewSessionId').value,ss=get('ss_sessions',[]),x=ss.find(a=>a.id===id);if(!x)return;const rs=get('ss_reviews',[]);rs.push({sessionId:id,partner:x.partner,rating:Number($('rating').value),feedback:$('feedback').value.trim(),time:new Date().toLocaleString()});set('ss_reviews',rs);notify('Thanks for rating '+x.partner+'!');$('feedback').value='';showAlert('Rating and feedback submitted!');});
}
/* ---------- Notifications ---------- */
if(page==='notifications'){const ns=get('ss_notifications',[]);$('notificationList').innerHTML=ns.length?ns.map(n=>`<div class="alert alert-${n.type||'info'} d-flex justify-content-between"><span><i class="bi bi-bell"></i> ${n.text}</span><small>${n.time}</small></div>`).join(''):'<div class="alert alert-light border">No notifications yet.</div>';}
