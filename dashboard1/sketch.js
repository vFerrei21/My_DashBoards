// ============================================================
//  DASHBOARD 1 — WEATHER STATION  (p5.js + APIs)
//  Cyberpunk edition · vferrei21
// ============================================================

let temperatura = 0;
let velocidadeVento = 0;
let nascerSol, porSol;
let eDia = true;
let loading = true;

// Dados adicionais para animação
let nuvens = [];
let frameOffset = 0;
let ultimaAtualizacao = 0;

// ===== CONFIGURAÇÃO =====
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont('Share Tech Mono');
  frameRate(30);

  // Inicializar nuvens
  for (let i = 0; i < 6; i++) {
    nuvens.push({
      x: random(width),
      y: random(80, 200),
      w: random(80, 180),
      h: random(30, 60),
      speed: random(0.3, 1.2),
      phase: random(TWO_PI)
    });
  }

  carregarDados();
  setInterval(carregarDados, 60000); // atualizar a cada 60s
}

// ===== DRAW =====
function draw() {
  // Céu dinâmico
  desenharCeu();

  // Sol / Lua com glow
  desenharAstro();

  // Nuvens (apenas de dia)
  desenharNuvens();

  // Chão com gradiente
  desenharChao();

  // Moinho de vento
  desenharMoinho();

  // Cards de informação
  desenharCards();

  // Barra solar
  desenharBarraSolar();

  // Indicador de loading
  if (loading) {
    fill('#00ffe5');
    noStroke();
    textSize(16);
    textAlign(LEFT, TOP);
    text('⬡ CARREGANDO DADOS...', 20, 20);
  }

  // Atualizar frame offset para animações
  frameOffset += 0.02;
}

// ===== CEU =====
function desenharCeu() {
  if (eDia) {
    // Céu diurno com gradiente baseado na temperatura
    let azul = map(temperatura, -5, 40, 180, 255);
    let verde = map(temperatura, -5, 40, 200, 220);
    let vermelho = map(temperatura, -5, 40, 100, 150);
    background(vermelho, verde, azul);

    // Gradiente superior mais claro
    noStroke();
    for (let y = 0; y < height * 0.6; y++) {
      let a = map(y, 0, height * 0.6, 60, 0);
      fill(255, 255, 255, a);
      rect(0, y, width, 1);
    }
  } else {
    // Céu noturno com estrelas
    background(8, 10, 25);
    // Estrelas cintilantes
    noStroke();
    for (let i = 0; i < 80; i++) {
      let x = (i * 137.5 + 42) % width;
      let y = (i * 97.3 + 13) % (height * 0.7);
      let brilho = 150 + 105 * sin(frameOffset * 2 + i);
      fill(brilho, brilho, 255, 200);
      circle(x, y, 1.5 + 0.5 * sin(frameOffset + i));
    }
  }
}

// ===== SOL / LUA =====
function desenharAstro() {
  noStroke();
  const x = width - 130;
  const y = 120;

  if (eDia) {
    // Sol com glow
    for (let r = 140; r > 0; r -= 10) {
      let a = map(r, 0, 140, 80, 0);
      fill(255, 220, 50, a);
      circle(x, y, r);
    }
    fill(255, 235, 80);
    circle(x, y, 70);

    // Raios solares
    push();
    translate(x, y);
    for (let i = 0; i < 12; i++) {
      let ang = frameOffset * 0.5 + i * PI / 6;
      let len = 90 + 15 * sin(frameOffset * 2 + i);
      stroke(255, 220, 50, 60);
      strokeWeight(2);
      line(0, 0, cos(ang) * len, sin(ang) * len);
    }
    pop();

  } else {
    // Lua com brilho
    for (let r = 90; r > 0; r -= 10) {
      let a = map(r, 0, 90, 60, 0);
      fill(200, 220, 255, a);
      circle(x, y, r);
    }
    fill(235, 240, 255);
    circle(x, y, 60);
    // Crateras
    fill(200, 210, 230, 80);
    circle(x - 12, y - 10, 14);
    circle(x + 16, y + 8, 10);
    circle(x + 8, y - 18, 8);
  }
}

