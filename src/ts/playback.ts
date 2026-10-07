export const SPEEDS = [0.5, 1, 2, 4] as const;

export type Speed = (typeof SPEEDS)[number];

export type Playback = {
	day: number;
	length: number;
	playing: boolean;
	speed: Speed;
};

export function createPlayback(length: number): Playback {
	return { day: 0, length, playing: false, speed: 1 };
}

export function frameMs(speed: Speed): number {
	return 1000 / speed;
}

export function parseSpeed(value: string): Speed | undefined {
	const speed = Number(value);
	return SPEEDS.find((item) => item === speed);
}

export function canStepBack(playback: Playback): boolean {
	return playback.day > 0;
}

export function canStepForward(playback: Playback): boolean {
	return playback.day < playback.length;
}

export function stepBack(playback: Playback): Playback {
	return { ...playback, playing: false, day: Math.max(0, playback.day - 1) };
}

export function stepForward(playback: Playback): Playback {
	return {
		...playback,
		playing: false,
		day: Math.min(playback.length, playback.day + 1),
	};
}

export function goToDay(playback: Playback, day: number): Playback {
	const clamped = Math.min(playback.length, Math.max(0, Math.trunc(day)));
	return { ...playback, playing: false, day: clamped };
}

export function resetPlayback(playback: Playback): Playback {
	return { ...playback, playing: false, day: 0 };
}

export function togglePlay(playback: Playback): Playback {
	if (playback.playing) {
		return { ...playback, playing: false };
	}
	if (!canStepForward(playback)) {
		return playback;
	}
	return { ...playback, playing: true };
}

export function tick(playback: Playback): Playback {
	if (!playback.playing || !canStepForward(playback)) {
		return { ...playback, playing: false };
	}
	const day = playback.day + 1;
	return { ...playback, day, playing: day < playback.length };
}

export function replaceSpeed(playback: Playback, speed: Speed): Playback {
	return { ...playback, speed };
}

export function replaceLength(playback: Playback, length: number): Playback {
	return { day: 0, length, playing: false, speed: playback.speed };
}
