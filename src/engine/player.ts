class Player {
	constructor(isFirst: boolean) {
		this.isFirst = isFirst;
		this.isWhite = isFirst;
	}
	readonly isFirst: boolean;
	readonly isWhite: boolean;
}

export default Player;
