MidiFile
============

MidiFile is a project intended to read/write standard MIDI files with JavaScript.



What it does
-------------
* Read MIDI files
* Check MIDI file structure (using strictMode)
*	(Not yet but soon) Write midi files

What it doesn't do
-------------
*	Playing midi files. It's the role of the WebMidiAPI or it's polyfill. You can find a sample MIDI player based on MidiFile in the test folder.

Usage
-------------
```js
// Your variable with a ArrayBuffer instance containing your MIDI file
var anyBuffer;

// Creating the MidiFile instance
var midiFile= new MidiFile(anyBuffer);

// Reading headers
midiFile.header.getFormat(); // 0, 1 or 2
midiFile.header.getTracksCount();
// Time division
if(midiFile.header.getTimeDivision()===MidiFileHeader.TICKS_PER_BEAT) {
	midiFile.header.getTicksPerBit()
}

// Reading a track events
midiFile.tracks[0].getTrackLength();
var trackEventsChunk=midiFile.tracks[0].getTrackEvents(),
	events=new MidiEvents.createParser(trackEventsChunk),
	event;
		do {
			event=events.next();
			// Printing meta events only
			if(event&&event.type===MidiEvents.EVENT_META
					&&event.text) {
				console.log('Text meta: '+event.text);
			}
		} while(event);
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
