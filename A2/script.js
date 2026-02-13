let canvas;
let ctx;
let tempstarterco2 = true;
let tempstarterheat = true;

let isDraggingDiagramm = false;

let dragOffsetXDiagramm = 0;
let dragOffsetYDiagramm = 0;

let currentElement = null; // Um das gerade gezogene Element zu speichern

    let diagramm = {
        id: "diagramm",          
        x: 725,
        y: 180,
        width: 625,
        height: 400,
        temperature: 20,  // Anfangstemperatur
    };
    
    let diagrammClose = {
      id: "diagrammClose",          
      width: 25,
      height: 25,
      src: 'img/close.png'
    };

    let lampOff = {
        id: "lampOff",
        x: 280,
        y: -50,
        width: 600,
        height: 527,
        src: 'img/lampeOff.png',
        isVisible : true,
    };

    let lampOn = {
        id: "lampOn",
        x: 280,
        y: -50,
        width: 600,
        height: 527,
        src: 'img/lampeOn.png',
        isVisible : false,
    };

    let bullet = {
        id: "bullet",
        x: 675,
        y: 500,
        width: 550,
        height: 116,
        src: 'img/bullet.png',
        isVisible : false,
    };

    let face = {
        id: "face",
        x: 210,
        y: 550,
        width: 1000,
        height: 101,
        src: 'img/face.png',
        isVisible : false,
    };

   

  let IRmitCO2 = {
    id: "IRmitCO2",
    width: 499,
    height: 400,
    src: 'img/IRmitCO2.png',
    temperature: 20,  // Anfangstemperatur
  };

  let IRohneCO2 = {
  id: "IRohneCO2",
  width: 499,
  height: 400,
  src: 'img/IRohneCO2.png',
  temperature: 20,  // Anfangstemperatur
  };

  let fadeAlpha = 0.2; // 0 = ganz IRohneCO2, 1 = ganz IRmitCO2
  let fadeSpeed = 0.002; // Geschwindigkeit des Übergangs


    let schalter={
        x: 54,
        y: 266,
        widht: 24,
        height: 14,
    }

    // Timer
    let timer={
        x: 1050,
        y: 25,
        weidht: 300,
        height: 100,
        startTime: 0, // Startzeit in Millisekunden
        elapsedTime: 0, // Vergangene Zeit
        isRunning: false,// Status der Stoppuhr
        buttonBox:{
          x: 25,
          y: 25,
          weidht: 300,
          height: 100
      },
    };

    let intervalId; // ID für setInterval 

    // Button-Positionen und Größen
    const buttons = {
        start: { x: timer.x + 25, y: 80, width: 70, height: 30, label: 'Start' },
        stop: { x: timer.x + 120, y: 80, width: 70, height: 30, label: 'Stop' },
        reset: { x: timer.x + 215, y: 80, width: 70, height: 30, label: 'Reset' },
      };

    // ButtonBox
    let buttonBox={
        x: 25,
        y: 25,
        width: 500,
        height: 100,
    };

    // Checkboxen
    // Lampe
const checkboxLamp = {
    x: buttonBox.x + 25,
    y: buttonBox.y + 15,
    width: 70,
    height: 70,
    isChecked: false,
};

// bullet
const checkboxbullet = {
    x: buttonBox.x + 120,
    y: buttonBox.y + 15,
    width: 70,
    height: 70,
    isChecked: false,
};

const checkboxface = {
  x: buttonBox.x + 215,
  y: buttonBox.y + 15,
  width: 70,
  height: 70,
  isChecked: false,
};

// Diagramm
const checkboxDiagramm = {
    x: buttonBox.x + 310,
    y: buttonBox.y + 15,
    width: 80,
    height: 70,
    isChecked: false,
};

const checkboxRays = {
  x: buttonBox.x + 405,
  y: buttonBox.y + 15,
  width: 70,
  height: 70,
  isChecked: false,
  isVisible: false
};

const checkboxHelp = {
  x: buttonBox.x + 510,
  y: buttonBox.y + 15,
  width: 70,
  height: 70,
  isChecked: false,
};

