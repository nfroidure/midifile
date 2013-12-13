MIDIFile [![Build Status](https://travis-ci.org/nfroidure/MIDIFile.png?branch=master)](https://travis-ci.org/nfroidure/MIDIFile)
============

MIDIFile is a project intended to read/write standard MIDI files with
 JavaScript. MIDIFile is fully tested with the 3 existing MIDI formats.

MIDIFile can be used either in modern browsers
 ([pick the last bundle](https://github.com/nfroidure/MIDIFile/blob/master/dist/MIDIFIle.js))
 or with NodeJS by installing the following
 [NPM module](https://npmjs.org/package/midifile) :
```bash
npm install midifile
```

What it does
-------------
* Read MIDI files
* Check MIDI file structure (using strictMode)
*	Write MIDI files (still experimental)

What it doesn't do
-------------
*	Playing MIDI files. It's the role of the
 [MIDIPlayer project](https://github.com/nfroidure/MIDIPlayer).

You can also find a [Karaoke MIDI player](http://midiwebkaraoke.com) based on
 MIDIFile and a very [trivial MIDI player](http://rest4.org/github/nfroidure/MIDIFile/master/tests/index.html)
 in the test folder.

Usage
-------------
```js
// Your variable with a ArrayBuffer instance containing your MIDI file
var anyBuffer;

// Creating the MIDIFile instance
var midiFile= new MIDIFile(anyBuffer);

// Reading headers
midiFile.header.getFormat(); // 0, 1 or 2
midiFile.header.getTracksCount(); // n
// Time division
if(midiFile.header.getTimeDivision()===MIDIFileHeader.TICKS_PER_BEAT) {
	midiFile.header.getTicksPerBit();
} else {
	midiFile.header.getSMPTEFrames();
	midiFile.header.getTicksPerFrame();
}

// MIDI events retriever
var events=midiFile.getMidiEvents();
events[0].subtype; // type of [MIDI event](https://github.com/nfroidure/MIDIFile/blob/master/src/MIDIEvents.js#L34)
events[0].playTime; // time in ms at wich the event must be played
events[0].param1; // first parameter
events[0].param2; // second one

// Lyrics retriever
var lyrics=midiFile.getLyrics();
lyrics[0].playTime; // Time at wich the text must be displayed
lyrics[0].text; // The text content to be displayed

// Reading whole track events and filtering them yourself
var trackEventsChunk=midiFile.tracks[0].getTrackEvents(),
	events=new MIDIEvents.createParser(trackEventsChunk),
	event;
while(event=events.next()) {
	// Printing meta events containing text only
	if(event.type===MIDIEvents.EVENT_META&&event.text) {
		console.log('Text meta: '+event.text);
	}
}
```

Testing
-------------
Unit tests are using mocha and NodeJS. Install them and run the following command :

```bash
mocha tests/*.mocha.js
```

Why ArrayBuffers ?
-------------
ArrayBuffer instances ar the best way to manage binary datas like MIDI files.

Requirements
-------------
* ArrayBuffer, DataView or their polyfills

Contributing
-------------
* Feel free to PR
* If you find a MIDI File the library can't read an if it's under a free, PR
 the file in the sounds folder and add tests for him. I'll work on it asap.

License
-------
Copyright Nicolas Froidure 2013. MIT licence.
