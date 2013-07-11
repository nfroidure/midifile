// MIDIFile : Read (and soon edit) a MIDI file in a given ArrayBuffer

// AMD + global + NodeJS : You can use this object by inserting a script
// or using an AMD loader (like RequireJS) or using NodeJS
(function(root,define){ define(['./MIDIFileHeader','./MIDIFileTrack','./MIDIEvents'],
	function(MIDIFileHeader,MIDIFileTrack, MIDIEvents) {
// START: Module logic start

	function MIDIFile(buffer, strictMode) {
		if(!(buffer instanceof ArrayBuffer))
			throw new Error('Invalid buffer received.');
		// Minimum MIDI file size is a headerChunk size (14bytes)
		// and an empty track (8+3bytes)
		if(buffer.byteLength<25)
			throw new Error('A buffer of a valid MIDI file must have size at least'
				+' 25bytes.');
		// Reading header
		this.header=new MIDIFileHeader(buffer, strictMode);
		this.tracks=[];
		var track;
		var curIndex=14;
		// Reading tracks
		for(var i=0, j=this.header.getTracksCount(); i<j; i++) {
			// Testing the buffer length
			if(strictMode&&curIndex>=buffer.byteLength-1)
				throw new Error('Couldn\'t find datas corresponding to the track #'+i+'.');
			// Creating the track object
			var track=new MIDIFileTrack(buffer, curIndex, strictMode);
			this.tracks.push(track);
			// Updating index to the track end
			curIndex+=track.getTrackLength()+8;
		}
		// Testing integrity : curIndex should be at the end of the buffer
		if(strictMode&&curIndex!=buffer.byteLength)
			throw new Error('It seems that the buffer contains too much datas.');
	}

// END: Module logic end

	return MIDIFile;

});})(this,typeof define === 'function' && define.amd ?
	// AMD
	define :
	// NodeJS
	(typeof exports === 'object'?function (name, deps, factory) {
		console.log('Node');
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		module.exports=factory.apply(this, deps.map(function(dep){
			return require(dep);
		}));
	}:
	// Global
	function (name, deps, factory) {
		console.log('Global');
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		this.MIDIFile=factory.apply(this, deps.map(function(dep){
			return root[dep.substring(dep.lastIndexOf('/')+1)];
		}));
	}.bind(this)
	)
);
