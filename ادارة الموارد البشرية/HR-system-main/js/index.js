
/* ============================
   HR System — Single-file JS
   All data in-memory by default.
   Toggle persistence to save to localStorage (optional).
   ============================ */

/* ========== Data stores ========== */
let employees = [];         // {id, firstName, lastName, dept, title, phone, email, hireDate, salary}
let jobs = [];              // {id, title, desc, postedAt}
let applicants = [];        // {id, name, phone, email, jobId, status}
let attendance = [];        // {id, empId, name, date, in, out, hours, status}
let payrolls = [];          // {id, empId, month, base, overtime, allowances, deductions, net}
let performances = [];      // {id, empId, title, rating, notes, date}
let trainings = [];         // {id, title, date, participants:[]}
let leaves = [];            // {id, empId, start, end, status, reason}
let persistenceEnabled = false;

/* ====== Cached DOM ====== */
const navBtns = document.querySelectorAll('.nav-btn');
const sections = document.querySelectorAll('.section');
const pageTitle = document.querySelector('.page-title');
const togglePersistence = document.getElementById('togglePersistence');

const openAddEmployee = document.getElementById('openAddEmployee');
const exportJSON = document.getElementById('exportJSON');
const importJSONBtn = document.getElementById('importJSONBtn');
const importJSON = document.getElementById('importJSON');

const statTotalEmployees = document.getElementById('statTotalEmployees');
const statDepartments = document.getElementById('statDepartments');
const statAttendance = document.getElementById('statAttendance');
const statPayrolls = document.getElementById('statPayrolls');
const recentEmployees = document.getElementById('recentEmployees');
const dashboardDepts = document.getElementById('dashboardDepts');

/* Basic */
const basicSearch = document.getElementById('basicSearch');
const basicDeptFilter = document.getElementById('basicDeptFilter');
const basicAddBtn = document.getElementById('basicAddBtn');
const basicExportCSV = document.getElementById('basicExportCSV');
const basicTableBody = document.getElementById('basicTableBody');

/* Recruitment */
const openJobModal = document.getElementById('openJobModal');
const jobsList = document.getElementById('jobsList');
const applicantsTable = document.getElementById('applicantsTable');

/* Attendance */
const attendanceEmployee = document.getElementById('attendanceEmployee');
const attendanceIn = document.getElementById('attendanceIn');
const attendanceOut = document.getElementById('attendanceOut');
const attendanceSave = document.getElementById('attendanceSave');
const attendanceClock = document.getElementById('attendanceClock');
const attendanceBody = document.getElementById('attendanceBody');

/* Payroll */
const payEmployee = document.getElementById('payEmployee');
const payBase = document.getElementById('payBase');
const payOvertime = document.getElementById('payOvertime');
const payAllowances = document.getElementById('payAllowances');
const payCalc = document.getElementById('payCalc');
const paySave = document.getElementById('paySave');
const payrollBody = document.getElementById('payrollBody');

/* Performance */
const perfEmployee = document.getElementById('perfEmployee');
const perfTitle = document.getElementById('perfTitle');
const perfRating = document.getElementById('perfRating');
const perfSave = document.getElementById('perfSave');
const perfBody = document.getElementById('perfBody');

/* Training */
const trainingTitle = document.getElementById('trainingTitle');
const trainingDate = document.getElementById('trainingDate');
const trainingCreate = document.getElementById('trainingCreate');
const trainingList = document.getElementById('trainingList');

/* Leaves */
const leaveEmployee = document.getElementById('leaveEmployee');
const leaveStart = document.getElementById('leaveStart');
const leaveEnd = document.getElementById('leaveEnd');
const leaveRequest = document.getElementById('leaveRequest');
const leavesBody = document.getElementById('leavesBody');

/* Reports */
const reportGenerate = document.getElementById('reportGenerate');
const reportArea = document.getElementById('reportArea');
const exportCSVBtn = document.getElementById('exportCSVBtn');
const showCharts = document.getElementById('showCharts');
const chartsArea = document.getElementById('chartsArea');
const chartCanvas = document.getElementById('chartCanvas');
const closeCharts = document.getElementById('closeCharts');

/* Modals */
const employeeModal = document.getElementById('employeeModal');
const employeeForm = document.getElementById('employeeForm');
const employeeCancel = document.getElementById('employeeCancel');
const e_dept = document.getElementById('e_dept');

const jobModal = document.getElementById('jobModal');
const jobForm = document.getElementById('jobForm');
const jobCancel = document.getElementById('jobCancel');

