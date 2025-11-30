/* js/main.js
   Arquivo único - contém todas as interações do front-end:
   - Canvas animado
   - Greeting dinâmico
   - Menu mobile toggle
   - Planos dinâmicos (página + modal)
   - Modal login completo (validação dos termos)
   - Termos de uso em modal (texto extenso)
   - Simulação de login e compra (localStorage)
   - Redirecionamento "Esqueci a senha" para WhatsApp
   - Pequenas notificações (toasts)
*/

/* ========= CONFIG ========= */
const WHATSAPP = "https://wa.me/5544999119849";

/* Planos definidos (pode editar valores aqui) */
const PLANS = [
  { id: "diario", title: "Diário", priceBRL: 10, days: 1, description: "Acesso por 1 dia" },
  { id: "semanal", title: "Semanal", priceBRL: 25, days: 7, description: "Acesso por 7 dias" },
  { id: "quinzenal", title: "Quinzenal", priceBRL: 50, days: 15, description: "Acesso por 15 dias" },
  { id: "mensal", title: "Mensal", priceBRL: 100, days: 30, description: "Acesso completo 30 dias" },
];

/* ========= UTILITÁRIOS ========= */
function $(sel) { return document.querySelector(sel); }
function $all(sel) { return Array.from(document.querySelectorAll(sel)); }

function createToast(message, type = "info", timeout = 3500) {
  const toast = document.createElement("div");
  toast.className = "ft-toast";
  toast.style = `
    position: fixed;
    right: 20px;
    bottom: 20px;
    background: rgba(18,18,30,0.95);
    color: white;
    padding: 12px 16px;
    border-radius: 10px;
    box-shadow: 0 8px 20px rgba(0,0,0,0.6);
    z-index: 99999;
    font-size: 14px;
    border: 1px solid rgba(199,162,232,0.18);
  `;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.style.opacity = "0", timeout - 250);
  setTimeout(() => toast.remove(), timeout);
}

/* Small helper to format currency BRL */
function fmtBRL(value) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

/* ========= CANVAS / PARTICLES ========= */
(function canvasModule(){
  const canvas = document.getElementById('data-network');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let particles = [];
  const PARTICLE_COUNT = 70;
  const CONNECT_DISTANCE = 150;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resize);
  resize();

  class P {
    constructor(x,y){
      this.x = x;
      this.y = y;
      this.r = Math.random()*1.5 + 0.5;
      this.vx = (Math.random()-0.5)*0.1;
      this.vy = (Math.random()-0.5)*0.1;
      this.opacity = Math.random()*0.4 + 0.1;
      this.pulse = 0;
    }
    update(){
      if (this.x + this.r > canvas.width || this.x - this.r < 0) this.vx *= -1;
      if (this.y + this.r > canvas.height || this.y - this.r < 0) this.vy *= -1;
      this.x += this.vx;
      this.y += this.vy;
      this.pulse = Math.max(0, this.pulse - 0.005);
      if (Math.random() < 0.0008) this.pulse = 1;
    }
    draw(){
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.r, 0, Math.PI*2);
      ctx.fillStyle = `rgba(255,255,255,${this.opacity.toFixed(2)})`;
      ctx.fill();
      if (this.pulse > 0) {
        ctx.shadowBlur = 10*this.pulse;
        const pulseColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft') || '#C7A2E8';
        ctx.shadowColor = pulseColor.trim();
        ctx.fillStyle = pulseColor.trim();
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.r*1.6, 0, Math.PI*2);
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
  }

  function init(){
    particles = [];
    for (let i=0;i<PARTICLE_COUNT;i++) particles.push(new P(Math.random()*canvas.width, Math.random()*canvas.height));
  }

  function connect(){
    const timeOffset = Date.now()/15000;
    for (let a=0;a<particles.length;a++){
      for (let b=a+1;b<particles.length;b++){
        const A = particles[a];
        const B = particles[b];
        const dist = Math.hypot(A.x - B.x, A.y - B.y);
        if (dist < CONNECT_DISTANCE){
          const alpha = 1 - (dist/CONNECT_DISTANCE);
          const lineWidth = 0.5;
          ctx.beginPath();
          ctx.strokeStyle = `rgba(74,20,140,${(alpha*0.45).toFixed(2)})`;
          ctx.lineWidth = lineWidth;
          ctx.moveTo(A.x, A.y);
          ctx.lineTo(B.x, B.y);
          ctx.stroke();

          // flow point
          const travel = (timeOffset % 1);
          const seg = 0.5;
          let t = travel < seg ? travel/seg : (1-travel)/seg;
          const fx = A.x + (B.x - A.x) * t;
          const fy = A.y + (B.y - A.y) * t;
          ctx.beginPath();
          ctx.arc(fx, fy, 2.2, 0, Math.PI*2);
          ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim() || '#C7A2E8';
          ctx.shadowBlur = 14;
          ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim() || '#C7A2E8';
          ctx.fill();
          ctx.shadowBlur = 0;
        }
      }
    }
  }

  function loop(){
    ctx.clearRect(0,0,canvas.width,canvas.height);
    connect();
    for (const p of particles){ p.update(); p.draw(); }
    requestAnimationFrame(loop);
  }

  init();
  loop();
})();

