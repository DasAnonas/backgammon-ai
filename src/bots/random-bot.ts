
class SimpleBot {

	private static GetRandomIndex(len: number): number {
		return Math.floor(Math.random() * len);
	}
	
	static GetMoveSimple(myboard: number[], opponentBoard: number[], moves: { [key: number]: number[] }): [number, number]  {
		const keys = Object.keys(moves);
		if (keys.length === 0) 
			throw new Error('No possible moves');
		let index = SimpleBot.GetRandomIndex(keys.length);
		const from = Number(keys[index]);
		index = SimpleBot.GetRandomIndex(moves[from].length)
		const to = moves[from][index]
		return [from, to];
	}
}

export default SimpleBot