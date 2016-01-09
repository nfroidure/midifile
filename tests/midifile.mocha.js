'use strict';

var fs = require('fs');
var assert = require('assert');
var path = require('path');
var MIDIFile = require('./../src/MIDIFile.js');
var MIDIFileHeader = require('./../src/MIDIFileHeader.js');
var MIDIEvents = require('midievents');

// Helper to get an ArrayBuffer from a NodeJS buffer
// Borrowed here : http://stackoverflow.com/questions/8609289/convert-a-binary-
// nodejs-buffer-to-javascript-arraybuffer
function toArrayBuffer(buffer) {
  var ab = new ArrayBuffer(buffer.length);
  var view = new Uint8Array(ab);
  var i;

  for (i = 0; i < buffer.length; ++i) {
    view[i] = buffer[i];
  }
  return ab;
}

// Tests
describe('Reading well formed MIDI files', function() {

  it('Format 0 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat0.mid'))
    ));

    assert.equal(mF.header.getFormat(), 0);
    assert.equal(mF.header.getTracksCount(), 1);
    assert.equal(mF.header.getTimeDivision(), MIDIFileHeader.TICKS_PER_BEAT);
    assert.equal(mF.header.getTicksPerBeat(), 96);
    assert.equal(mF.tracks.length, 1);
    assert.equal(mF.tracks[0].getTrackLength(), 59);
    events = mF.tracks[0].getTrackContent();
    assert.equal(events.buffer.byteLength, 81);
    assert.equal(events.byteLength, 59);
    assert.equal(events.byteOffset, 22);
    // Check events retrieving
    events = mF.getMidiEvents();
    assert.equal(events.length, 11);
    assert.equal(events[0].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[0].subtype, MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE);
    assert.equal(events[0].index, 0x25);
    assert.equal(events[0].delta, 0);
    assert.equal(events[0].channel, 0);
    assert.equal(events[0].param1, 0x5);
    assert.equal(events[1].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[1].subtype, MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE);
    assert.equal(events[1].index, 0x28);
    assert.equal(events[1].delta, 0);
    assert.equal(events[1].channel, 1);
    assert.equal(events[1].param1, 0x2E);
    assert.equal(events[2].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[2].subtype, MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE);
    assert.equal(events[2].index, 0x2B);
    assert.equal(events[2].delta, 0);
    assert.equal(events[2].channel, 2);
    assert.equal(events[2].param1, 0x46);
    assert.equal(events[3].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[3].subtype, MIDIEvents.EVENT_MIDI_NOTE_ON);
    assert.equal(events[3].index, 0x2E);
    assert.equal(events[3].delta, 0);
    assert.equal(events[3].channel, 2);
    assert.equal(events[3].param1, 0x30);
    assert.equal(events[3].param2, 0x60);
    assert.equal(events[4].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[4].subtype, MIDIEvents.EVENT_MIDI_NOTE_ON);
    assert.equal(events[4].index, 0x32);
    assert.equal(events[4].delta, 0);
    assert.equal(events[4].channel, 2);
    assert.equal(events[4].param1, 0x3C);
    assert.equal(events[4].param2, 0x60);
    assert.equal(events[5].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[5].subtype, MIDIEvents.EVENT_MIDI_NOTE_ON);
    assert.equal(events[5].index, 0x35);
    assert.equal(events[5].delta, 0x60);
    assert.equal(events[5].channel, 1);
    assert.equal(events[5].param1, 0x43);
    assert.equal(events[5].param2, 0x40);
    assert.equal(events[6].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[6].subtype, MIDIEvents.EVENT_MIDI_NOTE_ON);
    assert.equal(events[6].index, 0x39);
    assert.equal(events[6].delta, 0x60);
    assert.equal(events[6].channel, 0);
    assert.equal(events[6].param1, 0x4C);
    assert.equal(events[6].param2, 0x20);
    assert.equal(events[7].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[7].subtype, MIDIEvents.EVENT_MIDI_NOTE_OFF);
    assert.equal(events[7].index, 0x3D);
    assert.equal(events[7].delta, 192); // 2 bytes delta time
    assert.equal(events[7].channel, 2);
    assert.equal(events[7].param1, 0x30);
    assert.equal(events[7].param2, 0x40);
    assert.equal(events[8].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[8].subtype, MIDIEvents.EVENT_MIDI_NOTE_OFF);
    assert.equal(events[8].index, 0x42);
    assert.equal(events[8].delta, 0x00);
    assert.equal(events[8].channel, 2);
    assert.equal(events[8].param1, 0x3C);
    assert.equal(events[8].param2, 0x40);
    assert.equal(events[9].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[9].subtype, MIDIEvents.EVENT_MIDI_NOTE_OFF);
    assert.equal(events[9].index, 0x45);
    assert.equal(events[9].delta, 0x00);
    assert.equal(events[9].channel, 1);
    assert.equal(events[9].param1, 0x43);
    assert.equal(events[9].param2, 0x40);
    assert.equal(events[10].type, MIDIEvents.EVENT_MIDI);
    assert.equal(events[10].subtype, MIDIEvents.EVENT_MIDI_NOTE_OFF);
    assert.equal(events[10].index, 0x49);
    assert.equal(events[10].delta, 0x00);
    assert.equal(events[10].channel, 0);
    assert.equal(events[10].param1, 0x4C);
    assert.equal(events[10].param2, 0x40);
  });

  it('Format 1 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat1.mid'))
    ));
    assert.equal(mF.header.getFormat(), 1);
    assert.equal(mF.header.getTracksCount(), 4);
    assert.equal(mF.header.getTimeDivision(), MIDIFileHeader.TICKS_PER_BEAT);
    assert.equal(mF.header.getTicksPerBeat(), 96);
    assert.equal(mF.tracks.length, 4);
    // Track 1
    assert.equal(mF.tracks[0].getTrackLength(), 19);
    events = mF.tracks[0].getTrackContent();
    assert.equal(events.buffer.byteLength, 117);
    assert.equal(events.byteLength, 19);
    assert.equal(events.byteOffset, 22);
    // Track 2
    assert.equal(mF.tracks[1].getTrackLength(), 16);
    events = mF.tracks[1].getTrackContent();
    assert.equal(events.buffer.byteLength, 117);
    assert.equal(events.byteLength, 16);
    assert.equal(events.byteOffset, 49);
    // Track 3
    assert.equal(mF.tracks[2].getTrackLength(), 15);
    events = mF.tracks[2].getTrackContent();
    assert.equal(events.buffer.byteLength, 117);
    assert.equal(events.byteLength, 15);
    assert.equal(events.byteOffset, 73);
    // Track 4
    assert.equal(mF.tracks[3].getTrackLength(), 21);
    events = mF.tracks[3].getTrackContent();
    assert.equal(events.buffer.byteLength, 117);
    assert.equal(events.byteLength, 21);
    assert.equal(events.byteOffset, 96);
  });

  it('Format 2 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat2.mid'))
    ));
    assert.equal(mF.header.getFormat(), 2);
    assert.equal(mF.header.getTracksCount(), 9);
    assert.equal(mF.header.getTimeDivision(), MIDIFileHeader.TICKS_PER_BEAT);
    assert.equal(mF.header.getTicksPerBeat(), 96);
    assert.equal(mF.tracks.length, 9);
    // Track 1
    assert.equal(mF.tracks[0].getTrackLength(), 24);
    events = mF.tracks[0].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 24);
    assert.equal(events.byteOffset, 22);
    // Track 2
    assert.equal(mF.tracks[1].getTrackLength(), 20);
    events = mF.tracks[1].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 54);
    // Track 3
    assert.equal(mF.tracks[2].getTrackLength(), 20);
    events = mF.tracks[2].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 82);
    // Track 4
    assert.equal(mF.tracks[3].getTrackLength(), 20);
    events = mF.tracks[3].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 110);
    // Track 5
    assert.equal(mF.tracks[4].getTrackLength(), 20);
    events = mF.tracks[4].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 138);
    // Track 6
    assert.equal(mF.tracks[5].getTrackLength(), 20);
    events = mF.tracks[5].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 166);
    // Track 7
    assert.equal(mF.tracks[6].getTrackLength(), 20);
    events = mF.tracks[6].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 194);
    // Track 8
    assert.equal(mF.tracks[7].getTrackLength(), 20);
    events = mF.tracks[7].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 222);
    // Track 9
    assert.equal(mF.tracks[8].getTrackLength(), 20);
    events = mF.tracks[8].getTrackContent();
    assert.equal(events.buffer.byteLength, 270);
    assert.equal(events.byteLength, 20);
    assert.equal(events.byteOffset, 250);
  });

  it('Karaoke MIDI file', function() {
    var events;
    var lyrics;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat1-lyrics.mid'))
    ));
    assert.equal(mF.header.getFormat(), 1);
    assert.equal(mF.header.getTracksCount(), 1);
    assert.equal(mF.header.getTimeDivision(), MIDIFileHeader.TICKS_PER_BEAT);
    assert.equal(mF.header.getTicksPerBeat(), 96);
    assert.equal(mF.tracks.length, 1);
    assert.equal(mF.tracks[0].getTrackLength(), 109);
    events = mF.tracks[0].getTrackContent();
    assert.equal(events.buffer.byteLength, 131);
    assert.equal(events.byteLength, 109);
    assert.equal(events.byteOffset, 22);
    // Reading lyrics
    lyrics = mF.getLyrics();
    assert.equal(lyrics[0].text, 'He');
    assert.equal(lyrics[0].playTime, 0);
    assert.equal(lyrics[1].text, 'llo');
    assert.equal(Math.floor(lyrics[1].playTime), 666);
    assert.equal(lyrics[2].text, '\\Ka');
    assert.equal(Math.floor(lyrics[1].playTime), 666);
    assert.equal(lyrics[3].text, 'ra');
    assert.equal(Math.floor(lyrics[1].playTime), 666);
    assert.equal(lyrics[4].text, 'o');
    assert.equal(Math.floor(lyrics[1].playTime), 666);
    assert.equal(lyrics[5].text, 'ke');
    assert.equal(Math.floor(lyrics[1].playTime), 666);
  });

  it('Real world MIDI file : Mountain Man', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'Avgvst', 'MountainMan.mid'))
    ));
    assert.equal(mF.header.getFormat(), 0);
    assert.equal(mF.header.getTracksCount(), 1);
    assert.equal(mF.header.getTimeDivision(), MIDIFileHeader.TICKS_PER_BEAT);
    assert.equal(mF.header.getTicksPerBeat(), 192);
    assert.equal(mF.tracks.length, 1);
    assert.equal(mF.tracks[0].getTrackLength(), 47411);
    events = mF.tracks[0].getTrackContent();
    assert.equal(events.buffer.byteLength, 47433);
    assert.equal(events.byteLength, 47411);
    assert.equal(events.byteOffset, 22);
  });
});