/* ========= GREETING ========= */
(function greeting() {
  const el = document.getElementById('greeting');
  if (!el) return;
  function update() {
    const h = new Date().getHours();
    let text = "Dados acessíveis com segurança.";
    if (h >= 5 && h < 12) text = "Bom dia. Suas consultas estão prontas.";
    else if (h >= 12 && h < 18) text = "Boa tarde. Continue avançando.";
    else text = "Boa noite. Dados acessíveis com segurança.";
    el.textContent = text;
  }
  update();
  setInterval(update, 60*1000);
})();

/* ========= MENU MOBILE ========= */
(function mobileMenu(){
  const btn = document.getElementById('mobile-menu-button');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => menu.classList.toggle('hidden'));
})();

/* ========= RENDER PLANOS (na página e modal) ========= */
function renderPlansTo(containerSelector, includeAction = true) {
  const container = typeof containerSelector === "string" ? document.querySelector(containerSelector) : containerSelector;
  if (!container) return;
  container.innerHTML = ""; // limpa
  PLANS.forEach(plan => {
    const card = document.createElement('div');
    card.className = 'card-module p-6 rounded-2xl text-center';
    card.style.minHeight = '160px';
    card.style.display = 'flex';
    card.style.flexDirection = 'column';
    card.style.justifyContent = 'space-between';
    card.innerHTML = `
      <div>
        <h3 class="text-xl font-bold mb-2">${plan.title}</h3>
        <p class="text-gray-300 mb-4">${plan.description}</p>
        <div class="text-3xl font-extrabold mb-2">${fmtBRL(plan.priceBRL)}</div>
      </div>
      <div>
        ${includeAction ? `<button class="btn-premium select-plan px-4 py-2 rounded-full" data-plan="${plan.id}">Selecionar</button>` : ''}
      </div>
    `;
    container.appendChild(card);
  });
}

/* Inicial render da área de planos na página (vazia inicialmente) */
document.addEventListener('DOMContentLoaded', () => {
  // No HTML enviado, "planos-container" existe; mostramos os planos lá
  renderPlansTo('#planos-container', true);

  // Também pre-render para modal container (se existir)
  renderPlansTo('#planos-container-modal', true);

  // Bind handlers para botões Selecionar (delegation)
  document.body.addEventListener('click', (e) => {
    // open login modal if buttons with class btn-open-login are clicked
    if (e.target.closest('.btn-open-login')) {
      openLoginModal();
      return;
    }
    // buttons inside plans (page or modal)
    const planBtn = e.target.closest('.select-plan');
    if (planBtn) {
      const planId = planBtn.getAttribute('data-plan');
      openLoginModal(planId);
      return;
    }
  });
});

/* ========= MODAL LOGIN / PLANOS FLOW ========= */
const modalBackdrop = $('#modal-backdrop');
const modalCloseBtn = $('#modal-close');
const loginForm = $('#login-form');
const planosContainerModal = $('#planos-container-modal');

