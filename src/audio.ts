import * as Instruments from 'webaudio-instruments';

const player = new Instruments();

const getNote = (value: number) => {
    const offset = 16;
    const fiveOctaves = 5 * 12;
    const midiOffset = 33;
    let instrument;
    let pitch;
    if (value === 0) {
        return null;
    } else if (value < offset) {
        const instruments = [
            25, 26, 0, 2, 3, 5, 8, 10, 13, 15, 17, 19, 20, 23, 45
        ];
        instrument = 128 + instruments[value - 1];
        pitch = 60;

    } else if (value < (offset + fiveOctaves * 1)) {
        // elec piano
        instrument = 4;
        pitch = midiOffset + value - offset;

    } else if (value < (offset + fiveOctaves * 2)) {
        // Pad 5
        instrument = 92;
        pitch = midiOffset + value - fiveOctaves - offset;

    } else if (value < (offset + fiveOctaves * 3)) {
        // Orch harp
        instrument = 46;
        pitch = midiOffset + value - fiveOctaves * 2 - offset;
    } else {
        instrument = 15;
        pitch = midiOffset + value - fiveOctaves * 3 - offset;
    }

    return {
        instrument,
        pitch
    };
};

export const playSound = (sound: number, duration=60/360) => {
    const note = getNote(sound);

    if (note) {
        player.play(
            note.instrument,
            note.pitch,
            0.5, // velocity
            duration
        );
    }
};

export const playAudioBuffer = (buffer: Array<number>, bpm=360) => {
    const secInMin = 60;
    const duration = (secInMin/bpm);

    let index = 0;
    const interval = setInterval(() => {
        if (index >= buffer.length) {
            clearInterval(interval);
            return;
        }

        playSound(buffer[index]);
        
        index++;
    }, 1000 * duration);

    return interval;
};
