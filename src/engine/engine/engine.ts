import Board from '../board';
import Move from '../move';
import MoveState from '../moveState';

interface Engine {
	MakeMove(moveState: MoveState, board: Board, move: Move): boolean;
	StartMove(moveState: MoveState | null, board: Board, dices: [number, number]): MoveState | null
	EndMove(moveState: MoveState, board: Board): boolean;
	UndoLastMove(moveState: MoveState, board: Board): [number, number] | null;

	GetPossibleMoves(moveState: MoveState, board: Board):{ [key: number]: number[] } ;
	SetPossibleMoves(moveState: MoveState, board: Board): void;
	GetNewBoard(): Board;
}

export default Engine;
