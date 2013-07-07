MIDIFile
============

MIDIFile is a project intended to read/write standard MIDI files with JavaScript. MIDFile is fully tested with the 3 existing MIDI formats.

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
var MIDIFile= new MIDIFile(anyBuffer);

// Reading headers
MIDIFile.header.getFormat(); // 0, 1 or 2
MIDIFile.header.getTracksCount();
// Time division
if(MIDIFile.header.getTimeDivision()===MIDIFileHeader.TICKS_PER_BEAT) {
	MIDIFile.header.getTicksPerBit()
}

// Reading a track events
MIDIFile.tracks[0].getTrackLength();
var trackEventsChunk=MIDIFile.tracks[0].getTrackEvents(),
	events=new MIDIEvents.createParser(trackEventsChunk),
	event;
		do {
			event=events.next();
			// Printing meta events only
			if(event&&event.type===MIDIEvents.EVENT_META
					&&event.text) {
				console.log('Text meta: '+event.text);
			}
		} while(event);
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
