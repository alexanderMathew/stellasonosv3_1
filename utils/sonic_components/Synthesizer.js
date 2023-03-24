import * as Tone from "tone";
import { Constants } from "../data_processing/Constants";
import ls from 'local-storage';

/*
  This class models the synthesizer that plays sound back to the Sound Image. 
*/
class Synthesizer {
  constructor(instrumentId, instrumentName, baseOctave=3, baseNote="C", range=4, soundEffects) {
    this.instrumentId = instrumentId;
    this.baseOctave = baseOctave;
    this.range = range;
    this.soundEffectsInfo = soundEffects;
    this.playerLoaded = false; 
    this.currentNotePlaybackRate = 0; // stores the currently playing note's playback rate.
    this.currentNoteOnEdge = false;  
    this.currentHorizontalRatio = 0.0;

    // Use instrument id to check in the samples catalog to determine what 
    // base note to be used for this instrument, depending on whether the C note
    // exists for this instrument.
    let baseNoteName = baseNote + baseOctave;
    if (instrumentId === Constants.STAR_INSTRUMENT_NAME) {
      // The default note for xylophone is set to be C5.
      baseNoteName = "C5";
    }

    /* Initialize sound effects using the effects params set for the image. */
    this.reverb = new Tone.Reverb(
      this.soundEffectsInfo["reverb"]["params"]
    ); // no toDestination because that will effectively start the reverb
    this.tremolo = new Tone.Tremolo(
      this.soundEffectsInfo["tremolo"]["frequency"], 
      this.soundEffectsInfo["tremolo"]["depth"]
    ).toDestination();
    this.distortion = new Tone.Distortion(this.soundEffectsInfo["distortion"]);
    this.panner = new Tone.Panner(0); // 0 means sound is in the middle, ie. no left or right panning.

    /* Initialize Player */
    this.player = new Tone.Player({
      url : process.env.REACT_APP_FILE_SERVER + "/samples/" + instrumentName + "/" + baseNoteName + ".mp3",
      loop : instrumentName !== Constants.STAR_INSTRUMENT_NAME, // only loop for non-star objects
      loopStart: 0.5, // start of loop, in seconds
      loopEnd: 2.0, // end of loop, in seconds
      onload: () => this.playerLoaded = true
    });
  }

  /* Checks if current synthesizer is for star objects. */
  isStar() {
    return this.instrumentId === Constants.STAR_INSTRUMENT_NAME;
  }

  /* Checks if current synthesizer is for the background. */
  isBackground() {
    return this.instrumentId === Constants.BACKGROUND_INSTRUMENT_NAME;
  }
  
  /* 
   * The input is a dictionary of features of the current object that wants to play this synth.
   * These features in turn determine certain sound features of the synth note. 
   */ 
  startPlayer(currObjectFeatures) {
    const avgPixel = currObjectFeatures["avgPixel"];
    const distance = currObjectFeatures["distance"];
    const onEdge = currObjectFeatures["onEdge"];
    const horizontalRatio = currObjectFeatures["horizontalRatio"];
    this.currentHorizontalRatio = horizontalRatio;
    if (this.playerLoaded && this.player.state === 'stopped') {
      if (this.isStar()) {
        this.player.volume.value = -5;
      } else if (this.isBackground()) {
        this.player.volume.value = -5;
      } else {
        this.player.volume.value = this.getVolumeFromDistance(distance);
      }
      if (onEdge) {
        this.currentNoteOnEdge = true;
        // Pitch shift effect; currently changing the note's playback rate directly
        // without using the actual picth shifter, because pitch shifter sounds worse.
        if (this.soundEffectsInfo["pitchShift"]["on"]) {
          this.player.playbackRate = this.getEdgePlaybackRateFromPixelValue(avgPixel); 
        }
        // Distortion effect
        if (this.soundEffectsInfo["distort"]["on"]) {
          this.distortion.toDestination();
          this.player.connect(this.distortion);
        }     
      } else {
        this.currentNoteOnEdge = false;
        this.player.playbackRate = this.getPlaybackRateFromPixelValue(avgPixel);
        // Connect player to effects according to effects config. 
        if (this.soundEffectsInfo["reverb"]["on"]) {
          this.reverb.toDestination();
          this.player.connect(this.reverb);
        }
        if (this.soundEffectsInfo["tremolo"]["on"]) {
          this.tremolo.start();
          this.player.connect(this.tremolo);
        }
      }
      this.panner.pan.setValueAtTime(horizontalRatio, 0.25);
      this.panner.toDestination();
      this.player.connect(this.panner);
      
      this.player.toDestination();
      this.currentNotePlaybackRate = this.player.playbackRate;
      this.player.start();
    }
  }

