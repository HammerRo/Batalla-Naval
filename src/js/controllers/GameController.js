import { EventEmitter } from '../utils/EventEmitter.js';
import { Player } from '../models/Player.js';
import { Ship } from '../models/Ship.js';
import { AIService } from '../services/AIService.js';
import { GAME_STATES, SHIP_TYPES, ORIENTATIONS } from '../config/constants.js';

export class GameController extends EventEmitter {
    constructor() {
        super();
        this.gameState = GAME_STATES.SETUP;
        this.humanPlayer = new Player('Jugador', false);
        this.computerPlayer = new Player('Computadora', true);
        this.aiService = new AIService();
        this.currentPlayer = this.humanPlayer;
        this.selectedShip = null;
        this.selectedOrientation = ORIENTATIONS.HORIZONTAL;
        this.availableShips = [];

        this.initialize();
    }

    initialize() {
        this.humanPlayer.setOpponentBoard(this.computerPlayer.board);
        this.computerPlayer.setOpponentBoard(this.humanPlayer.board);
        this.initializeAvailableShips();
    }

    initializeAvailableShips() {
        this.availableShips = [];

        SHIP_TYPES.forEach((shipType, typeIndex) => {
            for (let i = 0; i < shipType.quantity; i++) {
                const ship = new Ship({
                    id: `${shipType.id}_${i}`,
                    name: shipType.name,
                    size: shipType.size,
                    icon: shipType.icon
                });
                this.availableShips.push(ship);
            }
        });
    }

    getAvailableShips() {
        return [...this.availableShips];
    }

    getShipTypesInfo() {
        const info = [];

        SHIP_TYPES.forEach(shipType => {
            const remaining = this.availableShips.filter(
                ship => ship.name === shipType.name
            ).length;

            info.push({
                id: shipType.id,
                name: shipType.name,
                size: shipType.size,
                icon: shipType.icon,
                remaining: remaining,
                total: shipType.quantity
            });
        });

        return info;
    }

    selectShip(shipId) {
        const ship = this.availableShips.find(s => s.id === shipId);
        if (!ship) {
            throw new Error('Barco no encontrado');
        }

        ship.orientation = this.selectedOrientation;
        this.selectedShip = ship;
        this.emit('shipSelected', { ship });
    }

    setOrientation(orientation) {
        this.selectedOrientation = orientation;
        if (this.selectedShip) {
            this.selectedShip.orientation = orientation;
        }
    }

    placeSelectedShip(row, col) {
        if (!this.selectedShip) {
            throw new Error('No hay barco seleccionado');
        }

        try {
            this.selectedShip.orientation = this.selectedOrientation;
            this.selectedShip.place(row, col, this.selectedOrientation);
            this.humanPlayer.board.placeShip(this.selectedShip, row, col);

            const index = this.availableShips.indexOf(this.selectedShip);
            if (index !== -1) {
                this.availableShips.splice(index, 1);
            }

            this.emit('shipPlaced', { ship: this.selectedShip, row, col });
            this.selectedShip = null;

            if (this.availableShips.length === 0) {
                this.emit('allShipsPlaced');
            }

            return true;
        } catch (error) {
            this.emit('error', { message: error.message });
            return false;
        }
    }

    canPlaceShip(row, col, size, orientation) {
        return this.humanPlayer.board.canPlaceShip(row, col, size, orientation);
    }

    getShipPlacementPreview(row, col) {
        if (!this.selectedShip) {
            return { valid: false, positions: [] };
        }

        const ship = this.selectedShip;
        ship.orientation = this.selectedOrientation;

        const valid = this.humanPlayer.board.canPlaceShip(
            row,
            col,
            ship.size,
            ship.orientation
        );

        if (!valid) {
            return { valid: false, positions: [] };
        }

        const positions = [];
        for (let i = 0; i < ship.size; i++) {
            if (ship.orientation === ORIENTATIONS.HORIZONTAL) {
                positions.push({ row: row, col: col + i });
            } else {
                positions.push({ row: row + i, col: col });
            }
        }

        return { valid, positions };
    }

    placeShipsRandomly() {
        this.humanPlayer.board.reset();
        this.initializeAvailableShips();

        const shipsToPlace = [...this.availableShips];

        shipsToPlace.forEach(ship => {
            let placed = false;

            while (!placed) {
                const orientation = Math.random() > 0.5
                    ? ORIENTATIONS.HORIZONTAL
                    : ORIENTATIONS.VERTICAL;

                const position = this.aiService.generateRandomShipPlacement(
                    this.humanPlayer.board,
                    ship.size,
                    orientation
                );

                if (position) {
                    try {
                        ship.orientation = orientation;
                        ship.place(position.row, position.col, orientation);
                        this.humanPlayer.board.placeShip(ship, position.row, position.col);
                        placed = true;
                    } catch (error) {
                        // Intentar de nuevo
                    }
                }
            }
        });

        this.availableShips = [];
        this.emit('allShipsPlaced');
        this.emit('shipsPlacedRandomly');
    }