/* Helper functions */
function id(prefix='id'){ return prefix + '_' + Math.random().toString(36).slice(2,9); }
function nowISO(){ return new Date().toISOString(); }
function formatDate(d){ if(!d) return ''; const dt = new Date(d); return dt.toLocaleDateString('en-CA'); }
function getDeptLabel(k){ const m = departments.find(x=>x.key===k); return m? m.name : 'غير محدد'; }

/* Departments collection (used UI-wide) */
const departments = [
  { key: 'development', name: 'التطوير' },
  { key: 'marketing', name: 'التسويق' },
  { key: 'sales', name: 'المبيعات' },
  { key: 'finance', name: 'المالية' },
  { key: 'hr', name: 'الموارد البشرية' },
  { key: 'unassigned', name: 'غير محدد' }
];

/* ==== Navigation handling ==== */
navBtns.forEach(b=>{
  b.addEventListener('click', ()=>{
    navBtns.forEach(x=>x.classList.remove('active'));
    b.classList.add('active');
    const sec = b.dataset.section;
    sections.forEach(s=> s.style.display = (s.id === sec) ? '' : 'none');
    pageTitle.textContent = b.textContent.trim();
    if(sec === 'reports') buildReport();
  });
});

/* ====== Persistence (optional) ====== */
const STORAGE = 'hr_system_backup_v1';
togglePersistence.addEventListener('click', ()=>{
  if(!persistenceEnabled){
    if(confirm('تفعيل الحفظ المحلي؟ ستبقى البيانات محفوظة في هذا المتصفح حتى تحذفيها.')) {
      persistenceEnabled = true;
      togglePersistence.textContent = 'Disable Persistence';
      saveToStorage();
      toast('تم تفعيل الحفظ المحلي');
    }
  } else {
    persistenceEnabled = false;
    togglePersistence.textContent = 'Enable Persistence';
    toast('أيقفت الحفظ المحلي — البيانات الآن في الذاكرة فقط');
  }
});
function saveToStorage(){
  if(!persistenceEnabled) return;
  const payload = { employees, jobs, applicants, attendance, payrolls, performances, trainings, leaves, savedAt: nowISO() };
  localStorage.setItem(STORAGE, JSON.stringify(payload));
}
function loadFromStorage(){
  try{
    const raw = localStorage.getItem(STORAGE);
    if(raw){
      const p = JSON.parse(raw);
      employees = p.employees || [];
      jobs = p.jobs || [];
      applicants = p.applicants || [];
      attendance = p.attendance || [];
      payrolls = p.payrolls || [];
      performances = p.performances || [];
      trainings = p.trainings || [];
      leaves = p.leaves || [];
      toast('تم تحميل بيانات مخزنة محلياً');
    }
  }catch(e){ console.warn('loadFromStorage', e); }
}