  stopPlayer() {
    if (this.player.state === 'started') {
      this.currentNotePlaybackRate = 0;
      this.currentNoteOnEdge = false;
      this.currentHorizontalRatio = 0.0;
      this.disconnectAllEffects();
      this.player.stop();
    }
  }

  disconnectAllEffects() {
    this.reverb.disconnect();
    this.tremolo.stop();
    this.distortion.disconnect();
  }

  /* 
   * Checks if the note denoted by the passed in synth info passed in has the same properties
   * as the current note being played. 
   */ 
  isSameNote(currObjectFeatures) {
    let avgPixel = currObjectFeatures["avgPixel"];
    let onEdge = currObjectFeatures["onEdge"];
    let newPlaybackRate = this.getPlaybackRateFromPixelValue(avgPixel);
    const newHorizontalRatio = currObjectFeatures["horizontalRatio"];
    // If the curzor's horizontal ratio relative to the entire image has changed a lot,
    // stop the previously playing note and start a new one with the corresponding panning effect.
    return newPlaybackRate === this.currentNotePlaybackRate && onEdge === this.currentNoteOnEdge
      && Math.abs(newHorizontalRatio - this.currentHorizontalRatio) <= 0.3;
  }

  /* Calculate volume value based on the passed in distance. */
  getVolumeFromDistance(distance) {
    // The greater the distance, the smaller the inverse distance, the quieter the note should be.
    const cursorSize = ls.get("cursor-size") || Constants.CURSOR_NEIGHBOR_BOX_SIZE;
    const inverseDistance = (cursorSize * 2) - distance; 
    // The subtraction in the end is necessary because the middle of the volume range should be 0,
    // so the entire volume range is [-RANGE/2 , +RANGE/2]
    const noteVolume = inverseDistance / (cursorSize * 2) * Constants.VOLUME_RANGE - Constants.VOLUME_RANGE / 2;
    return Math.floor(noteVolume);
  }

  /* 
   * Determine what percent of the input pixle value is compared to the overall 0-255 scale,
   * then convert this scale into a playback rate that corresponds to a note pitch. 
   * Only play up to a fifth above the base note. Anything higher sounds distorted.
   * Returns the value as the playback rate for the Player object. 
   */
  getPlaybackRateFromPixelValue(avgPixel) {
    const totalNumberOfNotes = 5;
    const scale = Math.ceil(avgPixel / 255 * totalNumberOfNotes); 
    switch (scale) {
      case 1: return Constants.PlAYBACK_RATE_UNISON;
      case 2: return Constants.PlAYBACK_RATE_MAJOR_SECOND;
      case 3: return Constants.PlAYBACK_RATE_MAJOR_THIRD;
      case 4: return Constants.PlAYBACK_RATE_PERFECT_FOURTH;
      case 5: return Constants.PlAYBACK_RATE_PERFECT_FIFTH;
    }
  }

  /* 
   * Return the playback rate that is half a step above the major scale notes.
   */
  getEdgePlaybackRateFromPixelValue(avgPixel) {
    const totalNumberOfNotes = 5;
    const scale = Math.ceil(avgPixel / 255 * totalNumberOfNotes); 
    switch (scale) {
      case 1: return Constants.PlAYBACK_RATE_MINOR_SECOND;
      case 2: return Constants.PlAYBACK_RATE_MINOR_THIRD;
      case 3: return Constants.PlAYBACK_RATE_PERFECT_FOURTH;
      case 4: return Constants.PlAYBACK_RATE_TRITONE;
      case 5: return Constants.PlAYBACK_RATE_MINOR_SIXTH; 
    }
  }
}

export default Synthesizer;
