const playButton = document.getElementById('playButton');
const stopButton = document.getElementById('stopButton');
const synth = new Tone.PolySynth().toDestination();

const notes = ['C3', 'D3', 'E3', 'F3', 'G3', 'A3', 'B3', 'C4', 'D4', 'E4', 'F4', 'G4', 'A4', 'B4', 'C5'];
const chords = [['C3', 'E3', 'G3'], ['D3', 'F3', 'A3'], ['E3', 'G3', 'B3'], ['F3', 'A3', 'C4'], ['G3', 'B3', 'D4'], ['A3', 'C4', 'E4'], ['B3', 'D4', 'F4']];

function generateJazzMelody() {
    const melody = [];
    for (let i = 0; i < 16; i++) {
        melody.push(notes[Math.floor(Math.random() * notes.length)]);
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

    const loop = new Tone.Sequence((time, note) => {
        synth.triggerAttackRelease(note, '8n', time);
    }, melody).start(0);

    const chordLoop = new Tone.Sequence((time, chord) => {
        synth.triggerAttackRelease(chord, '1m', time);
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
