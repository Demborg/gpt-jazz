const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const canvas = document.getElementById('animationCanvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const ctx = canvas.getContext('2d');

let circleSize = 0;
let circleX = canvas.width / 2;
let circleY = canvas.height / 2;
let circleColor = 'rgba(0, 0, 255, 0.5)';

const scale = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const chords = [['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['B3', 'D4', 'F4']];

let chordIndex = 0;
const melodyOctave = 4;

function getRandomNoteFromScale(scale, octave) {
    const randomIndex = Math.floor(Math.random() * scale.length);
    return scale[randomIndex];
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.beginPath();
    ctx.arc(circleX, circleY, circleSize, 0, 2 * Math.PI);
    ctx.fillStyle = circleColor;
    ctx.fill();

    circleSize *= 0.95;

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

function playNoteAnimation(synthType) {
    if (synthType === 'melody') {
        circleSize = 50 + Math.random() * 100;
        circleX = Math.random() * canvas.width;
        circleY = Math.random() * canvas.height;
        circleColor = `rgba(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255}, 0.5)`;
    } else if (synthType === 'chord') {
        circleSize = 50 + Math.random() * 100;
    }
}

function playMelody(time) {
    const note = getRandomNoteFromScale(scale, melodyOctave);
    console.log(note)
    const duration = '8n';
    const velocity = Math.random() * 0.5 + 0.5;
    melodySynth.triggerAttackRelease(note, duration, time, velocity);
    playNoteAnimation('melody');
}

function playChords(time) {
    const currentChord = chords[chordIndex];
    chordIndex = (chordIndex + 1) % chords.length;
    const duration = '1m';
    currentChord.forEach((note) => {
        chordSynth.triggerAttackRelease(note, duration, time);
    });
    playNoteAnimation('chord');
}

async function playJazz() {
    Tone.Transport.bpm.value = 120;
    Tone.Transport.scheduleRepeat(playMelody, '8n');
    Tone.Transport.scheduleRepeat(playChords, '1m');


    // Add this line to start Tone.js in response to a user action
    await Tone.start();

    Tone.Transport.start();
}

function stopJazz() {
    Tone.Transport.stop();
}

playButton.addEventListener('click', playJazz);
stopButton.addEventListener('click', stopJazz);