
async function loadQuestions(){
  try{
    const res = await fetch('questions.json');
    const qs = await res.json();
    return qs;
  }catch(e){
    console.error('Failed to load questions', e);
    return null;
  }
}

function renderQuestions(qs){
  const quizArea = document.getElementById('quiz-area');
  const sectionsOrder = ['Math','English','Reasoning','GK'];
  sectionsOrder.forEach(sec => {
    const secQs = qs.filter(q => q.section === sec);
    const secDiv = document.createElement('section');
    secDiv.innerHTML = `<h2 class="section-title">${sec} (${secQs.length} Q)</h2>`;
    secQs.forEach((q,i) => {
      const card = document.createElement('div');
      card.className = 'question-card';
      card.id = q.id;
      const html = `
        <div class="qtext">${q.id}. ${q.q}</div>
        <div class="options">
          ${q.options.map((opt, idx) => `<label><input type="radio" name="${q.id}" value="${idx}" /> ${opt}</label>`).join('')}
        </div>
      `;
      card.innerHTML = html;
      secDiv.appendChild(card);
    });
    quizArea.appendChild(secDiv);
  });
}

function computeResults(qs){
  const userAnswers = {};
  qs.forEach(q => {
    const sel = document.querySelector(`input[name="${q.id}"]:checked`);
    userAnswers[q.id] = sel ? Number(sel.value) : null;
  });
  const sections = {};
  let total = 0, maxTotal = qs.length;
  qs.forEach(q => {
    sections[q.section] = sections[q.section] || {correct:0,total:0};
    sections[q.section].total += 1;
    if(userAnswers[q.id] === q.answer) sections[q.section].correct += 1;
    if(userAnswers[q.id] === q.answer) total += 1;
  });
  return {sections,total,maxTotal,userAnswers};
}

document.addEventListener('DOMContentLoaded', async ()=>{
  const qs = await loadQuestions();
  if(!qs){ document.getElementById('quiz-area').innerHTML='<p>Questions could not be loaded.</p>'; return; }
  renderQuestions(qs);
  document.getElementById('submitBtn').addEventListener('click', ()=>{
    const name = document.getElementById('name').value || 'Guest';
    const results = computeResults(qs);
    const resDiv = document.getElementById('result');
    resDiv.style.display = 'block';
    let html = `<h3>Result for ${name}</h3><ul>`;
    for(const s of Object.keys(results.sections)) {
      html += `<li><strong>${s}:</strong> ${results.sections[s].correct} / ${results.sections[s].total}</li>`;
    }
    html += `</ul><p><strong>Total:</strong> ${results.total} / ${results.maxTotal}</p>`;
    const unanswered = Object.keys(results.userAnswers).filter(k=>results.userAnswers[k]===null);
    if(unanswered.length) html += `<p class="small">Unanswered: ${unanswered.length} question(s).</p>`;
    resDiv.innerHTML = html;
    resDiv.scrollIntoView({behavior:'smooth'});
  });
});
