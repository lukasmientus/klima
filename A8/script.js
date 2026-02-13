let canvas;
    let ctx;
    let isDragging = false;     // Status, ob die Maus gedrückt ist
    let dragOffsetX = 0;        // Offset zwischen Maus und Kerzenposition (X)
    let dragOffsetY = 0;        // Offset zwischen Maus und Kerzenposition (Y)

    let candle = {
        id: "candle",          
        x: 20,
        y: 550,
        width: 120,
        height: 76,
        src: 'img/candle.png'
    };

    let blueballon = {
        id: "blueballon",          
        x: 270,
        y: 50,
        width: 350,
        height: 450,
        src: 'img/ballon_blue.png',
        temperature: 20,  // Anfangstemperatur
        maxTemperature: 100, // Maximale Temperatur
        isPopped: false
    };

    let redballon = {
        id: "redballon",          
        x: 750,
        y: 50,
        width: 350,
        height: 450,
        src: 'img/ballon_red.png',
        temperature: 20,  // Anfangstemperatur
        maxTemperature: 100, // Maximale Temperatur
        isPopped: false
    };
       

    let particles = []; // Array, um die Rußpartikel zu speichern

    // Partikel für Explosion
    let particlesRedBallonExplision = [];
    let particlesBlueBallonExplision = [];

    let collisionBlueBallon = false;
    let collisionRedBallon = false;

    // Kerzenflamme
    let flame = {
        x: candle.x + 62,
        y: candle.y + 15,
        height: 50,         // Höhe der Flamme
        width: 20,          // Breite der Flamme
        flicker: 5,         // Flicker-Effekt
    };

    let flamearea ={
        x: candle.x+62,
        y: candle.y,
        width: flame.width, 
        height: flame.height + 20,
    };

    const roomTemperatur = 20;

    // Timer
    let timer={
        x: 1050,
        y: 25,
        weidht: 300,
        height: 100
    };

    let startTime = 0; // Startzeit in Millisekunden
    let elapsedTime = 0; // Vergangene Zeit
    let intervalId; // ID für setInterval
    let isRunning = false; // Status der Stoppuhr

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
        weidht: 300,
        height: 100
    };

    // Checkboxen
    // Kerze 
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
        const milliseconds = Math.floor((elapsedTime % 1000) / 10);
        const seconds = Math.floor((elapsedTime / 1000) % 60);
        const minutes = Math.floor(elapsedTime / 60000);
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
        if (!isRunning) {
          isRunning = true;
          startTime = Date.now() - elapsedTime; // Berücksichtige bereits vergangene Zeit
          intervalId = setInterval(() => {
            elapsedTime = Date.now() - startTime;
            Timer();
          }, 10);
        }
      }
  
    // Stoppe die Stoppuhr
    function stopStopwatch() {
        if (isRunning) {
          isRunning = false;
          clearInterval(intervalId);
        }
      }
  
    // Setze die Stoppuhr zurück
    function resetStopwatch() {
        isRunning = false;
        clearInterval(intervalId);
        elapsedTime = 0;
        Timer();
      }
    
    function createParticle() {

        if(collisionBlueBallon || collisionRedBallon)
        {
        // Erzeuge einen neuen Rußpartikel
        particles.push({
            x: candle.x + 62 + Math.random() * 5, // Startpunkt nahe der Flamme
            y: candle.y - 15,
            size: Math.random() * 5 + 2, // Partikelgröße
            opacity: Math.random() * 0.5 + 0.5, // Anfangs-Deckkraft
            speedY: Math.random() * -2 - 1, // Aufwärtsbewegung
            speedX: Math.random() * 2 - 1, // Seitliche Bewegung
            shrinkRate: Math.random() * 0.05 + 0.01, // Schrumpfgeschwindigkeit
        
        });
        };
    };

    function drawRectangletTest(x, y, width, height) {
        ctx.fillStyle = 'blue'; // Farbe des Rechtecks
        ctx.fillRect(x, y, width, height);
    };
    function updateParticles() {
        particles.forEach((particle, index) => {
            // Bewege die Partikel
            particle.y += particle.speedY;
            particle.x += particle.speedX;
            particle.size -= particle.shrinkRate;
            particle.opacity -= 0.01;

            // Entferne Partikel, wenn sie zu klein oder unsichtbar sind
            if (particle.size <= 0 || particle.opacity <= 0) {
                particles.splice(index, 1);
            }
        });
    }

    function drawParticles() {
        particles.forEach((particle) => {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${particle.opacity})`;
            ctx.fill();
        });
    }

    function drawCandleFlame() {

        // Flicker-Animation
        flame.flicker = Math.sin(Date.now() / 100) * 5; // Flackern der Flamme
        const currentHeight = flame.height + flame.flicker; // Variierende Höhe
        const currentWidth = flame.width + Math.random() * 5 - 2.5; // Variierende Breite

        // Radialer Farbverlauf für die Flamme
        const gradient = ctx.createRadialGradient(flame.x, flame.y - currentHeight / 2, 5, flame.x, flame.y, currentHeight);
        gradient.addColorStop(0, 'rgba(255, 255, 0, 1)');  // Gelber Kern
        gradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.8)'); // Orange Mitte
        gradient.addColorStop(1, 'rgba(255, 69, 0, 0)');    // Roter Rand (transparent)

        // Hintergrund löschen
        //ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Flamme zeichnen
        ctx.beginPath();
        ctx.ellipse(flame.x, flame.y - currentHeight / 2, currentWidth / 2, currentHeight / 2, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
    };

function checkForCollisionBlueBallon() {
    // Ellipsen-Parameter berechnen
    const cx = blueballon.x + blueballon.width / 2; // Mittelpunkt X
    const cy = blueballon.y + blueballon.height / 2; // Mittelpunkt Y
    const a = blueballon.width / 2; // Horizontale Halbachse
    const b = blueballon.height / 2; // Vertikale Halbachse

    // Flammenbereich als Rechteck
    const flameLeft = flamearea.x;
    const flameTop = flamearea.y - flamearea.height;
    const flameRight = flamearea.x + flamearea.width;
    const flameBottom = flamearea.y - 50;

    // Überprüfen, ob eine Ecke der Flamme in der Ellipse liegt
    function isPointInEllipse(x, y) {
        return (
            Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2) <= 1
        );
    }

    if (
        (isPointInEllipse(flameLeft, flameTop) ||
        isPointInEllipse(flameRight, flameTop) ||
        isPointInEllipse(flameLeft, flameBottom) ||
        isPointInEllipse(flameRight, flameBottom)) && blueballon.isVisible && !blueballon.isPopped
    ) {
        collisionBlueBallon = true;
        startStopwatch();
    } else {
        collisionBlueBallon = false;
        
    };
};

function checkForCollisionRedBallon() {
    // Ellipsen-Parameter berechnen
    const cx = redballon.x + redballon.width / 2; // Mittelpunkt X
    const cy = redballon.y + redballon.height / 2; // Mittelpunkt Y
    const a = redballon.width / 2; // Horizontale Halbachse
    const b = redballon.height / 2; // Vertikale Halbachse

    // Flammenbereich als Rechteck
    const flameLeft = flamearea.x;
    const flameTop = flamearea.y - flamearea.height;
    const flameRight = flamearea.x + flamearea.width;
    const flameBottom = flamearea.y - 50;

    // Überprüfen, ob eine Ecke der Flamme in der Ellipse liegt
    function isPointInEllipse(x, y) {
        return (
            Math.pow((x - cx) / a, 2) + Math.pow((y - cy) / b, 2) <= 1
        );
    }

    if (
        (isPointInEllipse(flameLeft, flameTop) ||
        isPointInEllipse(flameRight, flameTop) ||
        isPointInEllipse(flameLeft, flameBottom) ||
        isPointInEllipse(flameRight, flameBottom)) && redballon.isVisible && !redballon.isPopped
    ) {
        collisionRedBallon = true;
        startStopwatch();
    } else {
        collisionRedBallon = false;
    }
};

    function resetPloppRedBallon(){
        if(redballon.isPopped){
            checkboxRedBallon.isChecked=false
        }
    };

    function resetPloppBlueBallon(){
        if(blueballon.isPopped){
            checkboxBlueBallon.isChecked=false
        }
    };
    
    // Thermometer zeichnen
    function drawThermometer(ctx, x, y, width, height, temperature = 0, maxTemperature = 100) {
        // Außenrahmen des Thermometers
        ctx.fillStyle = 'black';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height - width / 2, width / 2, 0, Math.PI * 2); // Unterer runder Bereich
        ctx.rect(x, y, width, height - width / 2); // Rechteckiger Bereich
        ctx.fill();
    
        // Innerer Bereich für die Flüssigkeit
        const innerWidth = width * 0.5;
        const innerX = x + (width - innerWidth) / 2;
        const innerY = y + 10; // Abstand oben
        const innerHeight = height - width - 10; // Höhe für die Flüssigkeit
        ctx.fillStyle = 'white';
        ctx.fillRect(innerX, innerY, innerWidth, innerHeight);
    
        // Temperaturanzeige (Flüssigkeitsstand)
        const tempHeight = ((temperature) / (maxTemperature)) * innerHeight;
        const tempY = innerY + innerHeight - tempHeight;
        ctx.fillStyle = 'red';
        ctx.fillRect(innerX, tempY, innerWidth, tempHeight);
    
        // Skalenlinien und Beschriftung
        ctx.strokeStyle = 'black';
        ctx.lineWidth = 2;
        ctx.font = '14px Arial';
        ctx.fillStyle = 'black';
        const scaleCount = 5; // Anzahl der Skalenstriche
        const minTemperature = 0; // Mindesttemperatur
    
        for (let i = 0; i <= scaleCount; i++) {
            const scaleY = innerY + (innerHeight / scaleCount) * i;
            const scaleValue = maxTemperature - ((maxTemperature - minTemperature) / scaleCount) * i;
    
            // Skalenstriche
            ctx.beginPath();
            ctx.moveTo(x + width + 5, scaleY); // Skala rechts neben dem Thermometer
            ctx.lineTo(x + width + 20, scaleY);
            ctx.stroke();
    
            // Beschriftung
            ctx.fillText(scaleValue.toFixed(0), x + width + 25, scaleY + 5); // Text rechts von den Skalenstrichen
        }
    
        // Optional: Lichtreflexion
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.arc(x + width / 2, y + height - width / 2, width / 2 * 0.8, Math.PI * 0.2, Math.PI * 0.8);
        ctx.fill();
    };
    
    function thermometerBlueBallon(){
        if(collisionBlueBallon && candle.isVisible)
        {
            if (blueballon.temperature < blueballon.maxTemperature)
                {
                    blueballon.temperature += 0.05;
                }
        }
        else
        {
            if (roomTemperatur < blueballon.temperature)
                {
                    blueballon.temperature -= 0.05;
                }
        }
            
    };

    function thermometerRedBallon(){
        if(collisionRedBallon && candle.isVisible)
        {
            if (redballon.temperature < redballon.maxTemperature)
                {
                    redballon.temperature += 0.5;
                }
        }
        else
        {
            if (roomTemperatur < redballon.temperature)
                {
                    redballon.temperature -= 0.5;
                }
        }
            
    };
    
   
    // Funktion für Partikel-Explosion
    function drawParticlesRedBallonExplision() {
    particlesRedBallonExplision.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.01; // Transparenz der Partikel
        if (particle.alpha <= 0) particlesRedBallonExplision.splice(index, 1); // Entferne Partikel, wenn unsichtbar

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 0, 0, ${particle.alpha})`;
        ctx.fill();
        ctx.closePath();
    });
};

    function animateRedBalloon() {
    if (!redballon.isPopped) {
        // Lasse den Ballon wachsen
        if (redballon.temperature >= 62.5) {
            redballon.isPopped = true;
            createParticlesRedBallonExplision(); // Erzeuge Partikel für Explosion
        }
    }

    // Zeichne den Ballon oder die Partikel
    drawParticlesRedBallonExplision();

    // Wiederhole die Animation, solange noch Partikel sichtbar sind
    if (redballon.isPopped && particlesRedBallonExplision.length === 0) return; // Stoppe die Animation, wenn alle Partikel verschwunden sind
    
};

