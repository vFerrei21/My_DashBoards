// ============================================================
//  DASHBOARD 2 — IMAGE LAB  (p5.js + Pexels API)
//  Cyberpunk edition · vferrei21
// ============================================================

let imgOriginal;       // imagem original (sem efeitos)
let imgDisplay;        // imagem processada (para mostrar)
let apiKey = '';
let isReady = false;

// Controlos
let promptInput;
let brightnessSlider, glitchSlider, posterizeSlider, pixelateSlider;
let grayscaleCheck, invertCheck, noiseCheck, blurCheck;
let statusMsg = 'Aguardando...';
let imageHistory = [];
let historyIndex = -1;
let isProcessing = false;

// ===== CONFIGURAÇÃO INICIAL =====
function setup() {
  createCanvas(windowWidth, windowHeight);
  pixelDensity(1);
  textFont('Share Tech Mono');
  noLoop(); // só desenha quando necessário

  // Restaurar API key guardada
  const saved = localStorage.getItem('pexels_api_key');
  if (saved && saved.length > 10) {
    apiKey = saved;
    showDashboard();
  } else {
    showWelcomeScreen();
  }
}

// ===== ECRÃ DE BOAS-VINDAS =====
function showWelcomeScreen() {
  background(10);
  noLoop();

  const panel = createDiv(`
    <div style="max-width:500px; margin:60px auto; padding:30px; background:rgba(15,15,26,0.9); border:1px solid #00ffe5; border-radius:8px; font-family:'Share Tech Mono',monospace; color:#c8c8ff; box-shadow:0 0 40px rgba(0,255,229,0.05);">
      <h1 style="font-family:'Orbitron',sans-serif; font-weight:900; color:#00ffe5; letter-spacing:0.1em; margin-bottom:6px;">IMAGE LAB</h1>
      <p style="color:#7b2fff; letter-spacing:0.1em; font-size:0.8rem; margin-bottom:20px;">Dashboard 2 · Pexels API</p>
      <p style="font-size:0.75rem; color:#5a5a8a; margin-bottom:12px;">Introduz a tua API Key da Pexels para começar.</p>
      <ol style="font-size:0.7rem; color:#5a5a8a; padding-left:20px; margin-bottom:16px; line-height:1.6;">
        <li>Cria conta grátis em <span style="color:#00ffe5;">pexels.com</span></li>
        <li>Vai a <span style="color:#00ffe5;">pexels.com/api</span></li>
        <li>Clica em <span style="color:#00ffe5;">Get Started</span></li>
        <li>Copia a tua <span style="color:#00ffe5;">API Key</span></li>
      </ol>
      <input id="apiInput" type="text" placeholder="API Key" style="width:100%; padding:8px 12px; background:rgba(255,255,255,0.05); border:1px solid rgba(123,47,255,0.3); border-radius:4px; color:#c8c8ff; font-family:'Share Tech Mono',monospace; font-size:0.8rem; outline:none; margin-bottom:12px;">
      <button id="startBtn" style="background:rgba(0,255,229,0.15); border:1px solid #00ffe5; color:#00ffe5; padding:8px 24px; font-family:'Share Tech Mono',monospace; font-size:0.8rem; letter-spacing:0.1em; border-radius:4px; cursor:pointer; transition:0.2s;">ENTRAR</button>
      <p style="font-size:0.6rem; color:#5a5a8a; margin-top:16px;">A chave fica guardada localmente.</p>
    </div>
  `);
  panel.position(0, 0);
  panel.style('width', '100%');
  panel.style('display', 'flex');
  panel.style('justify-content', 'center');
  panel.style('align-items', 'center');
  panel.style('height', '100vh');
  panel.style('pointer-events', 'auto');
  panel.style('z-index', '1000');

  const startBtn = document.getElementById('startBtn');
  const apiInput = document.getElementById('apiInput');

  startBtn.addEventListener('click', () => {
    const key = apiInput.value.trim();
    if (key.length < 10) {
      alert('Introduz uma API Key válida.');
      return;
    }
    apiKey = key;
    localStorage.setItem('pexels_api_key', key);
    panel.remove();
    showDashboard();
  });

  apiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') startBtn.click();
  });
}

