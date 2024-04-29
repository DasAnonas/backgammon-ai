import Engine from '../engine';
import Board from '../../board';
import Move from '../../move';
import MoveState from '../../moveState';
import Player from '../../player';
import {ValidationResult, validators} from './moveValidators';
import MovesTreeNode from '../../movesTree';
class LongNardyEngine implements Engine {
	constructor(endGameCallback: (winner: boolean | null) => void) {
		this.endGameCallback = endGameCallback;
	}
	private endGameCallback: (winner: boolean | null) => void;

	MakeMove(moveState: MoveState, board: Board, move: Move): boolean {
		if (moveState.isMoveEnded()) {
			console.debug("MakeMove moveState.isMoveEnded()")
			return false;
		}
		const movesTree = moveState.getMovesTree();
		if (movesTree === null) {
			console.debug("MakeMove movesTree === null")
			return false;
		}
		const moves = movesTree.findIfCombinedMovePossible(move.from, move.to);
		if (moves === null) {
			console.debug("MakeMove moves === null")
			return false;
		}
		console.debug("MakeMove moves", moves)
		for (const move of moves) {
			console.log("MakeMove move", move)
			board.addPiece(moveState.isWhiteTurn(), move.to);
			board.removePiece(moveState.isWhiteTurn(), move.from);
			moveState.addToDoneMoves([move.from, move.to]);
			moveState.removeFromRemainingMoves(move.to - move.from);
		}
		this.SetPossibleMoves(moveState, board);
		return true;
	}

	StartMove(moveState: MoveState | null, board: Board, dices: [number, number]): MoveState | null {
		if (moveState === null) {
			moveState = this.createInitialMoveState(dices, true);
			this.SetPossibleMoves(moveState, board);
			return moveState;
		}
		if (!moveState.isMoveEnded()) {
			return null;
		}
		const newMoveState = this.createNewMoveState(dices, moveState);
		this.SetPossibleMoves(newMoveState, board);
		return newMoveState;
	}

	EndMove(moveState: MoveState, board: Board): boolean {
		if (moveState.isMoveEnded()) {
			return false;
		}
		const possibleMoves = this.GetPossibleMoves(moveState, board);
		if (Object.keys(possibleMoves).length !== 0) {
			return false;
		}
		moveState.endMove();

		const currPlayerFinished =	board.countPieces(moveState.isWhiteTurn()) === 0;
		const oppositePlayerFinished = board.countPieces(!moveState.isWhiteTurn()) === 0;
		if (currPlayerFinished && oppositePlayerFinished) {
			this.endGameCallback(null);
		} else if (!currPlayerFinished && oppositePlayerFinished) {
			this.endGameCallback(!moveState.isWhiteTurn());
		} else if (currPlayerFinished && !oppositePlayerFinished) {
			const isEvenMove = moveState.getMoveNumber() % 2 === 0;
			if (isEvenMove) {
				this.endGameCallback(moveState.isWhiteTurn());
			}
		}
		return true;
	}

	UndoLastMove(moveState: MoveState, board: Board): [number, number] | null {
		if (moveState.isMoveEnded()) {
			return null;
		}
		const lastMove = moveState.popLastDoneMove();
		if (lastMove === null) {
			return null;
		}
		moveState.addToRemainingMoves(lastMove[1] - lastMove[0]);
		board.addPiece(moveState.isWhiteTurn(), lastMove[0]);
		board.removePiece(moveState.isWhiteTurn(), lastMove[1]);
		this.SetPossibleMoves(moveState, board);
		return lastMove;
	}

	GetPossibleMoves(moveState: MoveState, board: Board): { [key: number]: number[] }  {
		const movesTree = moveState.getMovesTree();
		if (movesTree === null) {
			return {};
		}
		return movesTree.getPossibleMovesObject();
	}

	private createInitialMoveState(dices: [number, number], isWhiteFirst: boolean): MoveState {
		return new MoveState(
			1,
			isWhiteFirst,
			dices,
			dices[0] === dices[1] ? [dices[0], dices[0], dices[0], dices[0]] : [dices[0], dices[1]],
			[]
		);
	}

	private createNewMoveState(dices: [number, number], oldMS: MoveState): MoveState {
		return new MoveState(
			oldMS.getMoveNumber() + 1,
			!oldMS.isWhiteTurn(),
			dices,
			dices[0] === dices[1] ? [dices[0], dices[0], dices[0], dices[0]] : [dices[0], dices[1]],
			[]
		);
	}

	GetNewBoard(): Board {
		return new Board(
			Board.ObjectToArray(24, {0: 15}),
			Board.ObjectToArray(24, {0: 15}),
		);
	}

	SetPossibleMoves(moveState: MoveState, board: Board) {
		const possibleMoves = this.findPossibleMoves(moveState, board);
		console.log("SetPossibleMoves")
		console.log(possibleMoves.printNode());
		moveState.setMovesTree(possibleMoves);
	}

	private findPossibleMoves(moveState: MoveState, board: Board): MovesTreeNode {
		const permutations = this.getAllUniquePermutations(moveState.getRemainingMoves());
		const movesTree = new MovesTreeNode();
		for (let i = 0; i < 24; i++) {
			if (board.getCurrentBoard(moveState.isWhiteTurn())[i] === 0) continue;
			
			for (const permutation of permutations) {
				const move: [number, number] = [i, i + permutation[0]];
				const newMoveState = moveState.getCopy();
				const newBoard = board.getBoardCopy();
				const MoveValid = this.isMoveValid(newMoveState, newBoard, move);
				if (!MoveValid.IsValid())
					continue;
				newMoveState.removeFromRemainingMoves(permutation[0]);
				newMoveState.addToDoneMoves(move);
				newBoard.addPiece(moveState.isWhiteTurn(), move[1]);
				newBoard.removePiece(moveState.isWhiteTurn(), move[0]);
				const nextMovesTree = this.findPossibleMoves(newMoveState, newBoard);
				nextMovesTree.move = move;
				movesTree.addNextMove(nextMovesTree);
			}
		}
		return movesTree;
	}

	private getAllUniquePermutations(nums: number[]): number[][] {
		if (nums.length === 0) return [];
		if (nums.length === 2) {
			if (nums[0] === nums[1]) return [[nums[0], nums[1]]];
			return [
				[nums[0], nums[1]],
				[nums[1], nums[0]]
			];
		}
		return [nums];
	}

	private isMoveValid(moveState: MoveState, board: Board, move: [number, number]): ValidationResult {
		let result: ValidationResult;

		for (const name in validators) {
			if (validators[name]) {
				result = validators[name](moveState, board, move);
				if (!result.IsValid()) return result;
			}
		}
		return new ValidationResult('', true);
	}
}

export default LongNardyEngine;