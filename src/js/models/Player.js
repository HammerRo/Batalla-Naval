import { Board } from './Board.js';

export class Player {
    constructor(name, isComputer = false) {
        this.name = name;
        this.isComputer = isComputer;
        this.board = new Board();
        this.opponentBoard = null;
    }

    setOpponentBoard(board) {
        this.opponentBoard = board;
    }

    attack(row, col) {
        if (!this.opponentBoard) {
            throw new Error('No hay tablero oponente');
        }
        return this.opponentBoard.receiveAttack(row, col);
    }

    hasLost() {
        return this.board.allShipsSunk();
    }

    hasWon() {
        return this.opponentBoard && this.opponentBoard.allShipsSunk();
    }

    reset() {
        this.board.reset();
        this.opponentBoard = null;
    }
}