    startGame() {
        if (this.availableShips.length > 0) {
            throw new Error('Debes colocar todos tus barcos primero');
        }

        this.placeComputerShips();
        this.gameState = GAME_STATES.PLAYING;
        this.currentPlayer = this.humanPlayer;

        this.emit('gameStarted', { currentPlayer: this.currentPlayer.name });
    }

    placeComputerShips() {
        SHIP_TYPES.forEach(shipType => {
            for (let i = 0; i < shipType.quantity; i++) {
                const ship = new Ship({
                    id: `${shipType.id}_computer_${i}`,
                    name: shipType.name,
                    size: shipType.size,
                    icon: shipType.icon
                });

                let placed = false;

                while (!placed) {
                    const orientation = Math.random() > 0.5
                        ? ORIENTATIONS.HORIZONTAL
                        : ORIENTATIONS.VERTICAL;

                    const position = this.aiService.generateRandomShipPlacement(
                        this.computerPlayer.board,
                        ship.size,
                        orientation
                    );

                    if (position) {
                        try {
                            ship.orientation = orientation;
                            ship.place(position.row, position.col, orientation);
                            this.computerPlayer.board.placeShip(ship, position.row, position.col);
                            placed = true;
                        } catch (error) {
                            // Intentar de nuevo
                        }
                    }
                }
            }
        });
    }

    handlePlayerAttack(row, col) {
        if (this.gameState !== GAME_STATES.PLAYING) {
            throw new Error('El juego no ha comenzado');
        }

        try {
            const result = this.humanPlayer.attack(row, col);

            if (result.alreadyAttacked) {
                this.emit('error', { message: 'Ya disparaste aquí' });
                return result;
            }

            this.emit('cellAttacked', { player: this.humanPlayer.name, ...result });

            if (result.hit) {
                this.emit('shipHit', result);

                if (result.sunk) {
                    this.emit('shipSunk', { ship: result.ship, player: this.humanPlayer.name });
                }

                if (this.checkGameOver()) {
                    return result;
                }

                return result;
            }

            setTimeout(() => {
                this.executeComputerTurn();
            }, 800);

            return result;
        } catch (error) {
            this.emit('error', { message: error.message });
            throw error;
        }
    }

    executeComputerTurn() {
        if (this.gameState !== GAME_STATES.PLAYING) {
            return;
        }

        try {
            const target = this.aiService.selectTarget(this.humanPlayer.board);
            const result = this.computerPlayer.attack(target.row, target.col);

            this.aiService.processAttackResult(result);

            this.emit('cellAttacked', { player: this.computerPlayer.name, ...result });

            if (result.hit) {
                this.emit('shipHit', result);

                if (result.sunk) {
                    this.emit('shipSunk', { ship: result.ship, player: this.computerPlayer.name });
                }

                if (this.checkGameOver()) {
                    return;
                }

                setTimeout(() => {
                    this.executeComputerTurn();
                }, 800);
            }
        } catch (error) {
            console.error('Error en turno de computadora:', error);
        }
    }

    checkGameOver() {
        if (this.humanPlayer.hasWon()) {
            this.endGame(this.humanPlayer);
            return true;
        }

        if (this.computerPlayer.hasWon()) {
            this.endGame(this.computerPlayer);
            return true;
        }

        return false;
    }

    endGame(winner) {
        this.gameState = GAME_STATES.GAME_OVER;

        const stats = {
            winner: winner.name,
            playerShots: this.humanPlayer.opponentBoard.attackHistory.size,
            computerShots: this.computerPlayer.opponentBoard.attackHistory.size
        };

        this.emit('gameOver', stats);
    }

    reset() {
        this.gameState = GAME_STATES.SETUP;
        this.humanPlayer.reset();
        this.computerPlayer.reset();
        this.aiService.reset();
        this.currentPlayer = this.humanPlayer;
        this.selectedShip = null;
        this.selectedOrientation = ORIENTATIONS.HORIZONTAL;
        this.initializeAvailableShips();
        this.emit('gameReset');
    }

    getGameState() {
        return this.gameState;
    }
}