/**
 * Tests para el juego de Batalla Naval
 */

import { Ship } from '../src/js/models/Ship.js';
import { Board } from '../src/js/models/Board.js';
import { Player } from '../src/js/models/Player.js';
import { GameController } from '../src/js/controllers/GameController.js';
import { ORIENTATIONS, CELL_STATES } from '../src/js/config/constants.js';

describe('Ship', () => {
    let ship;

    beforeEach(() => {
        ship = new Ship({
            id: 'test-ship',
            name: 'Test Ship',
            size: 3,
            icon: '🚢'
        });
    });

    test('debe crear un barco correctamente', () => {
        expect(ship.id).toBe('test-ship');
        expect(ship.name).toBe('Test Ship');
        expect(ship.size).toBe(3);
        expect(ship.icon).toBe('🚢');
    });

    test('debe colocar el barco horizontalmente', () => {
        ship.place(0, 0, ORIENTATIONS.HORIZONTAL);

        expect(ship.positions).toHaveLength(3);
        expect(ship.positions[0]).toEqual({ row: 0, col: 0 });
        expect(ship.positions[1]).toEqual({ row: 0, col: 1 });
        expect(ship.positions[2]).toEqual({ row: 0, col: 2 });
    });

    test('debe colocar el barco verticalmente', () => {
        ship.place(0, 0, ORIENTATIONS.VERTICAL);

        expect(ship.positions).toHaveLength(3);
        expect(ship.positions[0]).toEqual({ row: 0, col: 0 });
        expect(ship.positions[1]).toEqual({ row: 1, col: 0 });
        expect(ship.positions[2]).toEqual({ row: 2, col: 0 });
    });

    test('debe registrar impactos correctamente', () => {
        ship.place(0, 0, ORIENTATIONS.HORIZONTAL);

        expect(ship.hit(0, 0)).toBe(true);
        expect(ship.hit(0, 1)).toBe(true);
        expect(ship.hit(0, 0)).toBe(false); // Ya fue impactado
    });

    test('debe detectar cuando está hundido', () => {
        ship.place(0, 0, ORIENTATIONS.HORIZONTAL);

        expect(ship.isSunk()).toBe(false);

        ship.hit(0, 0);
        ship.hit(0, 1);
        expect(ship.isSunk()).toBe(false);

        ship.hit(0, 2);
        expect(ship.isSunk()).toBe(true);
    });

    test('debe lanzar error si la posición es inválida', () => {
        expect(() => {
            ship.place(9, 9, ORIENTATIONS.HORIZONTAL);
        }).toThrow();
    });
});

describe('Board', () => {
    let board;
    let ship;

    beforeEach(() => {
        board = new Board();
        ship = new Ship({
            id: 'test-ship',
            name: 'Test Ship',
            size: 3,
            icon: '🚢'
        });
    });

    test('debe crear un tablero vacío', () => {
        expect(board.size).toBe(10);
        expect(board.matrix).toHaveLength(10);
        expect(board.ships).toHaveLength(0);
    });

    test('debe colocar un barco correctamente', () => {
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        board.placeShip(ship, 0, 0);

        expect(board.ships).toHaveLength(1);
        expect(board.getCellState(0, 0)).toBe(CELL_STATES.SHIP);
        expect(board.getCellState(0, 1)).toBe(CELL_STATES.SHIP);
        expect(board.getCellState(0, 2)).toBe(CELL_STATES.SHIP);
    });

    test('debe detectar colisiones', () => {
        const ship1 = new Ship({
            id: 'ship1',
            name: 'Ship 1',
            size: 3,
            icon: '🚢'
        });
        const ship2 = new Ship({
            id: 'ship2',
            name: 'Ship 2',
            size: 3,
            icon: '🚢'
        });

        ship1.orientation = ORIENTATIONS.HORIZONTAL;
        board.placeShip(ship1, 0, 0);

        ship2.orientation = ORIENTATIONS.VERTICAL;
        expect(() => {
            board.placeShip(ship2, 0, 0);
        }).toThrow();
    });

    test('debe procesar ataques correctamente', () => {
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        board.placeShip(ship, 0, 0);

        // Ataque que acierta
        let result = board.receiveAttack(0, 0);
        expect(result.hit).toBe(true);
        expect(result.miss).toBe(false);

        // Ataque que falla
        result = board.receiveAttack(5, 5);
        expect(result.hit).toBe(false);
        expect(result.miss).toBe(true);

        // Ataque repetido
        result = board.receiveAttack(0, 0);
        expect(result.alreadyAttacked).toBe(true);
    });

    test('debe detectar cuando un barco es hundido', () => {
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        board.placeShip(ship, 0, 0);

        board.receiveAttack(0, 0);
        board.receiveAttack(0, 1);
        let result = board.receiveAttack(0, 2);

        expect(result.sunk).toBe(true);
        expect(board.getCellState(0, 0)).toBe(CELL_STATES.SUNK);
    });

    test('debe detectar cuando todos los barcos están hundidos', () => {
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        board.placeShip(ship, 0, 0);

        expect(board.allShipsSunk()).toBe(false);

        board.receiveAttack(0, 0);
        board.receiveAttack(0, 1);
        board.receiveAttack(0, 2);

        expect(board.allShipsSunk()).toBe(true);
    });

    test('debe obtener estadísticas correctamente', () => {
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        board.placeShip(ship, 0, 0);

        board.receiveAttack(0, 0); // hit
        board.receiveAttack(5, 5); // miss

        const stats = board.getStats();
        expect(stats.totalAttacks).toBe(2);
        expect(stats.hits).toBe(1);
        expect(stats.misses).toBe(1);
        expect(stats.accuracy).toBe('50.0');
    });
});

