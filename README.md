MIDIFile
============

MIDIFile is a project intended to read/write standard MIDI files with JavaScript. MIDIFile is fully tested with the 3 existing MIDI formats.

You can test it here : http://rest4.org/github/nfroidure/MIDIFile/master/tests/index.html

What it does
-------------
* Read MIDI files
* Check MIDI file structure (using strictMode)
*	(Not yet but soon) Write MIDI files

What it doesn't do
-------------
*	Playing MIDI files. It's the role of the WebMIDIAPI or it's polyfill. You can find a sample MIDI player based on MIDIFile in the test folder.

Usage
-------------
```js
// Your variable with a ArrayBuffer instance containing your MIDI file
var anyBuffer;

// Creating the MIDIFile instance
var midiFile= new MIDIFile(anyBuffer);

// Reading headers
midiFile.header.getFormat(); // 0, 1 or 2
midiFile.header.getTracksCount();
// Time division
if(midiFile.header.getTimeDivision()===MIDIFileHeader.TICKS_PER_BEAT) {
	midiFile.header.getTicksPerBit()
}

// Getting MIDI events
midiFile.getMidiEvents();

// Getting file lyrics
midiFile.getLyrics();

// Reading whole track events and filtering yourself
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
ArrayBuffer instances ar the best way to manage binary datas like MIDI files. It avoid high memory consumption.

Requirements
-------------
* ArrayBuffer, DataView or their polyfills

License
-------
Copyright Nicolas Froidure 2013. MIT licence.