// ===== DASHBOARD PRINCIPAL =====
function showDashboard() {
  isReady = true;
  // Criar painel de controlo (via DOM)
  const panel = createDiv();
  panel.class('control-panel');
  panel.position(windowWidth - 310, 20);

  // Título
  const title = createDiv('IMAGE <span>LAB</span>');
  title.class('panel-title');
  title.parent(panel);

  // Input de pesquisa
  const searchGroup = createDiv();
  searchGroup.class('control-group');
  searchGroup.parent(panel);
  createElement('label', 'Pesquisar').parent(searchGroup);
  promptInput = createInput('');
  promptInput.class('input-text');
  promptInput.attribute('placeholder', 'ex: cyberpunk city');
  promptInput.parent(searchGroup);

  const btnGroup = createDiv();
  btnGroup.style('display', 'flex');
  btnGroup.style('gap', '6px');
  btnGroup.style('margin-top', '6px');
  btnGroup.parent(searchGroup);

  const genBtn = createButton('Pesquisar');
  genBtn.class('btn btn-primary');
  genBtn.parent(btnGroup);
  genBtn.mousePressed(() => { if (!isProcessing) searchImage(); });

  const randBtn = createButton('🎲 Aleatório');
  randBtn.class('btn btn-secondary');
  randBtn.parent(btnGroup);
  randBtn.mousePressed(() => {
    const words = ['neon', 'cyber', 'space', 'vaporwave', 'city', 'robot', 'abstract', 'nature', 'cosmic', 'glitch'];
    const w = words[floor(random(words.length))];
    promptInput.value(w);
    searchImage();
  });

  // Sliders
  const sliders = [
    { label: 'Brilho', id: 'brightness', min: -100, max: 100, val: 0 },
    { label: 'Glitch', id: 'glitch', min: 0, max: 100, val: 0 },
    { label: 'Posterize', id: 'posterize', min: 2, max: 24, val: 8 },
    { label: 'Pixelate', id: 'pixelate', min: 2, max: 40, val: 2 },
  ];

  sliders.forEach(s => {
    const g = createDiv();
    g.class('control-group');
    g.parent(panel);
    createElement('label', s.label).parent(g);
    const slider = createSlider(s.min, s.max, s.val);
    slider.class('slider');
    slider.parent(g);
    // guardar referência
    if (s.id === 'brightness') brightnessSlider = slider;
    else if (s.id === 'glitch') glitchSlider = slider;
    else if (s.id === 'posterize') posterizeSlider = slider;
    else if (s.id === 'pixelate') pixelateSlider = slider;
    // atualizar ao soltar
    slider.input(() => { if (imgOriginal) applyEffects(); });
  });

  // Checkboxes
  const checks = [
    { label: 'Escala Cinzentos', id: 'grayscale' },
    { label: 'Inverter Cores', id: 'invert' },
    { label: 'Ruído', id: 'noise' },
    { label: 'Blur', id: 'blur' },
  ];

  checks.forEach(c => {
    const g = createDiv();
    g.class('control-group');
    g.parent(panel);
    const cbGroup = createDiv();
    cbGroup.class('checkbox-group');
    cbGroup.parent(g);
    const cb = createCheckbox('', false);
    cb.parent(cbGroup);
    if (c.id === 'grayscale') grayscaleCheck = cb;
    else if (c.id === 'invert') invertCheck = cb;
    else if (c.id === 'noise') noiseCheck = cb;
    else if (c.id === 'blur') blurCheck = cb;
    cb.changed(() => { if (imgOriginal) applyEffects(); });
    const label = createSpan(c.label);
    label.parent(cbGroup);
  });

  // Botões de ação
  const actionGroup = createDiv();
  actionGroup.style('display', 'flex');
  actionGroup.style('flex-wrap', 'wrap');
  actionGroup.style('gap', '4px');
  actionGroup.style('margin-top', '8px');
  actionGroup.parent(panel);

  const resetBtn = createButton('↺ Reset');
  resetBtn.class('btn btn-secondary');
  resetBtn.parent(actionGroup);
  resetBtn.mousePressed(() => { if (imgOriginal) { resetImage(); } });

  const saveBtn = createButton('💾 PNG');
  saveBtn.class('btn btn-primary');
  saveBtn.parent(actionGroup);
  saveBtn.mousePressed(() => { if (imgDisplay) saveCanvas('image_lab', 'png'); });

  // Status bar (p5 canvas)
  statusMsg = 'Pronto. Pesquisa uma imagem.';
  loop(); // ativar draw para mostrar status
}

