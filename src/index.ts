import SimpleBot from "./bots/random-bot";
import { GameSession } from "./game-session";

const ITERATIONS = 10000;

const results = {
	one: 0,
	two: 0,
	draw: 0
}
const now = new Date();
for (let i = 0; i<ITERATIONS; i++) {
	const session = new GameSession(SimpleBot.GetMoveSimple, SimpleBot.GetMoveSimple);
	const res = session.RunGame();
	results[res] ++;
}

console.log(`[Summary] ${ITERATIONS} iterations were made in ${(new Date()).getTime() - now.getTime()}ms, ${results.one / ITERATIONS * 100}% is First bot winrate, ${results.two / ITERATIONS * 100}% is Second bot winrate, ${results.draw / ITERATIONS * 100}% are draws`);