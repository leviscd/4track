/* assets/js/main.js
   2025 - 4Track - main JS unificado
   - Animação (canvas)
   - Menu mobile
   - Smooth scroll
   - Modals: Plans, Login, Terms
   - Login simulation (localStorage)
   - Redirect to WhatsApp for forgot / signup
*/

/* ============================
   Config / Helpers
   ============================ */
const WHATSAPP_URL = "https://wa.me/5544999119849";

function qs(sel, ctx = document) { return ctx.querySelector(sel); }
function qsa(sel, ctx = document) { return Array.from((ctx || document).querySelectorAll(sel)); }

function showModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.remove('hidden');
    modalEl.style.display = 'flex';
    // focus first input if present
    const input = qs('input', modalEl);
    if (input) setTimeout(() => input.focus(), 120);
    document.body.style.overflow = 'hidden';
}

function hideModal(modalEl) {
    if (!modalEl) return;
    modalEl.classList.add('hidden');
    modalEl.style.display = 'none';
    document.body.style.overflow = '';
}

function isLoggedIn() {
    return localStorage.getItem('4track_logged') === '1';
}
function setLoggedIn(flag = true) {
    if (flag) localStorage.setItem('4track_logged', '1');
    else localStorage.removeItem('4track_logged');
}

/* ============================
   Canvas Background Animation
   ============================ */
