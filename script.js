const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const melodySynth = new Tone.PolySynth().toDestination();
const chordSynth = new Tone.PolySynth().toDestination();

// Lower the volume of the chord synthesizer
chordSynth.volume.value = -12;

const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const chords = [['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['B3', 'D4', 'F4']];

function generateJazzMelody() {
    const melody = [];
    for (let i = 0; i < 16; i++) {
        melody.push({
            note: notes[Math.floor(Math.random() * notes.length)],
            duration: ['8n', '4n', '16n'][Math.floor(Math.random() * 3)]
        });
    }
    return melody;
}

function generateJazzChords() {
    const progression = [];
    for (let i = 0; i < 4; i++) {
        progression.push(chords[Math.floor(Math.random() * chords.length)]);
    }
    return progression;
}

async function playJazz() {
    const melody = generateJazzMelody();
    const chords = generateJazzChords();

    const loop = new Tone.Sequence((time, { note, duration }) => {
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
