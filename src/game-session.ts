import { Game } from "long-nardy-engine";

type MoveFunc = (myboard: number[], opponentBoard: number[], moves: { [key: number]: number[] }) => [number, number];
type Result = 'firstWin' | 'secondWin' | 'draw';


class GameSession {
	constructor (firstBot: MoveFunc, secondBot: MoveFunc) {
		this.firstBot = firstBot;
		this.secondBot = secondBot;
		this.engine = Game.CreateGame();
		this.initialDices = this.engine.InitGame();
	}

	firstBot: MoveFunc; 
	secondBot: MoveFunc;
	engine: Game;
	initialDices: [number, number];

	RunGame(): Result {
		while (true) {
			this.RunAllMoves(this.initialDices[0] > this.initialDices[1] ? this.firstBot : this.secondBot);
			if (this.engine.HasGameEnded())
				break;
			this.RunAllMoves(this.initialDices[0] < this.initialDices[1] ? this.firstBot : this.secondBot);
			if (this.engine.HasGameEnded())
				break;
		}
		const result = this.GetResult();
		console.log(`[Game Session] Game over, result is: ${result === 'firstWin' || result === 'secondWin' ? 'winner is bot ' : ''}${result}, moves count: ${this.engine.Export().gameState?.moveCounter}`);
		return result
	}

	RunAllMoves(moveFunc: MoveFunc) {
		this.engine.StartMove();
		while (true) {
			if (Object.keys(this.engine.GetPossibleMoves()).length === 0)
				break;
			const myBoard = this.engine.GetBoard().getCurrentBoard(this.engine.GetCurrentPlayer());
			const opponentBoard = this.engine.GetBoard().getOpponentBoard(this.engine.GetCurrentPlayer());
			const move = moveFunc(myBoard, opponentBoard, this.engine.GetPossibleMoves());
			this.engine.Move(move);	
		}
		this.engine.EndMove();
	}

	GetResult(): Result {
		if (!this.engine.HasGameEnded()) 
			throw new Error('game is not ended')
		const winner = this.engine.GetWinner();
		if (!winner)
			return 'draw';
		return winner?.isFirst && this.initialDices[0] > this.initialDices[1] || !winner?.isFirst && this.initialDices[0] < this.initialDices[1] ? 'firstWin' : 'secondWin'
	}
}

export {MoveFunc, GameSession}