import MovesTreeNode from "../engine/movesTree";

class result {
	points: number = 0;
	moves: Array<[number, number]> = [];
	board: number[] = [];
	random: number = Math.random();

	AddMove(move: [number, number]) {
		this.moves.push(move);
		return this;
	}

	SetBoard(board: number[]) {
		this.board = board;
		return this;
	}

	Copy() {
		const res = new result();
		res.points = this.points;
		res.moves = this.moves.slice();
		res.board = this.board.slice();
		res.random = Math.random();
		return res;
	}
}

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
			const fields: number[] = [];
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

	static GetMove(board: number[], opponentBoard: number[], movesTreeNode: MovesTreeNode): Array<[number, number]>  {
		const boards: result[] = [];
	
		movesTreeNode.nextMoves?.forEach((node) => {
			SimpleBot.processNode(board, node, new result().SetBoard(board), boards);
		});

		boards.forEach((b) => {
			b.points = SimpleBot.CountPoints(board, b.board, opponentBoard);
		});

		let max = boards[0];

		boards.forEach(b => {
			if (b.points > max.points)
				max = b;
		});

		return max.moves;
	}

	static processNode(board: number[], node: MovesTreeNode, current: result, boards: result[]) {
		if (node.move === null) {
			return;
		}
		const newBoard = SimpleBot.GetNewBoard(board, node.move[0], node.move[1]);
		const res = current.Copy().SetBoard(newBoard).AddMove(node.move);
		if (node.nextMoves === null) {
			boards.push(res);
			return;
		}
		node.nextMoves.forEach((n) => {
			SimpleBot.processNode(newBoard, n, res, boards);
		});
	}
}

export default SimpleBot