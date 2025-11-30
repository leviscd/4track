/* ===================== MENU MOBILE ===================== */
const mobileBtn = document.getElementById("mobile-btn");
const mobileMenu = document.getElementById("mobile-menu");
const closeMenu = document.getElementById("close-menu");

mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.remove("hidden");
});

closeMenu.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
});

/* Fechar menu ao clicar em um link */
document.querySelectorAll(".mobile-link").forEach(link => {
    link.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
    });
});


/* ===================== SCROLL SUAVE ===================== */
document.querySelectorAll("[data-scroll]").forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const target = document.querySelector(link.getAttribute("data-scroll"));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 70,
                behavior: "smooth"
            });
        }
    });
});


/* ===================== MODAL DOS PLANOS ===================== */
const planosModal = document.getElementById("planos-modal");
const closePlanosModal = document.getElementById("close-planos-modal");
const selectedPlan = document.getElementById("selected-plan");
const planLink = document.getElementById("plan-link");

document.querySelectorAll(".plan-btn").forEach(btn => {
    btn.addEventListener("click", () => {
        const plano = btn.getAttribute("data-plan");

        selectedPlan.textContent = `Plano Selecionado: ${plano}`;

        const phone = "5544999119849";
        const msg = encodeURIComponent(`Olá, desejo assinar o plano ${plano}.`);
        planLink.href = `https://wa.me/${phone}?text=${msg}`;

        planosModal.classList.remove("hidden");
    });
});

closePlanosModal.addEventListener("click", () => {
    planosModal.classList.add("hidden");
});


/* ===================== MODAL TERMOS DE USO ===================== */
const termosModal = document.getElementById("termos-modal");
const openTermos = document.getElementById("open-termos");
const closeTermos = document.getElementById("close-termos");

openTermos.addEventListener("click", () => {
    termosModal.classList.remove("hidden");
});

closeTermos.addEventListener("click", () => {
    termosModal.classList.add("hidden");
});


/* ===================== LOGIN ===================== */
const loginBtn = document.querySelector(".login-btn");

loginBtn.addEventListener("click", () => {
    const user = document.querySelectorAll(".login-input")[0].value.trim();
    const pass = document.querySelectorAll(".login-input")[1].value.trim();
    const termosCheck = document.getElementById("termos-check");

    if (!user || !pass) {
        alert("Preencha usuário e senha.");
        return;
    }

    if (!termosCheck.checked) {
        alert("Você precisa aceitar os Termos de Uso para entrar.");
        return;
    }

    // Quando o PHP estiver pronto, você vai substituir por:
    // fetch("login.php", { method:"POST", body: formData })

    alert("Login enviado! (Backend ainda será implementado)");
});


/* ===================== ANIMAÇÕES SUAVES ===================== */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("show");
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll(".card, .plan-card").forEach(el => {
    el.classList.add("hidden-card");
    observer.observe(el);
});
