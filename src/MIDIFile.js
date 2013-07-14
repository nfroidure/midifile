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

	MIDIFile.prototype.getMidiEvents = function() {
		// Reading events
		var events, event, tempo=500, playTime=0, midiEvents=[],
			format=this.header.getFormat(),
			tickResolution=this.header.getTickResolution();
		for(var i=0, j=this.tracks.length; i<j; i++) {
			// reset playtime if format is 2
			playTime=(2==format&&playTime?playTime:0);
			events=new MIDIEvents.createParser(this.tracks[i].getTrackEvents(),0,false);
			// loooping throught events
			 while(event=events.next()) {
			 	playTime+=(event.delta?event.delta*tickResolution:0);
				if(event.type===MIDIEvents.EVENT_META) {
					// tempo change events
					if(event.subtype===MIDIEvents.EVENT_META_SET_TEMPO) {
						tickResolution=this.header.getTickResolution(event.tempo);
					}
				// push midi events
				} else if(event.type===MIDIEvents.EVENT_MIDI) {
					event.playTime=playTime;
					midiEvents.push(event);
				}
			}
		}
		midiEvents.sort(function(a,b) {
			return (a.playTime<b.playTime?-1:(a.playTime>b.playTime?1:
				(a.index<b.index?-1:(a.index>b.index?1:0))));
		});
		return midiEvents;
	}

	MIDIFile.prototype.getLyrics = function() {
		// Reading events
		var events, event, tempo=500, playTime=0,
			format=this.header.getFormat(),
			tickResolution=this.header.getTickResolution(),
			karaoke=-1, texts=[], lyrics=[];
		for(var i=0, j=this.tracks.length; i<j; i++) {
			// reset playtime if format is 2
			playTime=(2==format&&playTime?playTime:0);
			events=new MIDIEvents.createParser(this.tracks[i].getTrackEvents(),0,false);
			// loooping throught events
			 while(event=events.next()) {
			 	playTime+=(event.delta?event.delta*tickResolution:0);
				if(event.type===MIDIEvents.EVENT_META) {
					// tempo change events
					if(event.subtype===MIDIEvents.EVENT_META_SET_TEMPO) {
						tickResolution=this.header.getTickResolution(event.tempo);
					// lyrics
					} else if(event.subtype===MIDIEvents.EVENT_META_LYRICS) {
							event.playTime=playTime;
							lyrics.push(event);
					} else if(event.subtype===MIDIEvents.EVENT_META_TEXT) {
						// karaoke detection
						if(i<karaoke+2&&karaoke>0&&event.text) {
							// KAR file
							// Special text
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
							} else {
								event.playTime=playTime;
								texts.push(event);
							}
						} else if(1==format&&event.text&&i<3&&0===event.text.indexOf('@K')) {
							karaoke=i;
							//console.log('Karaoke. Track: '+karaoke)
						}
					}
				}
			}
		}
		if(lyrics.length) {
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