/* ====== Toast ====== */
let toastTimer = null;
function toast(msg, time=2000){
  let el = document.getElementById('hr_toast');
  if(!el){
    el = document.createElement('div');
    el.id = 'hr_toast';
    el.style.position='fixed'; el.style.bottom='20px'; el.style.left='20px'; el.style.padding='10px 14px';
    el.style.borderRadius='8px'; el.style.background='rgba(0,0,0,0.8)'; el.style.color='#fff'; el.style.zIndex='99999';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.style.opacity = '1';
  clearTimeout(toastTimer);
  toastTimer = setTimeout(()=> el.style.opacity='0', time);
}

/* ====== UI population helpers ====== */
function populateDeptSelectors(){
  // all selects for departments
  document.querySelectorAll('select').forEach(sel=>{
    if(sel === basicDeptFilter || sel === e_dept){
      // fill options for these selects
      const prev = sel.value || '';
      sel.innerHTML = '';
      departments.forEach(d=> {
        const opt = document.createElement('option'); opt.value = d.key; opt.textContent = d.name;
        sel.appendChild(opt);
      });
      // add "كل الأقسام" for filters
      if(sel === basicDeptFilter){
        const add = document.createElement('option'); add.value=''; add.textContent='كل الأقسام'; sel.insertBefore(add, sel.firstChild);
      }
      sel.value = prev;
    }
  });
}

/* populate employee selects */
function populateEmployeeSelects(){
  const all = employees.slice();
  function fill(sel){
    sel.innerHTML = '';
    const placeholder = document.createElement('option'); placeholder.value=''; placeholder.textContent='اختر موظف'; sel.appendChild(placeholder);
    all.forEach(e=>{
      const opt = document.createElement('option'); opt.value = e.id; opt.textContent = `${e.firstName} ${e.lastName||''}`;
      sel.appendChild(opt);
    });
  }
  [attendanceEmployee, payEmployee, perfEmployee, leaveEmployee].forEach(s=> { if(s) fill(s); });
}

/* ====== Render functions (all sections) ====== */
function renderAll(){
  renderStats();
  renderRecentEmployees();
  renderDashboardDepts();
  renderBasicTable();
  renderJobs();
  renderApplicants();
  renderAttendanceTable();
  renderPayrolls();
  renderPerformance();
  renderTrainings();
  renderLeaves();
  populateEmployeeSelects();
  if(persistenceEnabled) saveToStorage();
}

/* Stats */
function renderStats(){
  statTotalEmployees.textContent = employees.length;
  statDepartments.textContent = departments.length;
  statAttendance.textContent = attendance.length;
  statPayrolls.textContent = payrolls.length;
}

/* Recent employees */
function renderRecentEmployees(){
  recentEmployees.innerHTML = '';
  const latest = employees.slice().reverse().slice(0,8);
  if(!latest.length){ recentEmployees.innerHTML = '<tr><td colspan="4" class="small-muted">لا يوجد</td></tr>'; return; }
  latest.forEach(emp=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${emp.firstName} ${emp.lastName||''}</td><td>${getDeptLabel(emp.dept)}</td><td>${emp.title||''}</td><td class="actions"><button class="btn ghost btn-edit" data-id="${emp.id}">تعديل</button> <button class="btn ghost btn-delete" data-id="${emp.id}">حذف</button></td>`;
    recentEmployees.appendChild(tr);
  });
  recentEmployees.querySelectorAll('.btn-edit').forEach(b=> b.addEventListener('click', ()=> openEmployeeModal(b.dataset.id)));
  recentEmployees.querySelectorAll('.btn-delete').forEach(b=> b.addEventListener('click', ()=> { if(confirm('هل تريد حذف الموظف؟')){ employees = employees.filter(x=>x.id!==b.dataset.id); renderAll(); } }));
}

/* Dashboard depts */
function renderDashboardDepts(){
  const html = departments.map(d=> {
    const count = employees.filter(e=> e.dept === d.key).length;
    return `<div style="margin-bottom:6px">${d.name}: <strong>${count}</strong></div>`;
  }).join('');
  dashboardDepts.innerHTML = html || '<div class="small-muted">لا توجد</div>';
}

/* Basic table */
function renderBasicTable(){
  basicTableBody.innerHTML = '';
  const filter = basicDeptFilter.value;
  const q = basicSearch.value.trim().toLowerCase();
  const list = employees.filter(e=> {
    if(filter && e.dept !== filter) return false;
    if(!q) return true;
    return (`${e.firstName} ${e.lastName||''} ${e.title||''}`).toLowerCase().includes(q);
  });
  if(!list.length){ basicTableBody.innerHTML = '<tr><td colspan="8" class="small-muted">لا توجد نتائج</td></tr>'; return; }
  list.forEach(emp=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td><input type="checkbox" data-id="${emp.id}" class="rowSel"/></td>
      <td>${emp.firstName}</td><td>${emp.lastName||''}</td><td>${getDeptLabel(emp.dept)}</td><td>${emp.title||''}</td><td>${emp.phone||''}</td><td>${emp.salary||0}</td>
      <td class="actions"><button class="btn ghost btn-edit" data-id="${emp.id}">تعديل</button><button class="btn ghost btn-delete" data-id="${emp.id}">حذف</button></td>`;
    basicTableBody.appendChild(tr);
  });
  basicTableBody.querySelectorAll('.btn-edit').forEach(b=> b.addEventListener('click', ()=> openEmployeeModal(b.dataset.id)));
  basicTableBody.querySelectorAll('.btn-delete').forEach(b=> b.addEventListener('click', ()=> { if(confirm('حذف؟')){ employees = employees.filter(x=>x.id!==b.dataset.id); renderAll(); } }));
}