const infoButtons = {
  LampButton: { 
        x: checkboxLamp.x, 
        y: checkboxLamp.y, 
        width: checkboxLamp.width, 
        height: checkboxLamp.height, 
        label: 'Lampe', 
        checkbox: checkboxLamp,
        src: 'img/lampeIcon.png',
  },
  bulletButton: { 
        x: checkboxbullet.x, 
        y: checkboxbullet.y, 
        width: checkboxbullet.width, 
        height: checkboxbullet.height, 
        label: 'Erde', 
        checkbox: checkboxbullet,
        src: 'img/bulletIcon.png' 
  },
  faceButton: { 
      x: checkboxface.x, 
      y: checkboxface.y, 
      width: checkboxface.width, 
      height: checkboxface.height, 
      label: 'Flächen', 
      checkbox: checkboxface,
      src: 'img/cameraIcon.png'
  },
  DiagrammButton: { 
        x: checkboxDiagramm.x, 
        y: checkboxDiagramm.y, 
        width: checkboxDiagramm.width, 
        height: checkboxDiagramm.height, 
        label: 'Diagramm', 
        checkbox: checkboxDiagramm,
        src: 'img/DiagrammIcon.png'
  },
  
  RaysButton: { 
      x: checkboxRays.x, 
      y: checkboxRays.y, 
      width: checkboxRays.width, 
      height: checkboxRays.height, 
      label: 'Strahlen', 
      checkbox: checkboxRays,
      src: 'img/rays_icon.png'
  },
  // HelpButton: { 
  //     x: checkboxHelp.x, 
  //     y: checkboxHelp.y, 
  //     width: checkboxHelp.width, 
  //     height: checkboxHelp.height, 
  //     label: 'Hilfe', 
  //     checkbox: checkboxHelp,
  //     src: 'img/questionmark.png'
  // },
};