describe('Reading invalid MIDI files', function() {

  it('Should fail when the header chunk is bad', function() {
    assert.throws(function() {
      new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderChunk.mid'))
      ));
    });
  });

  it('Should fail when the MIDI format is invalid', function() {
    assert.throws(function() {
      var mF = new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderFormat.mid'))
      ));
      mF.header.getFormat();
    });
  });

  it('Should fail when the header chunk is bad', function() {
    assert.throws(function() {
      new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderChunk.mid'))
      ));
    });
  });

  it('Should fail when the header length is bad', function() {
    assert.throws(function() {
      var mF = new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderLength.mid'))
      ));
      mF.getFormat();
    });
  });

  it('Should fail when the header chunk is bad', function() {
    assert.throws(function() {
      var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderSmtp.mid'))));
      mF.header.getSMPTEFrames();
    });
  });

  it('Should fail when tracks count is not corresponding to the real track count', function() {
    assert.throws(function() {
      new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderTracksNum.mid'))
      ), true);
    });
  });

  it('Should fail when the track header is bad', function() {
    assert.throws(function() {
      new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadTrackHdr.mid'))
      ));
    });
  });

  it('Should fail when the track length is bad', function() {
    assert.throws(function() {
      new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadTrackLength.mid'))
      ));
    });
  });

});