describe('Player', () => {
    let player;

    beforeEach(() => {
        player = new Player('Test Player', 'human');
    });

    test('debe crear un jugador correctamente', () => {
        expect(player.name).toBe('Test Player');
        expect(player.type).toBe('human');
        expect(player.board).toBeInstanceOf(Board);
    });

    test('debe poder atacar al oponente', () => {
        const opponent = new Player('Opponent', 'computer');
        player.setOpponentBoard(opponent.board);

        const ship = new Ship({
            id: 'test',
            name: 'Test',
            size: 3,
            icon: '🚢'
        });
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        opponent.board.placeShip(ship, 0, 0);

        const result = player.attack(0, 0);
        expect(result.hit).toBe(true);
    });

    test('debe detectar victoria', () => {
        const opponent = new Player('Opponent', 'computer');
        player.setOpponentBoard(opponent.board);

        const ship = new Ship({
            id: 'test',
            name: 'Test',
            size: 2,
            icon: '🚢'
        });
        ship.orientation = ORIENTATIONS.HORIZONTAL;
        opponent.board.placeShip(ship, 0, 0);

        player.attack(0, 0);
        player.attack(0, 1);

        expect(player.hasWon()).toBe(true);
    });
});

describe('GameController', () => {
    let gameController;

    beforeEach(() => {
        gameController = new GameController();
    });

    test('debe inicializar correctamente', () => {
        expect(gameController.humanPlayer).toBeDefined();
        expect(gameController.computerPlayer).toBeDefined();
        expect(gameController.gameState).toBe('setup');
    });

    test('debe permitir seleccionar barcos', () => {
        const availableShips = gameController.getAvailableShips();
        expect(availableShips.length).toBeGreaterThan(0);

        gameController.selectShip(availableShips[0].id);
        expect(gameController.selectedShip).toBeDefined();
    });

    test('debe permitir colocar barcos', () => {
        const availableShips = gameController.getAvailableShips();
        gameController.selectShip(availableShips[0].id);
        gameController.setOrientation(ORIENTATIONS.HORIZONTAL);

        const success = gameController.placeSelectedShip(0, 0);
        expect(success).toBe(true);
    });

    test('no debe permitir iniciar sin todos los barcos colocados', () => {
        expect(() => {
            gameController.startGame();
        }).toThrow();
    });

    test('debe resetear el juego correctamente', () => {
        gameController.reset();

        expect(gameController.gameState).toBe('setup');
        expect(gameController.humanPlayer.board.ships).toHaveLength(0);
        expect(gameController.getAvailableShips().length).toBeGreaterThan(0);
    });
});