let img;
let apiKey = "";
let appStarted = false;
let promptInput;
let brightnessSlider;
let glitchSlider;
let posterizeSlider;
let grayscaleCheck;
let invertCheck;
let noiseCheck;
let statusMsg =
  "Pesquisa uma imagem";

function setup() {
  createCanvas(windowWidth,windowHeight);
  textFont("Arial");
  showWelcomeScreen();
}

function showWelcomeScreen() {
  background(20);
  let panel = createDiv(`
    <h1>Dashboard 2</h1>
    <h3>Como obter a API Key da Pexels</h3>
    <ol>
      <li>Criar conta gratuita em Pexels</li>
      <li>Aceder a https://www.pexels.com/api</li>
      <li>Clicar em Get Started</li>
      <li>Copiar a API Key</li>
      <li>Colar a chave abaixo</li>
    </ol>
    <p>
      Este projeto utiliza pedidos HTTP reais
      à API da Pexels.
    </p>`);

  panel.position(40, 30);
  panel.style("color", "white");

  let keyInput =createInput("");keyInput.position(60,330);

  keyInput.size(400);keyInput.attribute("placeholder","API Key Pexels");

  let startBtn = createButton("Entrar");

  startBtn.position(60, 370);

  startBtn.mousePressed(() => {

    apiKey =
      keyInput.value().trim();

    if (apiKey.length < 10) 
    {
      alert("Introduz uma API Key válida.");
      return;
    }
    panel.remove();
    keyInput.remove();
    startBtn.remove();
    initializeDashboard();});
}

function initializeDashboard() {

  appStarted = true;

  let ui = createDiv();
  ui.position(15, 15);

  ui.style( "background", "rgba(0,0,0,0.85)");
  ui.style( "padding", "15px" );
  ui.style("border-radius", "12px");
  ui.style("width", "260px");
  ui.style("color", "white");
  createP("Pesquisar Imagem").parent(ui);

  promptInput = createInput("");
  promptInput.parent(ui);
  promptInput.size(230);
  promptInput.attribute("placeholder","Ex: cyberpunk city");

  let generateBtn =
    createButton(
      "Pesquisar"
    );

  generateBtn.parent(ui);

  generateBtn.mousePressed(
    generateImage
  );

  createP(
    "Brilho"
  ).parent(ui);

  brightnessSlider =
    createSlider(
      -100,
      100,
      0
    );

  brightnessSlider.parent(ui);

  createP(
    "Glitch"
  ).parent(ui);

  glitchSlider =
    createSlider(
      0,
      100,
      0
    );

  glitchSlider.parent(ui);

  createP(
    "Posterize"
  ).parent(ui);

  posterizeSlider =
    createSlider(
      2,
      20,
      8
    );

  posterizeSlider.parent(ui);

  grayscaleCheck =
    createCheckbox(
      "Escala Cinzentos",
      false
    );

  grayscaleCheck.parent(ui);

  invertCheck =
    createCheckbox(
      "Inverter Cores",
      false
    );

  invertCheck.parent(ui);

  noiseCheck =
    createCheckbox(
      "Ruído",
      false
    );

  noiseCheck.parent(ui);

  createElement(
    "br"
  ).parent(ui);

  let saveBtn =
    createButton(
      "Guardar PNG"
    );

  saveBtn.parent(ui);

  saveBtn.mousePressed(() => {

    saveCanvas(
      "dashboard2",
      "png"
    );

  });
}

async function generateImage() {

  statusMsg =
    "Loading...";

  try {

    let search =
      encodeURIComponent(
        promptInput.value()
      );

    let response =
      await fetch(
        `https://api.pexels.com/v1/search?query=${search}&per_page=1`,
        {
          headers: {
            Authorization:
              apiKey
          }
        }
      );

    let data =
      await response.json();

    if (
      !data.photos ||
      data.photos.length === 0
    ) {

      statusMsg =
        "Nenhuma imagem encontrada";

      return;
    }

    let imageUrl =
      data.photos[0]
      .src.large2x;

    loadImage(

      imageUrl,

      loaded => {

        img = loaded;

        statusMsg =
          "Imagem carregada";
      },

      err => {

        console.error(
          err
        );

        statusMsg =
          "Erro ao carregar";
      }
    );

  } catch(err) {

    console.error(
      err
    );

    statusMsg =
      "Erro API";
  }
}

function draw() {

  background(20);

  if (
    !appStarted
  ) return;

  if (img) {

    image(
      img,
      0,
      0,
      width,
      height
    );

    applyEffects();
  }

  fill(255);

  noStroke();

  rect(
    width - 260,
    20,
    240,
    50
  );

  fill(0);

  textSize(14);

  text(
    statusMsg,
    width - 245,
    50
  );
}

function applyEffects() {

  if (
    grayscaleCheck.checked()
  ) {

    filter(GRAY);
  }

  if (
    invertCheck.checked()
  ) {

    filter(INVERT);
  }

  loadPixels();

  let brightnessValue =
    brightnessSlider.value();

  let glitchValue =
    glitchSlider.value();

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    pixels[i] +=
      brightnessValue;

    pixels[i + 1] +=
      brightnessValue;

    pixels[i + 2] +=
      brightnessValue;

    if (
      random(100)
      < glitchValue
    ) {

      pixels[i] =
        random(255);

      pixels[i+1] =
        random(255);

      pixels[i+2] =
        random(255);
    }

    if (
      noiseCheck.checked()
    ) {

      let n =
        random(
          -25,
          25
        );

      pixels[i] += n;
      pixels[i+1] += n;
      pixels[i+2] += n;
    }
  }

  updatePixels();

  posterizeEffect(
    posterizeSlider.value()
  );

  mouseWarp();
}

function posterizeEffect(
  levels
) {

  loadPixels();

  let step =
    255 / levels;

  for (
    let i = 0;
    i < pixels.length;
    i += 4
  ) {

    pixels[i] =
      floor(
        pixels[i]
        / step
      ) * step;

    pixels[i+1] =
      floor(
        pixels[i+1]
        / step
      ) * step;

    pixels[i+2] =
      floor(
        pixels[i+2]
        / step
      ) * step;
  }

  updatePixels();
}

function mouseWarp() {

  noFill();
  stroke(255,180);
  let radius =
    map(mouseX,0,width,20,250);
    circle(mouseX,mouseY,radius);
}

function windowResized() {
  resizeCanvas(
    windowWidth,
    windowHeight
  );
}