/* Jobs & applicants */
function renderJobs(){
  if(!jobs.length){ jobsList.innerHTML = '<div class="small-muted">لا توجد وظائف منشورة</div>'; return; }
  jobsList.innerHTML = jobs.map(j=> `<div style="padding:8px;background:rgba(255,255,255,0.02);margin-bottom:6px;border-radius:6px"><strong>${j.title}</strong> <div class="small-muted">${formatDate(j.postedAt)}</div><div style="margin-top:6px">${j.desc||''}</div><div style="margin-top:6px"><button class="btn ghost btn-apply" data-id="${j.id}">تقدم</button></div></div>`).join('');
  jobsList.querySelectorAll('.btn-apply').forEach(b=> b.addEventListener('click', ()=> applyForJob(b.dataset.id)));
}
function renderApplicants(){
  applicantsTable.innerHTML = '';
  if(!applicants.length){ applicantsTable.innerHTML = '<tr><td colspan="6" class="small-muted">لا يوجد</td></tr>'; return; }
  applicants.forEach(a=>{
    const tr = document.createElement('tr');
    const job = jobs.find(j=>j.id===a.jobId) || {};
    tr.innerHTML = `<td>${a.name}</td><td>${job.title||''}</td><td>${a.phone||''}</td><td>${a.email||''}</td><td>${a.status||'قيد المراجعة'}</td>
      <td class="actions"><button class="btn ghost btn-hire" data-id="${a.id}">توظيف</button> <button class="btn ghost btn-reject" data-id="${a.id}">رفض</button></td>`;
    applicantsTable.appendChild(tr);
  });
  applicantsTable.querySelectorAll('.btn-hire').forEach(b=> b.addEventListener('click', ()=> hireApplicant(b.dataset.id)));
  applicantsTable.querySelectorAll('.btn-reject').forEach(b=> b.addEventListener('click', ()=> { const id=b.dataset.id; applicants = applicants.map(a=> a.id===id? {...a, status:'مرفوض'}:a); renderApplicants(); }));
}

/* Attendance */
function renderAttendanceTable(){
  attendanceBody.innerHTML = '';
  if(!attendance.length){ attendanceBody.innerHTML = '<tr><td colspan="6" class="small-muted">لا توجد سجلات</td></tr>'; return; }
  attendance.slice().reverse().forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.name}</td><td>${r.date}</td><td>${r.in}</td><td>${r.out}</td><td>${r.hours}</td><td>${r.status}</td>`;
    attendanceBody.appendChild(tr);
  });
}

/* Payrolls */
function renderPayrolls(){
  payrollBody.innerHTML = '';
  if(!payrolls.length){ payrollBody.innerHTML = '<tr><td colspan="8" class="small-muted">لا توجد قسائم</td></tr>'; return; }
  payrolls.slice().reverse().forEach(p=>{
    const emp = employees.find(e=> e.id === p.empId) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${emp.firstName||''}</td><td>${p.month}</td><td>${p.base}</td><td>${p.overtime}</td><td>${p.allowances}</td><td>${p.deductions}</td><td>${p.net}</td>
      <td class="actions"><button class="btn ghost btn-print" data-id="${p.id}">طباعة</button></td>`;
    payrollBody.appendChild(tr);
  });
  payrollBody.querySelectorAll('.btn-print').forEach(b=> b.addEventListener('click', ()=> printPayroll(b.dataset.id)));
}

/* Performance */
function renderPerformance(){
  perfBody.innerHTML = '';
  if(!performances.length){ perfBody.innerHTML = '<tr><td colspan="5" class="small-muted">لا توجد تقييمات</td></tr>'; return; }
  performances.slice().reverse().forEach(p=>{
    const emp = employees.find(e=> e.id===p.empId) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${emp.firstName||''}</td><td>${p.title}</td><td>${p.rating}</td><td>${formatDate(p.date)}</td><td>${p.notes||''}</td>`;
    perfBody.appendChild(tr);
  });
}

/* Trainings */
function renderTrainings(){
  if(!trainings.length){ trainingList.innerHTML = '<div class="small-muted">لا توجد دورات</div>'; return; }
  trainingList.innerHTML = trainings.map(t=>{
    const parts = (t.participants||[]).map(id=> (employees.find(e=>e.id===id)||{}).firstName || '---').join(', ');
    return `<div style="margin-bottom:8px;padding:8px;background:rgba(255,255,255,0.02);border-radius:6px"><strong>${t.title}</strong> - ${formatDate(t.date)}<div class="small-muted">المشاركين: ${parts||'لا أحد'}</div></div>`;
  }).join('');
}

/* Leaves */
function renderLeaves(){
  leavesBody.innerHTML = '';
  if(!leaves.length){ leavesBody.innerHTML = '<tr><td colspan="4" class="small-muted">لا طلبات</td></tr>'; return; }
  leaves.slice().reverse().forEach(l=>{
    const emp = employees.find(e=> e.id === l.empId) || {};
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${emp.firstName||''}</td><td>${l.start} → ${l.end}</td><td>${l.status||'معلقة'}</td><td class="actions"><button class="btn ghost btn-approve" data-id="${l.id}">موافقة</button> <button class="btn ghost btn-reject" data-id="${l.id}">رفض</button></td>`;
    leavesBody.appendChild(tr);
  });
  leavesBody.querySelectorAll('.btn-approve').forEach(b=> b.addEventListener('click', ()=> { leaves = leaves.map(x=> x.id===b.dataset.id? {...x, status:'موافق'}: x); renderLeaves(); }));
  leavesBody.querySelectorAll('.btn-reject').forEach(b=> b.addEventListener('click', ()=> { leaves = leaves.map(x=> x.id===b.dataset.id? {...x, status:'مرفوض'}: x); renderLeaves(); }));
}

