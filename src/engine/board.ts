import Player from './player';

class Board {
	constructor(white: number[], black: number[]) {
		this.whiteBoard = white;
		this.blackBoard = black;
	}

	private whiteBoard: number[] = [];
	private blackBoard: number[] = [];

	getCurrentBoard(isWhite: boolean): number[] {
		return isWhite ? this.whiteBoard.slice() : this.blackBoard.slice();
	}

	getOpponentBoard(isWhite: boolean): number[] {
		return isWhite ? this.blackBoard.slice() : this.whiteBoard.slice();
	}

	addPiece(isWhite: boolean, index: number) {
		const board = isWhite ? this.whiteBoard : this.blackBoard;
		if (index >= 0 && board.length > index) board[index]++;
	}

	removePiece(isWhite: boolean, index: number) {
		const board = isWhite ? this.whiteBoard : this.blackBoard;
		if (index >= 0 && board.length > index) board[index]--;
	}

	getBoardCopy(): Board {
		const board = new Board(this.whiteBoard.slice(), this.blackBoard.slice());
		return board;
	}

	ApplyBoard(board: Board) {
		this.whiteBoard = board.whiteBoard.slice();
		this.blackBoard = board.blackBoard.slice();
	}

	countPieces(isWhite: boolean): number {
		const board = isWhite ? this.whiteBoard : this.blackBoard;
		return board.reduce((acc, curr) => acc + curr, 0);
	}

	static ObjectToArray(length: number, pieces: { [key: number]: number }): number[] {
		return Array(length)
			.fill(0)
			.map((_, i) => (pieces[i] && pieces[i] > 0 ? pieces[i] : 0));
	}
}

export default Board;
