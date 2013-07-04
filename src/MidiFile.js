// MidiFile : Read (and soon edit) a midi file in a given ArrayBuffer

// AMD + global : You can use this object by inserting a script
// or using an AMD loader (like RequireJS)
(function(root,define){ define(['./MidiFileHeader','./MidiFileTrack'], function(MidiFileHeader,MidiFileTrack) {

	function MidiFile(buffer) {
		if(!(buffer instanceof ArrayBuffer))
				throw Error('Invalid buffer received.');
		// Minimum Midi file size is a headerChunk size (14bytes)
		// and an empty track (8+3bytes)
		if(buffer.byteLength<25)
				throw Error('A buffer of a valid Midi file must have size at least'
					+' 25bytes.');
		// Reading header
		this.header=new MidiFileHeader(buffer);
		this.tracks=[];
		var track;
		var curIndex=14;
		// Reading tracks
		for(var i=this.header.getTracksCount()-1; i>=0; i--) {
			// Creating the track object
			var track=new MidiFileTrack(buffer,curIndex);
			this.tracks.push(track);
			// Updating index to the track end
			curIndex+=track.getTrackLength()+8;
		}
		// Testing integrity : curIndex should be at the end of the buffer
		if(curIndex!=buffer.byteLength)
				throw Error('It seems that the buffer contains too much datas.');
	}

	MidiFile.prototype.play=function(midiOutput) {
		// Temporary
		if(!midiOutput)
			throw new Error('No midi output given.');
		// Stop old sounds
    midiOutput.send([0xB0, 0x7B, 0]);
    midiOutput.send([0xB1, 0x7B, 0]);
    midiOutput.send([0xB2, 0x7B, 0]);
    // Variables
		var events, event, tempo=500, division=this.header.getTicksPerBeat(), totalTime=0;
    for(var i=this.tracks.length-1; i>=0; i--) {
    	events=new MidiEvents.createParser(this.tracks[i].getTrackEvents(),0,false);
    	totalTime=1500;
			do {
				event=events.next();
				if(event&&event.type===MidiEvents.EVENT_MIDI) {
					midiOutput.send(
						[(event.subtype<<4)+event.channel, event.param1, (event.param2||0x00)],
						totalTime+=0|(1000*(tempo/1000*event.delta/division)));
				} else if(event&&event.type===MidiEvents.EVENT_META
						&&event.subtype===MidiEvents.EVENT_META_SET_TEMPO) {
					console.log('New tempo: '+(0|event.tempo));
					midiOutput.send(
						[event.type,event.subtype, event.v1, event.v2, event.v3],
						totalTime+=0|(1000*(tempo/1000*event.delta/division)));
				}
			} while(event);
    }
	console.log('File loaded Time:'+totalTime+', Tracks:'+this.tracks.length);
	};

	return MidiFile;

});})(this,typeof define === 'function' && define.amd ?
		define : function (name, deps, factory) {
	var root=this;
	if(typeof name === 'object') {
		factory=deps; deps=name;
	}
	this.MidiFile=factory.apply(this, deps.map(function(dep){
		return root[dep.substring(dep.lastIndexOf('/')+1)];
	}));
}.bind(this));