// ===== NUVENS =====
function desenharNuvens() {
  if (!eDia) return;
  noStroke();

  nuvens.forEach((n, i) => {
    // Velocidade influenciada pelo vento
    let speedFactor = map(velocidadeVento, 0, 50, 0.2, 2.5);
    n.x += n.speed * speedFactor * 0.3;
    if (n.x > width + n.w) n.x = -n.w;

    // Opacidade e cor suave
    let alpha = 180 + 40 * sin(frameOffset + i);
    fill(255, 255, 255, alpha);

    // Desenhar nuvem com várias elipses
    let cx = n.x, cy = n.y + 10 * sin(frameOffset * 0.5 + i);
    ellipse(cx, cy, n.w, n.h);
    ellipse(cx - n.w * 0.3, cy + 8, n.w * 0.6, n.h * 0.7);
    ellipse(cx + n.w * 0.3, cy + 6, n.w * 0.5, n.h * 0.6);
    ellipse(cx - n.w * 0.5, cy + 4, n.w * 0.4, n.h * 0.5);
    ellipse(cx + n.w * 0.5, cy + 2, n.w * 0.35, n.h * 0.5);
  });
}

// ===== CHÃO =====
function desenharChao() {
  let yBase = height - 140;
  // Gradiente do chão
  for (let y = yBase; y < height; y++) {
    let t = map(y, yBase, height, 0, 1);
    let r = lerpColor(
      color(30, 120, 50),
      color(15, 60, 25),
      t
    );
    stroke(r);
    strokeWeight(1);
    line(0, y, width, y);
  }
  // Linha de separação com glow
  noStroke();
  fill(0, 255, 229, 20);
  rect(0, yBase - 2, width, 4);
  fill(0, 255, 229, 10);
  rect(0, yBase - 6, width, 8);
}

// ===== MOINHO =====
function desenharMoinho() {
  push();
  translate(width / 2, height / 2 + 80);

  // Base / torre
  noStroke();
  fill(30, 30, 45);
  rectMode(CENTER);
  rect(0, 40, 40, 100, 6);
  // Detalhes na torre
  fill(50, 50, 70);
  rect(0, 20, 30, 20, 4);
  rect(0, 50, 30, 20, 4);
  rect(0, 80, 30, 20, 4);

  // Corpo principal (casa do moinho)
  fill(60, 60, 85);
  rect(0, -30, 100, 100, 10);
  // Telhado
  fill(40, 40, 60);
  triangle(-55, -70, 0, -120, 55, -70);

  // Centro das pás
  fill(0, 255, 229);
  circle(0, -50, 16);
  fill(255);
  circle(0, -50, 8);

  // Velocidade de rotação baseada no vento
  let speed = map(velocidadeVento, 0, 50, 0, 0.15);
  rotate(frameCount * speed);

  // Pás com estilo
  for (let i = 0; i < 4; i++) {
    rotate(HALF_PI);
    push();
    // Sombra da pá
    fill(30, 30, 50, 60);
    rect(0, -70, 22, 130, 8);
    // Pá principal
    fill(200, 210, 230);
    rect(0, -70, 18, 130, 6);
    // Reforço
    fill(150, 160, 180);
    rect(0, -60, 10, 100, 4);
    // Ponta
    fill(0, 255, 229, 80);
    rect(0, -130, 14, 20, 4);
    pop();
  }

  // Efeito de brilho no centro
  noStroke();
  fill(0, 255, 229, 30);
  circle(0, -50, 40);

  pop();
}

