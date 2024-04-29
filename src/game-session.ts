//import { Game } from "long-nardy-engine";
import { Game } from "./engine";
import MovesTreeNode from "./engine/movesTree";

type MoveFunc = (myboard: number[], opponentBoard: number[], moves: { [key: number]: number[] }) => [number, number];
type MoveFuncNew = (board: number[], opponentBoard: number[], movesTreeNode: MovesTreeNode) => Array<[number, number]>;
type Result = 'one' | 'two' | 'draw';


class GameSession {
	constructor (firstBot: MoveFunc, secondBot: MoveFuncNew) {
		this.firstBot = firstBot;
		this.secondBot = secondBot;
		this.engine = Game.CreateNewGame(1);
		this.initialDices = this.engine.InitGame(null);
	}

	firstBot: MoveFunc; 
	secondBot: MoveFuncNew;
	engine: Game;
	initialDices: [number, number];

	RunGame(): Result {
		const now = new Date();
		while (true) {
			if (this.initialDices[0] > this.initialDices[1])
				this.RunAllMoves(this.firstBot);
			else 
				this.RunAllMovesNew(this.secondBot);
			if (this.engine.GameFinished())
				break;
			if (this.initialDices[0] < this.initialDices[1])
				this.RunAllMoves(this.firstBot);
			else 
				this.RunAllMovesNew(this.secondBot);
			if (this.engine.GameFinished())
				break;
		}
		const result = this.GetResult();
		console.log(`[Game Session] Game over ${(new Date()).getTime() - now.getTime()}ms, result is: ${result === 'one' || result === 'two' ? 'winner is Bot ' : ''}${result}, moves count: ${this.engine.GetMoveState()?.getMoveNumber()}`);
		return result
	}

	RunAllMoves(moveFunc: MoveFunc) {
		this.engine.StartMove(null);
		while (true) {
			if (Object.keys(this.engine.GetPossibleMoves()).length === 0)
				break;
			const myBoard = this.engine.GetBoard().getCurrentBoard(this.engine.GetMoveState()?.isWhiteTurn() || false);
			const opponentBoard = this.engine.GetBoard().getOpponentBoard(this.engine.GetMoveState()?.isWhiteTurn() || false);
			const move = moveFunc(myBoard, opponentBoard, this.engine.GetPossibleMoves());
			this.engine.MakeMove(move);	
		}
		this.engine.EndMove();
	}

	RunAllMovesNew(moveFunc: MoveFuncNew) {
		this.engine.StartMove(null);
		while (true) {
			if (Object.keys(this.engine.GetPossibleMoves()).length === 0)
				break;
			const myBoard = this.engine.GetBoard().getCurrentBoard(this.engine.GetMoveState()?.isWhiteTurn() || false);
			const opponentBoard = this.engine.GetBoard().getOpponentBoard(this.engine.GetMoveState()?.isWhiteTurn() || false);
			const tree = this.engine.GetMoveState()?.getMovesTree();
			if (!tree)
				break;
			const move = moveFunc(myBoard, opponentBoard, tree);
			if (!move)
				break;
			for (let moveItem of move)
				this.engine.MakeMove(moveItem);	
		}
		this.engine.EndMove();
	}

	GetResult(): Result {
		if (!this.engine.GameFinished()) 
			throw new Error('game is not ended')
		const winner = this.engine.GetWinner();
		if (!winner)
			return 'draw';
		return winner?.isFirst && this.initialDices[0] > this.initialDices[1] || !winner?.isFirst && this.initialDices[0] < this.initialDices[1] ? 'one' : 'two'
	}
}

export {MoveFunc, GameSession}