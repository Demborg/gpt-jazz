const playPauseButton = document.getElementById('playPauseButton');
const canvas = document.getElementById('animationCanvas');
const melodyToggle = document.getElementById('melodyToggle');
const chordsToggle = document.getElementById('chordsToggle');
const bassToggle = document.getElementById('bassToggle');
const crazyModeToggle = document.getElementById('crazyModeToggle');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let circleSize = 0;
let circleX = canvas.width / 2;
let circleY = canvas.height / 2;
let circleColor = 'rgba(0, 0, 255, 0.5)';
const circles = [];

const scale = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const chords = [['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['B3', 'D4', 'F4']];

let chordIndex = 0;
const melodyOctave = 4;

function updateSchedule() {
    Tone.Transport.cancel();

    Tone.Transport.scheduleRepeat(playMelody, '8n');
    Tone.Transport.scheduleRepeat(playChords, '1m');
    Tone.Transport.scheduleRepeat(playBass, '4n');
}

melodyToggle.addEventListener('change', updateSchedule);
chordsToggle.addEventListener('change', updateSchedule);
bassToggle.addEventListener('change', updateSchedule);

function getRandomNoteFromScale(scale, octave) {
    if (crazyModeToggle.checked) {
        return Tone.Frequency(Math.floor(Math.random() * 88) + 21, "midi").toNote();
    } else {
        const randomIndex = Math.floor(Math.random() * scale.length);
        return scale[randomIndex];
    }
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    circles.forEach((circle, index) => {
        ctx.beginPath();
        ctx.arc(circle.x, circle.y, circle.radius, 0, Math.PI * 2);
        ctx.fillStyle = circle.color;
        ctx.fill();

        circle.radius -= 0.5;
        if (circle.radius <= 0) {
            circles.splice(index, 1);
        }
    });

    requestAnimationFrame(draw);
}

draw();

function createSynth() {
    return new Tone.FMSynth({
        modulationIndex: 10 + Math.random() * 20,
        envelope: {
            attack: 0.01,
            decay: 0.1 + Math.random() * 0.3,
            sustain: 0.1 + Math.random() * 0.3,
            release: 1 + Math.random() * 1.5
        },
        modulation: {
            type: ["sine", "square", "triangle", "sawtooth"][
                Math.floor(Math.random() * 4)
            ],
        },
        modulationEnvelope: {
            attack: 0.1 + Math.random() * 0.4,
            decay: Math.random() * 0.2,
            sustain: 0.5 + Math.random() * 0.5,
            release: 0.1 + Math.random() * 0.9
        },
    }).toDestination();
}

const melodySynth = createSynth();
const chordSynth = createSynth();
const bassSynth = createSynth();

// Lower the volume of the chord synthesizer
chordSynth.volume.value = -12;

function generateJazzMelody(chordProgression) {
    const melody = [];
    const totalBars = chordProgression.length * 2;
    for (let bar = 0; bar < totalBars; bar++) {
        const currentChord = chordProgression[bar % chordProgression.length];
        for (let beat = 0; beat < 4; beat++) {
            const note = scale[Math.floor(Math.random() * scale.length)];
            melody.push({
                note,
                duration: ['8n', '4n', '16n'][Math.floor(Math.random() * 3)],
                time: `${bar}:0:${beat}`
            });
        }
    }
    return melody;
}

function generateJazzChords() {
    const progression = [];
    for (let i = 0; i < 8; i++) {
        progression.push(chords[Math.floor(Math.random() * chords.length)]);
    }
    return progression;
}

function playNoteAnimation(track, frequency) {
    const circle = {
        x: (canvas.width / 2) + (Math.sin(frequency / 100) * canvas.width / 4),
        y: (canvas.height / 2) + (Math.cos(frequency / 100) * canvas.height / 4),
        radius: track === 'melody' ? 50 : (track === 'bass' ? 30 : 25),
        color: track === 'melody' ? `rgba(255, 0, 0, 0.5)` : (track === 'bass' ? `rgba(0, 0, 255, 0.5)` : `rgba(0, 255, 0, 0.5)`),
    };
    circles.push(circle);
}

function playMelody(time) {
    if (!melodyToggle.checked) return;
    const note = getRandomNoteFromScale(scale, melodyOctave);
    const frequency = Tone.Frequency(note).toFrequency();
    const duration = '4n';
    const velocity = Math.random() * 0.5 + 0.5;
    melodySynth.triggerAttackRelease(note, duration, time, velocity);
    playNoteAnimation('melody', frequency);
}

function playChords(time) {
    if (!chordsToggle.checked) return;
    const currentChord = chords[chordIndex];
    chordIndex = (chordIndex + 1) % chords.length;
    const duration = '1m';
    currentChord.forEach((note) => {
        const frequency = Tone.Frequency(note).toFrequency();
        chordSynth.triggerAttackRelease(note, duration, time);
        playNoteAnimation('chord', frequency);
    });
}

function generateBassPattern(chordProgression) {
    const bassPattern = [];
    chordProgression.forEach((chord) => {
        const bassNote = chord[0].charAt(0) + (parseInt(chord[0].slice(-1)) - 1);
        bassPattern.push(bassNote);
    });
    return bassPattern;
}

const chordProgression = generateJazzChords();
const bassPattern = generateBassPattern(chordProgression);
let bassIndex = 0;

function playBass(time) {
    if (!bassToggle.checked) return;
    const bassNote = bassPattern[bassIndex];
    bassIndex = (bassIndex + 1) % bassPattern.length;
    const frequency = Tone.Frequency(bassNote).toFrequency();
    const duration = '4n';
    const velocity = Math.random() * 0.5 + 0.5;
    bassSynth.triggerAttackRelease(bassNote, duration, time, velocity);
    playNoteAnimation('bass', frequency);
}

let isPlaying = false;

async function toggleJazz() {
    if (!isPlaying) {
        Tone.Transport.bpm.value = crazyModeToggle.checked ? 240 : 120;
        updateSchedule();
        Tone.Transport.scheduleRepeat(playMelody, '8n');
        Tone.Transport.scheduleRepeat(playChords, '1m');
        Tone.Transport.scheduleRepeat(playBass, '4n');

        await Tone.start();
        Tone.Transport.start();
        playPauseButton.textContent = 'Pause';
        isPlaying = true;
    } else {
        Tone.Transport.stop();
        playPauseButton.textContent = 'Play';
        isPlaying = false;
    }
}


const infoButton = document.getElementById("infoButton");
const infoModal = document.getElementById("infoModal");
const closeButton = document.querySelector(".close");

infoButton.addEventListener("click", () => {
    infoModal.style.display = "block";
});

closeButton.addEventListener("click", () => {
    infoModal.style.display = "none";
});

crazyModeToggle.addEventListener('change', () => {
    if (crazyModeToggle.checked) {
        Tone.Transport.bpm.value = 240;
    } else {
        Tone.Transport.bpm.value = 120;
    }
});


window.addEventListener("click", (event) => {
    if (event.target === infoModal) {
        infoModal.style.display = "none";
    }
});

playPauseButton.addEventListener('click', toggleJazz);