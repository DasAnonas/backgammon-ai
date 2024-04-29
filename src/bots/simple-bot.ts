type PointsFunction = (oldBoard: number[], newBoard: number[], opponentBoard: number[]) => number;

class SimpleBot {

	private static FromHead: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		if (oldBoard[0] > newBoard[0])
			return 1
		return 0;
	}

	private static TakeEmptyField: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		const counter = (pr: number, c: number) => c > 0 ? pr + 1 : pr
		const oldCount = oldBoard.reduce(counter);
		const newCount = newBoard.reduce(counter);
		if (oldCount === newCount)
			return 0;
		if (oldCount > newCount)
			return -3;
		return 3;
	}

	private static GoOut: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		const counter = (acc: number, c: number) => acc + c;
		const oldCount = oldBoard.reduce(counter);
		const newCount = newBoard.reduce(counter);
		if (newCount < oldCount)
			return 8;
		return 0;
	}

	private static MakeRow: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		if (SimpleBot.GoOut(oldBoard, newBoard, opponentBoard) > 0)
			return 0;
		const CountRows = function(brd: number[]) {
			const fields = [];
			let acc = 0;
			brd.forEach(v => {
				if (v === 0 && acc > 0) {
					fields.push(acc);
					acc = 0;
				}
				if (v > 0)
					acc++;
			})
			if (acc > 0)
				fields.push(acc);
			fields.sort((a, b) => b - a);
			return fields;
		};
		const rowsOld = CountRows(oldBoard);
		const rowsNew = CountRows(newBoard);
		for (let i=0; i<rowsNew.length; i++) {
			if (rowsOld.length <= i)
				return 4;
			if (rowsNew[i] > rowsOld[i])
				return 4
			if (rowsNew[i] < rowsOld[i])
				return 0;
		}
		return 0;
	}

	private static GetRandomIndex(len: number): number {
		return Math.floor(Math.random() * len);
	}

	static GetNewBoard(board: number[], from: number, to: number): number[] {
		const copy = [...board]
		if (from < 24)
			copy[from] = copy[from] > 0 ? (copy[from] -= 1) : 0;
		if (to < 24) 
			copy[to] += 1;
		return copy;
	}

	private static NotToFarAlone: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		let currInd = 0;
		for (let i = 23; i > 12; i--) {
			if (newBoard[i] === oldBoard[i] || newBoard[i] <= 0)
				continue;
			if (newBoard[i] > 0) {
				if ((currInd !== 0) && (i + 6 < currInd)) {
					return -5
				}
				currInd = i;
			}
		}
		return currInd > 18 ? -5 : 0;
	}

	private static NoOpponentBlock: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		const transformId = (id: number) => { return id < 12 ? id + 12 : id - 12; };
		let block = 0;
		for (let i = 0; i < opponentBoard.length; i++) {
			if (block <= 3 && opponentBoard[i] === 0) {
				block = 0;
				continue;
			}
			if (opponentBoard[i] > 0) {
				block++;
				continue;
			}
			let newId = transformId(i);
			if (oldBoard[newId] === 0 && newBoard[newId] > 0)
				return 5;
			newId = transformId(i + 1);
			if ( i+1 <= 23 && oldBoard[newId] === 0 && newBoard[newId] > 0)
				return 5;
			newId = transformId(i - block - 1);
			if (oldBoard[newId] === 0 && newBoard[newId] > 0)
				return 3;
			block = 0;
		}
		return 0;
	}

	private static CountPoints: PointsFunction = (oldBoard, newBoard, opponentBoard) => {
		const funcs = [
			SimpleBot.FromHead,
			SimpleBot.TakeEmptyField,
			SimpleBot.GoOut,
			SimpleBot.MakeRow,
			SimpleBot.NotToFarAlone,
			SimpleBot.NoOpponentBlock
		]
		return funcs.reduce((ac, f) => ac + f(oldBoard, newBoard, opponentBoard), 0);
	}

	static GetMove(myboard: number[], opponentBoard: number[], moves: { [key: number]: number[] }): [number, number]  {
		const combinations = [];
		
		for (let from in moves) {
			for (let mvs of moves[from]) {
				const move = [Number(from), mvs];
				const newboard = SimpleBot.GetNewBoard(myboard, move[0], move[1]);
				const combo = {
					move: move,
					points: SimpleBot.CountPoints(myboard, newboard, opponentBoard),
					length: move[1] - move[0],
					random: Math.random()
				};
				combinations.push(combo);
			}
		}
		let max = combinations[0];
		if (!max)
			throw new Error("No moves");
		combinations.forEach(c => {
			// if (c.points > max.points || (c.points === max.points && c.random > max.random))
			// 	max = c;
			if (c.points > max.points)
				max = c;
		});
		// console.log(combinations)
		return [max.move[0], max.move[1]];
	}
}

export default SimpleBot