describe('Reading malformed MIDI files in strict mode', function() {

  it('Should fail when tracks count is not corresponding to the real track count', function() {
    assert.throws(function() {
      new MIDIFile(toArrayBuffer(
        fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIBadHeaderTracksNum.mid'))
      ), true);
    });
  });

});

describe('Calculating required buffer length ', function() {

  it('Should work with events of Format 0 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat0.mid'))
    ));

    events = mF.getTrackEvents(0);
    // -2 bytes for running statuses
    assert.equal(MIDIEvents.getRequiredBufferLength(events) - 2,
      mF.tracks[0].getTrackLength());
  });

  it('Should work with events of Format 1 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat1.mid'))
    ));
    events = mF.getTrackEvents(0);
    assert.equal(MIDIEvents.getRequiredBufferLength(events),
      mF.tracks[0].getTrackLength());
    events = mF.getTrackEvents(1);
    // -1 byte for running status
    assert.equal(MIDIEvents.getRequiredBufferLength(events) - 1,
      mF.tracks[1].getTrackLength());
    events = mF.getTrackEvents(2);
    // -1 byte for running statuses
    assert.equal(MIDIEvents.getRequiredBufferLength(events) - 1,
      mF.tracks[2].getTrackLength());
    events = mF.getTrackEvents(3);
    // -3 bytes for running statuses
    assert.equal(MIDIEvents.getRequiredBufferLength(events) - 3,
      mF.tracks[3].getTrackLength());
  });

  it('Should work with events of Format 1 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat1-lyrics.mid'))
    ));

    events = mF.getTrackEvents(0);
    assert.equal(MIDIEvents.getRequiredBufferLength(events),
      mF.tracks[0].getTrackLength());
  });

  it('Should work with events of Format 2 MIDI file', function() {
    var events;
    var mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', 'MIDIOkFormat2.mid'))
    ));

    events = mF.getTrackEvents(0);
    assert.equal(MIDIEvents.getRequiredBufferLength(events),
      mF.tracks[0].getTrackLength());
  });

});