function drawParticlesBlueBallonExplision() {
    particlesBlueBallonExplision.forEach((particle, index) => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.alpha -= 0.01; // Transparenz der Partikel
        if (particle.alpha <= 0) particlesBlueBallonExplision.splice(index, 1); // Entferne Partikel, wenn unsichtbar

        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(24,116,205, ${particle.alpha})`;
        ctx.fill();
        ctx.closePath();
    });
};

    function animateBlueBalloon() {
    if (!blueballon.isPopped) {
        // Lasse den Ballon wachsen
        if (blueballon.temperature >= 80.25) {
            blueballon.isPopped = true;
            createParticlesBlueBallonExplision(); // Erzeuge Partikel für Explosion
        }
    }

    // Zeichne den Ballon oder die Partikel
    drawParticlesBlueBallonExplision();

    // Wiederhole die Animation, solange noch Partikel sichtbar sind
    if (blueballon.isPopped && particlesBlueBallonExplision.length === 0) return; // Stoppe die Animation, wenn alle Partikel verschwunden sind
    
};

    // Erzeuge Partikel für den platzenden Ballon
function createParticlesRedBallonExplision() {
    for (let i = 0; i < 50; i++) {
        particlesRedBallonExplision.push({
            x: redballon.x + redballon.width / 2,
            y: redballon.y + redballon.height / 3,
            radius: Math.random() * 10 + 5, // Partikelgröße
            vx: (Math.random() - 0.5) * 8, // Geschwindigkeit x
            vy: (Math.random() - 0.5) * 8, // Geschwindigkeit y
            alpha: 1, // Anfangs-Transparenz
        });
    }
};

      // Erzeuge Partikel für den platzenden Ballon
function createParticlesBlueBallonExplision() {
    for (let i = 0; i < 50; i++) {
        particlesBlueBallonExplision.push({
            x: blueballon.x + blueballon.width / 2,
            y: blueballon.y + blueballon.height / 3,
            radius: Math.random() * 10 + 5, // Partikelgröße
            vx: (Math.random() - 0.5) * 8, // Geschwindigkeit x
            vy: (Math.random() - 0.5) * 8, // Geschwindigkeit y
            alpha: 1, // Anfangs-Transparenz
        });
    }
};


    function startAnimation() {
        canvas = document.getElementById('canvas');
        canvas.style.backgroundColor = "rgb(240,240,240)";
        const fullscreenBtn = document.getElementById('fullscreen-btn')
        ctx = canvas.getContext('2d');
        loadImages();

        setInterval(checkForCollisionRedBallon, 100 / 25);
        setInterval(checkForCollisionBlueBallon, 100 / 25);
        setInterval(thermometerBlueBallon, 1000 / 25);
        setInterval(thermometerRedBallon, 1000 / 25);


        canvas.addEventListener("mousedown", startDrag);
        canvas.addEventListener("mousedown", startDrag);
        canvas.addEventListener("touchstart", startDrag, { passive: false });
        canvas.addEventListener("mousemove", drag);
        canvas.addEventListener("touchmove", drag, { passive: false });
        canvas.addEventListener("mouseup", stopDrag);
        canvas.addEventListener("touchend", stopDrag);
        fullscreenBtn.addEventListener('click', () => {
            if (canvas.requestFullscreen) {
              canvas.requestFullscreen();
            } else if (canvas.webkitRequestFullscreen) {
              canvas.webkitRequestFullscreen();
            } else if (canvas.msRequestFullscreen) {
              canvas.msRequestFullscreen();
            }
          });
        
        draw();
    };

    function loadImages() {
        candle.img = new Image();
        candle.img.src = candle.src;
        
        blueballon.img = new Image();
        blueballon.img.src = blueballon.src;
        
        redballon.img = new Image();
        redballon.img.src = redballon.src;
    };

    function draw() {
        ctx.clearRect(0, 0, canvas.width, canvas.height); // Canvas leeren
        if (blueballon.isVisible && !blueballon.isPopped) {
        ctx.drawImage(blueballon.img, blueballon.x, blueballon.y, blueballon.width, blueballon.height);
        drawThermometer(ctx, blueballon.x + blueballon.width/2, blueballon.y + blueballon.height/3, 10, 200, blueballon.temperature, 100);
        };
        if (redballon.isVisible && !redballon.isPopped) {
        ctx.drawImage(redballon.img, redballon.x, redballon.y, redballon.width, redballon.height);
        drawThermometer(ctx, redballon.x + redballon.width/2, redballon.y + redballon.height/3, 10, 200, redballon.temperature, 100);
        };
        resetPloppRedBallon();
        resetPloppBlueBallon();

        if (candle.isVisible) {
            ctx.drawImage(candle.img, candle.x, candle.y, candle.width, candle.height);
            flame.x = candle.x + 62;
            flame.y = candle.y + 12;
            flamearea.x = candle.x + 52;
            flamearea.y = candle.y - 50;
            drawCandleFlame();
            drawParticles();
        };

        //drawRectangletTest(flamearea.x, flamearea.y, flamearea.width, flamearea.height);
           
        
        
        updateParticles();
        animateRedBalloon();
        animateBlueBalloon();

        // Erzeuge regelmäßig neue Partikel
        if (Math.random() < 0.5) {
            createParticle();
        };
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
    
    // Ziehen starten
    function startDrag(event) {
        const { mouseX, mouseY } = getMousePosition(event);
    
        if (
            mouseX >= candle.x &&
            mouseX <= candle.x + candle.width &&
            mouseY >= candle.y &&
            mouseY <= candle.y + candle.height
        ) {
            isDragging = true;
            dragOffsetX = mouseX - candle.x;
            dragOffsetY = mouseY - candle.y;
        }
    
        checkCheckboxes(mouseX, mouseY);
        handleClick(event); // Falls ein Button gedrückt wurde
        event.preventDefault();
    }
    
    // Ziehen
    function drag(event) {
        if (!isDragging) return;
        const { mouseX, mouseY } = getMousePosition(event);
        candle.x = mouseX - dragOffsetX;
        candle.y = mouseY - dragOffsetY;
        event.preventDefault();
    }
    
    // Ziehen stoppen
    function stopDrag(event) {
        isDragging = false;
        event.preventDefault();
    }
    
    // Checkboxen prüfen
    function checkCheckboxes(mouseX, mouseY) {
        [checkboxCandle, checkboxBlueBallon, checkboxRedBallon].forEach(checkbox => {
            if (
                mouseX >= checkbox.x &&
                mouseX <= checkbox.x + checkbox.width &&
                mouseY >= checkbox.y &&
                mouseY <= checkbox.y + checkbox.height
            ) {
                checkbox.isChecked = !checkbox.isChecked;
                if (checkbox === checkboxCandle) candle.isVisible = checkbox.isChecked;
                if (checkbox === checkboxBlueBallon)
                    {
                        blueballon.isVisible = checkbox.isChecked;
                        blueballon.isPopped = false;
                    };

                if (checkbox === checkboxRedBallon) 
                    {
                        redballon.isVisible = checkbox.isChecked;
                        redballon.isPopped = false;
                    };
            }
        });
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
    
    