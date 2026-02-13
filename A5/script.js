let canvas;
let ctx;
let tempstarterco2 = true;
let tempstarterheat = true;

let isDraggingDiagramm = false;
let isDraggingIRcameraDisplay = false;

let dragOffsetXDiagramm = 0;
let dragOffsetYDiagramm = 0;
let dragOffsetXIRcameraDisplay = 0;
let dragOffsetYIRcameraDisplay = 0;

let currentElement = null; // Um das gerade gezogene Element zu speichern

    let hilfe = {
      id: "hilfe",          
        x: 725,
        y: 180,
        width: 625,
        height: 400,
    };

    let hilfeclose ={
      id: "hilfeClose",          
      width: 25,
      height: 25,
      src: 'img/close.png'
    };

    let diagramm = {
        id: "diagramm",          
        x: 725,
        y: 180,
        width: 625,
        height: 400,
        layer: 2, // Ebene für überlappende Bilder
    };
    
    let diagrammClose = {
      id: "diagrammClose",          
      width: 25,
      height: 25,
      src: 'img/close.png'
    };

    let lampOff = {
        id: "lampOff",
        x: 20,
        y: 330,
        width: 290,
        height: 365,
        src: 'img/lampeOff.png',
        isVisible : true,
    };

    let lampOn = {
        id: "lampOn",
        x: 20,
        y: 330,
        width: 290,
        height: 365,
        src: 'img/lampeOn.png',
        isVisible : false,
    };

    let lampe = {
        id: "lampe",
        x: 20,
        y: 285,
        width: 290,
        height: 255,
        src: 'img/lampe.png',
        isVisible : false,
    };

    let pipe = {
        id: "pipe",
        x: 330,
        y: 155,
        width: 370,
        height: 383,
        src: 'img/pipe.png',
        isVisible : true,
    };

    let CO2glass = {
        id: "CO2glass",
        x: 579,
        y: 170,
        width: 466,
        height: 458,
        src: 'img/CO2glass.png',
        isVisible : false,
    };

    let IRcamera = {
        id: "IRcamera",
        x: 720,
        y: 270,
        width: 148,
        height: 283,
        src: 'img/IRcamera.png',
        isVisible : false,
    };

    let IRcameraDisplay = {
      id: "IRcameraDisplay",          
      x: 525,
      y: 180,
      width: 499,
      height: 400,
      src: 'img/cameraDisplay.png',
      layer: 1, // Ebene für überlappende Bilder
  };

  let IRcameraDisplayClose = {
      id: "IRcameraDisplayClose",          
      width: 25,
      height: 25,
      src: 'img/close.png'
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

    let bubbles = [];

    function drawBubbles() {
        for (let i = 0; i < bubbles.length; i++) {
            let bubble = bubbles[i];
            ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
            ctx.beginPath();
            ctx.arc(bubble.x, bubble.y, bubble.size, 0, Math.PI * 2);
            ctx.fill();
            bubble.y -= bubble.speed;
            if (bubble.y < 530) bubbles.splice(i, 1);
        }
    };

    function createBubble() {
        if (Math.random() < 0.2) {
            bubbles.push({
                x: 920 + Math.random() * 80,
                y: 600,
                size: Math.random() * 5 + 3,
                speed: Math.random() * 2 + 1
            });
        }
    };

    const particles = [];

    const pathPoints = [
        { x: 959.6363677978516, y: 513.4545516967773 },
        { x: 958.6363677978516, y: 456.45455169677734 },
        { x: 957.6363677978516, y: 411.45455169677734 },
        { x: 961.6363677978516, y: 369.45455169677734 },
        { x: 963.6363677978516, y: 331.45455169677734 },
        { x: 951.6363677978516, y: 278.45455169677734 },
        { x: 941.6363677978516, y: 236.45455169677734 },
        { x: 928.6363677978516, y: 215.45455169677734 },
        { x: 886.6363677978516, y: 188.45455169677734 },
        { x: 826.6363677978516, y: 178.45455169677734 },
        { x: 779.6363677978516, y: 181.45455169677734 },
        { x: 708.6363677978516, y: 187.45455169677734 },
        { x: 658.6363677978516, y: 200.45455169677734 },
        { x: 625.6363677978516, y: 216.45455169677734 },
        { x: 589.6363677978516, y: 244.45455169677734 },
        { x: 587.6363677978516, y: 311.45455169677734 }
        

      ];

    const container = {
        x: 381,
        y: 295,
        width: 250,
        height: 230,
      };

      function getPathPosition(t) {
        const segment = Math.floor(t * (pathPoints.length - 1));
        const start = pathPoints[segment];
        const end = pathPoints[segment + 1] || pathPoints[pathPoints.length - 1];
        const localT = (t * (pathPoints.length - 1)) % 1;
    
        const x = start.x + (end.x - start.x) * localT;
        const y = start.y + (end.y - start.y) * localT;
    
        return { x, y };
      }
    
      class Particle {
        constructor() {
          this.reset();
        }
    
        reset() {
          this.inContainer = false;
          this.t = 0;
          this.speed = Math.random() * 0.003 + 0.001;
          this.radius = 2; //Math.random() * 3 + 1.5
          this.opacity = Math.random() * 0.5 + 0.3;
    
          this.x = 0;
          this.y = 0;
    
          // Wenn im Behälter:
          this.vx = 0;
          this.vy = 0;
        }
    
        update() {
          if (!this.inContainer) {
            this.t += this.speed;
            if (this.t >= 1) {
              this.inContainer = true;
              this.x = container.x + container.width / 2;
              this.y = container.y + 5;
    
              // Zufällige Bewegung wie Gasatom
              const angle = Math.random() * 2 * Math.PI;
              const speed = Math.random() * 1.5 + 0.5;
              this.vx = Math.cos(angle) * speed;
              this.vy = Math.sin(angle) * speed;
            } else {
              const pos = getPathPosition(this.t);
              this.x = pos.x;
              this.y = pos.y;
            }
          } else {
            this.x += this.vx;
            this.y += this.vy;
    
            // Wände des Behälters
            if (this.x - this.radius < container.x) {
              this.x = container.x + this.radius;
              this.vx *= -1;
            }
            if (this.x + this.radius > container.x + container.width) {
              this.x = container.x + container.width - this.radius;
              this.vx *= -1;
            }
            if (this.y - this.radius < container.y) {
              this.y = container.y + this.radius;
              this.vy *= -1;
            }
            if (this.y + this.radius > container.y + container.height) {
              this.y = container.y + container.height - this.radius;
              this.vy *= -1;
            }
          }
        }
    
        draw() {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(204,0,0,${this.opacity})`;
          ctx.fill();
        }
      }

    function updateParticles() {
        if (!CO2glass.isVisible) {
          particles.length = 0; // löscht alle Partikel
          return;
        }
      
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.update();
        }
      }

    setInterval(() => {
        if (particles.length < 150) {
          particles.push(new Particle());
        }
      }, 100);

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
        width: 600,
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

// CO2
const checkboxCO2 = {
    x: buttonBox.x + 120,
    y: buttonBox.y + 15,
    width: 70,
    height: 70,
    isChecked: false,
};
// Diagramm
const checkboxDiagramm = {
    x: buttonBox.x + 215,
    y: buttonBox.y + 15,
    width: 80,
    height: 70,
    isChecked: false,
};

const checkboxIRcamera = {
  x: buttonBox.x + 320,
  y: buttonBox.y + 15,
  width: 70,
  height: 70,
  isChecked: false,
};

const checkboxRays = {
  x: buttonBox.x + 415,
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
  CO2Button: { 
        x: checkboxCO2.x, 
        y: checkboxCO2.y, 
        width: checkboxCO2.width, 
        height: checkboxCO2.height, 
        label: 'CO2', 
        checkbox: checkboxCO2,
        src: 'img/CO2Icon.png' 
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
  IRcameraButton: { 
      x: checkboxIRcamera.x, 
      y: checkboxIRcamera.y, 
      width: checkboxIRcamera.width, 
      height: checkboxIRcamera.height, 
      label: 'Kamera', 
      checkbox: checkboxIRcamera,
      src: 'img/cameraIcon.png'
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
  HelpButton: { 
      x: checkboxHelp.x, 
      y: checkboxHelp.y, 
      width: checkboxHelp.width, 
      height: checkboxHelp.height, 
      label: 'Hilfe', 
      checkbox: checkboxHelp,
      src: 'img/questionmark.png'
  },
};

function infoButtonBox() { 
    // Stelle sicher, dass buttonBox korrekt definiert ist
    

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
    
      const data = []; 
const maxDataPoints = 2000;
let time = 0;
const padding = 50;
const yMax = 60; // Skalierung der Y-Werte
let lastValue = 0; // Speichert den aktuellen Wert für die Anzeige

// Position für die Wertanzeige (beliebig anpassbar)
const textX = 480;
const textY = 200;

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

let currentTemp = 19;
let transitionStartTime = 0;
let transitionStartTemp = 19;
let lastEffectiveTarget = 19;

function sigmoid(t) {
    return 1 / (1 + Math.exp(-0.01 * t + 8));
}

function generateVesselTemperature(t) {
    // Zieltemperatur je nach Kombination
    let targetTemp;
    if (heat) {
        targetTemp = co2 ? 39 : 29;
    } else {
        targetTemp = 19;
    }

    // Nur wenn sich das Ziel geändert hat, neue Transition starten
    if (targetTemp !== lastEffectiveTarget) {
        transitionStartTime = t;
        transitionStartTemp = currentTemp;
        lastEffectiveTarget = targetTemp;
    }

    const delta = targetTemp - transitionStartTemp;
    const timeSinceTransition = t - transitionStartTime;
    const curveProgress = sigmoid(timeSinceTransition);

    currentTemp = transitionStartTemp + delta * curveProgress;

    return currentTemp;
}



function updateData() {
    lastValue = generateVesselTemperature(time);

    if (lastValue < 19) {
        lastValue = 19;
    }
    
    data.push({ x: time, y: lastValue });
    
    if (data.length > maxDataPoints) {
        data.shift(); // Entfernt alte Werte
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


function drawGraph() {
    ctx.clearRect(diagramm.x, diagramm.y, diagramm.width, diagramm.height);
    drawGrid();
    drawAxes();

    ctx.beginPath();
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;

    const visibleData = data.slice(-maxDataPoints);
    visibleData.forEach((point, index) => {
        const x = diagramm.x + padding + (index / maxDataPoints) * (diagramm.width - padding - 10);
        const y = diagramm.y + diagramm.height - padding - (point.y / 60) * (diagramm.height - padding * 2);

        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });

    ctx.stroke();
}
    function drawTemperature() {
          // Aktuellen Wert als Text anzeigen
          ctx.font = "30px Arial";
          ctx.fillStyle = "black";
          ctx.fillText(`${lastValue.toFixed(1)} °C`, textX, textY);
      }
 

// Zusätzliche Datenstruktur: Strahlen
const rays = [];
const rayCount = 50;
const raySpacing = container.height / (rayCount + 1);


// Jeder Strahl startet links vom Behälter und geht nach rechts
for (let i = 1; i <= rayCount; i++) {
  const y = container.y + i * raySpacing;
  rays.push({
    start: { x: container.x - 150, y },
    dir: { x: 1, y: 0 }, // Horizontal nach rechts
  });
}
// Definiere die Strahlenbreite
 // Hier die Breite einstellen
// Funktion zur Reflexion eines Strahls an einer Kugel
function reflectRay(ray, particle) {
  const dx = ray.dir.x;
  const dy = ray.dir.y;

  const cx = particle.x;
  const cy = particle.y;

  const px = ray.start.x;
  const py = ray.start.y;

  const dist = Math.hypot(cx - px, cy - py);
  if (dist > 100) return null; // zu weit weg

  const dxp = cx - px;
  const dyp = cy - py;
  const t = (dxp * dx + dyp * dy) / (dx * dx + dy * dy);

  const closestX = px + dx * t;
  const closestY = py + dy * t;

  const distToCenter = Math.hypot(closestX - cx, closestY - cy);
  if (distToCenter < particle.radius) {
    // Normale berechnen
    const nx = closestX - cx;
    const ny = closestY - cy;
    const len = Math.hypot(nx, ny);
    const normX = nx / len;
    const normY = ny / len;

    // Reflexionsrichtung
    const dot = dx * normX + dy * normY;
    const rx = dx - 2 * dot * normX;
    const ry = dy - 2 * dot * normY;

    return {
      hit: { x: closestX, y: closestY },
      dir: { x: rx, y: ry },
    };
  }

  return null;
}

// Zeichnet die Strahlen
function drawRays() {
  for (const ray of rays) {
    let primaryEnd = { x: ray.start.x + 1000, y: ray.start.y };
    let firstHit = null;
    let firstDir = ray.dir;
    let rayWidth = 1;

    // === 1. Reflexion: Strahl trifft Kugel ===
    for (const particle of particles) {
      if (particle.inContainer) {
        const result = reflectRayAccurately(ray, particle);
        if (result) {
          primaryEnd = result.hit;
          firstDir = result.dir;
          firstHit = result.hit;
          break;
        }
      }
    }

    ctx.lineWidth = rayWidth;
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(ray.start.x, ray.start.y);
    ctx.lineTo(primaryEnd.x, primaryEnd.y);
    ctx.stroke();

    if (!firstHit) continue;

    // === 2. Wand-Kollision ===
    const secondStart = firstHit;
    const secondEnd = intersectRayWithContainer(secondStart, firstDir, container);

    let wallNormal = null;
    let reflect = false;

    if (firstDir.y > 0 && secondEnd.y > container.y + container.height) {
      secondEnd.y = container.y + container.height;
      secondEnd.x = secondStart.x + firstDir.x * ((secondEnd.y - secondStart.y) / firstDir.y);
      wallNormal = { x: 0, y: -1 };
      reflect = true;
    } else if (firstDir.y < 0 && secondEnd.y < container.y) {
      secondEnd.y = container.y;
      secondEnd.x = secondStart.x + firstDir.x * ((secondEnd.y - secondStart.y) / firstDir.y);
      wallNormal = { x: 0, y: 1 };
      reflect = true;
    }

    // === Strahl bis Wand ===
    ctx.strokeStyle = 'yellow';
    ctx.beginPath();
    ctx.moveTo(secondStart.x, secondStart.y);
    ctx.lineTo(secondEnd.x, secondEnd.y);
    ctx.stroke();

    if (!wallNormal) {
      // === Seitlich austreten (halbtransparent weiter) ===
      const exitStart = secondEnd;
      const exitEnd = {
        x: exitStart.x + firstDir.x * 100,
        y: exitStart.y + firstDir.y * 100
      };

      ctx.strokeStyle = 'rgba(255, 255, 0, 0.5)';
      ctx.beginPath();
      ctx.moveTo(exitStart.x, exitStart.y);
      ctx.lineTo(exitEnd.x, exitEnd.y);
      ctx.stroke();
      continue;
    }

    // === 3. Reflexion nach Wand ===
    const thirdStart = secondEnd;
    const thirdDir = reflectVector(firstDir, wallNormal);

    // Schritt 1: Linie innerhalb Container (Fade-out)
    const fadeLength = 50;
    const fade1End = {
      x: thirdStart.x + thirdDir.x * fadeLength,
      y: thirdStart.y + thirdDir.y * fadeLength
    };

    const gradient1 = ctx.createLinearGradient(
      thirdStart.x, thirdStart.y,
      fade1End.x, fade1End.y
    );
    gradient1.addColorStop(0, 'rgba(255, 255, 0, 1)');
    gradient1.addColorStop(1, 'rgba(255, 255, 0, 0)');

    ctx.strokeStyle = gradient1;
    ctx.beginPath();
    ctx.moveTo(thirdStart.x, thirdStart.y);
    ctx.lineTo(fade1End.x, fade1End.y);
    ctx.stroke();

    // Schritt 2: Weiter außerhalb (halbtransparent)
    const fade2End = {
      x: fade1End.x + thirdDir.x * fadeLength,
      y: fade1End.y + thirdDir.y * fadeLength
    };

    const gradient2 = ctx.createLinearGradient(
      fade1End.x, fade1End.y,
      fade2End.x, fade2End.y
    );
    gradient2.addColorStop(0, 'rgba(255, 255, 0, 0.5)');
    gradient2.addColorStop(1, 'rgba(255, 255, 0, 0)');

    ctx.strokeStyle = gradient2;
    ctx.beginPath();
    ctx.moveTo(fade1End.x, fade1End.y);
    ctx.lineTo(fade2End.x, fade2End.y);
    ctx.stroke();
  }
}




function reflectRayAccurately(ray, particle) {
  const dx = ray.dir.x;
  const dy = ray.dir.y;

  const cx = particle.x;
  const cy = particle.y;
  const r = particle.radius;

  // Ray: P = ray.start + t * ray.dir
  // Sphere: (P - center)^2 = r^2
  const ox = ray.start.x - cx;
  const oy = ray.start.y - cy;

  const a = dx * dx + dy * dy;
  const b = 2 * (dx * ox + dy * oy);
  const c = ox * ox + oy * oy - r * r;

  const discriminant = b * b - 4 * a * c;
  if (discriminant < 0) return null; // Kein Schnittpunkt

  const t = (-b - Math.sqrt(discriminant)) / (2 * a);
  if (t < 0) return null; // Hinter dem Startpunkt

  // Trefferpunkt
  const hitX = ray.start.x + dx * t;
  const hitY = ray.start.y + dy * t;

  // Normale an der Oberfläche der Kugel am Auftreffpunkt
  const nx = (hitX - cx) / r;
  const ny = (hitY - cy) / r;

  // Reflexion
  const dot = dx * nx + dy * ny;
  const rx = dx - 2 * dot * nx;
  const ry = dy - 2 * dot * ny;

  return {
    hit: { x: hitX, y: hitY },
    dir: { x: rx, y: ry }
  };
}

function reflectVector(dir, normal) {
  const dot = dir.x * normal.x + dir.y * normal.y;
  return {
    x: dir.x - 2 * dot * normal.x,
    y: dir.y - 2 * dot * normal.y
  };
}

function drawContainer() {
  ctx.strokeStyle = 'white';
  ctx.lineWidth = 2;
  ctx.strokeRect(container.x, container.y, container.width, container.height);
}

function clipLineToContainer(start, end, container) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;

  let tMin = 0;
  let tMax = 1;

  function clip(p, q) {
    if (p === 0 && q < 0) return false;
    const r = q / p;
    if (p < 0) {
      if (r > tMax) return false;
      if (r > tMin) tMin = r;
    } else if (p > 0) {
      if (r < tMin) return false;
      if (r < tMax) tMax = r;
    }
    return true;
  }

  const xMin = container.x;
  const xMax = container.x + container.width;
  const yMin = container.y;
  const yMax = container.y + container.height;

  if (
    clip(-dx, start.x - xMin) &&
    clip(dx, xMax - start.x) &&
    clip(-dy, start.y - yMin) &&
    clip(dy, yMax - start.y)
  ) {
    return {
      x: start.x + dx * tMax,
      y: start.y + dy * tMax
    };
  } else {
    return start; // keine sichtbare Linie mehr
  }
}

function intersectRayWithContainer(start, dir, container) {
  const x1 = container.x;
  const x2 = container.x + container.width;
  const y1 = container.y;
  const y2 = container.y + container.height;

  let tMax = Infinity;

  if (dir.x !== 0) {
    const tx1 = (x1 - start.x) / dir.x;
    const tx2 = (x2 - start.x) / dir.x;
    const tx = dir.x > 0 ? tx2 : tx1;
    if (tx > 0 && tx < tMax) tMax = tx;
  }
  if (dir.y !== 0) {
    const ty1 = (y1 - start.y) / dir.y;
    const ty2 = (y2 - start.y) / dir.y;
    const ty = dir.y > 0 ? ty2 : ty1;
    if (ty > 0 && ty < tMax) tMax = ty;
  }

  return {
    x: start.x + dir.x * tMax,
    y: start.y + dir.y * tMax
  };
}

function getWallNormal(point, container) {
  const epsilon = 1;

  if (Math.abs(point.y - container.y) < epsilon) {
    return { x: 0, y: -1 }; // Oben
  }
  if (Math.abs(point.y - (container.y + container.height)) < epsilon) {
    return { x: 0, y: 1 }; // Unten
  }

  // Links oder rechts → keine Reflexion!
  return null;
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

        draw();
    };

    function loadImages() {
        lampOff.img = new Image();
        lampOff.img.src = lampOff.src;

        lampOn.img = new Image();
        lampOn.img.src = lampOn.src;

        lampe.img = new Image();
        lampe.img.src = lampe.src;

        pipe.img = new Image();
        pipe.img.src = pipe.src;

        CO2glass.img = new Image();
        CO2glass.img.src = CO2glass.src;

        IRcamera.img = new Image();
        IRcamera.img.src = IRcamera.src;

        IRcameraDisplay.img = new Image();
        IRcameraDisplay.img.src = IRcameraDisplay.src;

        IRcameraDisplayClose.img = new Image();
        IRcameraDisplayClose.img.src = IRcameraDisplayClose.src;

        IRmitCO2.img = new Image();
        IRmitCO2.img.src = IRmitCO2.src;

        IRohneCO2.img = new Image();
        IRohneCO2.img.src = IRohneCO2.src;

        diagrammClose.img = new Image();
        diagrammClose.img.src = diagrammClose.src;
        
    };

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren

        ctx.drawImage(lampe.img, lampe.x, lampe.y, lampe.width, lampe.height);

        if (lampOn.isVisible) {
            ctx.drawImage(lampOn.img, lampOn.x, lampOn.y, lampOn.width, lampOn.height);
            }
        else{
            ctx.drawImage(lampOff.img, lampOff.x, lampOff.y, lampOff.width, lampOff.height);
        };
       
        if(CO2glass.isVisible){
        particles.forEach(p => {
                p.update();
                p.draw();
              }); 
        ctx.drawImage(CO2glass.img, CO2glass.x, CO2glass.y, CO2glass.width, CO2glass.height);
        drawBubbles();
        createBubble();
        }
        else{
            
        };
        ctx.drawImage(lampe.img, lampe.x, lampe.y, lampe.width, lampe.height);
        ctx.drawImage(pipe.img, pipe.x, pipe.y, pipe.width, pipe.height);
        
        if(IRcamera.isVisible){
        ctx.drawImage(IRcamera.img, IRcamera.x, IRcamera.y, IRcamera.width, IRcamera.height);
        };

        Timer();
        infoButtonBox();
        //drawContainer(); //Begrenzung für CO2 Atome
        updateData();
        drawTemperature();
        if(checkboxRays.isVisible && lampOn.isVisible){
          drawRays();
        };

        if(diagramm.layer==2 && IRcameraDisplay.layer==1){
          if(diagramm.isVisible){
          drawGraph();
          ctx.drawImage(diagrammClose.img, diagramm.x + 580, diagramm.y +10, diagrammClose.width, diagrammClose.height);
          };

        if(IRcamera.isVisible){

          ctx.drawImage(IRcameraDisplay.img, IRcameraDisplay.x, IRcameraDisplay.y, IRcameraDisplay.width, IRcameraDisplay.height);
          ctx.drawImage(IRcameraDisplayClose.img, IRcameraDisplay.x + 440,  IRcameraDisplay.y +20, IRcameraDisplayClose.width, IRcameraDisplayClose.height);
  
        if(lampOn.isVisible){
          // Ziel ermitteln
          let targetAlpha = CO2glass.isVisible ? 0.8 : 0;
      
          // Alpha-Wert langsam angleichen
        if (fadeAlpha < targetAlpha) {
              fadeAlpha = Math.min(fadeAlpha + fadeSpeed, targetAlpha);
          } else if (fadeAlpha > targetAlpha) {
              fadeAlpha = Math.max(fadeAlpha - fadeSpeed, targetAlpha);
          }
      
          // IRohneCO2 zuerst, dann IRmitCO2 drüberblenden
          if (fadeAlpha < 0.8) {
              ctx.globalAlpha = 0.8 - fadeAlpha;
              ctx.drawImage(IRohneCO2.img, IRcameraDisplay.x, IRcameraDisplay.y, IRohneCO2.width, IRohneCO2.height);
          }
      
          if (fadeAlpha > 0) {
              ctx.globalAlpha = fadeAlpha;
              ctx.drawImage(IRmitCO2.img, IRcameraDisplay.x, IRcameraDisplay.y, IRmitCO2.width, IRmitCO2.height);
          }
      
          ctx.globalAlpha = 1;
      };
    };
  };
    if(diagramm.layer==1 && IRcameraDisplay.layer==2){
        if(IRcamera.isVisible){
          ctx.drawImage(IRcameraDisplay.img, IRcameraDisplay.x, IRcameraDisplay.y, IRcameraDisplay.width, IRcameraDisplay.height);
          ctx.drawImage(IRcameraDisplayClose.img, IRcameraDisplay.x + 440,  IRcameraDisplay.y +20, IRcameraDisplayClose.width, IRcameraDisplayClose.height);
  
        if(lampOn.isVisible){
          // Ziel ermitteln
          let targetAlpha = CO2glass.isVisible ? 0.8 : 0;
      
          // Alpha-Wert langsam angleichen
        if (fadeAlpha < targetAlpha) {
              fadeAlpha = Math.min(fadeAlpha + fadeSpeed, targetAlpha);
          } else if (fadeAlpha > targetAlpha) {
              fadeAlpha = Math.max(fadeAlpha - fadeSpeed, targetAlpha);
          }
      
          // IRohneCO2 zuerst, dann IRmitCO2 drüberblenden
          if (fadeAlpha < 0.8) {
              ctx.globalAlpha = 0.8 - fadeAlpha;
              ctx.drawImage(IRohneCO2.img, IRcameraDisplay.x, IRcameraDisplay.y, IRohneCO2.width, IRohneCO2.height);
          }
      
          if (fadeAlpha > 0) {
              ctx.globalAlpha = fadeAlpha;
              ctx.drawImage(IRmitCO2.img, IRcameraDisplay.x, IRcameraDisplay.y, IRmitCO2.width, IRmitCO2.height);
          }
      
          ctx.globalAlpha = 1;
      };
    };

      if(diagramm.isVisible){
          drawGraph();
          ctx.drawImage(diagrammClose.img, diagramm.x + 580, diagramm.y +10, diagrammClose.width, diagrammClose.height);
          };
    };

    

      updateParticles();
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
    if(IRcamera.isVisible && diagramm.isVisible)
    {
     if (
      mouseX >= IRcameraDisplay.x &&
      mouseX <= IRcameraDisplay.x + IRcameraDisplay.width &&
      mouseY >= IRcameraDisplay.y &&
      mouseY <= IRcameraDisplay.y + IRcameraDisplay.height && IRcameraDisplay.layer == 1) 
    {
       isDraggingIRcameraDisplay = true;
      currentElement = 'IRcameraDisplay'; // Speichert, dass der IRcameraDisplay gerade gezogen wird
      dragOffsetXIRcameraDisplay = mouseX - IRcameraDisplay.x;
      dragOffsetYIRcameraDisplay = mouseY - IRcameraDisplay.y;
    }

    if (
      mouseX >= diagramm.x &&
      mouseX <= diagramm.x + diagramm.width &&
      mouseY >= diagramm.y &&
      mouseY <= diagramm.y + diagramm.height && diagramm.layer == 1)
      {
        isDraggingDiagramm = true;
        currentElement = 'diagramm'; // Speichert, dass das Diagramm gerade gezogen wird
        dragOffsetXDiagramm = mouseX - diagramm.x;
        dragOffsetYDiagramm = mouseY - diagramm.y;
      }
  
   if (
      mouseX >= diagramm.x &&
      mouseX <= diagramm.x + diagramm.width &&
      mouseY >= diagramm.y &&
      mouseY <= diagramm.y + diagramm.height && diagramm.layer == 2)
      {
  if (
      mouseX >= IRcameraDisplay.x &&
      mouseX <= IRcameraDisplay.x + IRcameraDisplay.width &&
      mouseY >= IRcameraDisplay.y &&
      mouseY <= IRcameraDisplay.y + IRcameraDisplay.height && IRcameraDisplay.layer == 1 ) 
    {
      isDraggingIRcameraDisplay = true;
      currentElement = 'IRcameraDisplay'; // Speichert, dass der IRcameraDisplay gerade gezogen wird
      dragOffsetXIRcameraDisplay = mouseX - IRcameraDisplay.x;
      dragOffsetYIRcameraDisplay = mouseY - IRcameraDisplay.y;
    }
    else{
       isDraggingDiagramm = true;
      currentElement = 'diagramm'; // Speichert, dass das Diagramm gerade gezogen wird
      dragOffsetXDiagramm = mouseX - diagramm.x;
      dragOffsetYDiagramm = mouseY - diagramm.y;
      diagramm.layer = 1;
      IRcameraDisplay.layer= 2;
      }
      }

      if (
      mouseX >= IRcameraDisplay.x &&
      mouseX <= IRcameraDisplay.x + IRcameraDisplay.width &&
      mouseY >= IRcameraDisplay.y &&
      mouseY <= IRcameraDisplay.y + IRcameraDisplay.height && IRcameraDisplay.layer == 2 ) 
    {
      if (
      mouseX >= diagramm.x &&
      mouseX <= diagramm.x + diagramm.width &&
      mouseY >= diagramm.y &&
      mouseY <= diagramm.y + diagramm.height && diagramm.layer == 1  ) 
    {
      isDraggingDiagramm = true;
      currentElement = 'diagramm'; // Speichert, dass das Diagramm gerade gezogen wird
      dragOffsetXDiagramm = mouseX - diagramm.x;
      dragOffsetYDiagramm = mouseY - diagramm.y;
    }
    else{
      isDraggingIRcameraDisplay = true;
      currentElement = 'IRcameraDisplay'; // Speichert, dass der IRcameraDisplay gerade gezogen wird
      dragOffsetXIRcameraDisplay = mouseX - IRcameraDisplay.x;
      dragOffsetYIRcameraDisplay = mouseY - IRcameraDisplay.y;
      diagramm.layer = 2;
      IRcameraDisplay.layer= 1;
    }
  };
  }
  if(IRcamera.isVisible && diagramm.isVisible == false){
    if (
      mouseX >= IRcameraDisplay.x &&
      mouseX <= IRcameraDisplay.x + IRcameraDisplay.width &&
      mouseY >= IRcameraDisplay.y &&
      mouseY <= IRcameraDisplay.y + IRcameraDisplay.height) 
    {
       isDraggingIRcameraDisplay = true;
      currentElement = 'IRcameraDisplay'; // Speichert, dass der IRcameraDisplay gerade gezogen wird
      dragOffsetXIRcameraDisplay = mouseX - IRcameraDisplay.x;
      dragOffsetYIRcameraDisplay = mouseY - IRcameraDisplay.y;
    }
  }

  if(diagramm.isVisible && IRcamera.isVisible == false){

    if (
      mouseX >= diagramm.x &&
      mouseX <= diagramm.x + diagramm.width &&
      mouseY >= diagramm.y &&
      mouseY <= diagramm.y + diagramm.height)
      {
        isDraggingDiagramm = true;
        currentElement = 'diagramm'; // Speichert, dass das Diagramm gerade gezogen wird
        dragOffsetXDiagramm = mouseX - diagramm.x;
        dragOffsetYDiagramm = mouseY - diagramm.y;
      }
  };


  checkCheckboxes(mouseX, mouseY);
  checkClose(mouseX, mouseY);
  handleClick(event); // Falls ein Button gedrückt wurde
  event.preventDefault();
}

// Ziehen
function drag(event) {
  if (!isDraggingDiagramm && !isDraggingIRcameraDisplay) return; // Keine Elemente werden gezogen

  const { mouseX, mouseY } = getMousePosition(event);

  if (isDraggingDiagramm) {
      diagramm.x = mouseX - dragOffsetXDiagramm;
      diagramm.y = mouseY - dragOffsetYDiagramm;
  }

  if (isDraggingIRcameraDisplay) {
      IRcameraDisplay.x = mouseX - dragOffsetXIRcameraDisplay;
      IRcameraDisplay.y = mouseY - dragOffsetYIRcameraDisplay;
  }

  event.preventDefault();
}

// Ziehen stoppen
function stopDrag(event) {
  isDraggingDiagramm = false;
  isDraggingIRcameraDisplay = false;
  currentElement = null; // Zurücksetzen der aktuellen Zieh-Einstellung
  event.preventDefault();
}
  // Checkboxen prüfen
  function checkCheckboxes(mouseX, mouseY) {
        [checkboxLamp, checkboxCO2, checkboxDiagramm, checkboxIRcamera, checkboxRays, checkboxHelp].forEach(checkbox => {
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
                    lastValueDrücker1 = lastValue;
                }
                if (checkbox === checkboxCO2){
                    CO2glass.isVisible = checkbox.isChecked;
                    co2=!co2;
                    t2=time;
                    tempstarterco2=false;
                    lastValueDrücker2 = lastValue;
                }
                if (checkbox === checkboxIRcamera) IRcamera.isVisible = checkbox.isChecked;
                if (checkbox === checkboxDiagramm) diagramm.isVisible = checkbox.isChecked;
                if (checkbox === checkboxRays) checkboxRays.isVisible = checkbox.isChecked;
            }
        });
    };

//Schließen von Fenstern prüfen:

    function checkClose(mouseX, mouseY) {
    if (
                mouseX >= diagramm.x + 580 &&
                mouseX <= diagramm.x + 580 + diagrammClose.width &&
                mouseY >= diagramm.y +10  &&
                mouseY <= diagramm.y +10 + diagrammClose.height
            ) {
              diagramm.isVisible=!diagramm.isVisible;
              checkboxDiagramm.isChecked=!checkboxDiagramm.isChecked;
    };

    if (
                mouseX >= IRcameraDisplay.x + 440 &&
                mouseX <= IRcameraDisplay.x + 440 + IRcameraDisplayClose.width &&
                mouseY >= IRcameraDisplay.y +20  &&
                mouseY <= IRcameraDisplay.y +20 + IRcameraDisplay.height
            ) {
              IRcamera.isVisible=!IRcamera.isVisible;
              checkboxIRcamera.isChecked=!checkboxIRcamera.isChecked;
    }
  }

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