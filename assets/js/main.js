document.addEventListener('DOMContentLoaded', () => {
    /* ============================= */
    /* CANVAS DE FUNDO               */
    /* ============================= */
    const canvas = document.getElementById('data-network');
    const ctx = canvas.getContext('2d');
    let particles = [];
    const particleCount = 70;
    const connectDistance = 150;
    const pulseColor = getComputedStyle(document.documentElement).getPropertyValue('--color-lilac-soft').trim();
    const particleColor = 'rgba(255, 255, 255, 0.2)';
    const lineColor = 'rgba(74, 20, 140, 0.5)';

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
            ctx.fillStyle = particleColor.replace('0.2', this.opacity.toFixed(2));
            ctx.fill();
            if (this.pulse > 0) {
                ctx.shadowBlur = 10 * this.pulse;
                ctx.shadowColor = pulseColor;
                ctx.fillStyle = pulseColor;
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
            if (Math.random() < 0.0005) this.pulse = 1;
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
        const timeOffset = Date.now() / 15000;
        for (let a = 0; a < particleCount; a++) {
            for (let b = a; b < particleCount; b++) {
                const pA = particles[a];
                const pB = particles[b];
                const dist = Math.hypot(pA.x - pB.x, pA.y - pB.y);
                if (dist < connectDistance) {
                    const lineAlpha = 1 - dist / connectDistance;
                    let lineWidth = 0.5;
                    let currentLineColor = lineColor;
                    const maxPulse = Math.max(pA.pulse, pB.pulse);
                    if (maxPulse > 0) { currentLineColor = pulseColor; lineWidth = 1 + maxPulse * 1.5; }
                    ctx.beginPath();
                    ctx.strokeStyle = currentLineColor.includes('rgba') ? currentLineColor.replace(/[\d\.]+\)/, (lineAlpha * 0.5).toFixed(2) + ')') : currentLineColor;
                    ctx.lineWidth = lineWidth;
                    ctx.moveTo(pA.x, pA.y);
                    ctx.lineTo(pB.x, pB.y);
                    ctx.stroke();
                    // fluxo de dados
                    let travel = timeOffset % 1;
                    const segmentDuration = 0.5;
                    let t = travel < segmentDuration ? travel / segmentDuration : (1 - travel) / segmentDuration;
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

    function animateParticles() {
        requestAnimationFrame(animateParticles);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        connectParticles();
        particles.forEach(p => p.update());
    }

    initParticles();
    animateParticles();
    window.addEventListener('resize', initParticles);

    /* ============================= */
    /* SAUDAÇÃO HERO                 */
    /* ============================= */
    function updateGreeting() {
        const greetingElement = document.getElementById('greeting');
        const hour = new Date().getHours();
        let greetingText = "Dados acessíveis com segurança.";
        if (hour >= 5 && hour < 12) greetingText = "Bom dia. Suas consultas estão prontas.";
        else if (hour >= 12 && hour < 18) greetingText = "Boa tarde. Continue avançando.";
        else greetingText = "Boa noite. Dados acessíveis com segurança.";
        greetingElement.textContent = greetingText;
    }
    updateGreeting();

    /* ============================= */
    /* MENU MOBILE TOGGLE            */
    /* ============================= */
    document.getElementById('mobile-menu-button').addEventListener('click', () => {
        const menu = document.getElementById('mobile-menu');
        menu.classList.toggle('hidden');
    });

    /* ============================= */
    /* MODAL LOGIN                   */
    /* ============================= */
    const modalBackdrop = document.getElementById('modal-backdrop');
    const modalClose = document.getElementById('modal-close');
    const modalTermsLink = document.getElementById('modal-terms-link');

    function openModal() { modalBackdrop.classList.remove('hidden'); }
    function closeModal() { modalBackdrop.classList.add('hidden'); }

    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', e => { if(e.target === modalBackdrop) closeModal(); });

    // Botões de login / comprar acesso / iniciar análise
    const ctaButtons = document.querySelectorAll('.btn-open-login');
    ctaButtons.forEach(btn => btn.addEventListener('click', openModal));

    /* ============================= */
    /* TERMOS DE USO                 */
    /* ============================= */
    const termsModalContent = `
    <h2 class="text-xl font-bold mb-4">Termos de Uso e Condições Jurídicas</h2>
    <p>Ao realizar login, você concorda com todas as imposições dos Termos de Uso. O usuário é responsável por manter a confidencialidade de credenciais e dados. Em caso de vazamento, compartilhamento não autorizado ou uso indevido de qualquer informação, a conta será imediatamente excluída. Registramos logs de acesso, IPs e ações do usuário para eventual comprovação em casos jurídicos, de acordo com o Código Penal Brasileiro (Lei 2.848/40, Art. 154-A, 298, 313, 298, 313-A), Marco Civil da Internet (Lei 12.965/14, Art. 7º e 10) e demais legislações pertinentes.</p>
    <p>O descumprimento dos termos poderá resultar em responsabilização civil e criminal. Dados coletados e tratados serão armazenados em servidor seguro e utilizados apenas para auditoria, análise e prevenção de crimes cibernéticos.</p>
    `;

    modalTermsLink.addEventListener('click', e => {
        e.preventDefault();
        const modalTerms = document.createElement('div');
        modalTerms.classList.add('absolute','inset-0','bg-black/90','flex','items-center','justify-center','p-8','overflow-auto','z-50');
        modalTerms.innerHTML = `
            <div class="bg-black/95 p-6 rounded-xl max-w-3xl text-white relative">
                <button id="close-terms" class="absolute top-4 right-4 text-xl">&times;</button>
                ${termsModalContent}
            </div>
        `;
        document.body.appendChild(modalTerms);
        document.getElementById('close-terms').addEventListener('click', () => modalTerms.remove());
    });

    /* ============================= */
    /* LOGIN FORM SUBMIT             */
    /* ============================= */
    const loginForm = document.getElementById('login-form');
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        const username = document.getElementById('login-user').value;
        const password = document.getElementById('login-pass').value;
        const termsChecked = document.getElementById('terms-check').checked;

        if(!termsChecked) {
            alert("Você deve aceitar os Termos de Uso para continuar.");
            return;
        }

        // Aqui você implementaria a validação real do login com backend
        alert(`Bem-vindo, ${username}! Login realizado com sucesso.`);
        closeModal();
    });
});
