import { Constants } from "../data_processing/Constants";

/**
 * Wrapper class for features related to haptic response on the sound image page.
 */
class Haptic {
	constructor(soundEffects) {
	  this.soundEffects = soundEffects; // dictionary from config file that is { soundFeatureName : params, ... }
	  this.hapticIntervalId = null;
	}

	start(imageLayerType) {
		let pattern; 
		if (imageLayerType === Constants.IMAGE_TYPE_COMPOSITE_ONLY) {
			pattern = this.soundEffects["haptic"]["default"];
		} else {
			pattern = this.soundEffects["haptic"][imageLayerType];
		}

		if (pattern.length === 0 || !Constants.CREATE_HAPTIC_RESPONSE_FLAG) {
			this.stop(); 
			return;
		}
		// If there is already an interval in progress, return early
		// so that the current interval keeps looping. 
		if (this.hapticIntervalId) {
			return; 
		}

		// Add up all the numbers in the "pattern" array to calculate how many milliseconds
		// in total the pattern lasts, and use this sum to then calculate the length of the 
		// delay interval in between each round of haptic response. Add 200ms buffer in between.
		const delayIntervalMs = pattern.reduce((partialSum, a) => partialSum + a, 0)+ 200;
		// Continuously trigger haptic response until the current note is stopped.
		this.hapticIntervalId = setInterval(function() {
			window.navigator.vibrate(pattern); 
		}, delayIntervalMs);
	}

	async stop() {
		if (!this.hapticIntervalId) {
			return; 
		}
		clearInterval(this.hapticIntervalId);
		this.hapticIntervalId = null;
		window.navigator.vibrate(0);
	}
}

export default Haptic; 