function openLoginModal(preselectPlanId = null) {
  if (!modalBackdrop) return;
  modalBackdrop.classList.remove('hidden');
  // ensure modal's plan list is rendered and, if preselectPlanId, highlight
  renderPlansTo('#planos-container-modal', true);
  if (preselectPlanId) {
    // highlight by adding a visual "selected" style to the button
    setTimeout(() => {
      const btn = document.querySelector(`#planos-container-modal .select-plan[data-plan="${preselectPlanId}"]`);
      if (btn) {
        btn.classList.add('selected-plan');
        btn.textContent = "Selecionado — Clique para efetuar login";
        // Scroll to it
        btn.scrollIntoView({behavior:'smooth', block:'center'});
      }
    }, 60);
    // store a pendingPlan marker
    modalBackdrop.dataset.pendingPlan = preselectPlanId;
  } else {
    delete modalBackdrop.dataset.pendingPlan;
  }
  // focus username
  setTimeout(()=> {
    const u = document.getElementById('login-user');
    if (u) u.focus();
  }, 120);
}

function closeLoginModal() {
  if (!modalBackdrop) return;
  modalBackdrop.classList.add('hidden');
  delete modalBackdrop.dataset.pendingPlan;
  // clear any selected-plan labels
  $all('#planos-container-modal .select-plan.selected-plan').forEach(b => {
    b.classList.remove('selected-plan');
    b.textContent = "Selecionar";
  });
}

/* close button */
if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeLoginModal);
/* clicking outside to close */
if (modalBackdrop) modalBackdrop.addEventListener('click', (ev) => {
  if (ev.target === modalBackdrop) closeLoginModal();
});

/* ========= LOGIN FORM HANDLING ========= */
if (loginForm) {
  loginForm.addEventListener('submit', (ev) => {
    ev.preventDefault();
    const user = (document.getElementById('login-user')||{value:''}).value.trim();
    const pass = (document.getElementById('login-pass')||{value:''}).value;
    const termsChecked = (document.getElementById('terms-check')||{checked:false}).checked;

    if (!termsChecked) {
      createToast("Você precisa aceitar os Termos de Uso para continuar.", "warn");
      return;
    }
    if (user.length < 2 || pass.length < 3) {
      createToast("Usuário ou senha inválidos (mínimo).", "error");
      return;
    }

    // Simula autenticação: grava usuário no localStorage com carimbo e prossegue
    const userObj = { username: user, loggedAt: Date.now() };
    localStorage.setItem('4track_user', JSON.stringify(userObj));
    createToast(`Login realizado como ${user}.`, "success", 3000);

    // Se havia um plano pendente, processa compra simulada
    const pendingPlan = modalBackdrop && modalBackdrop.dataset.pendingPlan;
    if (pendingPlan) {
      // encontrar plano
      const plan = PLANS.find(p => p.id === pendingPlan);
      if (plan) {
        // grava subscription: expires = agora + plan.days
        const expires = new Date();
        expires.setDate(expires.getDate() + plan.days);
        const subscription = {
          planId: plan.id,
          title: plan.title,
          priceBRL: plan.priceBRL,
          startedAt: Date.now(),
          expiresAt: expires.getTime()
        };
        localStorage.setItem('4track_subscription', JSON.stringify(subscription));
        createToast(`Assinatura ${plan.title} ativada — válida até ${expires.toLocaleDateString()}`, "success", 5000);
        delete modalBackdrop.dataset.pendingPlan;
      }
    }

    // close modal after short delay
    setTimeout(() => closeLoginModal(), 700);
  });
}

