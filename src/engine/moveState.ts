import MovesTreeNode from './movesTree';
import Player from './player';

class MoveState {
	private moveNumber: number;
	private isPlayerWhite: boolean;
	private dices: [number, number];
	private remainingMoves: number[] = [];
	private doneMoves: Array<[number, number]> = [];

	private isEnded: boolean = false;
	private movesTree: MovesTreeNode | null = null;

	constructor(num: number, isWhite: boolean, dices: [number, number], remainingMoves: number[], doneMoves: [number, number][]) {
		this.moveNumber = num;
		this.isPlayerWhite = isWhite;
		this.dices = dices;
		this.remainingMoves = remainingMoves;
		this.doneMoves = doneMoves;
		remainingMoves.sort((a, b) => a - b);
	}

	getDices(): [number, number] {
		return this.dices;
	}
	
	getMoveNumber(): number {
		return this.moveNumber;
	}

	isWhiteTurn(): boolean {
		return this.isPlayerWhite;
	}

	endMove() {
		this.isEnded = true;
	}

	addToRemainingMoves(move: number): boolean {
		if (this.isEnded) return false;
		this.remainingMoves.push(move);
		return true;
	}

	removeFromRemainingMoves(move: number): boolean {
		if (this.isEnded) return false;
		const index = this.remainingMoves.indexOf(move);
		if (index === -1) {
			return false;
		}
		this.remainingMoves.splice(index, 1);
		return true;
	}

	getRemainingMoves(): number[] {
		return this.remainingMoves;
	}

	addToDoneMoves(move: [number, number]): boolean {
		if (this.isEnded) return false;
		this.doneMoves.push(move);
		return true;
	}

	removeFromDoneMoves(move: [number, number]): boolean {
		if (this.isEnded) return false;
		const index = this.doneMoves.findIndex((m) => m[0] === move[0] && m[1] === move[1]);
		if (index === -1) return false;
		this.doneMoves.splice(index, 1);
		return true;
	}

	getDoneMoves(): Array<[number, number]> {
		return this.doneMoves;
	}

	popLastDoneMove(): [number, number] | null {
		return this.doneMoves.pop() || null;
	}

	setMovesTree(tree: MovesTreeNode | null) {
		this.movesTree = tree;
	}

	getMovesTree(): MovesTreeNode | null {
		if (this.isEnded) return null;
		return this.movesTree;
	}

	isMoveEnded() {
		return this.isEnded;
	}

	setRemainingMoves(moves: number[]) {
		this.remainingMoves = moves;
	}

	getCopy(): MoveState {
		const ms = new MoveState(this.moveNumber, this.isPlayerWhite, this.dices, this.remainingMoves.slice(), this.doneMoves.slice());
		ms.setMovesTree(this.getMovesTree());
		if (this.isEnded) {
			ms.endMove();
		}
		return ms;
	}

	update(moveState: MoveState) {
		this.moveNumber = moveState.moveNumber;
		this.isPlayerWhite = moveState.isPlayerWhite;
		this.dices = moveState.dices;
		this.remainingMoves = moveState.remainingMoves;
		this.doneMoves = moveState.doneMoves;
	}
}

export default MoveState;