/* Reports */
function buildReport(){
  reportArea.innerHTML = '';
  const totalEmployees = employees.length;
  const totalPayroll = payrolls.reduce((s,p)=> s + (p.net||0), 0);
  const byDept = departments.map(d=> ({ name: d.name, count: employees.filter(e=>e.dept===d.key).length }));
  const html = `<div class="card"><h4>تقرير سريع</h4><p>عدد الموظفين: ${totalEmployees}</p><p>إجمالي الرواتب (الصافي): ${totalPayroll}</p><div><h5>حسب الأقسام</h5>${byDept.map(b=>`<div>${b.name}: ${b.count}</div>`).join('')}</div></div>`;
  reportArea.innerHTML = html;
}

/* Charts */
function showChartModal(){
  chartsArea.style.display = 'flex';
  const ctx = chartCanvas.getContext('2d');
  ctx.clearRect(0,0,chartCanvas.width,chartCanvas.height);
  // draw simple bar chart: employees per dept
  const labels = departments.map(d=>d.name);
  const vals = departments.map(d=> employees.filter(e=> e.dept===d.key).length);
  const max = Math.max(...vals,1);
  const w = 800, h = 360;
  ctx.fillStyle = '#fff'; ctx.font = '14px Tahoma';
  ctx.fillText('الموظفين حسب الأقسام', 10, 20);
  labels.forEach((lab,i)=>{
    const barH = (vals[i]/max)*200;
    ctx.fillStyle = `hsl(${i*60},70%,55%)`;
    ctx.fillRect(50 + i*100, 300 - barH, 50, barH);
    ctx.fillStyle = '#fff';
    ctx.fillText(lab, 50 + i*100, 320);
    ctx.fillText(vals[i], 50 + i*100, 300 - barH - 6);
  });
}

/* ====== Actions: Add/Edit employee modal ====== */
function openEmployeeModal(editId){
  employeeModal.style.display = 'flex';
  employeeModal.setAttribute('aria-hidden','false');
  populateDeptSelectors();
  e_dept.value = e_dept.value || 'unassigned';
  if(editId){
    const emp = employees.find(e=> e.id===editId);
    if(emp){
      document.getElementById('e_first').value = emp.firstName || '';
      document.getElementById('e_last').value = emp.lastName || '';
      document.getElementById('e_title').value = emp.title || '';
      document.getElementById('e_phone').value = emp.phone || '';
      document.getElementById('e_email').value = emp.email || '';
      document.getElementById('e_hire').value = emp.hireDate || '';
      document.getElementById('e_salary').value = emp.salary || '';
      e_dept.value = emp.dept || 'unassigned';
      employeeForm.dataset.editId = emp.id;
    }
  } else {
    employeeForm.reset(); employeeForm.dataset.editId = '';
  }
}
function closeEmployeeModal(){ employeeModal.style.display = 'none'; employeeModal.setAttribute('aria-hidden','true'); }

/* Form submit add/edit employee */
employeeForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const obj = {
    id: employeeForm.dataset.editId || id('emp'),
    firstName: document.getElementById('e_first').value.trim(),
    lastName: document.getElementById('e_last').value.trim(),
    dept: document.getElementById('e_dept').value,
    title: document.getElementById('e_title').value.trim(),
    phone: document.getElementById('e_phone').value.trim(),
    email: document.getElementById('e_email').value.trim(),
    hireDate: document.getElementById('e_hire').value,
    salary: Number(document.getElementById('e_salary').value) || 0
  };
  if(obj.firstName.length < 2){ alert('الاسم يجب أن يكون حرفين عالأقل'); return; }
  if(employeeForm.dataset.editId){
    employees = employees.map(x=> x.id === obj.id ? obj : x);
    toast('تم تعديل بيانات الموظف');
  } else {
    employees.push(obj);
    toast('تم إضافة موظف');
  }
  renderAll();
  closeEmployeeModal();
});