(function canvasAnimation() {
    const canvas = document.getElementById('data-network');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let width = window.innerWidth;
    let height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;

    const PARTICLE_COUNT = 70;
    const CONNECT_DIST = 150;
    const particles = [];

    function rand(min, max) { return Math.random() * (max - min) + min; }

    class P {
        constructor() {
            this.x = rand(0, width);
            this.y = rand(0, height);
            this.r = rand(0.4, 1.8);
            this.vx = rand(-0.12, 0.12);
            this.vy = rand(-0.12, 0.12);
            this.opacity = rand(0.08, 0.4);
            this.pulse = 0;
        }
        move() {
            if (this.x < 0 || this.x > width) this.vx *= -1;
            if (this.y < 0 || this.y > height) this.vy *= -1;
            this.x += this.vx;
            this.y += this.vy;
            this.pulse = Math.max(0, this.pulse - 0.006);
            if (Math.random() < 0.0008) this.pulse = 1;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(255,255,255,${this.opacity})`;
            ctx.fill();
            if (this.pulse > 0) {
                ctx.save();
                ctx.shadowBlur = 12 * this.pulse;
                ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim() || '#c7a2e8';
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim() || '#c7a2e8';
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.r * 1.6, 0, Math.PI * 2);
                ctx.fill();
                ctx.restore();
            }
        }
    }

    function initParticles() {
        particles.length = 0;
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
        for (let i = 0; i < PARTICLE_COUNT; i++) particles.push(new P());
    }

    function connectAndFlow() {
        const pulseColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim() || '#c7a2e8';
        const baseLine = 'rgba(74,20,140,0.45)';
        const timeOffset = Date.now() / 15000;
        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const A = particles[a], B = particles[b];
                const dx = A.x - B.x, dy = A.y - B.y;
                const dist = Math.hypot(dx, dy);
                if (dist < CONNECT_DIST) {
                    const alpha = 1 - (dist / CONNECT_DIST);
                    const maxPulse = Math.max(A.pulse, B.pulse);
                    ctx.beginPath();
                    ctx.strokeStyle = maxPulse > 0 ? pulseColor : baseLine.replace('0.45', (alpha * 0.45).toFixed(2));
                    ctx.lineWidth = maxPulse > 0 ? 1 + maxPulse * 1.5 : 0.5;
                    ctx.moveTo(A.x, A.y);
                    ctx.lineTo(B.x, B.y);
                    ctx.stroke();

                    // flow point
                    const travel = (timeOffset % 1);
                    const seg = 0.5;
                    let t = travel < seg ? travel / seg : (1 - travel) / seg;
                    const fx = A.x + (B.x - A.x) * t;
                    const fy = A.y + (B.y - A.y) * t;
                    ctx.beginPath();
                    ctx.arc(fx, fy, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = pulseColor;
                    ctx.shadowBlur = 14;
                    ctx.shadowColor = pulseColor;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }
    }

    function frame() {
        ctx.clearRect(0, 0, width, height);
        connectAndFlow();
        for (let p of particles) {
            p.move();
            p.draw();
        }
        requestAnimationFrame(frame);
    }

    window.addEventListener('resize', () => { initParticles(); });
    initParticles();
    frame();
})();

/* ============================
   Page Interactions: DOM Ready
   ============================ */
document.addEventListener('DOMContentLoaded', () => {

    /* -------------------------------
       Mobile menu open / close
       ------------------------------- */
    const mobileBtn = qs('#mobile-btn');
    const mobileMenu = qs('#mobile-menu');
    const closeMobile = qs('#close-menu');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
    if (closeMobile) closeMobile.addEventListener('click', () => mobileMenu.classList.add('hidden'));
    // close on link click
    qsa('.mobile-link').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

    /* -------------------------------
       Smooth scroll for header links
       ------------------------------- */
    qsa('.nav-link').forEach(a => a.addEventListener('click', (e) => {
        e.preventDefault();
        const href = a.getAttribute('href') || '#';
        if (href.startsWith('#')) {
            const target = document.querySelector(href);
            if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
        }
    }));
    qsa('[data-scroll]').forEach(a => a.addEventListener('click', (e) => {
        e.preventDefault();
        const selector = a.getAttribute('data-scroll') || a.getAttribute('href');
        if (!selector) return;
        const target = document.querySelector(selector);
        if (target) window.scrollTo({ top: target.offsetTop - 80, behavior: 'smooth' });
    }));

    /* -------------------------------
       Modal elements
       ------------------------------- */
    const modalPlans = qs('#modal-plans');
    const modalLogin = qs('#modal-login');
    const modalTerms = qs('#modal-terms');

    // open plans buttons (multiple)
    qsa('[data-open-plans]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // If user is logged and clicked Comprar Acesso maybe show plans anyway.
            showModal(modalPlans);
        });
    });

    // close plans
    qsa('[data-close-plans]').forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(modalPlans);
    }));

    // clicking choose plan buttons inside plans modal should open login
    qsa('#modal-plans [data-open-login]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(modalPlans);
            showModal(modalLogin);
        });
    });

    // open login generic
    qsa('[data-open-login]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            // If the button is the CTA "Iniciar Análise", handle differently
            const text = (btn.innerText || '').toLowerCase();
            const isStartAnalysis = /iniciar análise|iniciar analise|iniciar/i.test(text);
            if (isStartAnalysis) {
                if (isLoggedIn()) {
                    // Simula iniciar análise
                    alert('Análise iniciada — (simulação). Em produção, redirecione ao painel.');
                    return;
                } else {
                    showModal(modalLogin);
                    return;
                }
            }
            // otherwise open login modal
            showModal(modalLogin);
        });
    });

    // close login modals
    qsa('[data-close-login]').forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(modalLogin);
    }));

    // open terms from inside login
    qsa('[data-open-terms]').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            hideModal(modalLogin);
            fillTermsContent(); // ensure content exists
            showModal(modalTerms);
        });
    });

    // open terms global (if footer link present)
    const footerTermsLink = qs('footer .footer-links a');
    if (footerTermsLink) {
        footerTermsLink.addEventListener('click', (e) => {
            e.preventDefault();
            fillTermsContent();
            showModal(modalTerms);
        });
    }

    // close terms
    qsa('[data-close-terms]').forEach(btn => btn.addEventListener('click', (e) => {
        e.preventDefault();
        hideModal(modalTerms);
    }));

    // backdrop close: if click in modal area outside content (modal has class modal and modal-content inside)
    qsa('.modal').forEach(modal => {
        modal.addEventListener('click', (ev) => {
            // if clicked the modal container itself (not the inner modal-content)
            if (ev.target === modal) {
                hideModal(modal);
            }
        });
    });

    // Escape closes any modal
    document.addEventListener('keydown', (ev) => {
        if (ev.key === 'Escape') {
            [modalPlans, modalLogin, modalTerms].forEach(m => { if (m) hideModal(m); });
        }
    });

    /* -------------------------------
       LOGIN FORM - validation & flow
       ------------------------------- */
    // We'll create a simple error container inside the login modal if not present.
    function ensureLoginErrorEl() {
        if (!modalLogin) return null;
        let err = qs('.login-error', modalLogin);
        if (!err) {
            err = document.createElement('div');
            err.className = 'login-error';
            err.style.color = '#ff8b8b';
            err.style.fontSize = '0.95rem';
            err.style.marginTop = '8px';
            modalLogin.querySelector('.modal-content').appendChild(err);
        }
        return err;
    }

    // Find inputs & consent
    const inputUser = modalLogin ? modalLogin.querySelector('input[type="text"]') : null;
    const inputPass = modalLogin ? modalLogin.querySelector('input[type="password"]') : null;
    const consentCheckbox = modalLogin ? modalLogin.querySelector('input[type="checkbox"]') : null;
    const loginButton = modalLogin ? modalLogin.querySelector('.btn-premium') : null;

    // Attach forgot / signup redirection (buttons in HTML point to WA but enforce here)
    qsa('#modal-login [onclick], #modal-login a').forEach(el => {
        // keep existing behavior; nothing to do
    });
    // Explicitly ensure any 'Esqueci' or 'Criar conta' buttons redirect
    qsa('#modal-login button').forEach(b => {
        const txt = (b.innerText || '').toLowerCase();
        if (txt.includes('esqueci')) b.addEventListener('click', () => { window.open(WHATSAPP_URL, '_blank'); });
        if (txt.includes('criar conta')) b.addEventListener('click', () => { window.open(WHATSAPP_URL, '_blank'); });
    });

    // Login submit handler
    if (loginButton) {
        loginButton.addEventListener('click', (e) => {
            e.preventDefault();
            const err = ensureLoginErrorEl();
            if (!inputUser || !inputPass || !consentCheckbox) {
                if (err) err.textContent = 'Erro interno: elementos do formulário não encontrados.';
                return;
            }
            const u = inputUser.value.trim();
            const p = inputPass.value;
            const accepted = consentCheckbox.checked;

            if (!accepted) {
                if (err) err.textContent = 'Você deve aceitar os Termos de Uso para prosseguir.';
                return;
            }
            if (u.length < 3 || p.length < 4) {
                if (err) err.textContent = 'Usuário ou senha inválidos (min. 3 chars user, 4 chars senha).';
                return;
            }

            // Simulated "authentication"
            setLoggedIn(true);
            hideModal(modalLogin);
            if (err) err.textContent = '';
            // Visual feedback
            const successMsg = document.createElement('div');
            successMsg.className = 'login-success';
            successMsg.textContent = 'Login efetuado com sucesso (simulação).';
            successMsg.style.color = '#cbe7c7';
            successMsg.style.marginTop = '10px';
            modalLogin.querySelector('.modal-content').appendChild(successMsg);
            setTimeout(() => { if (successMsg) successMsg.remove(); }, 1800);

            // In production: redirect to dashboard
            // window.location.href = '/dashboard';
        });
    }

    /* -------------------------------
       Buttons: Iniciar Análise behavior
       ------------------------------- */
    // Detect CTA button by icon text or class - check all premium buttons and match innerText
    qsa('.btn-premium').forEach(b => {
        const txt = (b.innerText || '').toLowerCase();
        if (txt.includes('iniciar análise') || txt.includes('iniciar analise')) {
            b.addEventListener('click', (ev) => {
                ev.preventDefault();
                if (isLoggedIn()) {
                    alert('Iniciando análise... (simulação). Você está logado.');
                    // redirect to analysis page in production
                } else {
                    showModal(modalLogin);
                }
            });
        }
    });

    /* -------------------------------
       Terms content filler
       ------------------------------- */
    function fillTermsContent() {
        // If modalTerms exists, fill with a detailed legal text (rich)
        if (!modalTerms) return;
        const contentWrapper = modalTerms.querySelector('.terms-box') || modalTerms.querySelector('.modal-content');
        if (!contentWrapper) return;

        // Avoid refilling every time
        if (contentWrapper.getAttribute('data-filled') === '1') {
            showModal(modalTerms);
            return;
        }

        const longLegal = `
            <h3>1. OBJETO</h3>
            <p>Estes Termos disciplinam o uso da plataforma 4Track, bem como dos módulos, APIs e interfaces correlatas. O usuário declara ter ciência de suas obrigações e limitações ao utilizar os serviços.</p>

            <h3>2. ACEITAÇÃO</h3>
            <p>Ao realizar login ou cadastro, o usuário aceita integralmente estes Termos e a Política de Privacidade. O uso contínuo configura aceite.</p>

            <h3>3. TRATAMENTO DE DADOS</h3>
            <p>A 4Track observará a Lei nº 13.709/2018 (LGPD) e demais normas aplicáveis. Dados pessoais poderão ser processados para execução do serviço, prevenção a fraudes e atendimento a solicitações legais.</p>

            <h3>4. REGISTROS E LOGS</h3>
            <p>A plataforma mantém logs de acesso, IP, timestamps e ações internas, que serão preservados para fins de auditoria e para atender requisições judiciais ou investigações oficiais.</p>

            <h3>5. VAZAMENTO E MEDIDAS</h3>
            <p>Em caso de comprovação de vazamento de credenciais, uso indevido, violação dos Termos ou incidentes de segurança, a 4Track poderá, a seu critério, suspender, bloquear ou excluir contas, além de comunicar autoridades. Outros problemas que ensejam essas medidas incluem: tentativa de intrusão, distribuição não autorizada de dados, uso para fins criminosos, scraping massivo e engenharia reversa.</p>

            <h3>6. PROIBIÇÕES</h3>
            <p>É terminantemente proibido: (i) compartilhar credenciais; (ii) realizar scraping ou automação sem autorização; (iii) usar o sistema para perseguição, chantagem, fraude, golpes ou qualquer conduta ilícita; (iv) tentar reproduzir ou distribuir componentes protegidos.</p>

            <h3>7. FUNDAMENTOS LEGAIS</h3>
            <p>As medidas acima encontram suporte no Marco Civil da Internet (Lei nº 12.965/2014), na LGPD (Lei nº 13.709/2018) e na Lei nº 12.737/2012 (delitos informáticos). Além disso, condutas que configurem crime estão sujeitas ao Código Penal (arts. pertinentes) e outras normas aplicáveis.</p>

            <h3>8. RESPONSABILIDADE</h3>
            <p>A 4Track não assume responsabilidade por decisões tomadas com base nas informações fornecidas. Exclui-se, na máxima extensão permitida por lei, responsabilidade por danos indiretos, lucros cessantes ou prejuízos de terceiros.</p>

            <h3>9. ENCERRAMENTO</h3>
            <p>O descumprimento destes Termos poderá resultar em medidas imediatas, incluindo exclusão de conta, bloqueio de acesso e eventual remessa de logs às autoridades competentes.</p>

            <hr>
            <p style="font-size:0.85rem;color:#cfc9e8">Referências: Lei nº 12.965/2014 (Marco Civil), Lei nº 13.709/2018 (LGPD), Lei nº 12.737/2012.</p>
        `;

        // place inside .terms-box if exists (HTML structure from index.html has .terms-box)
        const termsBox = modalTerms.querySelector('.terms-box');
        if (termsBox) {
            termsBox.innerHTML = longLegal;
            termsBox.setAttribute('data-filled', '1');
        } else {
            // fallback to modal-content insertion
            const container = modalTerms.querySelector('.modal-content');
            if (container) {
                const el = document.createElement('div');
                el.innerHTML = longLegal;
                container.appendChild(el);
                container.setAttribute('data-filled', '1');
            }
        }

        showModal(modalTerms);
    }

    /* -------------------------------
       Page: set greeting (time based)
       ------------------------------- */
    (function setGreeting() {
        const el = qs('#greeting');
        if (!el) return;
        const h = new Date().getHours();
        let txt = 'Dados acessíveis com segurança.';
        if (h >= 5 && h < 12) txt = 'Bom dia. Suas consultas estão prontas.';
        else if (h >= 12 && h < 18) txt = 'Boa tarde. Continue avançando.';
        else txt = 'Boa noite. Dados acessíveis com segurança.';
        el.textContent = txt;
    })();

    /* -------------------------------
       Initialize small UI tweaks if logged
       ------------------------------- */
    if (isLoggedIn()) {
        // Example: change Entrar no Sistema -> Minha Conta (if such element exists)
        qsa('[data-open-login]').forEach(btn => {
            // if it's in header or hero, keep as "Entrar" but you might show logged state
        });
    }
});
