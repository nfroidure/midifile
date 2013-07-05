// MidiFile : Read (and soon edit) a midi file in a given ArrayBuffer

// AMD + global : You can use this object by inserting a script
// or using an AMD loader (like RequireJS)
(function(root,define){ define(['./MidiFileHeader','./MidiFileTrack','./MidiEvents'],
	function(MidiFileHeader,MidiFileTrack, MidiEvents) {

	function MidiFile(buffer, strictMode) {
		if(!(buffer instanceof ArrayBuffer))
			throw new Error('Invalid buffer received.');
		// Minimum Midi file size is a headerChunk size (14bytes)
		// and an empty track (8+3bytes)
		if(buffer.byteLength<25)
			throw new Error('A buffer of a valid Midi file must have size at least'
				+' 25bytes.');
		// Reading header
		this.header=new MidiFileHeader(buffer, strictMode);
		this.tracks=[];
		var track;
		var curIndex=14;
		// Reading tracks
		for(var i=0, j=this.header.getTracksCount(); i<j; i++) {
			// Testing the buffer length
			if(strictMode&&curIndex>=buffer.byteLength-1)
				throw new Error('Couldn\'t find datas corresponding to the track #'+i+'.');
			// Creating the track object
			var track=new MidiFileTrack(buffer, curIndex, strictMode);
			this.tracks.push(track);
			// Updating index to the track end
			curIndex+=track.getTrackLength()+8;
		}
		// Testing integrity : curIndex should be at the end of the buffer
		if(strictMode&&curIndex!=buffer.byteLength)
			throw new Error('It seems that the buffer contains too much datas.');
	}

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