/* Cancel modal */
employeeCancel.addEventListener('click', closeEmployeeModal);

/* Open modal button */
openAddEmployee.addEventListener('click', ()=> openEmployeeModal());

/* Basic add btn */
basicAddBtn.addEventListener('click', ()=> openEmployeeModal());

/* Basic search/filter */
basicSearch.addEventListener('input', ()=> renderBasicTable());
basicDeptFilter.addEventListener('change', ()=> renderBasicTable());

/* Export CSV (basic) */
basicExportCSV.addEventListener('click', ()=>{
  if(!employees.length){ alert('لا يوجد بيانات'); return; }
  const rows = [['ID','الاسم','العائلة','القسم','المسمى','الهاتف','البريد','الراتب','تاريخ التوظيف']];
  employees.forEach(e=> rows.push([e.id, e.firstName, e.lastName||'', getDeptLabel(e.dept), e.title||'', e.phone||'', e.email||'', e.salary||0, e.hireDate||'']));
  let csv = rows.map(r=> r.map(c=> `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  csv = '\uFEFF' + csv;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'employees.csv'; a.click(); URL.revokeObjectURL(url);
});

/* ===== Recruitment: jobs modal and applicants ===== */
openJobModal.addEventListener('click', ()=> { jobModal.style.display = 'flex'; jobModal.setAttribute('aria-hidden','false'); });
jobCancel.addEventListener('click', ()=> { jobModal.style.display = 'none'; jobModal.setAttribute('aria-hidden','true'); });
jobForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const t = document.getElementById('jobTitle').value.trim();
  const d = document.getElementById('jobDesc').value.trim();
  if(!t){ alert('المسمى مطلوب'); return; }
  jobs.push({ id: id('job'), title: t, desc: d, postedAt: nowISO() });
  jobModal.style.display = 'none';
  toast('تم نشر الوظيفة');
  renderAll();
});
function applyForJob(jobId){
  const name = prompt('اسمك؟'); if(!name) return;
  const phone = prompt('هاتف؟'); const email = prompt('بريد إلكتروني؟');
  applicants.push({ id: id('app'), name, phone, email, jobId, status: 'قيد المراجعة' });
  toast('تم إضافة المتقدم');
  renderApplicants();
}
function hireApplicant(appId){
  const app = applicants.find(a=> a.id === appId);
  if(!app) return;
  const job = jobs.find(j=> j.id===app.jobId) || {};
  const emp = { id: id('emp'), firstName: app.name, lastName: '', dept: 'unassigned', title: job.title || 'موظف', phone: app.phone, email: app.email, hireDate: formatDate(new Date()), salary: 0 };
  employees.push(emp);
  applicants = applicants.map(a=> a.id===appId? {...a, status:'تم التوظيف'} : a);
  toast('تم توظيف المتقدم');
  renderAll();
}

/* ===== Attendance actions ===== */
attendanceSave.addEventListener('click', ()=>{
  const empId = attendanceEmployee.value;
  if(!empId){ alert('اختر موظفا'); return; }
  const tin = attendanceIn.value; const tout = attendanceOut.value;
  if(!tin || !tout){ alert('ادخل وقت الدخول والخروج'); return; }
  const minutes = t => { const [hh,mm] = t.split(':').map(Number); return hh*60 + mm; };
  const worked = Math.max(0, minutes(tout) - minutes(tin));
  const hours = (worked/60).toFixed(2);
  const rec = { id: id('att'), empId, name: (employees.find(e=>e.id===empId)||{}).firstName || '', date: formatDate(new Date()), in: tin, out: tout, hours, status: hours >= 8 ? 'حاضر' : 'تأخير' };
  attendance.push(rec);
  toast('تم تسجيل الحضور');
  renderAll();
});

/* Clock In/Out: simple toggle per employee */
const clockState = {}; // empId -> lastIn timestamp
attendanceClock.addEventListener('click', ()=>{
  const empId = attendanceEmployee.value;
  if(!empId){ alert('اختر موظف'); return; }
  if(!clockState[empId]){
    // clock in
    clockState[empId] = { in: new Date().toTimeString().slice(0,5) };
    toast('Clocked In');
  } else {
    // clock out and record
    const tin = clockState[empId].in;
    const tout = new Date().toTimeString().slice(0,5);
    const minutes = t => { const [hh,mm] = t.split(':').map(Number); return hh*60 + mm; };
    const worked = Math.max(0, minutes(tout) - minutes(tin));
    const hours = (worked/60).toFixed(2);
    attendance.push({ id: id('att'), empId, name: (employees.find(e=>e.id===empId)||{}).firstName || '', date: formatDate(new Date()), in: tin, out: tout, hours, status: hours >= 8 ? 'حاضر' : 'تأخير' });
    delete clockState[empId];
    toast('Clocked Out & Recorded');
    renderAll();
  }
});

/* ===== Payroll actions ===== */
// لما يختار موظف، ينعرض راتبه الأساسي تلقائياً
payEmployee.addEventListener('change', ()=>{
  const empId = payEmployee.value;
  if(!empId){ 
    payBase.value = '';
    return;
  }
  const emp = employees.find(e=> e.id === empId);
  if(emp){
    payBase.value = emp.salary || 0;
  }
});

payCalc.addEventListener('click', ()=>{
  const base = Number(payBase.value)||0;
  const ot = Number(payOvertime.value)||0;
  const otRate = Number(document.getElementById('payOvertimeRate').value)||50;
  const allowances = Number(payAllowances.value)||0;
  const deductions = Number(document.getElementById('payDeduction').value)||0;

  const net = base + (ot*otRate) + allowances - deductions;
  alert('الصافي: ' + net);
});

paySave.addEventListener('click', ()=>{
  const empId = payEmployee.value;
  if(!empId){ alert('اختر موظف'); return; }

  const base = Number(payBase.value)||0;
  const ot = Number(payOvertime.value)||0;
  const otRate = Number(document.getElementById('payOvertimeRate').value)||50;
  const allowances = Number(payAllowances.value)||0;
  const deductions = Number(document.getElementById('payDeduction').value)||0;

  const net = base + (ot*otRate) + allowances - deductions;
  payrolls.push({
    id: id('pay'),
    empId,
    month: new Date().toLocaleDateString('en-GB', { month:'long', year:'numeric' }),
    base,
    overtime: ot,
    allowances,
    deductions,
    net
  });
  toast('تم حفظ قسيمة راتب');
  renderAll();
});

/* Print payroll */
function printPayroll(pid){
  const rec = payrolls.find(p=> p.id === pid); if(!rec) return;
  const emp = employees.find(e=> e.id === rec.empId) || {};
  const html = `<h2>قسيمة راتب - ${emp.firstName||''}</h2><p>الشهر: ${rec.month}</p><p>الأساسي: ${rec.base}</p><p>الإضافي: ${rec.overtime}</p><p>البدلات: ${rec.allowances}</p><h3>الصافي: ${rec.net}</h3>`;
  const w = window.open('', '_blank', 'width=700,height=600'); w.document.write(`<html dir="rtl"><head><title>قسيمة</title></head><body>${html}</body></html>`); w.document.close(); w.print();
}

/* ===== Performance ===== */
perfSave.addEventListener('click', ()=>{
  const empId = perfEmployee.value; if(!empId){ alert('اختر'); return; }
  const title = perfTitle.value.trim() || 'تقييم';
  const rating = perfRating.value;
  performances.push({ id: id('perf'), empId, title, rating, notes:'', date: nowISO() });
  toast('تم إضافة تقييم');
  renderAll();
});

/* ===== Training ===== */
trainingCreate.addEventListener('click', ()=>{
  const t = trainingTitle.value.trim(); const d = trainingDate.value;
  if(!t || !d){ alert('املأ العنوان والتاريخ'); return; }
  trainings.push({ id: id('trn'), title: t, date: d, participants: [] });
  trainingTitle.value=''; trainingDate.value='';
  toast('تم إنشاء دورة');
  renderAll();
});

/* ===== Leaves ===== */
leaveRequest.addEventListener('click', ()=>{
  const empId = leaveEmployee.value; if(!empId){ alert('اختر موظف'); return; }
  const s = leaveStart.value; const e = leaveEnd.value; if(!s || !e){ alert('حدد التواريخ'); return; }
  leaves.push({ id: id('leave'), empId, start: s, end: e, status: 'معلقة', reason:'' });
  toast('تم تقديم طلب إجازة');
  renderAll();
});

/* ===== Reports and CSV/JSON export/import ===== */
reportGenerate.addEventListener('click', ()=> buildReport());
exportCSVBtn.addEventListener('click', ()=> {
  // export all employees as CSV
  if(!employees.length){ alert('لا يوجد'); return; }
  const rows = [['ID','الاسم','العائلة','القسم','المسمى','الهاتف','البريد','الراتب','التوظيف']];
  employees.forEach(e=> rows.push([e.id, e.firstName, e.lastName||'', getDeptLabel(e.dept), e.title||'', e.phone||'', e.email||'', e.salary||0, e.hireDate||'']));
  let csv = rows.map(r=> r.map(c=> `"${String(c||'').replace(/"/g,'""')}"`).join(',')).join('\n'); csv = '\uFEFF' + csv;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' }); const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'employees_report.csv'; a.click(); URL.revokeObjectURL(url);
});
exportJSON.addEventListener('click', ()=>{
  const payload = { employees, jobs, applicants, attendance, payrolls, performances, trainings, leaves, exportedAt: nowISO() };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'hr_export.json'; a.click(); URL.revokeObjectURL(url);
});
importJSONBtn.addEventListener('click', ()=> importJSON.click());
importJSON.addEventListener('change', (e)=>{
  const file = e.target.files[0]; if(!file) return;
  const reader = new FileReader();
  reader.onload = function(evt){
    try{
      const p = JSON.parse(evt.target.result);
      if(confirm('استيراد الملف: (موافق = استبدال الجلسة الحالية، إلغاء = إضافة فوق)')) {
        employees = p.employees || []; jobs = p.jobs || []; applicants = p.applicants || []; attendance = p.attendance || [];
        payrolls = p.payrolls || []; performances = p.performances || []; trainings = p.trainings || []; leaves = p.leaves || [];
      } else {
        employees = employees.concat(p.employees || []);
        jobs = jobs.concat(p.jobs || []);
        applicants = applicants.concat(p.applicants || []);
        attendance = attendance.concat(p.attendance || []);
        payrolls = payrolls.concat(p.payrolls || []);
        performances = performances.concat(p.performances || []);
        trainings = trainings.concat(p.trainings || []);
        leaves = leaves.concat(p.leaves || []);
      }
      renderAll(); toast('تم استيراد البيانات (مؤقت)');
    }catch(err){ alert('خطأ في ملف JSON'); }
  };
  reader.readAsText(file);
});

