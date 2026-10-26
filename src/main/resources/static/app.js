const $ = (s, root=document) => root.querySelector(s);
const $$ = (s, root=document) => [...root.querySelectorAll(s)];
let currentPage = "home";
const pageTitles = {home:"Dashboard",companies:"Company Drives",students:"Students",applications:"Applications",eligibility:"Eligibility Checker",placed:"Placed Students"};
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const money = v => v == null ? "—" : `₹${Number(v).toLocaleString("en-IN",{maximumFractionDigits:2})} LPA`;
const dateText = v => v ? String(v).slice(0,10) : "—";
const statusBadge = s => `<span class="badge ${String(s||"").toLowerCase()}">${esc(s||"—")}</span>`;
async function api(path, options={}) {
  const res = await fetch(`/api${path}`, {headers:{"Content-Type":"application/json"},...options});
  let data={}; try{data=await res.json()}catch{}
  if(!res.ok) throw new Error(data.error || data.message || `Request failed (${res.status})`);
  return data;
}
function toast(message, type="success") {
  const el=$("#toast"); el.textContent=message; el.className=`toast show ${type}`;
  clearTimeout(toast.timer); toast.timer=setTimeout(()=>el.className="toast",4200);
}
function navigate(page) {
  currentPage=page; $("#page-title").textContent=pageTitles[page]||"Dashboard";
  $$(".nav-item").forEach(b=>b.classList.toggle("active",b.dataset.page===page));
  renderPage();
}
$$(".nav-item").forEach(b=>b.addEventListener("click",()=>navigate(b.dataset.page)));
async function renderPage() {
  const el=$("#page-content"); el.innerHTML=`<div class="panel">Loading portal data…</div>`;
  try {
    if(currentPage==="home") await renderHome(el);
    if(currentPage==="students") await renderStudents(el);
    if(currentPage==="companies") await renderCompanies(el);
    if(currentPage==="applications") await renderApplications(el);
    if(currentPage==="eligibility") await renderEligibility(el);
    if(currentPage==="placed") await renderPlaced(el);
  } catch(e) { el.innerHTML=`<div class="panel"><h3>Could not load data</h3><p class="muted">${esc(e.message)}</p><button class="primary-btn" onclick="renderPage()">Retry</button><p class="muted">Confirm MySQL is running, the schema is imported and application.properties has correct credentials.</p></div>`; }
}
function stat(label,value,icon,note){return `<div class="stat-card"><div class="stat-top"><span>${label}</span><span class="stat-icon">${icon}</span></div><div class="stat-value">${value}</div><div class="stat-note">${note}</div></div>`}
function companyRow(c){return `<div class="company-row"><div class="company-logo">${esc((c.name||"?").slice(0,1).toUpperCase())}</div><div class="company-main"><strong>${esc(c.name)}</strong><small>${esc(c.role_title)} · ${esc(c.job_type)} · Min CGPA ${esc(c.minimum_cgpa)}</small></div><div class="company-meta"><b>${money(c.ctc_lpa)}</b><small>${dateText(c.drive_date)}</small></div>${statusBadge(c.status)}</div>`}
async function renderHome(el) {
  const d=await api("/dashboard");
  el.innerHTML=`<div class="hero"><span class="hero-tag">✦ CAMPUS RECRUITMENT SUITE</span><h2>Welcome to your <span class="gradient-text">Placement Portal</span></h2><p>Track company visits, verify student eligibility, manage applications and monitor placement outcomes — all in one place.</p></div>
  <div class="stats-grid">${stat("Registered Students",d.students,"♙","Student academic profiles")}${stat("Company Drives",d.companies,"▣","Recruitment opportunities")}${stat("Applications",d.applications,"▤","Submitted applications")}${stat("Students Placed",d.placed,"★","Successful outcomes")}</div>
  <div class="dashboard-grid"><div class="panel"><div class="panel-head"><div><div class="panel-title">Upcoming Company Drives</div><div class="panel-sub">Recruitment opportunities and eligibility criteria</div></div><button class="text-button" data-go="companies">View all →</button></div><div class="company-list">${d.upcoming.length?d.upcoming.map(companyRow).join(""):`<div class="empty">No company drives yet. Add a company to get started.</div>`}</div></div>
  <div class="panel"><div class="panel-head"><div><div class="panel-title">Recent Applications</div><div class="panel-sub">Latest student recruitment activity</div></div><button class="text-button" data-go="applications">View all →</button></div><div class="activity-list">${d.recentApplications.length?d.recentApplications.map(a=>`<div class="activity"><span class="activity-dot"></span><div class="activity-main"><strong>${esc(a.student)} · ${esc(a.company)}</strong><small>${esc(a.role_title)} · ${dateText(a.applied_at)}</small></div>${statusBadge(a.status)}</div>`).join(""):`<div class="empty">Applications will appear here once students apply.</div>`}</div></div></div>`;
  $$("[data-go]",el).forEach(b=>b.onclick=()=>navigate(b.dataset.go));
}
function pageHeading(title,desc,buttonLabel,buttonAction){return `<div class="page-heading"><div><div class="panel-title">${title}</div><p>${desc}</p></div>${buttonLabel?`<button class="primary-btn" id="add-btn">＋ ${buttonLabel}</button>`:""}</div>`}
function tablePage(heading,desc,button,columns,rows,search=true){return `${pageHeading(heading,desc,button)}${search?`<div class="filters"><input id="table-search" class="search-input" placeholder="Search records…"></div>`:""}<div class="table-wrap"><table><thead><tr>${columns.map(c=>`<th>${c}</th>`).join("")}</tr></thead><tbody id="table-body">${rows||""}</tbody></table></div>`}
function filterTable(){const input=$("#table-search"),body=$("#table-body");if(!input||!body)return;input.oninput=()=>$$("tr",body).forEach(r=>r.hidden=!r.innerText.toLowerCase().includes(input.value.toLowerCase()));}
function openModal(title,fields,onSave) {
  const root=$("#modal-root"); root.innerHTML=`<div class="modal-backdrop"><div class="modal" role="dialog" aria-modal="true"><div class="modal-head"><h2>${title}</h2><button class="close-btn" id="modal-close">✕</button></div><form id="data-form"><div class="form-grid">${fields.map(f=>`<div class="form-group ${f.full?"full":""}"><label for="${f.name}">${f.label}</label>${f.options?`<select id="${f.name}" name="${f.name}" ${f.required===false?"":"required"}>${f.options.map(o=>`<option value="${o.value}">${o.label}</option>`).join("")}</select>`:f.textarea?`<textarea id="${f.name}" name="${f.name}" rows="3" ${f.required===false?"":"required"} placeholder="${f.placeholder||""}"></textarea>`:`<input id="${f.name}" name="${f.name}" type="${f.type||"text"}" value="${f.value??""}" ${f.min!==undefined?`min="${f.min}"`:""} ${f.max!==undefined?`max="${f.max}"`:""} ${f.step?`step="${f.step}"`:""} ${f.required===false?"":"required"} placeholder="${f.placeholder||""}">`}</div>`).join("")}</div><div class="modal-actions"><button type="button" class="secondary-btn" id="modal-cancel">Cancel</button><button class="primary-btn" type="submit">Save record</button></div></form></div></div>`;
  const close=()=>root.innerHTML="";$("#modal-close").onclick=close;$("#modal-cancel").onclick=close;
  $(".modal-backdrop",root).onclick=e=>{if(e.target.classList.contains("modal-backdrop"))close()};
  $("#data-form",root).onsubmit=async e=>{e.preventDefault();const data=Object.fromEntries(new FormData(e.target).entries());try{await onSave(data);close();toast("Saved successfully.");renderPage()}catch(err){toast(err.message,"error")}};
}
async function renderStudents(el){
 const list=await api("/students");
 const rows=list.map(s=>`<tr><td>${esc(s.roll_no)}</td><td><strong>${esc(s.full_name)}</strong><br><span class="muted">${esc(s.email)}</span></td><td>${esc(s.department)}</td><td>${esc(s.graduation_year)}</td><td>${esc(s.cgpa)}</td><td>${esc(s.active_backlogs)}</td><td><button class="danger-btn small-btn" data-delete="${s.id}">Delete</button></td></tr>`).join("");
 el.innerHTML=tablePage("Student Directory","Manage student profiles and academic eligibility data.","Add Student",["Roll No","Student","Department","Year","CGPA","Backlogs","Action"],rows);
 $("#add-btn").onclick=()=>openModal("Register Student",[
 {name:"rollNo",label:"Roll number"},{name:"fullName",label:"Full name"},{name:"email",label:"Email",type:"email"},{name:"department",label:"Department",value:"MCA"},{name:"graduationYear",label:"Graduation year",type:"number",value:new Date().getFullYear()+1},{name:"cgpa",label:"CGPA (0–10)",type:"number",min:0,max:10,step:.01,value:7.5},{name:"activeBacklogs",label:"Active backlogs",type:"number",min:0,value:0},{name:"phone",label:"Phone (optional)",required:false}],d=>api("/students",{method:"POST",body:JSON.stringify(d)}));
 $$("[data-delete]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this student and their linked applications?"))try{await api(`/students/${b.dataset.delete}`,{method:"DELETE"});toast("Student deleted.");renderPage()}catch(e){toast(e.message,"error")}});
 filterTable();
}
async function renderCompanies(el){
 const list=await api("/companies");
 const rows=list.map(c=>`<tr><td><strong>${esc(c.name)}</strong><br><span class="muted">${esc(c.role_title)}</span></td><td>${esc(c.job_type)}</td><td>${money(c.ctc_lpa)}</td><td>${esc(c.minimum_cgpa)}</td><td>${esc(c.max_backlogs)}</td><td>${dateText(c.drive_date)}</td><td>${statusBadge(c.status)}</td><td><button class="danger-btn small-btn" data-delete="${c.id}">Delete</button></td></tr>`).join("");
 el.innerHTML=tablePage("Company Drives","Manage campus hiring drives, packages and eligibility rules.","Add Company",["Company / Role","Type","CTC","Min CGPA","Max Backlogs","Drive Date","Status","Action"],rows);
 $("#add-btn").onclick=()=>openModal("Add Company Drive",[
 {name:"name",label:"Company name"},{name:"roleTitle",label:"Job role"},{name:"jobType",label:"Job type",options:["PRODUCT","SERVICE","CONSULTING","OTHER"].map(x=>({value:x,label:x}))},{name:"ctcLpa",label:"CTC (LPA)",type:"number",min:0,step:.01,value:6},{name:"minimumCgpa",label:"Minimum CGPA",type:"number",min:0,max:10,step:.01,value:6},{name:"maxBacklogs",label:"Maximum active backlogs",type:"number",min:0,value:0},{name:"driveDate",label:"Drive date",type:"date",value:new Date(Date.now()+14*86400000).toISOString().slice(0,10)},{name:"status",label:"Drive status",options:["UPCOMING","OPEN","CLOSED"].map(x=>({value:x,label:x}))},{name:"description",label:"Description (optional)",textarea:true,required:false,full:true}],d=>api("/companies",{method:"POST",body:JSON.stringify(d)}));
 $$("[data-delete]").forEach(b=>b.onclick=async()=>{if(confirm("Delete this drive and its linked applications?"))try{await api(`/companies/${b.dataset.delete}`,{method:"DELETE"});toast("Company drive deleted.");renderPage()}catch(e){toast(e.message,"error")}});
 filterTable();
}
async function renderApplications(el){
 const list=await api("/applications");
 const rows=list.map(a=>`<tr><td>#${a.id}</td><td><strong>${esc(a.student)}</strong><br><span class="muted">${esc(a.roll_no)}</span></td><td>${esc(a.company)}<br><span class="muted">${esc(a.role_title)}</span></td><td>${money(a.ctc_lpa)}</td><td>${statusBadge(a.status)}</td><td><select class="field status-select" data-status="${a.id}">${["APPLIED","SHORTLISTED","REJECTED","PLACED"].map(s=>`<option ${s===a.status?"selected":""}>${s}</option>`).join("")}</select></td><td><button class="secondary-btn small-btn" data-update="${a.id}">Update</button></td></tr>`).join("");
 el.innerHTML=tablePage("Application Management","Review candidates and update recruitment outcomes.",null,["ID","Student","Company / Role","CTC","Current Status","Change Status","Action"],rows);
 $$("[data-update]").forEach(b=>b.onclick=async()=>{const id=b.dataset.update,status=$(`[data-status="${id}"]`).value;try{await api(`/applications/${id}`,{method:"PATCH",body:JSON.stringify({status})});toast("Application status updated.");renderPage()}catch(e){toast(e.message,"error")}});
 filterTable();
}
async function renderEligibility(el){
 const [students,companies,applications]=await Promise.all([api("/students"),api("/companies"),api("/applications")]);
 const activeCompanies=companies.filter(c=>String(c.status).toUpperCase()!=="CLOSED");
 const appliedPairs=new Set(applications.map(a=>`${a.student_id}:${a.company_id}`));
 const eligibility=(s,c)=>{
   const reasons=[];
   if(Number(s.cgpa)<Number(c.minimum_cgpa)) reasons.push(`CGPA ${s.cgpa} is below ${c.minimum_cgpa}`);
   if(Number(s.active_backlogs)>Number(c.max_backlogs)) reasons.push(`${s.active_backlogs} backlog(s), maximum allowed ${c.max_backlogs}`);
   if(String(c.status).toUpperCase()==="CLOSED") reasons.push("Drive is closed");
   return {ok:reasons.length===0,reasons};
 };
 const eligibleCompanyIdsByStudent=new Map(students.map(s=>[s.id,activeCompanies.filter(c=>eligibility(s,c).ok).map(c=>c.id)]));
 const noCompanyStudents=students.filter(s=>(eligibleCompanyIdsByStudent.get(s.id)||[]).length===0);
 const companySections=companies.map(c=>{
   const closed=String(c.status).toUpperCase()==="CLOSED";
   const eligible=closed?[]:students.filter(s=>eligibility(s,c).ok);
   const body=eligible.length?eligible.map(s=>{
     const pair=`${s.id}:${c.id}`;
     const alreadyApplied=appliedPairs.has(pair);
     return `<div class="eligible-student-row">
       <div class="eligible-student-main"><strong>${esc(s.full_name)}</strong><span>${esc(s.roll_no)} · ${esc(s.department)} · Graduation ${esc(s.graduation_year)}</span></div>
       <div class="eligible-metric"><small>CGPA</small><b>${esc(s.cgpa)} / 10</b></div>
       <div class="eligible-metric"><small>Backlogs</small><b>${esc(s.active_backlogs)}</b></div>
       <div class="eligible-actions">${alreadyApplied?`<span class="badge applied">Already Applied</span>`:`<button class="primary-btn small-btn" data-apply-student="${s.id}" data-apply-company="${c.id}">Apply Application →</button>`}</div>
     </div>`;
   }).join(""):`<div class="empty">${closed?"This drive is closed and is not accepting applications.":"No students currently meet this company's eligibility criteria."}</div>`;
   return `<section class="company-eligibility-card"><div class="company-eligibility-head"><div><div class="panel-title">${esc(c.name)}</div><div class="panel-sub">${esc(c.role_title)} · ${esc(c.job_type)} · ${money(c.ctc_lpa)} · Drive ${dateText(c.drive_date)}</div></div><div class="company-criteria"><span>Min CGPA <b>${esc(c.minimum_cgpa)}</b></span><span>Max backlogs <b>${esc(c.max_backlogs)}</b></span>${statusBadge(c.status)}</div></div><div class="eligible-student-list">${body}</div></section>`;
 }).join("");
 const noCompanyRows=noCompanyStudents.length?noCompanyStudents.map(s=>{
   const reasons=activeCompanies.map(c=>({company:c.name,...eligibility(s,c)})).filter(x=>!x.ok);
   return `<tr><td><strong>${esc(s.full_name)}</strong><br><span class="muted">${esc(s.roll_no)}</span></td><td>${esc(s.department)}</td><td>${esc(s.cgpa)} / 10</td><td>${esc(s.active_backlogs)}</td><td>${reasons.length?reasons.map(r=>`<div class="ineligible-reason"><b>${esc(r.company)}:</b> ${r.reasons.map(esc).join("; ")}</div>`).join(""):"No active company drives available"}</td></tr>`;
 }).join(""):`<tr><td colspan="5"><div class="empty">Every student is eligible for at least one available company drive. Great!</div></td></tr>`;
 el.innerHTML=`<div class="page-heading"><div><div class="panel-title">Eligibility & Apply</div><p>All companies are checked automatically. Eligible students appear under each company, with a one-click application action.</p></div><button class="secondary-btn" id="refresh-eligibility">↻ Refresh results</button></div>
 <div class="eligibility-summary-grid">${stat("Students",students.length,"♙","Registered student profiles")}${stat("Available Drives",activeCompanies.length,"▣","Open or upcoming, not closed")}${stat("Eligible Matches",activeCompanies.reduce((n,c)=>n+students.filter(s=>eligibility(s,c).ok).length,0),"✓","Student-company combinations")}${stat("Not Eligible Anywhere",noCompanyStudents.length,"!","Students with no qualifying drive")}</div>
 <div class="panel-head eligibility-section-title"><div><div class="panel-title">Eligible students by company</div><div class="panel-sub">A student can appear under multiple companies. Apply separately for each company.</div></div></div>
 ${!students.length?`<div class="empty">No students registered yet. Add students in the Students section first.</div>`:!companies.length?`<div class="empty">No company drives added yet. Add companies in Company Drives first.</div>`:companySections}
 <section class="company-eligibility-card ineligible-panel"><div class="company-eligibility-head"><div><div class="panel-title">Students not eligible for any company</div><div class="panel-sub">These students do not meet the CGPA/backlog criteria for any non-closed drive.</div></div><span class="badge rejected">${noCompanyStudents.length} student(s)</span></div><div class="table-wrap"><table><thead><tr><th>Student</th><th>Department</th><th>CGPA</th><th>Backlogs</th><th>Why not eligible</th></tr></thead><tbody>${noCompanyRows}</tbody></table></div></section>`;
 $("#refresh-eligibility").onclick=()=>renderPage();
 $$('[data-apply-student]',el).forEach(button=>button.onclick=async()=>{
   const studentId=Number(button.dataset.applyStudent),companyId=Number(button.dataset.applyCompany);
   const student=students.find(s=>Number(s.id)===studentId),company=companies.find(c=>Number(c.id)===companyId);
   if(!student||!company)return;
   button.disabled=true;button.textContent="Submitting…";
   try{const result=await api("/applications",{method:"POST",body:JSON.stringify({studentId,companyId})});toast(result.message||`Application submitted for ${student.full_name}.`);await renderEligibility(el);}
   catch(err){toast(err.message,"error");button.disabled=false;button.textContent="Apply Application →";}
 });
}
async function renderPlaced(el){
 const list=await api("/placed");
 const rows=list.map(s=>`<tr><td>${esc(s.roll_no)}</td><td><strong>${esc(s.student)}</strong></td><td>${esc(s.department)}</td><td>${esc(s.company)}</td><td>${esc(s.role_title)}</td><td>${money(s.ctc_lpa)}</td><td>${statusBadge("PLACED")}</td></tr>`).join("");
 el.innerHTML=tablePage("Placed Students","Verified placement outcomes from application records.",null,["Roll No","Student","Department","Company","Role","CTC","Status"],rows);
 filterTable();
}
renderPage();
