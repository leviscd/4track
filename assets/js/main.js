/* ============================
   ANIMAÇÃO DO FUNDO (CANVAS)
   ============================ */
(function () {
    const canvas = document.getElementById('data-network');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 70;
    const connectDistance = 150;

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    class Particle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.radius = Math.random() * 1.5 + 0.5;
            this.velocity = { x: (Math.random() - 0.5) * 0.1, y: (Math.random() - 0.5) * 0.1 };
            this.opacity = Math.random() * 0.4 + 0.1;
            this.pulse = 0;
        }
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
            ctx.fillStyle = `rgba(255,255,255,${this.opacity.toFixed(2)})`;
            ctx.fill();
            if (this.pulse > 0) {
                ctx.shadowBlur = 10 * this.pulse;
                ctx.shadowColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim();
                ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim();
                ctx.arc(this.x, this.y, this.radius * 1.5, 0, Math.PI * 2);
                ctx.fill();
                ctx.shadowBlur = 0;
            }
        }
        update() {
            if (this.x + this.radius > canvas.width || this.x - this.radius < 0) this.velocity.x = -this.velocity.x;
            if (this.y + this.radius > canvas.height || this.y - this.radius < 0) this.velocity.y = -this.velocity.y;
            this.x += this.velocity.x;
            this.y += this.velocity.y;
            this.pulse = Math.max(0, this.pulse - 0.005);
            if (Math.random() < 0.0008) this.pulse = 1;
            this.draw();
        }
    }

    function initParticles() {
        resizeCanvas();
        particles = [];
        for (let i = 0; i < particleCount; i++) {
            particles.push(new Particle(Math.random() * canvas.width, Math.random() * canvas.height));
        }
    }

    function connectParticles() {
        const pulseColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim();
        const baseLineColor = 'rgba(74, 20, 140, 0.5)';
        const timeOffset = Date.now() / 15000;

        for (let a = 0; a < particles.length; a++) {
            for (let b = a + 1; b < particles.length; b++) {
                const pA = particles[a];
                const pB = particles[b];
                const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
                if (dist < connectDistance) {
                    const lineAlpha = 1 - (dist / connectDistance);
                    const maxPulse = Math.max(pA.pulse, pB.pulse);
                    ctx.beginPath();
                    ctx.strokeStyle = maxPulse > 0 ? pulseColor : baseLineColor.replace('0.5', (lineAlpha * 0.45).toFixed(2));
                    ctx.lineWidth = maxPulse > 0 ? 1 + maxPulse * 1.5 : 0.5;
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.stroke();

                    // Flow point
                    const travel = (timeOffset % 1);
                    const segmentDuration = 0.5;
                    let t;
                    if (travel < segmentDuration) t = travel / segmentDuration;
                    else t = (1 - travel) / segmentDuration;
                    const flowX = pA.x + (pB.x - pA.x) * t;
                    const flowY = pA.y + (pB.y - pA.y) * t;
                    ctx.beginPath();
                    ctx.arc(flowX, flowY, 2.5, 0, Math.PI * 2);
                    ctx.fillStyle = pulseColor;
                    ctx.shadowBlur = 15;
                    ctx.shadowColor = pulseColor;
                    ctx.fill();
                    ctx.shadowBlur = 0;
                }
            }
        }
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        connectParticles();
        particles.forEach(p => p.update());
        requestAnimationFrame(animate);
    }

    initParticles();
    animate();
    window.addEventListener('resize', () => { initParticles(); });
})();

/* ============================
   SAUDAÇÃO DO HORÁRIO (com nome "Levi")
   ============================ */
(function () {
    function updateGreeting() {
        const el = document.getElementById('greeting');
        if (!el) return;
        const hour = new Date().getHours();
        let text = 'Dados acessíveis com segurança.';
        if (hour >= 5 && hour < 12) text = 'Bom dia. Suas consultas estão prontas.';
        else if (hour >= 12 && hour < 18) text = 'Boa tarde. Continue avançando.';
        else text = 'Boa noite. Dados acessíveis com segurança.';
        // se quiser nome fixo
        // el.textContent = `${text} — Levi`;
        el.textContent = text;
    }
    updateGreeting();
    setInterval(updateGreeting, 60 * 1000);
})();

/* ============================
   MENU MOBILE (corrigido)
   ============================ */
