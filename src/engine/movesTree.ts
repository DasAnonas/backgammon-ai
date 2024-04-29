import Move from './move';

class MovesTreeNode {
	move: [number, number] | null = null;
	nextMoves: Array<MovesTreeNode> | null = null;

	constructor(from?: number, to?: number) {
		if (from !== undefined && to !== undefined) this.move = [from, to];
	}

	get dice() {
		return this.move === null ? 0 : this.move[1] - this.move[0];
	}

	addNextMove(mv: MovesTreeNode) {
		if (this.nextMoves === null) this.nextMoves = [];
		this.nextMoves.push(mv);
	}

	static New(from?: number, to?: number, nextMoves?: Array<MovesTreeNode>): MovesTreeNode {
		const result = new MovesTreeNode(from, to);
		if (nextMoves) result.nextMoves = nextMoves;
		return result;
	}

	printNode(tab: number = 0): string {
		let node = this.move === null ? '===============\n' : `${'\t'.repeat(tab)}- ${tab} - [${this.move[0]} -> ${this.move[1]}]\n`;
		if (this.nextMoves === null) return node + '===============\n';

		this.nextMoves.forEach((n) => {
			node += n.printNode(tab + 1);
		});
		return node;
	}

	getPossibleMovesObject(): { [key: number]: number[] } {
		if (this.move !== null) throw new Error('This is not root node');
		const result: { [key: number]: number[] } = {};

		if (this.nextMoves === null) return result;

		for (let node of this.nextMoves) {
			if (node.move === null) continue;
			const [from, to] = node.move;
			if (result[from] === undefined) result[from] = [];
			result[from].push(to);

			if (node.nextMoves === null) continue;

			for (let child of node.nextMoves) {
				result[from].push(...child.nodeToObject(to));
			}
		}

		for (const key in result) result[key] = Array.from(new Set(result[key])).sort((a, b) => a - b);

		return result;
	}

	private nodeToObject(position: number): number[] {
		if (this.move === null) return [];
		const [from, to] = this.move;
		if (from !== position) return [];

		const result = [to];
		if (this.nextMoves === null) return result;

		for (let child of this.nextMoves) {
			result.push(...child.nodeToObject(to));
		}

		return result;
	}

	//getPossibleMovesObject(): { [key: number]: number[] } {
	//	if (this.move !== null) throw new Error('This is not root node');
	//	return this.nodeToObject();
	//}

	// private nodeToObject(): { [key: number]: number[] } {
	// 	const result: { [key: number]: number[] } = {};

	// 	if (this.move !== null) result[this.move[0]] = [this.move[1]];

	// 	this.childrenToObjects(result);

	// 	if (this.move !== null) return result;

	// 	for (const key in result) result[key] = Array.from(new Set(result[key])).sort((a, b) => a - b);

	// 	return result;
	// }

	// private childrenToObjects(result: { [key: number]: number[] }): void {
	// 	if (this.nextMoves === null) return;
	// 	for (let node of this.nextMoves) {
	// 		if (Array.isArray(this.move) && Array.isArray(node.move) && this.move[1] !== node.move[0]) //Вот сюда добавить эту строчку, дабы оно не гоняло все не связанные узлы
	// 			continue;
	// 		if (node.move && !Array.isArray(result[node.move[0]])) result[node.move[0]] = [];
	// 		const nodeRes = node.nodeToObject();

	// 		if (this.move === null || node.move === null || this.move[1] !== node.move[0]) {
	// 			for (const key in nodeRes) {
	// 				if (result[key] !== undefined) result[key].push(...nodeRes[key]);
	// 			}
	// 			continue;
	// 		}
	// 		result[this.move[0]].push(...nodeRes[node.move[0]]);
	// 		for (const key in nodeRes) {
	// 			if (key !== node.move[0].toString() && result[key] !== undefined) result[key].push(...nodeRes[key]);
	// 		}
	// 	}
	// }

	findIfCombinedMovePossible(from: number, to: number): Move[] | null {
		if (this.move !== null) throw new Error('This is not root node');
		const result = this.nodeToFind(from, to, []);
		// console.log(`Check move from: ${from}, to: ${to}`)
		// result?.forEach(
		// 	(m) => console.log(`from: ${m.from}, to: ${m.to}`)
		// )
		// console.log("--------------")
		return result;
	}

	private nodeToFind(from: number, to: number, moves: Move[]): Move[] | null {
		if (this.nextMoves === null) return null;
		for (let node of this.nextMoves) {
			const copy = [...moves];
			if (!node.move) continue;
			if (node.move[0] === from && node.move[1] === to) {
				copy.push(new Move(node.move[0], node.move[1]));
				return copy;
			}
			if (node.move[0] === from && node.move[1] < to) {
				copy.push(new Move(node.move[0], node.move[1]));
				const ntf = node.nodeToFind(node.move[1], to, copy);
				if (ntf !== null) return ntf;
			}
		}
		return null;
	}

	filterMovesTree() {
		if (this.move !== null) throw new Error('This is not root node');
		if (this.nextMoves === null) return;
		this.clearChildrenBySum();
	}

	private clearChildrenBySum() {
		if (this.nextMoves === null) return;
		const moves = Array<MovesTreeNode>();
		const maxSum = this.calculateMaxSum();
		this.nextMoves.forEach((n) => {
			const sum = n.calculateMaxSum();
			if (this.dice + sum >= maxSum) {
				n.clearChildrenBySum();
				moves.push(n);
			}
		});
		this.nextMoves = moves.length > 0 ? moves : null;
	}

	private calculateMaxSum(): number {
		if (this.nextMoves === null) return this.dice;
		return Math.max(...this.nextMoves.map((n) => n.calculateMaxSum())) + this.dice;
	}

	// These function needed for bot
	allMovesToArray(): [number, number][][] {
		if (this.move !== null) throw new Error('This is not root node');
		const result: [number, number][][] = this.convertToMovesArray();
		return result;
	}

	private convertToMovesArray(path: [number, number][] = []): [number, number][][] {
		let result: [number, number][][] = [];
		if (this.move !== null) {
			path = [...path, this.move];
		}
		if (this.nextMoves === null) {
			if (path.length > 0) result.push(path);
		} else {
			for (let child of this.nextMoves) {
				result = result.concat(child.convertToMovesArray(path));
			}
		}
		return result;
	}

	static CreateMoveTreeFromJson(json: any): MovesTreeNode {
		const node = new MovesTreeNode();
		node.move = json.move;
		console.debug(json.move);
		if (!Array.isArray(json.nextMoves)) return node;
		for (const nextMove of json.nextMoves) {
			const childNode = MovesTreeNode.CreateMoveTreeFromJson(nextMove);
			node.addNextMove(childNode);
		}
		return node;
	}
}

export default MovesTreeNode;