// ===== PESQUISAR IMAGEM =====
async function searchImage() {
  if (!apiKey) {
    statusMsg = 'API Key não definida.';
    return;
  }
  const query = promptInput.value().trim() || 'abstract';
  statusMsg = 'A pesquisar...';
  isProcessing = true;
  try {
    const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=1`;
    const response = await fetch(url, { headers: { Authorization: apiKey } });
    const data = await response.json();
    if (!data.photos || data.photos.length === 0) {
      statusMsg = 'Nenhuma imagem encontrada.';
      isProcessing = false;
      return;
    }
    const imageUrl = data.photos[0].src.large2x;
    loadImage(imageUrl, (loaded) => {
      imgOriginal = loaded;
      imgDisplay = loaded.get(); // cópia
      // Guardar no histórico
      imageHistory = [imgOriginal.get()];
      historyIndex = 0;
      statusMsg = 'Imagem carregada!';
      isProcessing = false;
      applyEffects(); // aplicar efeitos iniciais
      loop();
    }, () => {
      statusMsg = 'Erro ao carregar imagem.';
      isProcessing = false;
    });
  } catch (err) {
    console.error(err);
    statusMsg = 'Erro na API.';
    isProcessing = false;
  }
}

// ===== APLICAR EFEITOS =====
function applyEffects() {
  if (!imgOriginal) return;
  // Reset para original
  imgDisplay = imgOriginal.get();

  // Brilho
  const bright = brightnessSlider ? brightnessSlider.value() : 0;
  if (bright !== 0) {
    imgDisplay.loadPixels();
    for (let i = 0; i < imgDisplay.pixels.length; i += 4) {
      imgDisplay.pixels[i] = constrain(imgDisplay.pixels[i] + bright, 0, 255);
      imgDisplay.pixels[i+1] = constrain(imgDisplay.pixels[i+1] + bright, 0, 255);
      imgDisplay.pixels[i+2] = constrain(imgDisplay.pixels[i+2] + bright, 0, 255);
    }
    imgDisplay.updatePixels();
  }

  // Glitch (pixel aleatório)
  const glitch = glitchSlider ? glitchSlider.value() : 0;
  if (glitch > 0) {
    imgDisplay.loadPixels();
    for (let i = 0; i < imgDisplay.pixels.length; i += 4) {
      if (random(100) < glitch) {
        imgDisplay.pixels[i] = random(255);
        imgDisplay.pixels[i+1] = random(255);
        imgDisplay.pixels[i+2] = random(255);
      }
    }
    imgDisplay.updatePixels();
  }

  // Posterize
  const poster = posterizeSlider ? posterizeSlider.value() : 8;
  if (poster > 2) {
    imgDisplay.loadPixels();
    const step = 255 / poster;
    for (let i = 0; i < imgDisplay.pixels.length; i += 4) {
      imgDisplay.pixels[i] = floor(imgDisplay.pixels[i] / step) * step;
      imgDisplay.pixels[i+1] = floor(imgDisplay.pixels[i+1] / step) * step;
      imgDisplay.pixels[i+2] = floor(imgDisplay.pixels[i+2] / step) * step;
    }
    imgDisplay.updatePixels();
  }

  // Pixelate (usando resize)
  const pixelate = pixelateSlider ? pixelateSlider.value() : 2;
  if (pixelate > 2) {
    const w = imgDisplay.width;
    const h = imgDisplay.height;
    const temp = imgDisplay.get();
    temp.resize(w / pixelate, h / pixelate);
    imgDisplay.resize(w, h);
    imgDisplay.copy(temp, 0, 0, temp.width, temp.height, 0, 0, w, h);
  }

  // Filtros p5
  if (grayscaleCheck && grayscaleCheck.checked()) {
    imgDisplay.filter(GRAY);
  }
  if (invertCheck && invertCheck.checked()) {
    imgDisplay.filter(INVERT);
  }
  if (blurCheck && blurCheck.checked()) {
    imgDisplay.filter(BLUR, 3);
  }
  if (noiseCheck && noiseCheck.checked()) {
    imgDisplay.loadPixels();
    for (let i = 0; i < imgDisplay.pixels.length; i += 4) {
      const n = random(-30, 30);
      imgDisplay.pixels[i] = constrain(imgDisplay.pixels[i] + n, 0, 255);
      imgDisplay.pixels[i+1] = constrain(imgDisplay.pixels[i+1] + n, 0, 255);
      imgDisplay.pixels[i+2] = constrain(imgDisplay.pixels[i+2] + n, 0, 255);
    }
    imgDisplay.updatePixels();
  }

  // Atualizar canvas
  redraw();
}

// ===== RESET =====
function resetImage() {
  if (imgOriginal) {
    imgDisplay = imgOriginal.get();
    // Reset sliders
    if (brightnessSlider) brightnessSlider.value(0);
    if (glitchSlider) glitchSlider.value(0);
    if (posterizeSlider) posterizeSlider.value(8);
    if (pixelateSlider) pixelateSlider.value(2);
    if (grayscaleCheck) grayscaleCheck.checked(false);
    if (invertCheck) invertCheck.checked(false);
    if (noiseCheck) noiseCheck.checked(false);
    if (blurCheck) blurCheck.checked(false);
    applyEffects();
  }
}

// ===== DRAW =====
function draw() {
  background(10);

  // Mostrar imagem
  if (imgDisplay) {
    const w = imgDisplay.width;
    const h = imgDisplay.height;
    const scale = min(width / w, height / h);
    const dw = w * scale;
    const dh = h * scale;
    const dx = (width - dw) / 2;
    const dy = (height - dh) / 2;
    image(imgDisplay, dx, dy, dw, dh);
  } else {
    // Mensagem central
    fill('#5a5a8a');
    textSize(20);
    textAlign(CENTER, CENTER);
    text('🔍 Pesquisa uma imagem', width/2, height/2);
    textSize(14);
    fill('#3a3a5a');
    text('Usa a barra lateral →', width/2, height/2 + 40);
  }

  // Mouse warp (efeito visual)
  if (imgDisplay) {
    noFill();
    stroke(255, 180, 0.5);
    const r = map(mouseX, 0, width, 20, 200);
    circle(mouseX, mouseY, r);
  }

  // Status no canto inferior esquerdo
  fill('#5a5a8a');
  noStroke();
  textSize(11);
  textAlign(LEFT, BOTTOM);
  text(statusMsg || '', 20, height - 20);

  // Info no canto inferior direito
  if (imgOriginal) {
    textAlign(RIGHT, BOTTOM);
    text(`${imgOriginal.width}×${imgOriginal.height}`, width - 20, height - 20);
  }

  // Se não houver imagem, não loop continuamente
  if (!imgOriginal) {
    noLoop();
  }
}

// ===== REDIMENSIONAR =====
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  // Reposicionar painel
  const panel = document.querySelector('.control-panel');
  if (panel) {
    panel.style.right = '20px';
    panel.style.top = '20px';
  }
  redraw();
}

// ===== CURSOR GLOW =====
document.addEventListener('mousemove', (e) => {
  const glow = document.getElementById('cursor-glow');
  if (glow) {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  }
});
