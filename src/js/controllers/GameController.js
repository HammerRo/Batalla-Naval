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
        this.timeoutCounts = { human: 0, computer: 0 };
        this.turnDuration = 20; // default 20 seconds per turn

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
        // Configurar si el oponente es IA según el modo
        this.computerPlayer.isAI = this.gameMode === 'ai';
        this.emit('gameStarted', { currentPlayer: this.currentPlayer.name });

        // Iniciar el reloj/turno
        this.startTurn();
    }

    // Turn handling + timer (for local multiplayer)
    startTurn() {
        // Ensure any previous timer is cleared
        this.stopTurnTimer();

        // Emitir evento de inicio de turno
        this.emit('turnStarted', { currentPlayer: this.currentPlayer.name });

        // Comenzar cuenta regresiva (UI puede solicitar ticks)
        this.turnRemaining = this.turnDuration;
        this.emit('turnTick', { remaining: this.turnRemaining });
        this.turnTimer = setInterval(() => {
            this.turnRemaining -= 1;
            if (this.turnRemaining <= 0) {
                this.stopTurnTimer();
                // Tiempo agotado: incrementar contador y verificar pérdida por timeouts
                const playerKey = this.currentPlayer.isComputer ? 'computer' : 'human';
                this.timeoutCounts[playerKey] = (this.timeoutCounts[playerKey] || 0) + 1;

                // Si el jugador llegó a 2 timeouts, pierde instantáneamente
                if (this.timeoutCounts[playerKey] >= 2) {
                    const winner = this.currentPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;
                    this.endGame(winner);
                    return;
                }

                // Emitir timeout y cambiar turno
                this.emit('turnTimeout', { player: this.currentPlayer.name, count: this.timeoutCounts[playerKey] });
                this.switchTurn(true);
                return;
            }
            this.emit('turnTick', { remaining: this.turnRemaining });
        }, 1000);
    }

    stopTurnTimer() {
        if (this.turnTimer) {
            clearInterval(this.turnTimer);
            this.turnTimer = null;
        }
    }

    switchTurn(conceded = false) {
        // Cambiar jugador actual
        this.currentPlayer = this.currentPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;
        this.emit('turnChanged', { currentPlayer: this.currentPlayer.name, conceded });

        // Si el nuevo jugador es la IA y el modo es 'ai', ejecutarla
        if (this.gameMode === 'ai' && this.currentPlayer === this.computerPlayer && this.computerPlayer.isAI) {
            // Iniciar turno de la IA (no usar timer en IA)
            this.executeComputerTurn();
        } else {
            // Iniciar timer para el nuevo turno (para local)
            this.startTurn();
        }
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

    /**
     * Generalized attack handler used for both local and AI modes.
     * The currentPlayer performs the attack against its opponent board.
     */
    handleAttack(row, col) {
        if (this.gameState !== GAME_STATES.PLAYING) {
            throw new Error('El juego no ha comenzado');
        }

        try {
            const attacker = this.currentPlayer;
            const result = attacker.attack(row, col);

            if (result.alreadyAttacked) {
                this.emit('error', { message: 'Ya disparaste aquí' });
                return result;
            }
            // Reset timeout counter for the attacker (took action)
            const attackerKey = attacker.isComputer ? 'computer' : 'human';
            this.timeoutCounts[attackerKey] = 0;

            this.emit('cellAttacked', { player: attacker.name, ...result });

            if (result.hit) {
                this.emit('shipHit', result);

                if (result.sunk) {
                    this.emit('shipSunk', { ship: result.ship, player: attacker.name });
                }

                if (this.checkGameOver()) {
                    return result;
                }

                // En Batalle Naval, al acertar, el mismo jugador dispara de nuevo.
                // Reiniciar timer para el mismo jugador (si aplica)
                if (this.gameMode === 'local') {
                    this.startTurn();
                }

                return result;
            }

            // Si fue fallo, cambiar turno
            if (this.gameMode === 'ai') {
                // Para AI, si atacante fue humano, ejecutar turno de la IA después de delay
                if (attacker === this.humanPlayer) {
                    this.stopTurnTimer();
                    setTimeout(() => this.executeComputerTurn(), 800);
                } else {
                    // AI falló; volver a jugador humano
                    this.switchTurn(false);
                }
            } else {
                // Local: cambiar turno y conceder al otro jugador
                this.switchTurn(false);
            }

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
            // Solo ejecutar IA si está configurada como IA
            if (!this.computerPlayer.isAI) return;

            const target = this.aiService.selectTarget(this.humanPlayer.board);
            const result = this.computerPlayer.attack(target.row, target.col);

            // Reset timeout counter for computer (took action)
            this.timeoutCounts['computer'] = 0;

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
            } else {
                // IA falló: volver al jugador humano
                this.currentPlayer = this.humanPlayer;
                this.emit('turnChanged', { currentPlayer: this.currentPlayer.name, conceded: false });
                // Reiniciar timer para el humano
                this.startTurn();
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

        // Detener temporizador si existiera
        this.stopTurnTimer();

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
        // Re-initialize players/opponent boards and available ships
        this.initialize();
        this.emit('gameReset');
    }

    getGameState() {
        return this.gameState;
    }
}