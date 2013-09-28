// MIDIFile : Read (and soon edit) a MIDI file in a given ArrayBuffer

// AMD + global + NodeJS : You can use this object by inserting a script
// or using an AMD loader (like RequireJS) or using NodeJS
(function(root,define){ define(['./MIDIFileHeader','./MIDIFileTrack','./MIDIEvents'],
	function(MIDIFileHeader,MIDIFileTrack, MIDIEvents) {
// START: Module logic start

	function MIDIFile(buffer, strictMode) {
		// If not buffer given, creating a new MIDI file
		if(!buffer) {
			// Creating the content
			this.header=new MIDIFileHeader();
			this.tracks=[new MIDIFileTrack()];
		// if a buffer is provided, parsing him
		} else {
			if(!(buffer instanceof ArrayBuffer)) {
				throw new Error('Invalid buffer received.');
			}
			// Minimum MIDI file size is a headerChunk size (14bytes)
			// and an empty track (8+3bytes)
			if(buffer.byteLength<25) {
				throw new Error('A buffer of a valid MIDI file must have, at least, a'
					+' size of 25bytes.');
			}
			// Reading header
			this.header=new MIDIFileHeader(buffer, strictMode);
			this.tracks=[];
			var track;
			var curIndex=14;
			// Reading tracks
			for(var i=0, j=this.header.getTracksCount(); i<j; i++) {
				// Testing the buffer length
				if(strictMode&&curIndex>=buffer.byteLength-1) {
					throw new Error('Couldn\'t find datas corresponding to the track #'+i+'.');
				}
				// Creating the track object
				var track=new MIDIFileTrack(buffer, curIndex, strictMode);
				this.tracks.push(track);
				// Updating index to the track end
				curIndex+=track.getTrackLength()+8;
			}
			// Testing integrity : curIndex should be at the end of the buffer
			if(strictMode&&curIndex!=buffer.byteLength) {
				throw new Error('It seems that the buffer contains too much datas.');
			}
		}
	}

	// Events reading helpers
	MIDIFile.prototype.getEvents = function(type, subtype) {
		var events, event, playTime=0, filteredEvents=[],
			format=this.header.getFormat(),
			tickResolution=this.header.getTickResolution();
		// Reading events
		// if the read is sequential
		if(1!==format||1===this.tracks.length) {
			for(var i=0, j=this.tracks.length; i<j; i++) {
				// reset playtime if format is 2
				playTime=(2==format&&playTime?playTime:0);
				events=new MIDIEvents.createParser(this.tracks[i].getTrackContent(),0,false);
				// loooping throught events
				 while(event=events.next()) {
				 	playTime+=(event.delta?(event.delta*tickResolution)/1000:0);
					if(event.type===MIDIEvents.EVENT_META) {
						// tempo change events
						if(event.subtype===MIDIEvents.EVENT_META_SET_TEMPO) {
							tickResolution=this.header.getTickResolution(event.tempo);
						}
					}
					// push the asked events
					if(((!type)||event.type===type)
						&&((!subtype)||(event.subtype&&event.subtype===type))) {
						event.playTime=playTime;
						filteredEvents.push(event);
					}
				}
			}
		// the read is concurrent
		} else {
			var trackParsers=[], smallestDelta=-1, i, j;
			// Creating parsers
			for(i=0, j=this.tracks.length; i<j; i++) {
				trackParsers[i]={};
				trackParsers[i].parser=new MIDIEvents.createParser(
						this.tracks[i].getTrackContent(),0,false);
				trackParsers[i].curEvent=trackParsers[i].parser.next();
			}
			// Filling events
			do {
				smallestDelta=-1;
				// finding the smallest event
				for(i=0, j=trackParsers.length; i<j; i++) {
					if(trackParsers[i].curEvent) {
						if(-1===smallestDelta||trackParsers[i].curEvent.delta
							<trackParsers[smallestDelta].curEvent.delta) {
							smallestDelta=i;
						}
					}
				}
				if(-1!==smallestDelta) {
					// removing the delta of previous events
					for(i=0, j=trackParsers.length; i<j; i++) {
						if(i!==smallestDelta&&trackParsers[i].curEvent) {
							trackParsers[i].curEvent.delta-=trackParsers[smallestDelta].curEvent.delta;
						}
					}
					// filling values
					event=trackParsers[smallestDelta].curEvent;
				 	playTime+=(event.delta?(event.delta*tickResolution)/1000:0);
					if(event.type===MIDIEvents.EVENT_META) {
						// tempo change events
						if(event.subtype===MIDIEvents.EVENT_META_SET_TEMPO) {
							tickResolution=this.header.getTickResolution(event.tempo);
						}
					}
					// push midi events
					if(((!type)||event.type===type)
						&&((!subtype)||(event.subtype&&event.subtype===type))) {
						event.playTime=playTime;
						event.track=smallestDelta;
						filteredEvents.push(event);
					}
					// getting next event
					trackParsers[smallestDelta].curEvent=trackParsers[smallestDelta].parser.next();
				}
			} while(-1!==smallestDelta);
		}
		return filteredEvents;
	};

	MIDIFile.prototype.getMidiEvents = function() {
		return this.getEvents(MIDIEvents.EVENT_MIDI);
	};

	MIDIFile.prototype.getLyrics = function() {
		var events=this.getEvents(MIDIEvents.EVENT_META),
			texts=[], lyrics=[], event, karaoke=-1, format=this.header.getFormat();
		for(var i=0, j=events.length; i<j; i++) {
			event=events[i];
			// Lyrics
			if(event.subtype===MIDIEvents.EVENT_META_LYRICS) {
				lyrics.push(event);
			// Texts
			} else if(event.subtype===MIDIEvents.EVENT_META_TEXT) {
				// Ignore special texts
				if(event.text[0]=='@') {
					if(event.text[1]=='T') {
						//console.log('Title : '+event.text.substring(2));
					} else if(event.text[1]=='I') {
						//console.log('Info : '+event.text.substring(2));
					} else if(event.text[1]=='L') {
						//console.log('Lang : '+event.text.substring(2));
					}
				// karaoke text follows, remove all previous text
				} else if(0===event.text.indexOf('words')) {
					texts.length=0;
					//console.log('Word marker found');
				// Karaoke texts
				} else {
					// If playtime is greater than 0
					if(0!==event.playTime) {
						texts.push(event);
					}
				}
			}
		}
		// Choosing the right lyrics
		if(lyrics.length>2) {
			return lyrics;
		} else if(texts.length) {
			return texts;
		}
		return [];
	};

	// Basic events reading
	MIDIFile.prototype.getTrackEvents = function(index) {
		var event, events=[], parser;
		if(index>this.tracks.length||index<0) {
			throw Error('Invalid track index ('+index+')');
		}
		parser=new MIDIEvents.createParser(
			this.tracks[index].getTrackContent(),0,false);
		event=parser.next();
		do {
			events.push(event);
			event=parser.next();
		} while(event);
		return events;
	};

	// Basic events writting
	MIDIFile.prototype.setTrackEvents = function(index, events) {
		var bufferLength=MIDIEvents.getRequiredBufferLength(events),
			destination;
		if(index>this.tracks.length||index<0) {
			throw Error('Invalid track index ('+index+')');
		}
		if((!events)||(!events.length)) {
			throw Error('A track must contain at least one event, none given.');
		}
	};

	// Remove a track
	MIDIFile.prototype.deleteTrack = function(index) {
		if(index>this.tracks.length||index<0) {
			throw Error('Invalid track index ('+index+')');
		}
		this.tracks.splice(index,1);
		this.header.setTracksCount(this.tracks.length);
	};

	// Add a track
	MIDIFile.prototype.addTrack = function(index) {
		if(index>this.tracks.length||index<0) {
			throw Error('Invalid track index ('+index+')');
		}
		var track = new MIDIFileTrack();
		if(index==this.tracks.length) {
			this.tracks.push(track);
		} else {
			this.tracks.splice(index,0,track);
		}
		this.header.setTracksCount(this.tracks.length);
	};

	// Retrieve the content in a buffer
	MIDIFile.prototype.getContent = function() {
		var bufferLength, destination, origin;
		// Calculating the buffer content
		// - initialize with the header length
		bufferLength=MIDIFileHeader.HEADER_LENGTH;
		// - add tracks length
		for(var i=0, j=this.tracks.length; i<j; i++) {
			bufferLength=this.tracks[i].getTrackLength()+8;
		}
		// Creating the destination buffer
		destination=new Uint8Array(bufferLength);
		// Adding header
		origin=new Uint8Array(this.header.datas.buffer,
			this.header.datas.byteOffset,
			MIDIFileHeader.HEADER_LENGTH);
		for(var i=0, j=MIDIFileHeader.HEADER_LENGTH; i<j; i++) {
			destination[i]=origin[i];
		}
		// Adding tracks
		return destination.buffer;
	};

// END: Module logic end

	return MIDIFile;

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
		this.MIDIFile=factory.apply(this, deps.map(function(dep){
			return root[dep.substring(dep.lastIndexOf('/')+1)];
		}));
	}.bind(this)
	)
);