/* Charts */
showCharts.addEventListener('click', ()=> showChartModal());
closeCharts && closeCharts.addEventListener('click', ()=> chartsArea.style.display = 'none');

/* Print / export helpers already included */

/* ===== Utility: toastr and quick confirm are above ===== */

/* ===== Initialization: populate departments selectors and initial render ===== */
function init(){
  populateDeptSelectors();
  basicDeptFilter.value = '';
  // load persisted if exist (but only if persistenceEnabled previous)
  if(localStorage.getItem(STORAGE) && confirm('يوجد بيانات محفوظة سابقا. هل تريد تحميلها؟')) loadFromStorage();
  renderAll();
}
init();

/* Render All wrapper */
function renderAll() {
  renderStats();
  renderRecentEmployees();
  renderDashboardDepts();
  renderBasicTable();
  renderJobs();
  renderApplicants();
  renderAttendanceTable();
  renderPayrolls();
  renderPerformance();
  renderTrainings();
  renderLeaves();
  populateEmployeeSelects();
  buildReport();
  if(persistenceEnabled) saveToStorage();
}

/* Misc helpers: populate employee selects (again) */
function populateEmployeeSelects(){ populateEmployeeSelectsInternal(); }
function populateEmployeeSelectsInternal(){
  const sels = [attendanceEmployee, payEmployee, perfEmployee, leaveEmployee];
  sels.forEach(sel=>{
    if(!sel) return;
    sel.innerHTML = '';
    const p = document.createElement('option'); p.value=''; p.textContent='اختر موظف'; sel.appendChild(p);
    employees.forEach(e=>{ const o = document.createElement('option'); o.value = e.id; o.textContent = `${e.firstName} ${e.lastName||''}`; sel.appendChild(o); });
  });
}

/* small delay to ensure selectors filled */
setTimeout(()=>{ populateDeptSelectors(); populateEmployeeSelectsInternal(); renderAll(); }, 80);

/* final small keyboard shortcuts */
document.addEventListener('keydown', (e)=>{
  if(e.altKey && e.key.toLowerCase() === 'n'){ e.preventDefault(); openEmployeeModal(); }
  if(e.ctrlKey && e.key.toLowerCase() === 's'){ e.preventDefault(); saveToStorage(); toast('تم الحفظ (لو مفعل)'); }
});

/* small note in console */
console.info('HR System loaded — كل شيء يعمل بالذاكرة. اطلب "كمل" لتطوير أي جزء أو تفعيل الحفظ.');