/* ========= SELECIONAR/COMPRAR DENTRO DO MODAL ========= */
/* Se usuário clicar em um botão Select dentro do modal após estar logado,
   consideramos que ele quer finalizar a compra sem preencher login novamente.
   Implementamos um handler por delegation no body (acima), vamos estender:
*/
document.body.addEventListener('click', (e) => {
  const btn = e.target.closest('.select-plan');
  if (!btn) return;
  const planId = btn.getAttribute('data-plan');
  // If user logged in already, finalize purchase immediately
  const storedUser = localStorage.getItem('4track_user');
  if (storedUser) {
    const plan = PLANS.find(p => p.id === planId);
    if (plan) {
      const expires = new Date();
      expires.setDate(expires.getDate() + plan.days);
      const subscription = {
        planId: plan.id,
        title: plan.title,
        priceBRL: plan.priceBRL,
        startedAt: Date.now(),
        expiresAt: expires.getTime()
      };
      localStorage.setItem('4track_subscription', JSON.stringify(subscription));
      createToast(`Assinatura ${plan.title} ativada — válida até ${expires.toLocaleDateString()}`, "success", 4500);
      closeLoginModal();
    }
  } else {
    // Not logged: open login modal and preselect pending plan
    openLoginModal(planId);
    createToast("Faça login para finalizar a contratação do plano.", "info", 2200);
  }
});

/* ========= CHECK EXISTING SUBSCRIPTION / UI HINT ========= */
(function checkSubscriptionBadge(){
  const sub = localStorage.getItem('4track_subscription');
  if (sub) {
    try {
      const s = JSON.parse(sub);
      const expires = new Date(s.expiresAt);
      createToast(`Você possui ${s.title} válida até ${expires.toLocaleDateString()}`, "info", 5000);
    } catch(e){}
  }
})();

/* ========= "ESQUECI A SENHA" & "CRIAR CONTA" LINKS ========= */
(function bindWhatsAppLinks(){
  // Update any anchor that explicitly points to wa.me? provided earlier in HTML was direct href
  // But also ensure any element with data-wa attribute triggers WA
  document.body.addEventListener('click', (e) => {
    const a = e.target.closest('a');
    if (!a) return;
    // If anchor has href containing wa.me or explicitly leads to whatsapp, let it be
    if (a.getAttribute('href') && a.getAttribute('href').includes('wa.me')) return;
    // If link text contains "Esqueci" or "Criar conta", redirect to WhatsApp
    const txt = (a.textContent||'').toLowerCase();
    if (txt.includes('esqueci') || txt.includes('criar conta') || a.classList.contains('wa-redirect')) {
      e.preventDefault();
      window.open(WHATSAPP, '_blank');
    }
  });
})();

