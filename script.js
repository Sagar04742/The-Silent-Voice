// ================= GLOBAL ELEMENTS =================
const videoElement = document.getElementById("video");
const canvasElement = document.getElementById("canvas");
const canvasCtx = canvasElement.getContext("2d");
const gestureEl = document.getElementById("gesture");
const sentenceEl = document.getElementById("sentence");
const confidenceBar = document.getElementById("confidenceBar");
const emergencyEl = document.getElementById("emergency");
const historyList = document.getElementById("historyList");
const clearBtn = document.getElementById("clearHistory");

let lastGesture = "";
let lastActionTime = 0;
const ACTION_COOLDOWN = 2500;
let sirenInterval = null;
let audioCtx = null;

// ================= GESTURE MAPPINGS =================
const sentences = {
    "Water": "Can I have some water?",
    "Hospital": "Please take me to the hospital.",
    "Pain": "I am experiencing pain.",
    "Yes": "Yes, I understand.",
    "Stop": "Please stop what you are doing.",
    "I'm Fine": "I am feeling okay, thank you.",
    "Need Help": "I need assistance right now.",
    "Emergency": "EMERGENCY! PLEASE HELP!"
};

// ================= MEDIAPIPE SETUP =================
const hands = new Hands({
  locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
});

hands.setOptions({ 
    maxNumHands: 1, 
    modelComplexity: 1, 
    minDetectionConfidence: 0.75,
    minTrackingConfidence: 0.75 
});

hands.onResults(onResults);

const camera = new Camera(videoElement, {
  onFrame: async () => { await hands.send({ image: videoElement }); },
  width: 640, height: 480
});
camera.start();

// ================= CORE RENDERING =================
function onResults(results) {
  canvasCtx.save();
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  
  // Mirror for natural interaction
  canvasCtx.translate(canvasElement.width, 0);
  canvasCtx.scale(-1, 1);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
    const lm = results.multiHandLandmarks[0];
    
    // Draw visual feedback
    drawConnectors(canvasCtx, lm, HAND_CONNECTIONS, {color: '#00FF00', lineWidth: 4});
    drawLandmarks(canvasCtx, lm, {color: '#FF0000', lineWidth: 1});
    
    const prediction = classifyGesture(lm);
    handleLogic(prediction);
  } else {
    gestureEl.textContent = "No Hand Detected";
    confidenceBar.style.width = "0%";
  }
  canvasCtx.restore();
}

// ================= GESTURE LOGIC (ULTRA MAX) =================
function classifyGesture(lm) {
  // Finger Tip vs Lower Joint Comparison
  const isIndex = lm[8].y < lm[6].y;
  const isMiddle = lm[12].y < lm[10].y;
  const isRing = lm[16].y < lm[14].y;
  const isPinky = lm[20].y < lm[18].y;
  const isThumb = lm[4].y < lm[3].y;

  const count = [isIndex, isMiddle, isRing, isPinky].filter(Boolean).length;

  let label = "Unknown";
  
  // Logical conditions based on finger positions
  if (count === 0 && !isThumb) label = "Emergency"; 
  else if (isIndex && isMiddle && isRing && !isPinky) label = "Need Help"; 
  else if (count === 4 && isThumb) label = "Yes"; 
  else if (count === 4 && !isThumb) label = "Stop"; 
  else if (count === 1 && isIndex) label = "Water"; 
  else if (count === 2 && isIndex && isMiddle) label = "Hospital"; 
  else if (isThumb && count === 0) label = "I'm Fine";

  return { label, conf: 98 };
}

// ================= SYSTEM ACTIONS =================
function handleLogic(res) {
  gestureEl.textContent = res.label;
  confidenceBar.style.width = res.conf + "%";

  if (res.label === "Emergency") { 
    triggerEmergency(); 
    return; 
  }

  const now = Date.now();
  if (res.label !== lastGesture && now - lastActionTime > ACTION_COOLDOWN) {
    const text = sentences[res.label] || "-";
    
    if (text !== "-") {
      sentenceEl.textContent = ""; // Reset
      typeEffect(text);
      speak(text);
      addToHistory(res.label, text);
      lastGesture = res.label;
      lastActionTime = now;
    }
  }
}

function typeEffect(text) {
  let i = 0;
  const timer = setInterval(() => {
    sentenceEl.textContent += text[i];
    i++;
    if (i >= text.length) clearInterval(timer);
  }, 30);
}

function speak(text) {
  window.speechSynthesis.cancel();
  const msg = new SpeechSynthesisUtterance(text);
  msg.lang = 'en-US';
  window.speechSynthesis.speak(msg);
}

function addToHistory(gesture, fullText) {
  const div = document.createElement("div");
  div.className = "history-item";
  div.innerHTML = `<strong>${new Date().toLocaleTimeString()}</strong>: ${gesture}<br><small>${fullText}</small>`;
  historyList.prepend(div);
}

// ================= THE CLEAR BUTTON FIX =================
// Using a direct event listener to ensure reliability
clearBtn.addEventListener('click', function() {
    console.log("History Cleared");
    historyList.innerHTML = "";
});

// ================= EMERGENCY CONTROLS =================
function triggerEmergency() {
  emergencyEl.classList.remove("hidden");
  if (!sirenInterval) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    sirenInterval = setInterval(() => {
      const o = audioCtx.createOscillator();
      o.type = "sawtooth";
      o.frequency.setValueAtTime(440, audioCtx.currentTime);
      o.connect(audioCtx.destination);
      o.start(); o.stop(audioCtx.currentTime + 0.1);
    }, 200);
  }
}

// This function is called by the button in the HTML
window.stopSiren = function() {
  emergencyEl.classList.add("hidden");
  if (sirenInterval) {
    clearInterval(sirenInterval);
    sirenInterval = null;
  }
  lastActionTime = Date.now();
};

// ================= THEME & UI =================
document.getElementById("themeToggle").onclick = () => {
  document.body.classList.toggle("dark");
  document.body.classList.toggle("light");
};

function resize() {
  canvasElement.width = canvasElement.clientWidth;
  canvasElement.height = canvasElement.clientHeight;
}
window.addEventListener('resize', resize);
resize();