let canvas;
let ctx;
  
 // Timer
 let timer={
    x: 1050,
    y: 25,
    weidht: 300,
    height: 100,
    startTime: 0,       // Startzeit in Millisekunden
    elapsedTime: 0,     // Vergangene Zeit
    isRunning: false,   // Status der Stoppuhr
    buttonBox:{
        x: 25,
        y: 25,
        weidht: 300,
        height: 100
    },
};
let intervalId; // ID für setInterval

// Button-Positionen und Größen
const timerButtons = {
    start: { x: timer.x + 25, y: 80, width: 70, height: 30, label: 'Start' },
    stop: { x: timer.x + 120, y: 80, width: 70, height: 30, label: 'Stop' },
    reset: { x: timer.x + 215, y: 80, width: 70, height: 30, label: 'Reset' },
  };


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
    Object.values(timerButtons).forEach(button => {
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
    if (!isRunning) {
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

const checkboxCandle = {
    x: buttonBox.x + 25,
    y: buttonBox.y + 15,
    width: 70,
    height: 70,
    isChecked: false,
};

// Blauer Ballon
const checkboxBlueBallon = {
    x: buttonBox.x + 120,
    y: buttonBox.y + 15,
    width: 70,
    height: 70,
    isChecked: false,
};
// Roter Ballon
const checkboxRedBallon = {
    x: buttonBox.x + 215,
    y: buttonBox.y + 15,
    width: 70,
    height: 70,
    isChecked: false,
};


  const infoButtons = {
    candleButton: { 
        x: checkboxCandle.x, 
        y: checkboxCandle.y, 
        width: checkboxCandle.width, 
        height: checkboxCandle.height, 
        label: 'Kerze', 
        checkbox: checkboxCandle,
        src: 'img/candleIcon.png',
    },
    blueBallonButton: { 
        x: checkboxBlueBallon.x, 
        y: checkboxBlueBallon.y, 
        width: checkboxBlueBallon.width, 
        height: checkboxBlueBallon.height, 
        label: 'Wasser', 
        checkbox: checkboxBlueBallon,
        src: 'img/ballon_blue.png' 
    },
    redballonButton: { 
        x: checkboxRedBallon.x, 
        y: checkboxRedBallon.y, 
        width: checkboxRedBallon.width, 
        height: checkboxRedBallon.height, 
        label: 'Luft', 
        checkbox: checkboxRedBallon,
        src: 'img/ballon_red.png'
    },
};

function infoButtonBox() { 
    // Stelle sicher, dass buttonBox korrekt definiert ist
    const boxPadding = 10; // Falls nötig, etwas Abstand
    buttonBox.width = 310; // Stelle sicher, dass die Breite korrekt ist
    buttonBox.height = 100; // Stelle sicher, dass die Höhe korrekt ist

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
        ctx.drawImage(img, button.x + (button.width / 2) - 15, button.y + 10, 30, 30);

        // Button-Text
        ctx.fillStyle = '#fff';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(button.label, button.x + button.width / 2, button.y + 60);
    });
}





function startAnimation() {
    canvas = document.getElementById('canvas');
    ctx = canvas.getContext('2d');
    loadImages();
    
    //canvas.addEventListener("mousedown", startDrag);
    //canvas.addEventListener("mousedown", startDrag);
    //canvas.addEventListener("touchstart", startDrag, { passive: false });
    //canvas.addEventListener("mousemove", drag);
    //canvas.addEventListener("touchmove", drag, { passive: false });
    //canvas.addEventListener("mouseup", stopDrag);
    //canvas.addEventListener("touchend", stopDrag);
    
    draw();
};


function loadImages() {

};

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren
 
    Timer();
    infoButtonBox();

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



// Button-Klicks für Stoppuhr erkennen
function handleClick(event) {
  const { mouseX, mouseY } = getMousePosition(event);

  Object.entries(timer.buttons).forEach(([key, button]) => {
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
