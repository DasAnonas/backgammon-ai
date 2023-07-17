import SimpleBot from "./bots/random-bot";
import { GameSession } from "./game-session";

const ITERATIONS = 100;

const results = {
	firstWin: 0,
	secondWin: 0,
	draw: 0
}
for (let i = 0; i<ITERATIONS; i++) {
	const session = new GameSession(SimpleBot.GetMoveSimple, SimpleBot.GetMoveSimple);
	const res = session.RunGame();
	results[res] ++;
}
console.log(`[Summary] ${ITERATIONS} iterations made, ${results.firstWin / ITERATIONS * 100} % is first bot winrate, ${results.secondWin / ITERATIONS * 100} % is second bot winrate`);

