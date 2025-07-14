// State variables
let currentScreen = 'start-screen';
let userState = {
    challenge: null,
    journal: '',
    resource: null,
    log: []
};

// DOM Elements
const screens = document.querySelectorAll('.screen');
const startBtn = document.getElementById('start-btn');
const challengeSelection = document.getElementById('challenge-selection');
const challengeFocus = document.getElementById('challenge-focus');
const challengeVisualizer = document.getElementById('challenge-visualizer');
const journalEntry = document.getElementById('journal-entry');
const journalSubmitBtn = document.getElementById('journal-submit-btn');
const resourceSelection = document.getElementById('resource-selection');
const confrontationVisualizerContainer = document.getElementById('confrontation-visualizer-container');
const confrontationVisualizer = document.getElementById('confrontation-visualizer');
const confrontationText = document.getElementById('confrontation-text');
const sigilContinueBtn = document.getElementById('sigil-continue-btn');
const finishBtn = document.getElementById('finish-btn');
const restartBtn = document.getElementById('restart-btn');
const logBook = document.getElementById('log-book');

// Audio Context for sound effects
const audioContext = new (window.AudioContext || window.webkitAudioContext)();
let audioBuffers = {};

async function loadSound(name, url) {
    try {
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        audioBuffers[name] = audioBuffer;
    } catch(e) {
        console.error(`Failed to load sound ${name}:`, e);
    }
}

function playSound(name) {
    if (audioBuffers[name] && audioContext.state === 'running') {
        const source = audioContext.createBufferSource();
        source.buffer = audioBuffers[name];
        source.connect(audioContext.destination);
        source.start(0);
    }
}

// --- App Logic ---

function switchScreen(screenId) {
    currentScreen = screenId;
    screens.forEach(screen => {
        screen.classList.toggle('active', screen.id === screenId);
    });
    // Resume AudioContext on user interaction
    if (audioContext.state === 'suspended') {
        audioContext.resume();
    }
}

function resetApp() {
    userState.challenge = null;
    userState.journal = '';
    userState.resource = null;
    journalEntry.value = '';
    
    // Reset buttons
    document.querySelectorAll('.btn.selected').forEach(b => b.classList.remove('selected'));
    
    // Clear dynamic content
    challengeVisualizer.innerHTML = '';
    challengeFocus.style.display = 'none';
    confrontationVisualizerContainer.style.display = 'none';
    
    // Show challenge selection buttons again
    challengeSelection.style.display = 'flex';

    switchScreen('start-screen');
}


function updateLogbook() {
    logBook.innerHTML = '<h3>Your Journal</h3>'; // Clear previous entries
    userState.log.forEach(entry => {
        const div = document.createElement('div');
        div.classList.add('log-entry');
        div.innerHTML = `
            <p><strong>Date:</strong> ${entry.date}</p>
            <p><strong>Challenge:</strong> ${entry.challenge}</p>
            <p><strong>Resource:</strong> ${entry.resource}</p>
            <p><strong>Reflection:</strong> <em>${entry.journal}</em></p>
        `;
        logBook.appendChild(div);
    });
}


// --- Event Listeners ---

startBtn.addEventListener('click', () => {
    playSound('transition');
    switchScreen('challenge-screen');
});

challengeSelection.addEventListener('click', (e) => {
    if (e.target.classList.contains('challenge-btn')) {
        const selectedBtn = e.target;
        userState.challenge = selectedBtn.dataset.challenge;
        
        // Update UI
        document.querySelectorAll('.challenge-btn').forEach(btn => btn.classList.remove('selected'));
        selectedBtn.classList.add('selected');
        challengeSelection.style.display = 'none'; // Hide choices
        challengeFocus.style.display = 'block'; // Show focus area
        
        challengeVisualizer.innerHTML = `<img src="${userState.challenge.toLowerCase()}-symbol.png" class="challenge-symbol" alt="${userState.challenge}">`;
        playSound('meditation-guide');
    }
});

journalSubmitBtn.addEventListener('click', () => {
    userState.journal = journalEntry.value;
    if (!userState.journal) {
        alert('Please write a few words in the journal to continue.');
        return;
    }
    playSound('transition');
    switchScreen('strategy-screen');
});

resourceSelection.addEventListener('click', (e) => {
    const selectedBtn = e.target.closest('.resource-btn');
    if (selectedBtn) {
        userState.resource = selectedBtn.dataset.resource;
        
        // Update UI
        resourceSelection.style.display = 'none';
        confrontationVisualizerContainer.style.display = 'block';
        
        // Setup confrontation animation
        confrontationVisualizer.innerHTML = `
            <img src="${userState.challenge.toLowerCase()}-symbol.png" class="challenge-symbol" id="anim-challenge" alt="${userState.challenge}">
            <img src="${userState.resource.toLowerCase()}-resource.png" class="resource-symbol" id="anim-resource" alt="${userState.resource}">
        `;
        
        const challengeImg = document.getElementById('anim-challenge');
        const resourceImg = document.getElementById('anim-resource');

        confrontationText.textContent = `You chose the ${userState.resource}. Watch as it overcomes the ${userState.challenge}.`;
        
        // Animation sequence
        setTimeout(() => {
            playSound('resource-activate');
            resourceImg.style.opacity = '1';
            resourceImg.style.transform = 'scale(1.2)';
        }, 500);
        
        setTimeout(() => {
            challengeImg.style.opacity = '0';
            challengeImg.style.transform = 'scale(0.5)';
            resourceImg.style.transform = 'scale(1)';
        }, 2000);
        
        setTimeout(() => {
            playSound('victory');
            switchScreen('sigil-screen');
        }, 3500);
    }
});

sigilContinueBtn.addEventListener('click', () => {
    playSound('transition');
    switchScreen('response-screen');
});

finishBtn.addEventListener('click', () => {
    // Save to log
    const logEntry = {
        date: new Date().toLocaleDateString(),
        challenge: userState.challenge,
        resource: userState.resource,
        journal: userState.journal
    };
    userState.log.push(logEntry);
    updateLogbook();
    
    playSound('transition');
    switchScreen('log-screen');
});

restartBtn.addEventListener('click', () => {
    playSound('transition');
    // Clear state but keep the log
    resourceSelection.style.display = 'flex';
    resetApp();
});


// --- Initial Load ---
function init() {
    loadSound('transition', 'transition.mp3');
    loadSound('meditation-guide', 'meditation-guide.mp3');
    loadSound('resource-activate', 'resource-activate.mp3');
    loadSound('victory', 'victory.mp3');
    resetApp(); // Set initial state
    updateLogbook(); // Show empty log initially
}

init();

