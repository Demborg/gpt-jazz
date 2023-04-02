const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');

const melodySynth = new Tone.FMSynth({
    modulationIndex: 12,
    envelope: {
        attack: 0.01,
        decay: 0.2,
        sustain: 0.1,
        release: 1.2
    },
    modulation: {
        type: "square"
    },
    modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5
    }
}).toDestination();

const chordSynth = new Tone.FMSynth({
    modulationIndex: 20,
    envelope: {
        attack: 0.01,
        decay: 0.3,
        sustain: 0.1,
        release: 1.5
    },
    modulation: {
        type: "triangle"
    },
    modulationEnvelope: {
        attack: 0.5,
        decay: 0,
        sustain: 1,
        release: 0.5
    }
}).toDestination();


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

async function playJazz() {
    const chords = generateJazzChords();
    const melody = generateJazzMelody(chords);

    const loop = new Tone.Part((time, { note, duration }) => {
        melodySynth.triggerAttackRelease(note, duration, time);
    }, melody).start(0);

    const chordLoop = new Tone.Sequence((time, chord) => {
        const duration = ['1m', '2n', '4n'][Math.floor(Math.random() * 3)];
        const delay = Math.random() * 0.5;
        chordSynth.triggerAttackRelease(chord, duration, time + delay);
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
