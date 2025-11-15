import { EventEmitter } from '../utils/EventEmitter.js';
import { Player } from '../models/Player.js';
import { Ship } from '../models/Ship.js';
import { AIService } from '../services/AIService.js';
import { GAME_STATES, SHIP_TYPES, ORIENTATIONS } from '../config/constants.js';

export class GameController extends EventEmitter {
    constructor() {
        super();
        this.gameState = GAME_STATES.SETUP;
        this.humanPlayer = new Player('Jugador 1', false);
        this.computerPlayer = new Player('Jugador 2', true);
        this.aiService = new AIService();
        this.currentPlayer = this.humanPlayer;
        this.selectedShip = null;
        this.selectedOrientation = ORIENTATIONS.HORIZONTAL;
        this.availableShips = [];
        this.timeoutCounts = { human: 0, computer: 0 };
        this.turnDuration = 20; // default 20 seconds per turn
        this.isSwitchingTurn = false; // true during the 1s transition
        this.localSetupPhase = null; // 1 = Jugador 1, 2 = Jugador 2, null = completado

        this.initialize();
    }

    initialize() {
        this.humanPlayer.setOpponentBoard(this.computerPlayer.board);
        this.computerPlayer.setOpponentBoard(this.humanPlayer.board);
        // Configurar nombres y fase según el modo de juego
        if (this.gameMode === 'ai') {
            this.humanPlayer.name = 'Jugador';
            this.computerPlayer.name = 'Computadora';
            this.computerPlayer.isAI = true;
            this.localSetupPhase = null;
        } else if (this.gameMode === 'local') {
            this.humanPlayer.name = 'Jugador 1';
            this.computerPlayer.name = 'Jugador 2';
            this.computerPlayer.isAI = false;
            this.localSetupPhase = 1;
        }
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
            
            const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
                ? this.computerPlayer.board
                : this.humanPlayer.board;
            
            targetBoard.placeShip(this.selectedShip, row, col);

            const index = this.availableShips.indexOf(this.selectedShip);
            if (index !== -1) {
                this.availableShips.splice(index, 1);
            }

            this.emit('shipPlaced', { ship: this.selectedShip, row, col });
            this.selectedShip = null;

            if (this.availableShips.length === 0) {
                this.emit('allShipsPlaced', { phase: this.localSetupPhase });
            }

            return true;
        } catch (error) {
            this.emit('error', { message: error.message });
            return false;
        }
    }

    canPlaceShip(row, col, size, orientation) {
        const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
            ? this.computerPlayer.board
            : this.humanPlayer.board;
        return targetBoard.canPlaceShip(row, col, size, orientation);
    }

    getShipPlacementPreview(row, col) {
        if (!this.selectedShip) {
            return { valid: false, positions: [] };
        }

        const ship = this.selectedShip;
        ship.orientation = this.selectedOrientation;

        const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
            ? this.computerPlayer.board
            : this.humanPlayer.board;

        const valid = targetBoard.canPlaceShip(
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
        const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
            ? this.computerPlayer.board
            : this.humanPlayer.board;
        
        targetBoard.reset();
        this.initializeAvailableShips();

        const shipsToPlace = [...this.availableShips];

        shipsToPlace.forEach(ship => {
            let placed = false;

            while (!placed) {
                const orientation = Math.random() > 0.5
                    ? ORIENTATIONS.HORIZONTAL
                    : ORIENTATIONS.VERTICAL;

                const position = this.aiService.generateRandomShipPlacement(
                    targetBoard,
                    ship.size,
                    orientation
                );

                if (position) {
                    try {
                        ship.orientation = orientation;
                        ship.place(position.row, position.col, orientation);
                        targetBoard.placeShip(ship, position.row, position.col);
                        placed = true;
                    } catch (error) {
                        // Intentar de nuevo
                    }
                }
            }
        });

        this.availableShips = [];
        this.emit('allShipsPlaced', { phase: this.localSetupPhase });
        this.emit('shipsPlacedRandomly');
    }

    startPlayer2Setup() {
        if (this.gameMode !== 'local' || this.localSetupPhase !== 1) {
            throw new Error('Solo disponible en modo local tras fase 1');
        }
        this.localSetupPhase = 2;
        this.initializeAvailableShips();
        this.emit('player2SetupStarted');
    }

    getShipAt(row, col) {
        const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
            ? this.computerPlayer.board
            : this.humanPlayer.board;
        
        return targetBoard.ships.find(ship => ship.occupiesPosition(row, col));
    }

    moveShip(ship, newRow, newCol) {
        const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
            ? this.computerPlayer.board
            : this.humanPlayer.board;

        // Verificar si se puede colocar en la nueva posición (excluyendo el propio barco)
        if (!targetBoard.canPlaceShipExcluding(newRow, newCol, ship.size, ship.orientation, ship)) {
            throw new Error('No se puede mover el barco a esa posición');
        }

        // Quitar el barco de su posición actual
        targetBoard.removeShip(ship);

        // Colocarlo en la nueva posición
        ship.place(newRow, newCol, ship.orientation);
        targetBoard.placeShip(ship, newRow, newCol);

        this.emit('shipMoved', { ship, row: newRow, col: newCol });
        return true;
    }

    rotateShip(ship) {
        const targetBoard = (this.gameMode === 'local' && this.localSetupPhase === 2)
            ? this.computerPlayer.board
            : this.humanPlayer.board;

        // Determinar nueva orientación
        const currentOrientation = ship.orientation;
        const newOrientation = currentOrientation === ORIENTATIONS.HORIZONTAL
            ? ORIENTATIONS.VERTICAL
            : ORIENTATIONS.HORIZONTAL;

        // Obtener posición actual del barco (primera celda)
        const currentPos = ship.positions[0];
        if (!currentPos) throw new Error('Barco sin posiciones válidas');

        // Verificar si cabe en la nueva orientación
        if (!targetBoard.canPlaceShipExcluding(currentPos.row, currentPos.col, ship.size, newOrientation, ship)) {
            throw new Error('No se puede rotar el barco en esta posición');
        }

        // Quitar el barco
        targetBoard.removeShip(ship);

        // Cambiar orientación y recolocar
        ship.orientation = newOrientation;
        ship.place(currentPos.row, currentPos.col, newOrientation);
        targetBoard.placeShip(ship, currentPos.row, currentPos.col);

        this.emit('shipRotated', { ship });
        return true;
    }

    startGame() {
        if (this.availableShips.length > 0) {
            throw new Error('Debes colocar todos tus barcos primero');
        }

        if (this.gameMode === 'ai') {
            this.placeComputerShips();
        }
        
        if (this.gameMode === 'local') {
            this.localSetupPhase = null;
        }
        
        this.gameState = GAME_STATES.PLAYING;
        this.currentPlayer = this.humanPlayer;
        this.computerPlayer.isAI = this.gameMode === 'ai';
        this.emit('gameStarted', { currentPlayer: this.currentPlayer.name });

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
        // Stop any running timer while we transition
        this.stopTurnTimer();

        const fromPlayer = this.currentPlayer;
        const toPlayer = this.currentPlayer === this.humanPlayer ? this.computerPlayer : this.humanPlayer;

        // Mark switching state so attacks are blocked
        this.isSwitchingTurn = true;

        // Emit an event to signal a short turn-changing phase (UI can disable inputs)
        this.emit('turnChanging', { from: fromPlayer.name, to: toPlayer.name, conceded });

        // Delay only for AI mode to allow a short visual transition
        const delayMs = this.gameMode === 'local' ? 0 : 1000;
        setTimeout(() => {
            // Cambiar jugador actual
            this.currentPlayer = toPlayer;
            this.isSwitchingTurn = false;
            this.emit('turnChanged', { currentPlayer: this.currentPlayer.name, conceded });

            // Si el nuevo jugador es la IA y el modo es 'ai', ejecutarla
            if (this.gameMode === 'ai' && this.currentPlayer === this.computerPlayer && this.computerPlayer.isAI) {
                // Iniciar turno de la IA (no usar timer en IA)
                this.executeComputerTurn();
            } else {
                // Iniciar timer para el nuevo turno (para local)
                this.startTurn();
            }
        }, delayMs);
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

        if (this.isSwitchingTurn) {
            // Block attacks during the short transition
            throw new Error('Espera el cambio de turno');
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
                    // Bloquear y anunciar cambio hacia la IA
                    this.isSwitchingTurn = true;
                    this.emit('turnChanging', { from: this.humanPlayer.name, to: this.computerPlayer.name, conceded: false });
                    // Esperar 1 segundo antes de que la IA comience a atacar
                    setTimeout(() => this.executeComputerTurn(), 1000);
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
            // Signal UI that AI turn/start of AI attack sequence is beginning
            this.emit('aiTurnStart', { player: this.computerPlayer.name });
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
                    // End of AI activity (game finished)
                    this.emit('aiTurnEnd', { player: this.computerPlayer.name });
                    return;
                }

                setTimeout(() => {
                    this.executeComputerTurn();
                }, 800);
            } else {
                // IA falló: devolver inmediatamente el turno al jugador humano
                this.emit('aiTurnEnd', { player: this.computerPlayer.name });
                
                this.currentPlayer = this.humanPlayer;
                this.isSwitchingTurn = false;
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

        // Helper para contar aciertos y fallas sobre el tablero del oponente
        const countAttacks = (opponentBoard) => {
            let hits = 0, misses = 0;
            if (opponentBoard && opponentBoard.matrix) {
                for (let r = 0; r < opponentBoard.matrix.length; r++) {
                    for (let c = 0; c < opponentBoard.matrix[r].length; c++) {
                        const cell = opponentBoard.matrix[r][c];
                        if (cell === 'hit') hits++;
                        else if (cell === 'miss') misses++;
                    }
                }
            }
            return { hits, misses, total: hits + misses };
        };

        const p1Stats = countAttacks(this.humanPlayer.opponentBoard);
        const p2Stats = countAttacks(this.computerPlayer.opponentBoard);

        const stats = {
            winner: winner.name,
            playerShots: p1Stats.total,
            computerShots: p2Stats.total,
            mode: this.gameMode,
            p1: { name: this.humanPlayer.name, ...p1Stats },
            p2: { name: this.computerPlayer.name, ...p2Stats }
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