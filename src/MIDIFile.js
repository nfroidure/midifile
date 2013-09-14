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
				events=new MIDIEvents.createParser(this.tracks[i].getTrackEvents(),0,false);
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
						this.tracks[i].getTrackEvents(),0,false);
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