function infoButtonBox() {     

    // Hintergrund zeichnen
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(buttonBox.x, buttonBox.y, buttonBox.width, buttonBox.height);

    // Rahmen zeichnen
    ctx.strokeStyle = '#ccc';
    ctx.lineWidth = 4;
    ctx.strokeRect(buttonBox.x, buttonBox.y, buttonBox.width, buttonBox.height);

    // Buttons zeichnen
    Object.values(infoButtons).forEach(button => {

            
        // Button-Hintergrund je nach Status
        ctx.fillStyle = button.checkbox.isChecked ? '#add8e6' : '#007bff';
        ctx.fillRect(button.x, button.y, button.width, button.height);

        // Button-Rahmen für bessere Sichtbarkeit
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;
        ctx.strokeRect(button.x, button.y, button.width, button.height);

        // Bild über dem Button zeichnen (30x30px)
        let img = new Image();
        img.src = button.src;
        ctx.drawImage(img, button.x + (button.width / 2) - 25, button.y + 5, 50, 40);

        // Button-Text
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.label, button.x + button.width / 2, button.y + 60);
    });
}



      function Timer() {
        
        // Zeichne Hintergrund
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(timer.x, timer.y, timer.weidht, timer.height);
  
        // Zeichne Rahmen
        ctx.strokeStyle = '#ccc';
        ctx.lineWidth = 4;
        ctx.strokeRect(timer.x, timer.y, timer.weidht, timer.height);
  
        // Zeichne Zeit
        ctx.fillStyle = '#000';
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const milliseconds = Math.floor((timer.elapsedTime % 1000) / 10);
        const seconds = Math.floor((timer.elapsedTime / 1000) % 60);
        const minutes = Math.floor(timer.elapsedTime / 60000);
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}.${String(milliseconds).padStart(2, '0')}`;
        ctx.fillText(timeString, timer.x + timer.weidht/2, timer.y + timer.height/3);
  
        // Zeichne Buttons
        Object.values(buttons).forEach(button => {
          ctx.fillStyle = '#007bff';
          ctx.fillRect(button.x, button.y, button.width, button.height);
          ctx.fillStyle = '#fff';

          // Button-Rahmen für bessere Sichtbarkeit
            ctx.strokeStyle = '#000';
            ctx.lineWidth = 2;
            ctx.strokeRect(button.x, button.y, button.width, button.height);

          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
        });
      }

       // Starte die Stoppuhr
    function startStopwatch() {
        if (!timer.isRunning) {
          timer.isRunning = true;
          timer.startTime = Date.now() - timer.elapsedTime; // Berücksichtige bereits vergangene Zeit
          intervalId = setInterval(() => {
            timer.elapsedTime = Date.now() - timer.startTime;
            Timer();
          }, 10);
        }
      }
  
    // Stoppe die Stoppuhr
    function stopStopwatch() {
        if (timer.isRunning) {
          timer.isRunning = false;
          clearInterval(intervalId);
        }
      }
  
    // Setze die Stoppuhr zurück
    function resetStopwatch() {
        timer.isRunning = false;
        clearInterval(intervalId);
        timer.elapsedTime = 0;
        Timer();
      }
    
const dataBu = [];
const dataBF = [];
const dataWF = [];   
const maxDataPoints = 2000;
let time = 0;
const padding = 50;
const yMax = 60; // Skalierung der Y-Werte
let lastValueBu = 0; // Speichert den aktuellen Wert für die Anzeige
let lastValueBF = 0; // BF = BlackFace
let lastValueWF = 0; // WF = WhiteFace

// Position für die Wertanzeige (beliebig anpassbar)
const textBulletX = 1125;
const textBulletY = 560;
const textBlackFaceX = 1135;
const textBlackFaceY = 605;
const textWhiteFaceX = 288;
const textWhiteFaceY = 605;


let heat = false;
let co2 = false;
let t1 = 0;
let t2 = 0;
let ta = 0;
let tb = 0;
let ta1 = 0;
let tb1 = 0;
let lastValueDrücker1 = 0;
let lastValueDrücker2 = 0;

// Zustandsverwaltung
let tempStartHeat = false;
let tempStartCool = false;
let heatStartTime = 0;
let coolStartTime = 0;

let currentTempBu = 19;
let transitionStartTimeBu = 0;
let transitionStartTempBu = 19;
let lastEffectiveTargetBu = 19;
let currentTempBF = 19.5;
let transitionStartTimeBF = 0;
let transitionStartTempBF = 19.5;
let lastEffectiveTargetBF = 19.5;
let currentTempWF = 19;
let transitionStartTimeWF = 0;
let transitionStartTempWF = 19;
let lastEffectiveTargetWF = 19;

function sigmoidBu(tBu) {
    return 1 / (1 + Math.exp(-0.005 * tBu + 8));
}

function generateVesselTemperatureBu(tBu) {
    // Zieltemperatur je nach Kombination
    let targetTempBu;
    if (heat) {
        targetTempBu = co2 ? 39 : 29;
    } else {
        targetTempBu = 19;
    }

    // Nur wenn sich das Ziel geändert hat, neue Transition starten
    if (targetTempBu !== lastEffectiveTargetBu) {
        transitionStartTimeBu = tBu;
        transitionStartTempBu = currentTempBu;
        lastEffectiveTargetBu = targetTempBu;
    }

    const deltaBu = targetTempBu - transitionStartTempBu;
    const timeSinceTransitionBu = tBu - transitionStartTimeBu;
    const curveProgressBu = sigmoidBu(timeSinceTransitionBu);

    currentTempBu = transitionStartTempBu + deltaBu * curveProgressBu;

    return currentTempBu;
}

function updateDataBu() {
    lastValueBu = generateVesselTemperatureBu(time);

    if (lastValueBu < 19) {
        lastValueBu = 19;
    }
    
    dataBu.push({ x: time, y: lastValueBu });
    
    if (dataBu.length > maxDataPoints) {
        dataBu.shift(); // Entfernt alte Werte
    }
    
    time++;
}
// ______________________BlackFace_______________________
function sigmoidBF(tBF) {
    return 1 / (1 + Math.exp(-0.005 * tBF + 8));
}

function generateVesselTemperatureBF(tBF) {
    // Zieltemperatur je nach Kombination
    let targetTempBF;
    if (heat) {
        targetTempBF = co2 ? 39 : 42;
    } else {
        targetTempBF = 19.5;
    }

    // Nur wenn sich das Ziel geändert hat, neue Transition starten
    if (targetTempBF !== lastEffectiveTargetBF) {
        transitionStartTimeBF = tBF;
        transitionStartTempBF = currentTempBF;
        lastEffectiveTargetBF = targetTempBF;
    }

    const deltaBF = targetTempBF - transitionStartTempBF;
    const timeSinceTransitionBF = tBF - transitionStartTimeBF;
    const curveProgressBF = sigmoidBF(timeSinceTransitionBF);

    currentTempBF = transitionStartTempBF + deltaBF * curveProgressBF;

    return currentTempBF;
}

function updateDataBF() {
    lastValueBF = generateVesselTemperatureBF(time);

    if (lastValueBF < 19) {
        lastValueBF = 19;
    }
    
    dataBF.push({ x: time, y: lastValueBF });
    
    if (dataBF.length > maxDataPoints) {
        dataBF.shift(); // Entfernt alte Werte
    }
    
    time++;
}
// ______________________WhiteFace_______________________
function sigmoidWF(tWF) {
    return 1 / (1 + Math.exp(-0.005 * tWF + 8));
}

function generateVesselTemperatureWF(tWF) {
    // Zieltemperatur je nach Kombination
    let targetTempWF;
    if (heat) {
        targetTempWF = co2 ? 39 : 31;
    } else {
        targetTempWF = 19;
    }

    // Nur wenn sich das Ziel geändert hat, neue Transition starten
    if (targetTempWF !== lastEffectiveTargetWF) {
        transitionStartTimeWF = tWF;
        transitionStartTempWF = currentTempWF;
        lastEffectiveTargetWF = targetTempWF;
    }

    const deltaWF = targetTempWF - transitionStartTempWF;
    const timeSinceTransitionWF = tWF - transitionStartTimeWF;
    const curveProgressWF = sigmoidWF(timeSinceTransitionWF);

    currentTempWF = transitionStartTempWF + deltaWF * curveProgressWF;

    return currentTempWF;
}

function updateDataWF() {
    lastValueWF = generateVesselTemperatureWF(time);

    if (lastValueWF < 19) {
        lastValueWF = 19;
    }
    
    dataWF.push({ x: time, y: lastValueWF });
    
    if (dataWF.length > maxDataPoints) {
        dataWF.shift(); // Entfernt alte Werte
    }
    
    time++;
}

let currentMaxTime = 1000; // z. B. Start mit 1000 Sekunden, wächst dynamisch

function drawAxes() {
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;

    // Y-Achse mit Pfeil
    ctx.beginPath();
    ctx.moveTo(diagramm.x + padding, diagramm.y + diagramm.height - padding);
    ctx.lineTo(diagramm.x + padding, diagramm.y + 10);
    ctx.lineTo(diagramm.x + padding - 5, diagramm.y + 15);
    ctx.moveTo(diagramm.x + padding, diagramm.y + 10);
    ctx.lineTo(diagramm.x + padding + 5, diagramm.y + 15);
    ctx.stroke();

    // X-Achse mit Pfeil
    ctx.beginPath();
    ctx.moveTo(diagramm.x + padding, diagramm.y + diagramm.height - padding);
    ctx.lineTo(diagramm.x + diagramm.width - 10, diagramm.y + diagramm.height - padding);
    ctx.lineTo(diagramm.x + diagramm.width - 16, diagramm.y + diagramm.height - padding - 5);
    ctx.moveTo(diagramm.x + diagramm.width - 10, diagramm.y + diagramm.height - padding);
    ctx.lineTo(diagramm.x + diagramm.width - 16, diagramm.y + diagramm.height - padding + 5);
    ctx.stroke();

    // Achsenbeschriftung
    ctx.font = "14px Arial";
    ctx.fillStyle = "black";

    // X-Achse: Zeit t in Sekunden
    ctx.fillText("t (s)", diagramm.x + diagramm.width - 50, diagramm.y + diagramm.height - padding + 30);

    // Y-Achse: Temperatur in °C
    ctx.save();
    ctx.translate(diagramm.x + padding - 35, diagramm.y + 150);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText("Temperatur (°C)", 0, 0);
    ctx.restore();
}


function drawGrid() {
    ctx.strokeStyle = "#ddd";
    ctx.lineWidth = 1;
    ctx.font = "12px Arial";
    ctx.fillStyle = "black";

    ctx.fillStyle = "white";
    ctx.fillRect(diagramm.x - 10, diagramm.y, diagramm.width + 10, diagramm.height);
    ctx.strokeStyle = "black";
    ctx.lineWidth = 2;
    ctx.strokeRect(diagramm.x - 10, diagramm.y, diagramm.width + 10, diagramm.height);

    // Y-Achse (0–60 °C)
    for (let i = 0; i <= 60; i += 10) {
        let y = diagramm.y + diagramm.height - padding - (i / 60) * (diagramm.height - padding * 2);
        ctx.strokeStyle = "#ddd";
        ctx.beginPath();
        ctx.moveTo(diagramm.x + padding, y);
        ctx.lineTo(diagramm.x + diagramm.width - 10, y);
        ctx.stroke();

        ctx.fillStyle = "black";
        ctx.fillText(i.toFixed(0), diagramm.x + 15 + padding - 25, y + 4);
    }

    // Mitlaufende X-Achse
    const totalSeconds = 30;
    const stepSeconds = 5;
    const startTime = Math.max(0, time - maxDataPoints); // laufender Startzeitpunkt

    for (let s = 0; s <= totalSeconds; s += stepSeconds) {
        let relIndex = s * (maxDataPoints / totalSeconds);
        let x = diagramm.x + padding + (relIndex / maxDataPoints) * (diagramm.width - padding - 10);
        ctx.strokeStyle = "#ddd";
        ctx.beginPath();
        ctx.moveTo(x, diagramm.y + 10);
        ctx.lineTo(x, diagramm.y + diagramm.height - padding);
        ctx.stroke();

        const labelSeconds = Math.floor((startTime + relIndex) / 66.67); // Sekunden-Anzeige
        ctx.fillStyle = "black";
        ctx.fillText(`${labelSeconds}`, x - 10, diagramm.y + diagramm.height - padding + 15);
    }
}


function drawgraphBullet() {
    ctx.clearRect(diagramm.x, diagramm.y, diagramm.width, diagramm.height);
    drawGrid();
    drawAxes();

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.linewidth = 2;

    const visibleDatabu = dataBu.slice(-maxDataPoints);
    visibleDatabu.forEach((pointbu, index) => {
        const xbu = diagramm.x + padding + (index / maxDataPoints) * (diagramm.width - padding - 10);
        const ybu = diagramm.y + diagramm.height - padding - (pointbu.y / 60) * (diagramm.height - padding * 2);

        if (index === 0) {
            ctx.moveTo(xbu, ybu);
        } else {
            ctx.lineTo(xbu, ybu);
        }
    });

    ctx.stroke();
}

function drawGraphBlackFace() {

    ctx.beginPath();
    ctx.strokeStyle = "#e21919ff";
    ctx.linewidth = 2;

    const visibleDataBF = dataBF.slice(-maxDataPoints);
    visibleDataBF.forEach((pointBF, index) => {
        const xBF = diagramm.x + padding + (index / maxDataPoints) * (diagramm.width - padding - 10);
        const yBF = diagramm.y + diagramm.height - padding - (pointBF.y / 60) * (diagramm.height - padding * 2);

        if (index === 0) {
            ctx.moveTo(xBF, yBF);
        } else {
            ctx.lineTo(xBF, yBF);
        }
    });

    ctx.stroke();
}

function drawGraphWhiteFace() {

    ctx.beginPath();
    ctx.strokeStyle = "#02660eff";
    ctx.linewidth = 2;

    const visibleDataWF = dataWF.slice(-maxDataPoints);
    visibleDataWF.forEach((pointWF, index) => {
        const xWF = diagramm.x + padding + (index / maxDataPoints) * (diagramm.width - padding - 10);
        const yWF = diagramm.y + diagramm.height - padding - (pointWF.y / 60) * (diagramm.height - padding * 2);

        if (index === 0) {
            ctx.moveTo(xWF, yWF);
        } else {
            ctx.lineTo(xWF, yWF);
        }
    });

    ctx.stroke();
}




    function drawTemperatureBullet() {
          // Aktuellen Wert als Text anzeigen
          ctx.font = "30px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(`${lastValueBu.toFixed(1)} °C`, textBulletX, textBulletY);
      }

    function drawTemperatureBlackFace() {
          // Aktuellen Wert als Text anzeigen
          ctx.font = "30px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(`${lastValueBF.toFixed(1)} °C`, textBlackFaceX, textBlackFaceY);
      }

    function drawTemperatureWhiteFace() {
          // Aktuellen Wert als Text anzeigen
          ctx.font = "30px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(`${lastValueWF.toFixed(1)} °C`, textWhiteFaceX, textWhiteFaceY);
      }

      // Kugel (Erde)
    const sphere = {
      x: 712,
      y: 559,
      r: 32
    };

    const surfaceA = {x: 560, y: 595, w: 125, h: 5};
    const surfaceB = {x: 735, y: 600, w: 125, h: 5};

    const numRays = 25;
    const spacing = (sphere.r + 100) * 2 / numRays;
    const startX = sphere.x - sphere.r -100;
    let rays = [];
    let surfacesMode = false;

    function createRays(){
      let newRays = [];
      for(let i=0;i<numRays;i++){
        const x = startX + i*spacing-10;
        newRays.push({x:x,y:400, hit:false,absorbed:false,reflected:false,rx:0,ry:0,hitY:0,length:0});
      }
      rays = rays.concat(newRays);
    }

    function drawArrow(x1,y1,x2,y2,color){
      const headlen = 8;
      const dx = x2-x1;
      const dy = y2-y1;
      const angle = Math.atan2(dy,dx);
      ctx.strokeStyle=color;
      ctx.fillStyle=color;
      ctx.lineWidth=2;
      ctx.beginPath();
      ctx.moveTo(x1,y1);
      ctx.lineTo(x2,y2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(x2,y2);
      ctx.lineTo(x2-headlen*Math.cos(angle-Math.PI/6), y2-headlen*Math.sin(angle-Math.PI/6));
      ctx.lineTo(x2-headlen*Math.cos(angle+Math.PI/6), y2-headlen*Math.sin(angle+Math.PI/6));
      ctx.closePath();
      ctx.fill();
    }
      function updateRays(){
      rays.forEach(ray=>{
        if(!ray.hit){
          ray.y += 2;

          if(!surfacesMode){
            // Kugel-Modus
            const dx = ray.x - sphere.x;
            if(Math.abs(dx) < sphere.r){
              const yHit = sphere.y - Math.sqrt(sphere.r*sphere.r - dx*dx);
              if(ray.y >= yHit){
                ray.hit = true;
                ray.hitY = yHit;
                if(Math.random() < 0.7){
                  ray.absorbed = true;
                } else {
                  ray.reflected = true;
                  const nx = (ray.x - sphere.x);
                  const ny = (yHit - sphere.y);
                  const nlen = Math.hypot(nx,ny);
                  const n = {x:nx/nlen, y:ny/nlen};
                  const d = {x:0, y:1};
                  const dn = d.x*n.x + d.y*n.y;
                  const rx = d.x - 2*dn*n.x;
                  const ry = d.y - 2*dn*n.y;
                  ray.rx = rx;
                  ray.ry = ry;
                }
              }
            }
          } else {
            // Flächen-Modus
            if(ray.y >= surfaceA.y && ray.x >= surfaceA.x && ray.x <= surfaceA.x+surfaceA.w){
              ray.hit = true;
              ray.hitY = surfaceA.y;
              if(Math.random() < 0.3){ // Fläche A reflektiert stark
                ray.absorbed = true;
              } else {
                ray.reflected = true;
                ray.rx = (Math.random()*0.5 - 0.25);
                ray.ry = -1;
              }
            }
            else if(ray.y >= surfaceB.y && ray.x >= surfaceB.x && ray.x <= surfaceB.x+surfaceB.w){
              ray.hit = true;
              ray.hitY = surfaceB.y;
              if(Math.random() < 0.7){ // Fläche B absorbiert stark
                ray.absorbed = true;
              } else {
                ray.reflected = true;
                ray.rx = (Math.random()*0.5 - 0.25);
                ray.ry = -1;
              }
            }
          }
        } else if(ray.reflected){
          ray.length += 3;
        }
      });


      // Alte Strahlen entfernen (wenn zu weit unten oder reflektiert fertig)
      rays = rays.filter(ray => {
        if(ray.absorbed && ray.y > canvas.height) return false;
        if(ray.reflected && ray.length > 150) return false;
        return true;
      });
    }

    function renderRays(){

    //     if(!surfacesMode){
    //     // Kugel zeichnen
    //     ctx.beginPath();
    //     ctx.arc(sphere.x,sphere.y,sphere.r,0,Math.PI*2);
    //     ctx.fillStyle = '#2266aa';
    //     ctx.fill();
    //     ctx.strokeStyle = '#114477';
    //     ctx.stroke();
    //   } else {
    //     // Flächen zeichnen
    //     ctx.fillStyle = '#555';
    //     ctx.fillRect(surfaceA.x, surfaceA.y, surfaceA.w, surfaceA.h);
    //     ctx.fillStyle = '#333';
    //     ctx.fillRect(surfaceB.x, surfaceB.y, surfaceB.w, surfaceB.h);
    //   }


      // Strahlen zeichnen
      rays.forEach(ray=>{
        if(!ray.hit){
          drawArrow(ray.x, ray.y-50, ray.x, ray.y, 'yellow');
        } else if(ray.reflected){
          drawArrow(ray.x, ray.hitY, ray.x + ray.rx*ray.length, ray.hitY + ray.ry*ray.length, 'orange');
        }
      });
    }

    function startAnimation() {
        canvas = document.getElementById('canvas');
        canvas.style.backgroundColor = "rgb(240,240,240)";
        const fullscreenBtn = document.getElementById('fullscreen-btn');
        ctx = canvas.getContext('2d');
        loadImages();

        tempstarterco2 = true;
        tempstarterheat = true;
        canvas.addEventListener("mousedown", startDrag);
        canvas.addEventListener("mousedown", startDrag);
        canvas.addEventListener("touchstart", startDrag, { passive: false });
        canvas.addEventListener("mousemove", drag);
        canvas.addEventListener("touchmove", drag, { passive: false });
        canvas.addEventListener("mouseup", stopDrag);
        canvas.addEventListener("touchend", stopDrag);

        canvas.addEventListener("mousemove", (event) => {
            const rect = canvas.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            //console.log(`Mausposition: X=${x}, Y=${y}`);
        });

        fullscreenBtn.addEventListener('click', () => {
            if (canvas.requestFullscreen) {
              canvas.requestFullscreen();
            } else if (canvas.webkitRequestFullscreen) {
              canvas.webkitRequestFullscreen();
            } else if (canvas.msRequestFullscreen) {
              canvas.msRequestFullscreen();
            }
          });

        canvas.addEventListener("click", function(event) {
            // Berechne die Position des Canvas relativ zum Dokument
            const rect = canvas.getBoundingClientRect();
            
            // Berechne die Mausposition relativ zum Canvas
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
      
            // Ausgabe der Koordinaten in der Konsole
            console.log({ x, y });
          });
        createRays();
        setInterval(createRays, 1000);
        draw();
    };

    function loadImages() {
        lampOff.img = new Image();
        lampOff.img.src = lampOff.src;

        lampOn.img = new Image();
        lampOn.img.src = lampOn.src;

        bullet.img = new Image();
        bullet.img.src = bullet.src;

        face.img = new Image();
        face.img.src = face.src;
    };

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren


        if (lampOn.isVisible) {
            ctx.drawImage(lampOn.img, lampOn.x, lampOn.y, lampOn.width, lampOn.height);
            }
        else{
            ctx.drawImage(lampOff.img, lampOff.x, lampOff.y, lampOff.width, lampOff.height);
        };
       
        if(bullet.isVisible){
        ctx.drawImage(bullet.img, bullet.x, bullet.y, bullet.width, bullet.height);
        drawTemperatureBullet();
        }
        else{
            
        };
        
        if(face.isVisible){
        ctx.drawImage(face.img, face.x, face.y, face.width, face.height);
        drawTemperatureBlackFace();
        drawTemperatureWhiteFace();
        };

        Timer();
        infoButtonBox();
        //drawContainer(); //Begrenzung für CO2 Atome
        updateDataBu();
        updateDataBF();
        updateDataWF();
        
        if(checkboxRays.isVisible && lampOn.isVisible && bullet.isVisible){
            updateRays();
            renderRays();
        };
        if(checkboxRays.isVisible && lampOn.isVisible && face.isVisible){
            updateRays();
            renderRays();
        };
        if(diagramm.isVisible){
             if(bullet.isVisible){
                drawgraphBullet();
             }
             if(face.isVisible){
                ctx.clearRect(diagramm.x, diagramm.y, diagramm.width, diagramm.height);
                drawGrid();
                drawAxes();
                drawGraphBlackFace()
                drawGraphWhiteFace()
             }
      };

        //console.log(`time =${time}, ta= ${ta}, tb= ${tb}, lastvalue ${lastValue}, t1= ${time-t1}, t2= ${time-t2}, co2=${co2}, heat= ${heat}, ta1=${ta1}`);
        requestAnimationFrame(draw);
    };

    function getMousePosition(event) {
        const rect = canvas.getBoundingClientRect();
        let mouseX, mouseY;
    
        if (event.type.startsWith("touch")) {
            const touch = event.touches[0] || event.changedTouches[0];
            mouseX = (touch.clientX - rect.left) * (canvas.width / rect.width);
            mouseY = (touch.clientY - rect.top) * (canvas.height / rect.height);
        } else {
            mouseX = (event.clientX - rect.left) * (canvas.width / rect.width);
            mouseY = (event.clientY - rect.top) * (canvas.height / rect.height);
        }
    
        return { mouseX, mouseY };
    }
    
    // Ziehen starten
function startDrag(event) {
  const { mouseX, mouseY } = getMousePosition(event);
  
  if (
      mouseX >= diagramm.x &&
      mouseX <= diagramm.x + diagramm.width &&
      mouseY >= diagramm.y &&
      mouseY <= diagramm.y + diagramm.height
  ) {
      isDraggingDiagramm = true;
      currentElement = 'diagramm'; // Speichert, dass das Diagramm gerade gezogen wird
      dragOffsetXDiagramm = mouseX - diagramm.x;
      dragOffsetYDiagramm = mouseY - diagramm.y;
  }
  checkCheckboxes(mouseX, mouseY);
  handleClick(event); // Falls ein Button gedrückt wurde
  event.preventDefault();
}

// Ziehen
function drag(event) {
  if (!isDraggingDiagramm) return; // Keine Elemente werden gezogen

  const { mouseX, mouseY } = getMousePosition(event);

  if (isDraggingDiagramm) {
      diagramm.x = mouseX - dragOffsetXDiagramm;
      diagramm.y = mouseY - dragOffsetYDiagramm;
  }

  event.preventDefault();
}

// Ziehen stoppen
function stopDrag(event) {
  isDraggingDiagramm = false;
  currentElement = null; // Zurücksetzen der aktuellen Zieh-Einstellung
  event.preventDefault();
}
    // Checkboxen prüfen
    function checkCheckboxes(mouseX, mouseY) {
        [checkboxLamp, checkboxbullet, checkboxDiagramm, checkboxface, checkboxRays, checkboxHelp].forEach(checkbox => {
            if (
                mouseX >= checkbox.x &&
                mouseX <= checkbox.x + checkbox.width &&
                mouseY >= checkbox.y &&
                mouseY <= checkbox.y + checkbox.height
            ) {
                checkbox.isChecked = !checkbox.isChecked;

                if (checkbox === checkboxLamp){
                    lampOn.isVisible = checkbox.isChecked;
                    heat=!heat;
                    t1=time;
                    tempstarterheat=false;
                    lastValueDrücker1 = lastValueBu;
                };
                  if (checkbox === checkboxbullet){
                    bullet.isVisible = checkbox.isChecked;
                    face.isVisible =! bullet.isVisible;
                    checkboxface.isChecked = false;
                    surfacesMode=false;
                    t2=time;
                    tempstarterco2=false;
                    dataBu.length = 0;
                    currentTempBu = 19;
                     ransitionStartTimeBu = 0;
                    transitionStartTempBu = 19;
                    lastEffectiveTargetBu = 19;
                    lastValueBu=19;
                    time=0;
                };
                if (checkbox === checkboxface){
                    face.isVisible = checkbox.isChecked;
                    bullet.isVisible =! face.isVisible;
                    checkboxbullet.isChecked = false;
                    surfacesMode=true;
                    lastValueBF=19.5;
                    dataBF.length = 0;
                    lastValueWF = 19;
                    dataWF.length = 0;
                    time=0;
                    currentTempBF = 19.5;
                    transitionStartTimeBF = 0;
                    transitionStartTempBF = 19.5;
                    lastEffectiveTargetBF = 19.5;
                    currentTempWF = 19;
                    transitionStartTimeWF = 0;
                    transitionStartTempWF = 19;
                    lastEffectiveTargetWF = 19;
                };
                if (checkbox === checkboxDiagramm) diagramm.isVisible = checkbox.isChecked;
                if (checkbox === checkboxRays) checkboxRays.isVisible = checkbox.isChecked;
            }
        });
    };

    // Button-Klicks für Stoppuhr erkennen
    function handleClick(event) {
        const { mouseX, mouseY } = getMousePosition(event);
    
        Object.entries(buttons).forEach(([key, button]) => {
            if (
                mouseX >= button.x &&
                mouseX <= button.x + button.width &&
                mouseY >= button.y &&
                mouseY <= button.y + button.height
            ) {
                if (key === "start") startStopwatch();
                if (key === "stop") stopStopwatch();
                if (key === "reset") resetStopwatch();
            }
        });
    }


     

    
    