// ===== CARDS DE INFORMAÇÃO =====
function desenharCards() {
  if (loading) return;

  const cards = [
    { label: 'TEMPERATURA', value: temperatura.toFixed(1) + '°C', icon: '⊚' },
    { label: 'VENTO', value: velocidadeVento.toFixed(1) + ' km/h', icon: '↗' },
    { label: 'NASCER', value: nascerSol.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }), icon: '☀' },
    { label: 'PÔR', value: porSol.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }), icon: '☾' },
  ];

  const cardW = 160;
  const cardH = 72;
  const gap = 16;
  const startX = 30;
  const startY = 30;

  cards.forEach((c, i) => {
    const x = startX + i * (cardW + gap);
    const y = startY;

    // Fundo do card
    noStroke();
    fill(10, 10, 20, 200);
    rect(x, y, cardW, cardH, 8);

    // Borda neon
    stroke(0, 255, 229, 80);
    strokeWeight(1);
    noFill();
    rect(x, y, cardW, cardH, 8);

    // Ícone
    noStroke();
    fill(0, 255, 229);
    textSize(18);
    textAlign(LEFT, TOP);
    text(c.icon, x + 10, y + 8);

    // Label
    fill(90, 90, 140);
    textSize(9);
    textAlign(LEFT, TOP);
    text(c.label, x + 34, y + 10);

    // Valor
    fill(255);
    textSize(16);
    textAlign(LEFT, TOP);
    text(c.value, x + 10, y + 34);

    // Pequeno detalhe decorativo
    stroke(0, 255, 229, 30);
    strokeWeight(1);
    line(x + 10, y + cardH - 8, x + cardW - 10, y + cardH - 8);
  });
}

// ===== BARRA SOLAR =====
function desenharBarraSolar() {
  if (loading || !nascerSol || !porSol) return;

  const agora = new Date();
  const duracaoDia = porSol - nascerSol;
  const tempoDecorrido = agora - nascerSol;
  let progresso = constrain(tempoDecorrido / duracaoDia, 0, 1);

  const barX = 50;
  const barY = height - 50;
  const barW = width - 100;
  const barH = 20;

  // Fundo da barra
  noStroke();
  fill(20, 20, 40, 180);
  rect(barX, barY, barW, barH, 10);

  // Preenchimento com gradiente
  for (let x = 0; x < barW * progresso; x++) {
    let t = x / barW;
    let cor = lerpColor(
      color(255, 180, 50),
      color(0, 255, 229),
      t
    );
    stroke(cor);
    strokeWeight(barH - 4);
    line(barX + x + 2, barY + barH / 2, barX + x + 3, barY + barH / 2);
  }

  // Borda neon
  noFill();
  stroke(0, 255, 229, 60);
  strokeWeight(1);
  rect(barX, barY, barW, barH, 10);

  // Label
  noStroke();
  fill(100, 100, 160);
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text('CICLO SOLAR', barX, barY - 6);

  // Percentagem
  textAlign(RIGHT, BOTTOM);
  text(floor(progresso * 100) + '%', barX + barW, barY - 6);

  // Ícone de sol/lua no início/fim
  if (progresso < 0.5) {
    fill(255, 200, 50, 150);
    circle(barX + 4, barY + barH / 2, 12);
  } else {
    fill(200, 220, 255, 150);
    circle(barX + barW - 4, barY + barH / 2, 12);
  }
}

// ===== CARREGAR DADOS (APIs) =====
async function carregarDados() {
  loading = true;
  try {
    // Open-Meteo
    const respTempo = await fetch(
      'https://api.open-meteo.com/v1/forecast?latitude=41.15&longitude=-8.61&current=temperature_2m,wind_speed_10m&timezone=auto'
    );
    const tempo = await respTempo.json();
    temperatura = tempo.current.temperature_2m;
    velocidadeVento = tempo.current.wind_speed_10m;

    // Sunrise-Sunset
    const respSol = await fetch(
      'https://api.sunrise-sunset.org/json?lat=41.15&lng=-8.61&formatted=0'
    );
    const sol = await respSol.json();
    nascerSol = new Date(sol.results.sunrise);
    porSol = new Date(sol.results.sunset);

    const agora = new Date();
    eDia = agora > nascerSol && agora < porSol;
    loading = false;

    // Atualizar status
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (dot) {
      dot.className = 'dot online';
      text.textContent = 'LIVE';
    }
  } catch (erro) {
    console.error('Erro ao carregar APIs:', erro);
    loading = false;
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    if (dot) {
      dot.className = 'dot offline';
      text.textContent = 'OFFLINE';
    }
  }
}

// ===== REDIMENSIONAR =====
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

// ===== CURSOR GLOW =====
document.addEventListener('mousemove', (e) => {
  const glow = document.getElementById('cursor-glow');
  if (glow) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }
});
