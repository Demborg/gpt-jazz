const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const canvas = document.getElementById('animationCanvas');
const ctx = canvas.getContext('2d');

let circleSize = 0;
let circleX = canvas.width / 2;
let circleY = canvas.height / 2;
let circleColor = 'rgba(0, 0, 255, 0.5)';

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

const scale = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const chords = [['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['B3', 'D4', 'F4']];

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

async function playJazz() {
    const chords = generateJazzChords();
    const melody = generateJazzMelody(chords);

    const loop = new Tone.Part((time, { note, duration }) => {
        melodySynth.triggerAttackRelease(note, duration, time);
        Tone.Draw.schedule(() => playNoteAnimation('melody'), time);
    }, melody).start(0);

    const chordLoop = new Tone.Sequence((time, chord) => {
        const duration = ['1m', '2n', '4n'][Math.floor(Math.random() * 3)];
        const delay = Math.random() * 0.5;
        chordSynth.triggerAttackRelease(chord, duration, time + delay);
        Tone.Draw.schedule(() => playNoteAnimation('chord'), time + delay);
    }, chords).start(0);

    Tone.Transport.bpm.value = 120;

    // Add this line to start Tone.js in response to a user action
    await Tone.start();

    Tone.Transport.start();
}

function stopJazz() {
    Tone.Transport.stop();
}

playButton.addEventListener('click', playJazz);
stopButton.addEventListener('click', stopJazz);