describe('MIDI file', function() {
  var mF;
  var events;

  it('creation should work', function() {
    mF = new MIDIFile();
  });

  it('ticks per beat setting should work', function() {
    mF.header.setTicksPerBeat(128);
  });

  it('Track addition should work', function() {
    mF.addTrack(1); // at the end by specifying an index
    mF.addTrack(); // at the end
    mF.addTrack(1); // in the middle
    assert.equal(mF.tracks.length, mF.header.getTracksCount());
    assert.equal(mF.tracks.length, 4);
  });

  it('Track deletion should work', function() {
    mF.deleteTrack(1);
    assert.equal(mF.tracks.length, mF.header.getTracksCount());
    assert.equal(mF.tracks.length, 3);
  });

  it('Track events basic reading should work', function() {
    events = mF.getTrackEvents(1);
    assert.equal(events.length, 1);
  });

});

describe('MIDI file reencryption loop should work', function() {

  function encodingLoop(filePath) {
    var mF;
    var newMF;
    var mFEvents;
    var newMFEvents;

    mF = new MIDIFile(toArrayBuffer(
      fs.readFileSync(path.join(__dirname, '..', 'sounds', filePath))
    ));
    mF.tracks.forEach(function(track, index) {
      var events = mF.getTrackEvents(index);
      mF.setTrackEvents(index, events);
    });
    newMF = new MIDIFile(mF.getContent().slice());
    mFEvents = mF.getEvents();
    newMFEvents = newMF.getEvents();
    assert.equal(mFEvents.length, newMFEvents.length);
    // Testing each events
    mFEvents.forEach(function(event, index) {
      // Remove indexes since it is normal they differs
      delete event.index;
      delete newMFEvents[index].index;
      assert.deepEqual(event, newMFEvents[index], 'Same event at index:' + index);
    });
  }

  function dirEncodingLoop(dirName) {
    fs.readdirSync(path.join(__dirname, '..', 'sounds', dirName))
      .forEach(function(file) {
        if('README.md' !== file) {
          encodingLoop(path.join(dirName, file));
        }
      });
  }

  it('with the format 0 MIDI file', function() {
    encodingLoop('/../sounds/MIDIOkFormat0.mid');
  });

  it('with the format 1 MIDI file', function() {
    encodingLoop('/../sounds/MIDIOkFormat1.mid');
  });

  it('with the format 2 MIDI file', function() {
    encodingLoop('/../sounds/MIDIOkFormat2.mid');
  });

  it('with the Avgvst MIDI files', function() {
    this.timeout(10000);
    dirEncodingLoop('Avgvst');
  });

  it('with the Avgvst MIDI files', function() {
    this.timeout(10000);
    dirEncodingLoop('GerardoMarset');
  });

  it('with the Avgvst MIDI files', function() {
    this.timeout(10000);
    dirEncodingLoop('HorrorPen');
  });

  it('with the Avgvst MIDI files', function() {
    this.timeout(10000);
    dirEncodingLoop('Yubatake');
  });

});
