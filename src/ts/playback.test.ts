import { expect, test } from "vitest";
import {
	createPlayback,
	frameMs,
	goToDay,
	replaceLength,
	stepBack,
	stepForward,
	tick,
	togglePlay,
} from "./playback";

test("starts before the first day", () => {
	expect(createPlayback(16)).toEqual({ day: 0, length: 16, playing: false, speed: 1 });
});

test("steps pause playback and stay inside the timeline", () => {
	const playing = { ...createPlayback(2), day: 1, playing: true };
	expect(stepForward(playing)).toMatchObject({ day: 2, playing: false });
	expect(stepForward(stepForward(playing)).day).toBe(2);
	expect(stepBack(playing)).toMatchObject({ day: 0, playing: false });
	expect(stepBack(createPlayback(2)).day).toBe(0);
});

test("play advances one day per tick and stops on the last day", () => {
	const started = togglePlay(createPlayback(2));
	expect(started.playing).toBe(true);
	const first = tick(started);
	expect(first).toMatchObject({ day: 1, playing: true });
	const last = tick(first);
	expect(last).toMatchObject({ day: 2, playing: false });
	expect(tick(last)).toMatchObject({ day: 2, playing: false });
	expect(togglePlay(last).playing).toBe(false);
});

test("a new sample returns to day 0 and keeps the speed", () => {
	const playback = { ...createPlayback(16), day: 4, playing: true, speed: 4 as const };
	expect(replaceLength(playback, 14)).toEqual({
		day: 0,
		length: 14,
		playing: false,
		speed: 4,
	});
});

test("jumping to a day pauses playback", () => {
	const playing = { ...createPlayback(16), day: 4, playing: true, speed: 2 as const };
	expect(goToDay(playing, 2)).toEqual({ day: 2, length: 16, playing: false, speed: 2 });
	expect(goToDay(playing, -3).day).toBe(0);
	expect(goToDay(playing, 40).day).toBe(16);
});

test("1× waits one second", () => {
	expect(frameMs(1)).toBe(1000);
	expect(frameMs(4)).toBe(250);
	expect(frameMs(0.5)).toBe(2000);
});
