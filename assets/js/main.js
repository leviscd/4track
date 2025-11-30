/* ============================
   ANIMAÇÃO DO FUNDO (CANVAS)
============================ */
const canvas = document.getElementById("data-network");
const ctx = canvas.getContext("2d");

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let nodes = [];

function random(min, max) {
    return Math.random() * (max - min) + min;
}

function createNodes(count) {
    for (let i = 0; i < count; i++) {
        nodes.push({
            x: random(0, canvas.width),
            y: random(0, canvas.height),
            vx: random(-0.5, 0.5),
            vy: random(-0.5, 0.5),
            radius: random(1.5, 3),
        });
    }
}

function drawNodes() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let node of nodes) {
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > canvas.width) node.vx *= -1;
        if (node.y < 0 || node.y > canvas.height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(199, 162, 232, 0.7)";
        ctx.fill();
    }

    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            let dx = nodes[i].x - nodes[j].x;
            let dy = nodes[i].y - nodes[j].y;
            let distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < 150) {
                ctx.beginPath();
                ctx.moveTo(nodes[i].x, nodes[i].y);
                ctx.lineTo(nodes[j].x, nodes[j].y);
                ctx.strokeStyle = "rgba(199, 162, 232, 0.1)";
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        }
    }

    requestAnimationFrame(drawNodes);
}

createNodes(70);
drawNodes();

window.addEventListener("resize", () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});


/* ============================
     SAUDAÇÃO DO HORÁRIO
============================ */
function atualizarSaudacao() {
    const saudacaoEl = document.getElementById("greeting");
    const horas = new Date().getHours();
    let saudacao = "";

    if (horas >= 5 && horas < 12) saudacao = "Bom dia";
    else if (horas >= 12 && horas < 18) saudacao = "Boa tarde";
    else saudacao = "Boa noite";

    saudacaoEl.textContent = `${saudacao}, Levi`;
}

atualizarSaudacao();
setInterval(atualizarSaudacao, 60000);


/* ============================
       MENU MOBILE
============================ */
const mobileBtn = document.getElementById("mobile-btn");
const mobileMenu = document.getElementById("mobile-menu");
const mobileClose = document.getElementById("close-menu");

mobileBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});

mobileClose.addEventListener("click", () => {
    mobileMenu.classList.add("hidden");
});


/* ============================
   ANIMAÇÃO SUAVE DE SCROLL
============================ */
const navLinks = document.querySelectorAll("[data-scroll]");

navLinks.forEach(link => {
    link.addEventListener("click", (e) => {
        e.preventDefault();

        const target = document.querySelector(link.getAttribute("data-scroll"));
        if (target) {
            window.scrollTo({
                top: target.offsetTop - 80,
                behavior: "smooth"
            });
        }

        mobileMenu.classList.add("hidden");
    });
});


/* ============================
   ANIMAÇÃO DE REVELAR SEÇÕES
============================ */
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add("fade-in");
        }
    });
}, { threshold: 0.2 });

document.querySelectorAll(".reveal").forEach(el => observer.observe(el));
