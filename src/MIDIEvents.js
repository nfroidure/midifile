// MIDIEvents : Read (and soon edit) events from various sources (ArrayBuffer, Stream)

// AMD + global + NodeJS : You can use this object by inserting a script
// or using an AMD loader (like RequireJS) or using NodeJS
(function(root,define){ define([], function() {
// START: Module logic start

	function MIDIEvents() {
		throw new Error('MIDIEvents function not intended to be run.');
	}

	// Static constants
	// Event types
	MIDIEvents.EVENT_META=0xFF;
	MIDIEvents.EVENT_SYSEX=0xF0;
	MIDIEvents.EVENT_DIVSYSEX=0xF7;
	MIDIEvents.EVENT_MIDI=0x8;
	// Meta event types
	MIDIEvents.EVENT_META_SEQUENCE_NUMBER=0x00,
	MIDIEvents.EVENT_META_TEXT=0x01,
	MIDIEvents.EVENT_META_COPYRIGHT_NOTICE=0x02,
	MIDIEvents.EVENT_META_TRACK_NAME=0x03,
	MIDIEvents.EVENT_META_INSTRUMENT_NAME=0x04,
	MIDIEvents.EVENT_META_LYRICS=0x05,
	MIDIEvents.EVENT_META_MARKER=0x06,
	MIDIEvents.EVENT_META_CUE_POINT=0x07,
	MIDIEvents.EVENT_META_MIDI_CHANNEL_PREFIX=0x20,
	MIDIEvents.EVENT_META_END_OF_TRACK=0x2F,
	MIDIEvents.EVENT_META_SET_TEMPO=0x51,
	MIDIEvents.EVENT_META_SMTPE_OFFSET=0x54,
	MIDIEvents.EVENT_META_TIME_SIGNATURE=0x58,
	MIDIEvents.EVENT_META_KEY_SIGNATURE=0x59,
	MIDIEvents.EVENT_META_SEQUENCER_SPECIFIC=0x7F;
	// MIDI event types
	MIDIEvents.EVENT_MIDI_NOTE_OFF=0x8,
	MIDIEvents.EVENT_MIDI_NOTE_ON=0x9,
	MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH=0xA,
	MIDIEvents.EVENT_MIDI_CONTROLLER=0xB,
	MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE=0xC,
	MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH=0xD,
	MIDIEvents.EVENT_MIDI_PITCH_BEND=0xE;
	// MIDI event sizes
	MIDIEvents.MIDI_1PARAM_EVENTS=[
		MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE,
		MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH
	];
	MIDIEvents.MIDI_2PARAMS_EVENTS=[
		MIDIEvents.EVENT_MIDI_NOTE_OFF,
		MIDIEvents.EVENT_MIDI_NOTE_ON,
		MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH,
		MIDIEvents.EVENT_MIDI_CONTROLLER,
		MIDIEvents.EVENT_MIDI_PITCH_BEND
	];

	// Create an event stream parser
	MIDIEvents.createParser=function(stream, startAt, strictMode) {
		// Wrap DataView into a data stream
		if(stream instanceof DataView) {
			stream={
				'position':startAt||0,
				'buffer':stream,
				'readUint8':function() {
					return this.buffer.getUint8(this.position++);
				},
				'readUint16':function() {
					var v=this.buffer.getUint16(this.position);
					this.position=this.position+2;
					return v;
				},
				'readUint32':function() {
					var v=this.buffer.getUint16(this.position);
					this.position=this.position+2;
					return v;
				},
				'readVarInt':function() {
					var v=0, i=0;
					while(i++<4) {
						var b=this.readUint8();
						if (b&0x80) {
							v+=(b&0x7f);
							v<<=7;
						} else {
							return v+b;
						}
					}
					throw new Error('0x'+this.position.toString(16)+': Variable integer'
						+' length cannot exceed 4 bytes');
				},
				'readText':function(l) {
					var chars=[];
					for(l; l>0; l--) {
						chars.push(String.fromCharCode(this.readUint8()));
					}
					return chars.join('');
				},
				'readBytes':function(l) {
					var bytes=[];
					for(l; l>0; l--) {
						bytes.push(this.readUint8());
					}
					return bytes;
				},
				'pos':function() {
					return '0x'+(this.buffer.byteOffset+this.position).toString(16);
				},
				'end':function(l) {
					return this.position===this.buffer.byteLength;
				}
			}
			startAt=0;
		}
		// Consume stream till not at start index
		if(startAt>0) {
			while(startAt--)
				stream.readUint8();
		}
		// Private vars
		// Common vars
		var deltaTime, eventTypeByte, lastEventTypeByte, event,
		// MIDI events vars
			MIDIEventType, MIDIEventChannel, MIDIEventParam1, MIDIEventParam2;
		// creating the parser object
		return {
			// Read the next event
			'next':function() {
				// Check available datas
				if(stream.end())
					return null;
				// Creating the event
				event={
					// Memoize the event index
					'index':stream.pos(),
					// Read the delta time
					'delta':stream.readVarInt()
				};
				// Read the eventTypeByte
				eventTypeByte=stream.readUint8();
				if((eventTypeByte&0xF0) == 0xF0) {
					// Meta events
					if(eventTypeByte==MIDIEvents.EVENT_META) {
						event.type=MIDIEvents.EVENT_META;
						event.subtype=stream.readUint8();
						event.length=stream.readVarInt();
						switch(event.subtype) {
							case MIDIEvents.EVENT_META_SEQUENCE_NUMBER:
								if(strictMode&&2!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								event.msb=stream.readUint8();
								event.lsb=stream.readUint8();
								return event;
								break;
							case MIDIEvents.EVENT_META_TEXT:
							case MIDIEvents.EVENT_META_COPYRIGHT_NOTICE:
							case MIDIEvents.EVENT_META_TRACK_NAME:
							case MIDIEvents.EVENT_META_INSTRUMENT_NAME:
							case MIDIEvents.EVENT_META_LYRICS:
							case MIDIEvents.EVENT_META_MARKER:
							case MIDIEvents.EVENT_META_CUE_POINT:
								event.text=stream.readText(event.length);
								return event;
								break;
							case MIDIEvents.EVENT_META_MIDI_CHANNEL_PREFIX:
								if(strictMode&&1!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								event.prefix=stream.readUint8();
								return event;
								break;
							case MIDIEvents.EVENT_META_END_OF_TRACK:
								if(strictMode&&0!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								return event;
								break;
							case MIDIEvents.EVENT_META_SET_TEMPO:
								if(strictMode&&3!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								event.v1=stream.readUint8();
								event.v2=stream.readUint8();
								event.v3=stream.readUint8();
								event.tempo=((event.v1 << 16)
									+ (event.v2 << 8)
									+ event.v3);
								event.tempoBPM=60000000/event.tempo;
								return event;
								break;
							case MIDIEvents.EVENT_META_SMTPE_OFFSET:
								if(strictMode&&5!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								event.hour=stream.readUint8();
								if(strictMode&&event.hour>23)
									throw new Error(stream.pos()+' Value must be part of 0-23.');
								event.minutes=stream.readUint8();
								if(strictMode&&event.minutes>59)
									throw new Error(stream.pos()+' Value must be part of 0-59.');
								event.seconds=stream.readUint8();
								if(strictMode&&event.seconds>59)
									throw new Error(stream.pos()+' Value must be part of 0-59.');
								event.frames=stream.readUint8();
								if(strictMode&&event.frames>30)
									throw new Error(stream.pos()+' Value must be part of 0-30.');
								event.subframes=stream.readUint8();
								if(strictMode&&event.subframes>99)
									throw new Error(stream.pos()+' Value must be part of 0-99.');
								return event;
								break;
							 // Not implemented
							case MIDIEvents.EVENT_META_TIME_SIGNATURE:
								if(strictMode&&4!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								stream.readBytes(event.length);
								return event;
								break;
							case MIDIEvents.EVENT_META_KEY_SIGNATURE:
								if(strictMode&&2!==event.length)
									throw new Error(stream.pos()+' Bad metaevent length.');
								stream.readBytes(event.length);
								return event;
								break;
							case MIDIEvents.EVENT_META_SEQUENCER_SPECIFIC:
								event.data=stream.readBytes(event.length);
								return event;
								break;
							default:
								if(strictMode)
									throw new Error(stream.pos()+' Unknown meta event type '
										+'('+event.subtype.toString(16)+').');
								event.data=stream.readBytes(event.length);
								return event;
								break;
						}
					// System events
					} else if(eventTypeByte==MIDIEvents.EVENT_SYSEX
							||eventTypeByte==MIDIEvents.EVENT_DIVSYSEX) {
						event.type=eventTypeByte;
						event.length=stream.readVarInt();
						event.data=stream.readBytes(event.length);
						return event;
					// Unknown event, assuming it's system like event
					} else {
						if(strictMode)
							throw new Error(stream.pos()+' Unknown event type '
								+eventTypeByte.toString(16)+', Delta: '+event.delta+'.');
						event.type=eventTypeByte;
						event.badsubtype=stream.readVarInt();
						event.length=stream.readUint8();
						event.data=stream.readBytes(event.length);
						return event;
					}
				// MIDI events
				} else {
					// running status
					if((eventTypeByte&0x80)==0) {
						if(!(MIDIEventType))
							throw new Error(stream.pos()+' Running status without previous event');
						MIDIEventParam1=eventTypeByte;
					} else {
						MIDIEventType=eventTypeByte>>4;
						MIDIEventChannel=eventTypeByte&0x0F;
						MIDIEventParam1=stream.readUint8();
					}
					event.type=MIDIEvents.EVENT_MIDI;
					event.subtype=MIDIEventType;
					event.channel=MIDIEventChannel;
					event.param1=MIDIEventParam1;
					switch(MIDIEventType) {
						case MIDIEvents.EVENT_MIDI_NOTE_OFF:
							event.param2=stream.readUint8();
							return event;
							break;
						case MIDIEvents.EVENT_MIDI_NOTE_ON:
							// Could check velocity 0 to switch to off but loosing informations
							var velocity=stream.readUint8();
							if(!velocity) {
								event.subtype=MIDIEvents.EVENT_MIDI_NOTE_OFF;
								event.param2=127; // Find a standard telling what to do here
							} else {
								event.param2=velocity;
							}
							return event;
							break;
						case MIDIEvents.EVENT_MIDI_NOTE_AFTERTOUCH:
							event.param2=stream.readUint8();
							return event;
							break;
						case MIDIEvents.EVENT_MIDI_CONTROLLER:
							event.param2=stream.readUint8();
							return event;
							break;
						case MIDIEvents.EVENT_MIDI_PROGRAM_CHANGE:
							return event;
							break;
						case MIDIEvents.EVENT_MIDI_CHANNEL_AFTERTOUCH:
							return event;
							break;
						case MIDIEvents.EVENT_MIDI_PITCH_BEND:
							event.param2=stream.readUint8();
							return event;
							break;
						default:
							if(strictMode)
								throw new Error(stream.pos()+' Unknown MIDI event type '
									+'('+MIDIEventType.toString(16)+').');
							return event;
							break;
					}
				}
			}
		};
	};

	// Return the buffer length needed to encode the given events
	MIDIEvents.getRequiredBufferLength=function(events) {
		var bufferLength=0, event;
		// Calculating the track size by adding events lengths
		for(var i=0, j=events.length; i<j; i++) {
			// Computing necessary bytes to encode the delta value
			bufferLength+=
					(events[i].delta>>>21?4:
					(events[i].delta>>>14?3:
					(events[i].delta>>>7?2:1)));
			// MIDI Events have various fixed lengths
			if(events[i].type===MIDIEvents.EVENT_MIDI) {
				// Adding a byte for subtype + channel
				bufferLength++;
				// Adding a byte for the first params
				bufferLength++;
				// Adding a byte for the optionnal second param
				if(-1!==MIDIEvents.MIDI_2PARAMS_EVENTS.indexOf(events[i].subtype)) {
					bufferLength++;
				}
			// META / SYSEX events lengths are self defined
			} else {
				// Adding a byte for the event type
				bufferLength++;
				// Adding a byte for META events subtype
				if(events[i].type===MIDIEvents.EVENT_META) {
					bufferLength++;
				}
				// Adding necessary bytes to encode the length
				bufferLength+=
					(events[i].length>>>21?4:
					(events[i].length>>>14?3:
					(events[i].length>>>7?2:1)));
				// Adding bytes corresponding to the event length
				bufferLength+=events[i].length;
			}
		}
		return bufferLength;
	};

// END: Module logic end

	return MIDIEvents;

});})(this,typeof define === 'function' && define.amd ?
	// AMD
	define :
	// NodeJS
	(typeof exports === 'object'?function (name, deps, factory) {
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		module.exports=factory.apply(this, deps.map(function(dep) {
			return require(dep);
		}));
	}:
	// Global
	function (name, deps, factory) {
		var root=this;
		if(typeof name === 'object') {
			factory=deps; deps=name;
		}
		this.MIDIEvents=factory.apply(this, deps.map(function(dep) {
			return root[dep.substring(dep.lastIndexOf('/')+1)];
		}));
	}.bind(this)
	)
);
