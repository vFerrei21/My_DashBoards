let temperatura = 0;
let velocidadeVento = 0;

let nascerSol;
let porSol;

let eDia = true;
let loading = true;

// //=====================================================================================================================================
//                                                            Setup
// //=====================================================================================================================================

function setup() {

  createCanvas(
    windowWidth,
    windowHeight
  );
  textFont("Arial");
  carregarDados();
  setInterval(
    carregarDados,
    60000
  );
}

// // =====================================================================================================================================
//                                                          Draw
// // =====================================================================================================================================

function draw() {
  desenharCeu();
  if (loading) {
    fill(255);
    textSize(30);
    text(
      "Loading...",
      50,
      50
    );

    return;
  }

  desenharSolOuLua();
  desenharNuvens();
  desenharDados();
  desenharChao();
  desenharMoinho();
  desenharBarraSolar();
}

// =====================================================================================================================================
//                                                              APIs
// =====================================================================================================================================

async function carregarDados() {

  try {

    // =====================================================================================================================================
    //                                                       Open Meteo
    // =====================================================================================================================================

    const respostaTempo =
      await fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=41.15&longitude=-8.61&current=temperature_2m,wind_speed_10m&timezone=auto"
      );
    const tempo =
      await respostaTempo.json();
    temperatura =
      tempo.current.temperature_2m;
    velocidadeVento =
      tempo.current.wind_speed_10m;

    // =====================================================================================================================================
    //                                                    Sunrise Sunset API
    // =====================================================================================================================================

    const respostaSol =
      await fetch(
        "https://api.sunrise-sunset.org/json?lat=41.15&lng=-8.61&formatted=0"
      );
    const sol =
      await respostaSol.json();
    nascerSol =
      new Date(
        sol.results.sunrise
      );
    porSol =
      new Date(
        sol.results.sunset
      );
    let agora =
      new Date();
    eDia =
      agora > nascerSol &&
      agora < porSol;
    loading = false;
  }

  catch (erro) {
    console.error(
      "Erro ao carregar APIs:",
      erro
    );

  }
}

// =====================================================================================================================================
//                                                              CÉU
// =====================================================================================================================================

function desenharCeu() {

  if (eDia) {
    let azul =
      map(
        temperatura,
        -5,40,180,255
      );
    background(
      120,180,azul
    );
  }

  else {
    background(
      10,15,35
    );
  }
}

// =====================================================================================================================================
//                                                           SOL / LUA
// =====================================================================================================================================

function desenharSolOuLua() {

  noStroke();
  if (eDia) {
    fill(
      255,220,0
    );
    circle(
      width - 120,120,90
    );
  }
  else {
    fill(240);
    circle(
      width - 120,
      120,
      70
    );
  }
}

// =====================================================================================================================================
//                                                          NUVENS
// =====================================================================================================================================

function desenharNuvens() {

  if (!eDia) return;
  fill(255,180);
  noStroke();
  let velocidadeNuvens =
    map(velocidadeVento,0,50,0.3,3);

  for (let i = 0;i < 5;i++) {

    let x =
      (frameCount *velocidadeNuvens +i * 250) %(width + 200);

    ellipse(x,120 +sin(frameCount * 0.01 + i) * 20,120,60);
  }
}

// =====================================================================================================================================
//                                                          DADOS
// =====================================================================================================================================

function desenharDados() {

  fill(eDia ? 20 : 255);
  textSize(24);
  text("Temperatura: " + temperatura.toFixed(1) + " °C",30,50);

  text("Velocidade do Vento: " + velocidadeVento.toFixed(1) + " km/h", 30, 90);

  text("Nascer do Sol: " + nascerSol.toLocaleTimeString("pt-PT",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ),30,130);

  text(
    "Pôr do Sol: " +porSol.toLocaleTimeString("pt-PT",
      {
        hour: "2-digit",
        minute: "2-digit"
      }
    ),30,170
  );
}

// =====================================================================================================================================
//                                                          CHÃO
// =====================================================================================================================================

function desenharChao() {
  fill(60,150,60);
  noStroke();
  rect(0,height - 180,width,180);
}

// =====================================================================================================================================
//                                                          MOINHO
// =====================================================================================================================================

function desenharMoinho() {

  push();
  translate(width / 2,height / 2 + 100);

  // Torre

  stroke(80);
  strokeWeight(10);
  line(0,0,0,250);

  // Corpo

  rectMode(CENTER);
  fill(220);
  stroke(60);
  strokeWeight(3);
  rect(0,-30,90,130,10);

  // Centro das pás

  fill(100);
  circle(0,-50,20);

  // Velocidade baseada no vento

  let velocidadeRotacao =
    map(velocidadeVento,0,50,0,0.2);

  rotate(frameCount * velocidadeRotacao);

  // Pás

  fill(245);

  for (let i = 0; i < 4; i++) 
    {
    rotate(HALF_PI);
    rect(0,-80,20,130,5);
  }
  pop();
}

// =====================================================================================================================================
//                                          BARRA SOLAR
// =====================================================================================================================================

function desenharBarraSolar() {

  let duracaoDia = porSol - nascerSol;
  let tempoDecorrido = new Date() - nascerSol;
  let progresso = constrain(tempoDecorrido / duracaoDia,0,1);

  fill(eDia? color(255,180,0): color(120,180,255));

  rect( 50, height - 60, progresso * (width - 100),25,10 );

  fill(eDia ? 20 : 255);

  textSize(18);

  text("Progresso do Ciclo Solar",50,height - 70);
}

// =====================================================================================================================================
//                                                          Responsividade
// =====================================================================================================================================

function windowResized() {
  resizeCanvas( windowWidth, windowHeight);
}