/* ========= TERMS MODAL ========= */
function openTermsModal() {
  // create overlay (only one)
  if (document.getElementById('ft-terms-overlay')) return; // already open
  const overlay = document.createElement('div');
  overlay.id = 'ft-terms-overlay';
  overlay.style = `
    position: fixed; inset:0; z-index:999999; display:flex; align-items:center; justify-content:center;
    background: rgba(0,0,0,0.85); padding: 20px; overflow:auto;
  `;
  // long juridic text (you can expand/edit)
  const content = document.createElement('div');
  content.style = "max-width:900px; background:linear-gradient(180deg, rgba(12,12,30,0.98), rgba(8,8,16,0.98)); padding:28px; border-radius:12px; color:#EAE6F6; box-shadow: 0 10px 40px rgba(0,0,0,0.6); border:1px solid rgba(199,162,232,0.08);";
  content.innerHTML = `
    <button id="ft-terms-close" style="float:right; background:transparent; border:none; color:#ccc; font-size:22px; cursor:pointer;">&times;</button>
    <h2 style="margin-top:4px; margin-bottom:8px; color:#fff;">Termos de Uso - 4Track</h2>
    <div style="max-height:65vh; overflow:auto; padding-right:8px; line-height:1.45; font-size:13px;">
      <p><strong>1. Objeto:</strong> Estes Termos regem o uso da plataforma 4Track, seus módulos de consulta, interfaces e serviços relacionados.</p>
      <p><strong>2. Concordância:</strong> Ao utilizar o serviço, o usuário declara aceitar integralmente estes Termos e a Política de Privacidade.</p>
      <p><strong>3. Tratamento de Dados:</strong> Em conformidade com a Lei nº 13.709/2018 (LGPD) e com o Marco Civil da Internet (Lei nº 12.965/2014), a 4Track coleta e mantém registros (logs) de acesso, IPs, ações e operações para fins de auditoria, segurança e cumprimento de ordem judicial.</p>
      <p><strong>4. Proibições:</strong> É vedado ao usuário a prática de atividades ilícitas, violação de sistemas, invasão, distribuição de credenciais, scraping não autorizado, utilização de robôs ou automações que provoquem sobrecarga, ou qualquer conduta que viole a legislação, inclusive os arts. 154-A e 154 do Código Penal e a Lei nº 12.737/2012 que tipifica crimes contra sistemas informáticos.</p>
      <p><strong>5. Vazamentos e Medidas:</strong> Em caso de vazamento de credenciais, compartilhamento indevido ou qualquer incidente de segurança, a 4Track poderá adotar medidas tais como suspensão, desativação da conta, invalidação de chaves, cooperação com autoridades e preservação de logs para investigação.</p>
      <p><strong>6. Limitação de Responsabilidade:</strong> A 4Track não garante resultados específicos decorrentes do uso das informações e não será responsável por danos indiretos, lucros cessantes ou atos de terceiros. As medidas adotadas visam mitigar riscos e responsabilidades.</p>
      <p><strong>7. Base legal:</strong> Marco Civil da Internet (Lei nº 12.965/2014), LGPD (Lei nº 13.709/2018) e Lei nº 12.737/2012, além do ordenamento jurídico aplicável.</p>
      <p><em>Este documento tem caráter informativo e recomenda-se validação final por profissional jurídico antes de publicação.</em></p>
    </div>
  `;
  overlay.appendChild(content);
  document.body.appendChild(overlay);

  document.getElementById('ft-terms-close').addEventListener('click', () => overlay.remove());
  overlay.addEventListener('click', (ev) => { if (ev.target === overlay) overlay.remove(); });
}

/* Bind terms triggers:
   - any link with id 'modal-terms-link' (in modal)
   - any footer/links containing text 'Termos'
*/
document.addEventListener('click', (e) => {
  const a = e.target.closest('#modal-terms-link, a');
  if (!a) return;
  if (a.id === 'modal-terms-link') {
    e.preventDefault();
    openTermsModal();
    return;
  }
  // footer link detection by text
  const txt = (a.textContent||'').toLowerCase();
  if (txt.includes('termos')) {
    e.preventDefault();
    openTermsModal();
  }
});

/* ========= HERO CTAs: open modal when clicking hero CTA buttons ========= */
document.addEventListener('click', (e) => {
  const b = e.target.closest('.btn-open-login');
  if (!b) return;
  e.preventDefault();
  openLoginModal();
});

/* ========= SMALL UX: style selected-plan via CSS injection ========= */
(function injectStyles(){
  const css = `.select-plan.selected-plan{ outline: 2px solid rgba(199,162,232,0.35); background: linear-gradient(90deg, rgba(199,162,232,0.12), rgba(74,20,140,0.05)); } 
  .card-module .btn-premium { border-radius: 999px; }`;
  const s = document.createElement('style'); s.appendChild(document.createTextNode(css));
  document.head.appendChild(s);
})();

/* ========= Accessibility / small features ========= */
/* Close terms overlay with Esc */
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    // close modal if open
    if (modalBackdrop && !modalBackdrop.classList.contains('hidden')) closeLoginModal();
    const overlay = document.getElementById('ft-terms-overlay');
    if (overlay) overlay.remove();
  }
});

/* ========= Final: ensure any anchor for WA opens WA (fallback) ========= */
document.addEventListener('click', (e) => {
  const a = e.target.closest('a');
  if (!a) return;
  if (a.href && a.href.includes('wa.me')) return; // already ok
  const txt = (a.textContent||'').toLowerCase();
  if (txt.includes('esqueci') || txt.includes('criar conta')) {
    e.preventDefault();
    window.open(WHATSAPP, '_blank');
  }
});

/* ========= End of file ========= */
