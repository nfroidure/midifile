MIDIFile [![Build Status](https://travis-ci.org/nfroidure/MIDIFile.png?branch=master)](https://travis-ci.org/nfroidure/MIDIFile)
============

MIDIFile is a project intended to read/write standard MIDI files with JavaScript. MIDIFile is fully tested with the 3 existing MIDI formats.

What it does
-------------
* Read MIDI files
* Check MIDI file structure (using strictMode)
*	(Not yet but soon) Write MIDI files

What it doesn't do
-------------
*	Playing MIDI files. It's the role of the WebMIDIAPI or it's polyfill. You can find a [Karaoke MIDI player](http://midiwebkaraoke.com) based on MIDIFile and a very [trivial MIDI player](rest4.org/github/nfroidure/MidiFile/master/tests/index.html) in the test folder.

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

License
-------
Copyright Nicolas Froidure 2013. MIT licence.