(function () {
    const mobileBtn = document.getElementById('mobile-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    const btnOpenLogin = document.getElementById('btn-open-login');
    const btnOpenLoginMobile = document.getElementById('btn-open-login-mobile');

    if (mobileBtn && mobileMenu) {
        mobileBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // abrir login modal se usuário clicar no botão do header
    if (btnOpenLogin) btnOpenLogin.addEventListener('click', openLoginModal);
    if (btnOpenLoginMobile) btnOpenLoginMobile.addEventListener('click', openLoginModal);
})();

/* ============================
   SCROLL SUAVE (para links com data-scroll ou hashes)
   ============================ */
(function () {
    function smoothScrollTo(targetSelector) {
        const target = document.querySelector(targetSelector);
        if (!target) return;
        const top = target.offsetTop - 80;
        window.scrollTo({ top, behavior: 'smooth' });
    }

    document.querySelectorAll('[data-scroll]').forEach(a => {
        a.addEventListener('click', (e) => {
            e.preventDefault();
            const href = a.getAttribute('data-scroll') || a.getAttribute('href');
            if (href && href.startsWith('#')) smoothScrollTo(href);
            // fecha mobile se estiver aberto
            const mobileMenu = document.getElementById('mobile-menu');
            if (mobileMenu && !mobileMenu.classList.contains('hidden')) mobileMenu.classList.add('hidden');
        });
    });

    // também aplica a links de footer
    document.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
            // evita duplicar handlers nos que já têm data-scroll
            if (a.hasAttribute('data-scroll')) return;
            e.preventDefault();
            const href = a.getAttribute('href');
            if (href && href.startsWith('#')) smoothScrollTo(href);
        });
    });
})();

/* ============================
   LOGIN / MODAL / TERMOS
   ============================ */

/* Helpers */
function showElement(el) { if (!el) return; el.classList.remove('hidden'); el.style.display = (el.id === 'modal-backdrop') ? 'flex' : ''; }
function hideElement(el) { if (!el) return; el.classList.add('hidden'); el.style.display = 'none'; }

const WHATSAPP_URL = 'https://wa.me/5544999119849';

function openLoginModal() {
    const backdrop = document.getElementById('modal-backdrop');
    showElement(backdrop);
    // foco no usuário
    setTimeout(() => {
        const user = document.getElementById('login-user');
        if (user) user.focus();
    }, 120);
}

function closeLoginModal() {
    const backdrop = document.getElementById('modal-backdrop');
    hideElement(backdrop);
    // limpa erro
    const err = document.getElementById('login-error');
    if (err) { err.classList.add('hidden'); err.textContent = ''; }
}

/* open terms modal and populate legal text */
function openTermsModal() {
    const termsBackdrop = document.getElementById('terms-backdrop');
    const content = document.getElementById('terms-content');
    if (!content) return;

    // Conteúdo jurídico elaborado — você pode editar este template conforme necessário
    content.innerHTML = `
    <h3>1. OBJETO</h3>
    <p>Estes Termos de Uso disciplinam o acesso e a utilização dos serviços oferecidos pela 4Track, incluindo, mas não se limitando a, módulos de consulta analítica, painéis de auditoria e interfaces associadas (doravante "Serviço" ou "Serviços").</p>

    <h3>2. ACEITAÇÃO E ADESÃO</h3>
    <p>Ao realizar o cadastro ou efetuar login, o usuário declara ter lido, compreendido e aceitado integralmente estes Termos, a Política de Privacidade e demais normas aplicáveis. A utilização dos Serviços pressupõe o aceite expresso.</p>

    <h3>3. TRATAMENTO DE DADOS PESSOAIS</h3>
    <p>A 4Track tratará dados pessoais de acordo com a legislação aplicável, em especial a Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018), resguardando princípios de finalidade, necessidade, adequação, transparência e segurança no tratamento. O usuário consente no tratamento de dados para fins operacionais e legais, inclusive para manutenção de registros de conexão e logs, quando necessário para cumprimento de determinação legal ou requisição judicial.</p>

    <h3>4. PROIBIÇÕES E SEGURANÇA</h3>
    <p>É vedado ao usuário: (i) acessar, invadir ou tentar invadir dispositivos, contas ou áreas restritas; (ii) utilizar ferramentas de scraping, automação ou quaisquer meios que causem sobrecarga; (iii) compartilhar credenciais; (iv) usar o Serviço para práticas ilícitas; (v) divulgar conteúdo que viole direitos de terceiros. A prática de condutas que configurem crime eletrônico, nos termos do Código Penal e legislação correlata (incluindo Lei nº 12.737/2012 — "Lei Carolina Dieckmann"), sujeitará o autor às medidas civis, administrativas e penais cabíveis.</p>

    <h3>5. RESPONSABILIDADES E LOGS</h3>
    <p>O usuário reconhece e concorda que a 4Track mantém registros (logs) de acesso, operação e transações, que poderão ser preservados para fins de auditoria e para atender a ordens judiciais ou investigações oficiais. Esses registros poderão ser utilizados em processos administrativos, civis ou criminais no caso de uso indevido ou violação destes Termos (inclusive vazamento de credenciais, tentativas de intrusão, fraudes, e outros incidentes de segurança).</p>

    <h3>6. MEDIDAS EM CASO DE VAZAMENTO OU USO INDEVIDO</h3>
    <p>Em caso de comprovação de vazamento de credenciais, uso indevido da conta, comportamento que constitua risco à segurança, ou infração a estes Termos, a 4Track reserva-se o direito de: (i) suspender temporariamente o acesso; (ii) encerrar a conta; (iii) revogar chaves de acesso; (iv) colaborar com autoridades competentes para apuração dos fatos; (v) adotar medidas técnicas para mitigar danos.</p>

    <h3>7. NATUREZA DAS INFORMAÇÕES E LIMITAÇÃO DE RESPONSABILIDADE</h3>
    <p>As informações fornecidas pelos Serviços são de caráter informativo e auxiliar. A 4Track não garante resultados específicos decorrentes do uso dos Serviços e não se responsabiliza por decisões tomadas com base nas informações apresentadas. Na medida máxima permitida pela lei, excluem-se responsabilidades por danos indiretos, lucros cessantes ou prejuízos causados por terceiros.</p>

    <h3>8. BASES LEGAIS APLICÁVEIS</h3>
    <p>As partes reconhecem a aplicabilidade, ao caso concreto, das seguintes normas e princípios, entre outros: Marco Civil da Internet (Lei nº 12.965/2014), Lei Geral de Proteção de Dados (Lei nº 13.709/2018) e a Lei nº 12.737/2012 que trata de delitos informáticos. A coleta, armazenamento e eventual disponibilização de registros de conexão observarão o que dispõem essas normas e eventuais determinações judiciais.</p>

    <h3>9. PRAZO E ENCERRAMENTO</h3>
    <p>Estes Termos permanecem em vigor enquanto a conta estiver ativa ou até seu cancelamento. A 4Track pode, a qualquer tempo, alterar estes Termos, mediante comunicação ao usuário ou atualização na plataforma. A violação material destes termos poderá ensejar encerramento imediato da conta, sem prejuízo da adoção de medidas legais cabíveis.</p>

    <h3>10. DISPOSIÇÕES FINAIS</h3>
    <p>Fica eleito o foro competente para dirimir quaisquer controvérsias oriundas destes Termos, ressalvados os direitos legais imperativos. A eventual invalidade de qualquer cláusula não afetará a validade das demais disposições.</p>

    <hr>
    <p class="text-xs text-gray-400">Referências legais citadas: Marco Civil da Internet (Lei nº 12.965/2014), Lei Geral de Proteção de Dados – LGPD (Lei nº 13.709/2018), Lei nº 12.737/2012 e demais legislação aplicável.</p>
    `;

    showElement(termsBackdrop);
}

