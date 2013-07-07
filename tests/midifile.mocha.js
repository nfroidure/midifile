var fs=require('fs'), assert=require('assert'),
	MIDIFile = require('./../src/MIDIFile.js'),
	MIDIFileHeader = require('./../src/MIDIFileHeader.js');

// Helper to get an ArrayBuffer from a NodeJS buffer
// Borrowed here : http://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer
function toArrayBuffer(buffer) {
    var ab = new ArrayBuffer(buffer.length);
    var view = new Uint8Array(ab);
    for (var i = 0; i < buffer.length; ++i) {
        view[i] = buffer[i];
    }
    return ab;
}

// Tests
describe('Reading well formed MIDI files', function(){

	it("Format 0 MIDI file", function() {
		var mF=new MIDIFile(toArrayBuffer(
			fs.readFileSync(__dirname+'/../sounds/MIDIOkFormat0.mid')));
			assert.equal(mF.header.getFormat(),0);
			assert.equal(mF.header.getTracksCount(),1);
			assert.equal(mF.header.getTimeDivision(),MIDIFileHeader.TICKS_PER_BEAT);
			assert.equal(mF.header.getTicksPerBeat(),96);
			assert.equal(mF.tracks.length,1);
			assert.equal(mF.tracks[0].getTrackLength(),59);
			var events=mF.tracks[0].getTrackEvents();
			assert.equal(events.buffer.byteLength,81);
			assert.equal(events.byteLength,59);
			assert.equal(events.byteOffset,22);
	});

	it("Format 1 MIDI file", function() {
		var mF=new MIDIFile(toArrayBuffer(
			fs.readFileSync(__dirname+'/../sounds/MIDIOkFormat1.mid')));
			assert.equal(mF.header.getFormat(),1);
			assert.equal(mF.header.getTracksCount(),4);
			assert.equal(mF.header.getTimeDivision(),MIDIFileHeader.TICKS_PER_BEAT);
			assert.equal(mF.header.getTicksPerBeat(),96);
			assert.equal(mF.tracks.length,4);
			// Track 1
			assert.equal(mF.tracks[0].getTrackLength(),20);
			var events=mF.tracks[0].getTrackEvents();
			assert.equal(events.buffer.byteLength,118);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,22);
			// Track 2
			assert.equal(mF.tracks[1].getTrackLength(),16);
			var events=mF.tracks[1].getTrackEvents();
			assert.equal(events.buffer.byteLength,118);
			assert.equal(events.byteLength,16);
			assert.equal(events.byteOffset,50);
			// Track 3
			assert.equal(mF.tracks[2].getTrackLength(),15);
			var events=mF.tracks[2].getTrackEvents();
			assert.equal(events.buffer.byteLength,118);
			assert.equal(events.byteLength,15);
			assert.equal(events.byteOffset,74);
			// Track 4
			assert.equal(mF.tracks[3].getTrackLength(),21);
			var events=mF.tracks[3].getTrackEvents();
			assert.equal(events.buffer.byteLength,118);
			assert.equal(events.byteLength,21);
			assert.equal(events.byteOffset,97);
	});

	it("Format 2 MIDI file", function() {
		var mF=new MIDIFile(toArrayBuffer(
			fs.readFileSync(__dirname+'/../sounds/MIDIOkFormat2.mid')));
			assert.equal(mF.header.getFormat(),2);
			assert.equal(mF.header.getTracksCount(),9);
			assert.equal(mF.header.getTimeDivision(),MIDIFileHeader.TICKS_PER_BEAT);
			assert.equal(mF.header.getTicksPerBeat(),96);
			assert.equal(mF.tracks.length,9);
			// Track 1
			assert.equal(mF.tracks[0].getTrackLength(),24);
			var events=mF.tracks[0].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,24);
			assert.equal(events.byteOffset,22);
			// Track 2
			assert.equal(mF.tracks[1].getTrackLength(),20);
			var events=mF.tracks[1].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,54);
			// Track 3
			assert.equal(mF.tracks[2].getTrackLength(),20);
			var events=mF.tracks[2].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,82);
			// Track 4
			assert.equal(mF.tracks[3].getTrackLength(),20);
			var events=mF.tracks[3].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,110);
			// Track 5
			assert.equal(mF.tracks[4].getTrackLength(),20);
			var events=mF.tracks[4].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,138);
			// Track 6
			assert.equal(mF.tracks[5].getTrackLength(),20);
			var events=mF.tracks[5].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,166);
			// Track 7
			assert.equal(mF.tracks[6].getTrackLength(),20);
			var events=mF.tracks[6].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,194);
			// Track 8
			assert.equal(mF.tracks[7].getTrackLength(),20);
			var events=mF.tracks[7].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,222);
			// Track 9
			assert.equal(mF.tracks[8].getTrackLength(),20);
			var events=mF.tracks[8].getTrackEvents();
			assert.equal(events.buffer.byteLength,270);
			assert.equal(events.byteLength,20);
			assert.equal(events.byteOffset,250);
	});

	it("Sample MIDI file Mountain Man", function() {
		var mF=new MIDIFile(toArrayBuffer(
			fs.readFileSync(__dirname+'/../sounds/SampleMountainman.mid')));
			assert.equal(mF.header.getFormat(),0);
			assert.equal(mF.header.getTracksCount(),1);
			assert.equal(mF.header.getTimeDivision(),MIDIFileHeader.TICKS_PER_BEAT);
			assert.equal(mF.header.getTicksPerBeat(),192);
			assert.equal(mF.tracks.length,1);
			assert.equal(mF.tracks[0].getTrackLength(),47411);
			var events=mF.tracks[0].getTrackEvents();
			assert.equal(events.buffer.byteLength,47433);
			assert.equal(events.byteLength,47411);
			assert.equal(events.byteOffset,22);
	});
});


describe('Reading invalid MIDI files', function(){

	it("Should fail when the header chunk is bad", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderChunk.mid')));
		} catch(e) {
			done();
		}
	});

	it("Should fail when the MIDI format is invalid", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderFormat.mid')));
			mF.header.getFormat();
		} catch(e) {
			done();
		}
	});

	it("Should fail when the header chunk is bad", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderChunk.mid')));
		} catch(e) {
			done();
		}
	});

	it("Should fail when the header length is bad", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderLength.mid')));
			mF.getFormat();
		} catch(e) {
			done();
		}
	});

	it("Should fail when the header chunk is bad", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderSmtp.mid')));
				mF.header.getSMPTEFrames();
		} catch(e) {
			done();
		}
	});

	it("Should work when tracks count is not corresponding to the real track count", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderTracksNum.mid')),
				true);
		} catch(e) {
			done();
		}
	});

	it("Should fail when the track header is bad", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadTrackHdr.mid')));
		} catch(e) {
			done();
		}
	});

	it("Should fail when the track length is bad", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadTrackLength.mid')));
		} catch(e) {
			done();
		}
	});

});

describe('Reading malformed MIDI files in strict mode', function(){

	it("Should fail when tracks count is not corresponding to the real track count", function(done) {
		try {
			var mF=new MIDIFile(toArrayBuffer(
				fs.readFileSync(__dirname+'/../sounds/MIDIBadHeaderTracksNum.mid')),
				true);
		} catch(e) {
			done();
		}
	});

});
