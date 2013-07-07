// MIDIFileTrack : Read (and soon edit) a MIDI track chunk in a given ArrayBuffer

// AMD + global : You can use this object by inserting a script
// or using an AMD loader (like RequireJS)
(function(root,define){ define([], function() {

	function MIDIFileTrack(buffer, start, strictMode) {
		if(!(buffer instanceof ArrayBuffer))
				throw Error('Invalid buffer received.');
		// Buffer length must size at least like an  empty track (8+3bytes)
		if(buffer.byteLength-start<11)
			throw Error('Invalid MIDIFileTrack (0x'+start.toString(16)+') :'
				+' Buffer length must size at least 11bytes');
		// Creating a temporary view to read the track header
		this.datas=new DataView(buffer,start,8);
		// Reading MIDI track header chunk
		if(!('M'===String.fromCharCode(this.datas.getUint8(0))
			&&'T'===String.fromCharCode(this.datas.getUint8(1))
			&&'r'===String.fromCharCode(this.datas.getUint8(2))
			&&'k'===String.fromCharCode(this.datas.getUint8(3))))
			throw Error('Invalid MIDIFileTrack (0x'+start.toString(16)+') :'
				+' MTrk prefix not found');
		// Reading the track length
		var trackLength=this.getTrackLength();
		if(buffer.byteLength-start<trackLength)
			throw Error('Invalid MIDIFileTrack (0x'+start.toString(16)+') :'
				+' The track size exceed the buffer length.');
		// Creating the final DataView
		this.datas=new DataView(buffer,start,8+trackLength);
		// Trying to find the end of track event
		if(!(0xFF===this.datas.getUint8(8+trackLength-3)
			&&0x2F===this.datas.getUint8(8+trackLength-2)
			&&0x00===this.datas.getUint8(8+trackLength-1)))
				throw Error('Invalid MIDIFileTrack (0x'+start.toString(16)+') :'
				+' No track end event found at the expected index'
				+' ('+(8+trackLength-1).toString(16)+').');
	}

	// Track length
	MIDIFileTrack.prototype.getTrackLength=function() {
		return this.datas.getUint32(4);
	};

	MIDIFileTrack.prototype.setTrackLength=function(trackLength) {
		return this.datas.setUint32(trackLength);
	};

	// Track events buffer
	MIDIFileTrack.prototype.getTrackEvents=function() {
		return new DataView(this.datas.buffer,this.datas.byteOffset+8,this.datas.byteLength-8);
	};

	return MIDIFileTrack;


});})(this,typeof define === 'function' && define.amd ?
	// AMD
	define :
	// NodeJS
	(typeof exports === 'object'?function (name, deps, factory) {
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
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		this.MIDIFileTrack=factory.apply(this, deps.map(function(dep){
			return root[dep.substring(dep.lastIndexOf('/')+1)];
		}));
	}.bind(this)
	)
);