function closeTermsModal() {
    const termsBackdrop = document.getElementById('terms-backdrop');
    hideElement(termsBackdrop);
}

/* DOM bindings */
(function () {
    // Login modal openers/closers
    const openBtns = [document.getElementById('btn-open-login'), document.getElementById('btn-open-login-mobile')];
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', (e) => {
            if (e.target === modalBackdrop) closeLoginModal();
        });
    }
    if (modalClose) modalClose.addEventListener('click', closeLoginModal);

    // Terms modal open/close
    const linkTerms = document.getElementById('link-terms');
    const openTermsInline = document.getElementById('open-terms-inline');
    const termsClose = document.getElementById('terms-close');

    if (linkTerms) linkTerms.addEventListener('click', (e) => { e.preventDefault(); openTermsModal(); });
    if (openTermsInline) openTermsInline.addEventListener('click', (e) => { e.preventDefault(); openTermsModal(); });
    if (termsClose) termsClose.addEventListener('click', closeTermsModal);

    const termsBackdrop = document.getElementById('terms-backdrop');
    if (termsBackdrop) termsBackdrop.addEventListener('click', (e) => {
        if (e.target === termsBackdrop) closeTermsModal();
    });

    // Login form submit
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = document.getElementById('login-user').value.trim();
            const pass = document.getElementById('login-pass').value;
            const consent = document.getElementById('login-consent').checked;
            const err = document.getElementById('login-error');

            if (!consent) {
                if (err) { err.textContent = 'Você precisa aceitar os Termos de Uso para prosseguir.'; err.classList.remove('hidden'); }
                return;
            }

            // Simulação de login: aqui você deve trocar para chamada real ao seu backend.
            if (user.length >= 3 && pass.length >= 4) {
                // Login bem-sucedido: fechar modal e simular redirecionamento
                closeLoginModal();
                alert('Login efetuado (simulação). Em produção, autentique via servidor seguro.');
                // Aqui você pode redirecionar: window.location.href = '/dashboard';
            } else {
                if (err) { err.textContent = 'Usuário ou senha inválidos (simulação).'; err.classList.remove('hidden'); }
            }
        });
    }

    // Links "Esqueci a senha" / "Criar conta" — já apontam para WhatsApp no HTML, mas se quiser reforçar:
    const forgotLink = document.getElementById('forgot-link');
    const signupLink = document.getElementById('signup-link');
    if (forgotLink) forgotLink.setAttribute('href', WHATSAPP_URL);
    if (signupLink) signupLink.setAttribute('href', WHATSAPP_URL);

    // botão de abrir login no header mobile (caso exista)
    const btnOpenMobile = document.getElementById('btn-open-login-mobile');
    if (btnOpenMobile) btnOpenMobile.addEventListener('click', openLoginModal);
})();

/* ============================
   DEPOIS: IntersectionObserver para revelar seções
   ============================ */
(function () {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('fade-in');
        });
    }, { threshold: 0.2 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
})();
