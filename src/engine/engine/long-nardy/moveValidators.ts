import MoveState from '../../moveState';
import Board from '../../board';

type ValidatorFunction = (moveState: MoveState, board: Board, move: [number, number]) => ValidationResult;
type ValidatorFunctionsMap = { [key: string]: ValidatorFunction };

class ValidationResult {
	constructor(public message: string, public valid: boolean) {}
	IsValid() {
		return this.valid;
	}
}

function GetFalseValidationResult(message: string) {
	return new ValidationResult(message, false);
}

function GetTrueValidationResult() {
	return new ValidationResult('', true);
}

const IsThereAnyPiece: ValidatorFunction = (moveState, board, move) => {
	const from = move[0];
	const currentBoard = board.getCurrentBoard(moveState.isWhiteTurn());
	if (currentBoard[from] <= 0) return GetFalseValidationResult('[IsThereAnyPiece] no pieces');
	return GetTrueValidationResult();
};

const IsThereNoPieceOnOpponentBoard: ValidatorFunction = (moveState, board, move) => {
	let to = move[1];
	if (to > 23) return GetTrueValidationResult();

	const currentBoard = board.getOpponentBoard(moveState.isWhiteTurn());

	to = (to + 12) % 24;

	if (currentBoard[to] > 0) return GetFalseValidationResult('[IsThereNoPieceOnOpponentBoard] there are pieces on opponent`s board');
	return GetTrueValidationResult();
};

const IsMovePossible: ValidatorFunction = (moveState, board, move) => {
	if (move[0] < 0 || move[0] > 23) return GetFalseValidationResult('[IsMovePossible] move "from" is not valid');
	if (move[1] < 1 || move[1] > 29) return GetFalseValidationResult('[IsMovePossible] move "to" is not valid');
	if (move[1] <= move[0]) return GetFalseValidationResult('[IsMovePossible] "to" bigger than "from"');
	return GetTrueValidationResult();
};

const AreAllPiecesAtHome: ValidatorFunction = (moveState, board, move) => {
	if (move[1] < 24) return GetTrueValidationResult();
	const currentBoard = board.getCurrentBoard(moveState.isWhiteTurn());
	for (let i = 0; i < 18; i++) {
		if (currentBoard[i] !== 0) return GetFalseValidationResult('[AreAllPiecesAtHome] not all pieces are at home');
	}
	return GetTrueValidationResult();
};

const AreThereNoAlternativeMoves: ValidatorFunction = (moveState, board, move) => {
	if (move[1] <= 24) return GetTrueValidationResult();

	const mv = move[1] - move[0];
	const currentBoard = board.getCurrentBoard(moveState.isWhiteTurn());
	const opponentBoard = board.getOpponentBoard(moveState.isWhiteTurn()).slice(6, 12);
	for (let i = 18; i < move[0]; i++) {
		if (currentBoard[i] > 0) return GetFalseValidationResult('[AreThereNoAlternativeMoves] there are alternative moves');
	}
	return GetTrueValidationResult();
};

const IsOnlyOnePieceFromHead: ValidatorFunction = (moveState, board, move) => {
	const from = move[0];
	if (from !== 0 || moveState.getDoneMoves().length === 0) return GetTrueValidationResult();

	let doneHead = moveState.getDoneMoves().filter((doneMove) => doneMove[0] === 0).length;

	if (doneHead === 0) return GetTrueValidationResult();
	if (doneHead > 1) return GetFalseValidationResult('[IsOnlyOnePieceFromHead] head has been done twice already');

	const dices = moveState.getDices();
	if (dices[0] === 4) {
		const opponentBoard = board.getOpponentBoard(moveState.isWhiteTurn());
		if (opponentBoard[20] !== 0) return GetFalseValidationResult('[IsOnlyOnePieceFromHead] no possible moves with two heads');
	}

	const isRightDouble = dices[0] === dices[1] && [6, 4, 3].indexOf(dices[0]) !== -1;
	const result = moveState.getMoveNumber() < 3 && isRightDouble;
	if (result) return GetTrueValidationResult();
	return GetFalseValidationResult('[IsOnlyOnePieceFromHead] head has been done');
};

const IsNoSixBlocked: ValidatorFunction = (moveState, board, move) => {
	let currentBoard = board.getCurrentBoard(moveState.isWhiteTurn()).slice();
	currentBoard[move[0]] -= 1;
	if (move[1] < 24) currentBoard[move[1]] += 1;
	currentBoard = currentBoard.concat(currentBoard.slice(0, 5));

	const opponentBoard = board.getOpponentBoard(moveState.isWhiteTurn()).slice();
	const opponentSum = opponentBoard.reduce((acc, val) => acc + val, 0);
	if (opponentSum === 0) return GetTrueValidationResult();

	let k = -1;
	for (let i = 0; i < currentBoard.length; i++) {
		if (currentBoard[i] === 0) k = i;
		if (i - k <= 5) continue;

		let index = i > 24 ? i - 24 : i;
		index = index < 12 ? index + 12 : index - 12;

		for (let m = index; m < opponentBoard.length; m++) {
			if (opponentBoard[m] > 0) return GetTrueValidationResult();
		}
		return GetFalseValidationResult('[IsNoSixBlocked] blocked six');
	}

	return GetTrueValidationResult();
};

const validators: ValidatorFunctionsMap = {
	IsThereAnyPiece,
	IsThereNoPieceOnOpponentBoard,
	IsMovePossible,
	AreAllPiecesAtHome,
	AreThereNoAlternativeMoves,
	IsOnlyOnePieceFromHead,
	IsNoSixBlocked
};

export { ValidationResult, ValidatorFunction, ValidatorFunctionsMap, validators };
