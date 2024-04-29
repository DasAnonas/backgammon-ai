import Board from './board';
import Engine from './engine/engine';
import LongNardyEngine from './engine/long-nardy/engine';
import MoveState from './moveState';
import Player from './player';
import Move from './move';

enum GameType {
	Backgammon,
	LongNardy
}

type ExportGame = {
	player1?: Player;
	player2?: Player;
	board: {
		whiteBoard: number[];
		blackBoard: number[];
	};
	winner?: Player;
	ended: boolean;
	moveState?: {
		isPlayerWhite: boolean;
		moveNumber: number;
		dices: [number, number];
		doneMoves: [number, number][];
		remainingMoves: number[];
		isEnded: boolean;
	};
	gameType: GameType;
};


class Game {
	private readonly gameType: GameType;
	private player1: Player | null = null;
	private player2: Player | null = null;

	private engine: Engine | null = null;

	private board: Board | null = null;
	private moveState: MoveState | null = null;

	private winner: Player | null = null;
	private ended: boolean = false;

	private constructor(GameType: GameType) {
		this.gameType = GameType;
	}

	private getDice(): number {
		return Math.floor(Math.random() * 6) + 1;
	}

	GetBoard(): Board {
		if (this.board === null) throw new Error('Board is null');
		return this.board;
	}

	GameFinished(): boolean {
		return this.ended;
	}

	GetWinner(): Player | null {
		return this.winner;
	}

	private EndGameWithWinner(isWhite: boolean | null) {
		if (isWhite === true) {
			this.winner = this.player1!.isWhite ? this.player1 : this.player2;
		} else if (isWhite === false) {
			this.winner = this.player1!.isWhite ? this.player2 : this.player1;
		}
		this.ended = true;
	}

	MakeMove(move: [number, number]) {
		if (this.ended) throw new Error('Game is ended');
		if (this.moveState === null || this.board === null) throw new Error('Movestate or board is null');
		const ok = this.engine!.MakeMove(this.moveState, this.board, new Move(move[0], move[1]));
		if (!ok) throw new Error('Move is not possible');
	}

	StartMove(dices: [number, number] | null): [number, number] {
		if (dices === null) {
			dices = [this.getDice(), this.getDice()]
		}
		if (this.ended) throw new Error('Game is ended');
		if (this.board === null) throw new Error('Movestate or board is null');
		const moveState = this.engine!.StartMove(this.moveState, this.board, dices);
		if (moveState === null) throw new Error('Start Move is not possible');
		this.moveState = moveState;
		return dices;
	}

	EndMove() {
		if (this.ended) throw new Error('Game is ended');
		if (this.moveState === null || this.board === null) throw new Error('Movestate or board is null');
		const ok = this.engine!.EndMove(this.moveState, this.board);
		if (!ok) throw new Error('End Move is not possible');
	}

	UndoLastMove(): [number, number] {
		if (this.ended) throw new Error('Game is ended');
		if (this.moveState === null || this.board === null) throw new Error('Movestate or board is null');
		const lastMove = this.engine!.UndoLastMove(this.moveState, this.board);
		if (lastMove === null) throw new Error('Undo Move is not possible');
		return lastMove;
	}

	GetPossibleMoves(): { [key: number]: number[] } {
		if (this.ended) return {};
		if (this.moveState === null || this.board === null) return {};
		return this.engine!.GetPossibleMoves(this.moveState, this.board);
	};

	InitGame(dices: [number, number] | null): [number, number] {
		if (this.ended) throw new Error('Game is ended');
		if (dices === null) {
			dices = [this.getDice(), this.getDice()]
			while (dices[0] === dices[1]) {
				dices[1] = this.getDice();
			}
		}
		this.player1 = new Player(dices[0] > dices[1]);
		this.player2 = new Player(dices[0] < dices[1]);
		this.board = this.engine!.GetNewBoard();
		return dices;
	}

	Export(): ExportGame {
		return JSON.parse(JSON.stringify(this));
	}

	GetMoveState(): MoveState | null {
		return this.moveState;
	}

	static CreateNewGame(type: GameType): Game {
		if (type === null) type = GameType.LongNardy;
		const game = new Game(type);
		if (type === GameType.LongNardy) {
			game.engine = new LongNardyEngine(game.EndGameWithWinner.bind(game));
		}
		return game;
	}

	static ImportGame(data: ExportGame): Game {

		let player1 = null;
		let player2 = null;
		if (data.player1 && data.player2) {
			player1 = new Player(data.player1.isFirst);
			player2 = new Player(data.player2.isFirst);
		}

		let board = null;
		if (data.board !== null && data.board.blackBoard && data.board.whiteBoard) {
			board = new Board(data.board.whiteBoard, data.board.blackBoard);
		}

		let gameType = data.gameType;
		if (gameType === null) gameType = GameType.LongNardy;
		const game = Game.CreateNewGame(gameType);
		game.player1 = player1;
		game.player2 = player2;
		game.board = board;

		if (data.ended) {
			if (data.winner)
				game.EndGameWithWinner(data.winner.isFirst);
			else
				game.EndGameWithWinner(null);
		}

		let moveState = null;
		if (data.board && data.moveState) {
			moveState = new MoveState(
				data.moveState.moveNumber,
				data.moveState.isPlayerWhite,
				data.moveState.dices,
				data.moveState.remainingMoves,
				data.moveState.doneMoves
			);
			if (data.moveState.isEnded) {
				moveState.endMove();
			}
			game.engine!.SetPossibleMoves(moveState, board!)
		}

		game.moveState = moveState;
		return game;
	}
}


export { Game, GameType };
