import { BoardView } from './BoardView.js';
import { ORIENTATIONS, CSS_CLASSES, MESSAGES } from '../config/constants.js';

export class UIManager {
    constructor(gameController, currentUser = null, audioService = null, i18nService = null) {
        this.gameController = gameController;
        this.currentUser = currentUser;
        this.audioService = audioService;
        this.i18n = i18nService;
        this.handlers = {}; // referencias para poder desuscribir listeners
        
        // Estado para drag & drop
        this.dragState = {
            isDragging: false,
            ship: null,
            startRow: null,
            startCol: null,
            mouseDownTime: null
        };
        
        this.initializeElements();
        this.initializeViews();
        this.attachEventListeners();
        this.subscribeToGameEvents();
        this.renderShipsPanel();
        this.configureForMode();
        // Usuario solo se muestra en el título del tablero

        // Escuchar cambios de idioma
        if (this.i18n) {
            this.i18n.onLanguageChange(() => this.updateTexts());
        }
    }

    configureForMode() {
        const mode = this.gameController?.gameMode; // no default to avoid misconfig on first load

        if (mode === 'ai') {
            // Ocultar inicialmente el tablero del enemigo (mostramos solo el tuyo y los barcos)
            const computerWrapper = this.elements.computerBoard?.closest('.board-wrapper');
            if (computerWrapper) {
                computerWrapper.style.display = 'none';
            }

            const boardsContainer = document.querySelector('.boards-container');
            if (boardsContainer) {
                boardsContainer.classList.add('single-board');
            }

            // Cambiar texto del botón de inicio a '¡A jugar!' para claridad
            if (this.elements.btnStart) {
                this.elements.btnStart.textContent = '¡A jugar!';
            }

            // Sugerencia inicial
            this.updatePlacementHint('Coloca tus barcos. Presiona ¡A jugar! para comenzar');
            // Ajustar layout del contenedor principal para mostrar panel a la derecha
            const appContainer = document.querySelector('.game-container');
            if (appContainer) {
                appContainer.classList.add('placement-side');
            }
        } else if (mode === 'local') {
            // Ocultar tablero del oponente durante colocación
            const computerWrapper = this.elements.computerBoard?.closest('.board-wrapper');
            if (computerWrapper) {
                computerWrapper.style.display = 'none';
            }

            const boardsContainer = document.querySelector('.boards-container');
            if (boardsContainer) {
                boardsContainer.classList.add('single-board');
            }

            // Cambiar texto del botón de inicio a 'Siguiente'
            if (this.elements.btnStart) {
                this.elements.btnStart.textContent = 'Siguiente';
            }

            // Sugerencia inicial para Jugador 1
            this.updatePlacementHint('Jugador 1: Coloca tus barcos');
            
            const appContainer = document.querySelector('.game-container');
            if (appContainer) {
                appContainer.classList.add('placement-side');
            }
        }
    }

    initializeElements() {
        this.elements = {
            playerBoard: document.querySelector('#playerBoard'),
            computerBoard: document.querySelector('#computerBoard'),
            btnStart: document.querySelector('#btnStart'),
            btnBackToMenu: document.querySelector('#btnBackToMenu'),
            btnReset: document.querySelector('#btnReset'),
            btnRandomize: document.querySelector('#btnRandomize'),
            btnHorizontal: document.querySelector('#btnHorizontal'),
            btnVertical: document.querySelector('#btnVertical'),
            gameStatus: document.querySelector('#gameStatus'),
            shipsGrid: document.querySelector('#shipsGrid'),
            placementHint: document.querySelector('#placementHint'),
            gameOverModal: document.querySelector('#gameOverModal'),
            modalTitle: document.querySelector('#modalTitle'),
            finalStats: document.querySelector('#finalStats'),
            btnPlayAgain: document.querySelector('#btnPlayAgain'),
            btnBackToMenuModal: document.querySelector('#btnBackToMenuModal'),
            toastContainer: document.querySelector('#toastContainer'),
            gameHeader: document.querySelector('.game-header'),
            progressIndicator: document.querySelector('#progressIndicator')
        };

        // Turn indicator elements (timer only)
        this.elements.turnIndicator = document.querySelector('#turnIndicator');
        this.elements.turnTimer = document.querySelector('#turnTimer');

        // Ensure Reset/Rendirse button is hidden on first load (before any game)
        if (this.elements.btnReset) {
            this.elements.btnReset.style.display = 'none';
            this.elements.btnReset.textContent = 'Reiniciar';
        }

        // Mostrar indicador de progreso si hay un usuario registrado y estamos en modo AI
        this.updateProgressIndicator();
    }

    initializeViews() {
        this.playerBoardView = new BoardView(this.elements.playerBoard, 'player');
        this.computerBoardView = new BoardView(this.elements.computerBoard, 'computer');

        this.playerBoardView.setCellClickHandler((e) => this.handlePlayerBoardClick(e));
        this.playerBoardView.setCellHoverHandler((e) => this.handlePlayerBoardHover(e));
        this.computerBoardView.setCellClickHandler((e) => this.handleComputerBoardClick(e));
        this.computerBoardView.setCellHoverHandler((e) => this.handleComputerBoardHover(e));

        // Añadir event listeners para drag & drop
        this.elements.playerBoard.addEventListener('mousedown', (e) => this.handleBoardMouseDown(e, 'player'));
        this.elements.playerBoard.addEventListener('mousemove', (e) => this.handleBoardMouseMove(e, 'player'));
        this.elements.playerBoard.addEventListener('mouseup', (e) => this.handleBoardMouseUp(e, 'player'));
        this.elements.playerBoard.addEventListener('mouseleave', (e) => this.handleBoardMouseLeave(e));
        
        this.elements.computerBoard.addEventListener('mousedown', (e) => this.handleBoardMouseDown(e, 'computer'));
        this.elements.computerBoard.addEventListener('mousemove', (e) => this.handleBoardMouseMove(e, 'computer'));
        this.elements.computerBoard.addEventListener('mouseup', (e) => this.handleBoardMouseUp(e, 'computer'));
        this.elements.computerBoard.addEventListener('mouseleave', (e) => this.handleBoardMouseLeave(e));

        this.playerBoardView.render(this.gameController.humanPlayer.board);
        this.computerBoardView.render(this.gameController.computerPlayer.board);
        this.computerBoardView.disable();

        // Set initial board titles
        this.updateBoardTitles('player');
    }
    // Cambia los títulos y colores según el turno
    updateBoardTitles(currentTurn) {
        // Obtener elementos de título
        const playerTitle = document.querySelector('.board-wrapper:nth-child(1) .board-title');
        const computerTitle = document.querySelector('.board-wrapper:nth-child(2) .board-title');

        const mode = this.gameController?.gameMode || 'local';

        if (mode === 'local') {
            // Modo local: títulos son "Jugador 1" y "Jugador 2"
            if (playerTitle) {
                playerTitle.textContent = 'Jugador 1';
                playerTitle.classList.remove('turn-active', 'turn-inactive');
                playerTitle.classList.add(currentTurn === 'player' ? 'turn-active' : 'turn-inactive');
            }
            if (computerTitle) {
                computerTitle.textContent = 'Jugador 2';
                computerTitle.classList.remove('turn-active', 'turn-inactive');
                computerTitle.classList.add(currentTurn === 'computer' ? 'turn-active' : 'turn-inactive');
            }
        } else {
            // Modo AI: mostrar nombre de usuario
            let username = 'Invitado';
            if (this.currentUser && this.currentUser.username) {
                username = this.currentUser.username;
            }

            if (playerTitle) {
                playerTitle.textContent = `Tablero de ${username}`;
                playerTitle.classList.remove('turn-active', 'turn-inactive');
                playerTitle.classList.add(currentTurn === 'player' ? 'turn-active' : 'turn-inactive');
            }
            if (computerTitle) {
                computerTitle.textContent = 'Tablero Enemigo';
                computerTitle.classList.remove('turn-active', 'turn-inactive');
                computerTitle.classList.add(currentTurn === 'computer' ? 'turn-active' : 'turn-inactive');
            }
        }
    }

    attachEventListeners() {
        // Si ya hay handlers, no los volvemos a agregar
        if (this._listenersAttached) return;
        
        // Crear referencias de handlers para poder removerlos después
        this.handlers.onStartClick = () => this.handleStartGame();
        this.handlers.onBackClick = () => this.handleBackToMenu();
        this.handlers.onResetClick = () => this.handleReset();
        this.handlers.onRandomizeClick = () => this.handleRandomize();
        this.handlers.onHorizontalClick = () => this.handleOrientationChange(ORIENTATIONS.HORIZONTAL);
        this.handlers.onVerticalClick = () => this.handleOrientationChange(ORIENTATIONS.VERTICAL);
        this.handlers.onPlayAgainClick = () => this.handlePlayAgain();
        this.handlers.onBackToMenuModalClick = () => this.handleBackToMenu();
        this.handlers.onKeyDown = (e) => this.handleKeyPress(e);

        // Adjuntar listeners
        this.elements.btnStart?.addEventListener('click', this.handlers.onStartClick);
        this.elements.btnBackToMenu?.addEventListener('click', this.handlers.onBackClick);
        this.elements.btnReset?.addEventListener('click', this.handlers.onResetClick);
        this.elements.btnRandomize?.addEventListener('click', this.handlers.onRandomizeClick);
        this.elements.btnHorizontal?.addEventListener('click', this.handlers.onHorizontalClick);
        this.elements.btnVertical?.addEventListener('click', this.handlers.onVerticalClick);
        this.elements.btnPlayAgain?.addEventListener('click', this.handlers.onPlayAgainClick);
        this.elements.btnBackToMenuModal?.addEventListener('click', this.handlers.onBackToMenuModalClick);
        document.addEventListener('keydown', this.handlers.onKeyDown);
        
        // Marcar que los listeners ya fueron agregados
        this._listenersAttached = true;
    }

    handleBackToMenu() {
        // Reproducir sonido de confirmación
        this.audioService?.playSFX('confirm');
        
        // Ocultar modal antes de redirigir
        this.hideModal();
        
        // Asegurar volver al estado de colocación desde cualquier estado (playing o gameover)
        if (this.gameController) {
            const state = this.gameController.getGameState();
            if (state !== 'setup') {
                this.gameController.reset();
            }
        }

        // Destruir listeners de UI para evitar duplicados cuando se inicie otro juego
        this.destroy();
        
        // Si la app principal está expuesta, llamar al método que vuelve al menú
        try {
            if (window.__battleshipApp && typeof window.__battleshipApp.backToMenuFromGameMode === 'function') {
                window.__battleshipApp.backToMenuFromGameMode();
                return;
            }
        } catch (err) {
            console.warn('No se pudo usar backToMenuFromGameMode:', err);
        }

        // Fallback: redirigir a menu.html directamente
        window.location.href = 'menu.html';
    }

    subscribeToGameEvents() {
        this.gameController.on('shipPlaced', (data) => this.onShipPlaced(data));
        this.gameController.on('allShipsPlaced', (data) => this.onAllShipsPlaced(data));
        this.gameController.on('player2SetupStarted', () => this.onPlayer2SetupStarted());
        this.gameController.on('gameStarted', (data) => this.onGameStarted(data));
        this.gameController.on('turnStarted', (data) => this.onTurnStarted(data));
        this.gameController.on('turnChanging', (data) => this.onTurnChanging(data));
        this.gameController.on('turnTick', (data) => this.onTurnTick(data));
        this.gameController.on('turnChanged', (data) => this.onTurnChanged(data));
        this.gameController.on('aiTurnStart', (data) => this.onAiTurnStart(data));
        this.gameController.on('aiTurnEnd', (data) => this.onAiTurnEnd(data));
        this.gameController.on('turnTimeout', (data) => this.onTurnTimeout(data));
        this.gameController.on('cellAttacked', (data) => this.onCellAttacked(data));
        this.gameController.on('shipHit', (data) => this.onShipHit(data));
        this.gameController.on('shipSunk', (data) => this.onShipSunk(data));
        this.gameController.on('gameOver', (data) => this.onGameOver(data));
        this.gameController.on('gameReset', () => this.onGameReset());
        this.gameController.on('error', (data) => this.showToast(data.message, 'error'));
        this.gameController.on('shipsPlacedRandomly', () => this.onShipsPlacedRandomly());
    }

    // Limpieza de listeners ycriptores
    destroy() {
        // Quitar listeners del DOM
        this.elements.btnStart?.removeEventListener('click', this.handlers.onStartClick);
        this.elements.btnBackToMenu?.removeEventListener('click', this.handlers.onBackClick);
        this.elements.btnReset?.removeEventListener('click', this.handlers.onResetClick);
        this.elements.btnRandomize?.removeEventListener('click', this.handlers.onRandomizeClick);
        this.elements.btnHorizontal?.removeEventListener('click', this.handlers.onHorizontalClick);
        this.elements.btnVertical?.removeEventListener('click', this.handlers.onVerticalClick);
        this.elements.btnPlayAgain?.removeEventListener('click', this.handlers.onPlayAgainClick);
        this.elements.btnBackToMenuModal?.removeEventListener('click', this.handlers.onBackToMenuModalClick);
        document.removeEventListener('keydown', this.handlers.onKeyDown);

        // Quitar suscripciones de eventos del controlador de juego
        if (this.gameController && this.gameController.events && typeof this.gameController.events.clear === 'function') {
            this.gameController.events.clear();
        }
    }

    renderShipsPanel() {
        if (!this.elements.shipsGrid) return;

        this.elements.shipsGrid.innerHTML = '';
        const shipTypesInfo = this.gameController.getShipTypesInfo();

        shipTypesInfo.forEach(shipType => {
            const availableShips = this.gameController.getAvailableShips()
                .filter(s => s.name === shipType.name);
            
            const ship = availableShips.length > 0 ? availableShips[0] : null;
            const card = this.createShipCard(shipType, ship);
            this.elements.shipsGrid.appendChild(card);
        });
    }

    createShipCard(shipType, ship) {
        const card = document.createElement('div');
        card.className = 'ship-card';
        
        if (ship) {
            card.dataset.shipId = ship.id;
        }

        if (!ship || shipType.remaining === 0) {
            card.classList.add(CSS_CLASSES.SHIP_CARD_DISABLED);
        }

        card.innerHTML = `
            <div class="ship-card__header">
                <span class="ship-card__name">${shipType.icon} ${shipType.name}</span>
                <span class="ship-card__quantity">${shipType.remaining}/${shipType.total}</span>
            </div>
            <div class="ship-card__visual">
                ${Array(shipType.size).fill('').map(() => 
                    '<div class="ship-card__segment"></div>'
                ).join('')}
            </div>
        `;

        if (ship) {
            card.addEventListener('click', () => this.handleShipCardClick(ship));
        }

        return card;
    }

    handleShipCardClick(ship) {
        try {
            this.gameController.selectShip(ship.id);
            this.updateShipCardsSelection(ship.id);
            this.updatePlacementHint(`${ship.name} seleccionado - Haz clic en el tablero`);
            this.audioService?.playSFX('confirm');
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    updateShipCardsSelection(selectedShipId) {
        const cards = this.elements.shipsGrid?.querySelectorAll('.ship-card');
        
        cards?.forEach(card => {
            card.classList.remove(CSS_CLASSES.SHIP_CARD_SELECTED);
            
            if (card.dataset.shipId === selectedShipId) {
                card.classList.add(CSS_CLASSES.SHIP_CARD_SELECTED);
            }
        });
    }

    handlePlayerBoardClick(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        const state = this.gameController.getGameState();
        const phase = this.gameController?.localSetupPhase;
        const mode = this.gameController?.gameMode;

        if (state === 'setup') {
            // Solo permitir colocación en playerBoard si NO estamos en fase 2 de modo local
            if (mode === 'local' && phase === 2) {
                return; // En fase 2, se coloca en computerBoard
            }

            // Verificar si hay un barco en esta posición
            const existingShip = this.gameController.getShipAt(row, col);
            
            if (existingShip) {
                // Intentar rotar el barco
                try {
                    this.gameController.rotateShip(existingShip);
                    this.playerBoardView.hideShips = false;
                    this.playerBoardView.render(this.gameController.humanPlayer.board);
                    this.audioService?.playSFX('rotate_ship');
                    
                    // Verificar si el barco se movió a una nueva posición
                    const newPos = existingShip.positions[0];
                    if (newPos.row !== row || newPos.col !== col) {
                        this.showToast('Barco rotado y reubicado', 'success');
                    } else {
                        this.showToast('Barco rotado', 'success');
                    }
                } catch (err) {
                    this.showToast(err.message, 'error');
                }
                return;
            }
            
            const success = this.gameController.placeSelectedShip(row, col);

            if (success) {
                // Asegurar visibilidad de barcos durante colocación del Jugador 1
                this.playerBoardView.hideShips = false;
                this.playerBoardView.render(this.gameController.humanPlayer.board);
                this.renderShipsPanel();
                this.playerBoardView.clearPreview();
                this.audioService?.playSFX('place_ship');
            }
            return;
        }

        // Playing state - in local mode player2 attacks player's board
        if (state === 'playing' && mode === 'local') {
            // Only allow attack here if it's the computerPlayer's (player2) turn
            if (this.gameController.currentPlayer === this.gameController.computerPlayer) {
                try {
                    this.gameController.handleAttack(row, col);
                } catch (err) {
                    this.showToast(err.message, 'error');
                }
            } else {
                this.showToast('No es tu turno', 'error');
            }
        }
    }

    handlePlayerBoardHover(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        const state = this.gameController.getGameState();
        const phase = this.gameController?.localSetupPhase;
        const mode = this.gameController?.gameMode;
        
        // Solo mostrar preview si estamos en setup y NO en fase 2 de modo local
        if (state !== 'setup' || (mode === 'local' && phase === 2)) {
            return;
        }

        if (e.type === 'mouseenter') {
            const preview = this.gameController.getShipPlacementPreview(row, col);
            if (preview.positions.length > 0) {
                this.playerBoardView.showShipPreview(preview.positions, preview.valid);
            }
        } else if (e.type === 'mouseleave') {
            this.playerBoardView.clearPreview();
        }
    }

    handleComputerBoardClick(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        const state = this.gameController.getGameState();
        const phase = this.gameController?.localSetupPhase;
        const mode = this.gameController?.gameMode;

        // En setup, permitir colocación solo en fase 2 de modo local
        if (state === 'setup') {
            if (mode === 'local' && phase === 2) {
                // Verificar si hay un barco en esta posición
                const existingShip = this.gameController.getShipAt(row, col);
                
                if (existingShip) {
                    // Intentar rotar el barco
                    try {
                        this.gameController.rotateShip(existingShip);
                        this.computerBoardView.hideShips = false;
                        this.computerBoardView.render(this.gameController.computerPlayer.board);
                        this.audioService?.playSFX('rotate_ship');
                        
                        // Verificar si el barco se movió a una nueva posición
                        const newPos = existingShip.positions[0];
                        if (newPos.row !== row || newPos.col !== col) {
                            this.showToast('Barco rotado y reubicado', 'success');
                        } else {
                            this.showToast('Barco rotado', 'success');
                        }
                    } catch (err) {
                        this.showToast(err.message, 'error');
                    }
                    return;
                }
                
                const success = this.gameController.placeSelectedShip(row, col);

                if (success) {
                    // Asegurar visibilidad de barcos durante colocación del Jugador 2
                    this.computerBoardView.hideShips = false;
                    this.computerBoardView.render(this.gameController.computerPlayer.board);
                    this.renderShipsPanel();
                    this.computerBoardView.clearPreview();
                    this.audioService?.playSFX('place_ship');
                }
            }
            return;
        }

        // In playing state, human (player1) attacks computer board when it's their turn
        if (state === 'playing') {
            if (this.gameController.currentPlayer === this.gameController.humanPlayer) {
                try {
                    this.gameController.handleAttack(row, col);
                } catch (error) {
                    this.showToast(error.message, 'error');
                }
            } else {
                this.showToast('No es tu turno', 'error');
            }
        }
    }

    handleComputerBoardHover(e) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        const state = this.gameController.getGameState();
        const phase = this.gameController?.localSetupPhase;
        const mode = this.gameController?.gameMode;
        
        // Solo mostrar preview si estamos en setup Y en fase 2 de modo local
        if (state !== 'setup' || mode !== 'local' || phase !== 2) {
            return;
        }

        if (e.type === 'mouseenter') {
            const preview = this.gameController.getShipPlacementPreview(row, col);
            if (preview.positions.length > 0) {
                this.computerBoardView.showShipPreview(preview.positions, preview.valid);
            }
        } else if (e.type === 'mouseleave') {
            this.computerBoardView.clearPreview();
        }
    }

    handleBoardMouseDown(e, boardType) {
        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        const state = this.gameController.getGameState();
        const phase = this.gameController?.localSetupPhase;
        const mode = this.gameController?.gameMode;

        // Solo permitir drag en fase de setup
        if (state !== 'setup') return;

        // Verificar que estamos en el tablero correcto según la fase
        if (boardType === 'player' && mode === 'local' && phase === 2) return;
        if (boardType === 'computer' && (mode !== 'local' || phase !== 2)) return;

        // Verificar si hay un barco en esta posición
        const ship = this.gameController.getShipAt(row, col);
        
        if (ship) {
            this.dragState.ship = ship;
            this.dragState.startRow = row;
            this.dragState.startCol = col;
            this.dragState.mouseDownTime = Date.now();
            this.dragState.isDragging = false; // No es drag hasta que se mueva
        }
    }

    handleBoardMouseMove(e, boardType) {
        if (!this.dragState.ship) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) return;

        // Si nos movemos, activar drag
        if (!this.dragState.isDragging && 
            (row !== this.dragState.startRow || col !== this.dragState.startCol)) {
            this.dragState.isDragging = true;
        }

        if (this.dragState.isDragging) {
            // Mostrar preview del barco en la nueva posición
            const ship = this.dragState.ship;
            const targetBoard = boardType === 'player' 
                ? this.gameController.humanPlayer.board 
                : this.gameController.computerPlayer.board;
            
            const valid = targetBoard.canPlaceShipExcluding(
                row, col, ship.size, ship.orientation, ship
            );

            const positions = [];
            for (let i = 0; i < ship.size; i++) {
                if (ship.orientation === ORIENTATIONS.HORIZONTAL) {
                    positions.push({ row: row, col: col + i });
                } else {
                    positions.push({ row: row + i, col: col });
                }
            }

            const boardView = boardType === 'player' ? this.playerBoardView : this.computerBoardView;
            boardView.showShipPreview(positions, valid);
        }
    }

    handleBoardMouseUp(e, boardType) {
        if (!this.dragState.ship) return;

        const row = parseInt(e.target.dataset.row);
        const col = parseInt(e.target.dataset.col);

        if (isNaN(row) || isNaN(col)) {
            this.resetDragState();
            return;
        }

        const timeDiff = Date.now() - this.dragState.mouseDownTime;

        // Si es un click rápido (< 200ms) y no se movió, es un click para rotar
        // El click ya se maneja en handlePlayerBoardClick/handleComputerBoardClick
        if (timeDiff < 200 && !this.dragState.isDragging) {
            this.resetDragState();
            return;
        }

        // Si se arrastró, intentar mover el barco
        if (this.dragState.isDragging && 
            (row !== this.dragState.startRow || col !== this.dragState.startCol)) {
            try {
                this.gameController.moveShip(this.dragState.ship, row, col);
                
                const boardView = boardType === 'player' ? this.playerBoardView : this.computerBoardView;
                const targetBoard = boardType === 'player' 
                    ? this.gameController.humanPlayer.board 
                    : this.gameController.computerPlayer.board;
                
                boardView.hideShips = false;
                boardView.render(targetBoard);
                boardView.clearPreview();
                
                this.showToast('Barco movido', 'success');
                this.audioService?.playSFX('place_ship');
            } catch (err) {
                this.showToast(err.message, 'error');
            }
        }

        this.resetDragState();
    }

    handleBoardMouseLeave(e) {
        if (this.dragState.isDragging) {
            this.playerBoardView.clearPreview();
            this.computerBoardView.clearPreview();
        }
        this.resetDragState();
    }

    resetDragState() {
        this.dragState = {
            isDragging: false,
            ship: null,
            startRow: null,
            startCol: null,
            mouseDownTime: null
        };
    }

    handleOrientationChange(orientation) {
        this.gameController.setOrientation(orientation);

        this.elements.btnHorizontal?.classList.remove(CSS_CLASSES.BTN_ACTIVE);
        this.elements.btnVertical?.classList.remove(CSS_CLASSES.BTN_ACTIVE);

        if (orientation === ORIENTATIONS.HORIZONTAL) {
            this.elements.btnHorizontal?.classList.add(CSS_CLASSES.BTN_ACTIVE);
        } else {
            this.elements.btnVertical?.classList.add(CSS_CLASSES.BTN_ACTIVE);
        }
    }

    handleStartGame() {
        try {
            // Play confirm sound
            this.audioService?.playSFX('confirm');
            
            const mode = this.gameController?.gameMode;
            const phase = this.gameController?.localSetupPhase;
            
            if (mode === 'local' && phase === 1) {
                // Transición a fase 2
                this.gameController.startPlayer2Setup();
            } else {
                // Iniciar juego normalmente
                this.gameController.startGame();
            }
        } catch (error) {
            this.audioService?.playSFX('error');
            this.showToast(error.message, 'error');
        }
    }

    handleReset() {
        // Play confirm sound
        this.audioService?.playSFX('confirm');
        
        const state = this.gameController.getGameState();
        
        // Si el juego está en progreso, cambiar a "Rendirse"
        if (state === 'playing') {
            this.showConfirmModal(
                '¿Estás seguro de que quieres rendirte?',
                'Esta acción no se puede deshacer y perderás la partida.',
                () => {
                    // Play confirm sound again when confirming surrender
                    this.audioService?.playSFX('confirm');
                    
                    // El jugador actual se rinde
                    if (this.gameController.gameMode === 'local') {
                        // En local, gana el contrario al jugador actual
                        const winner = this.gameController.currentPlayer === this.gameController.humanPlayer
                            ? this.gameController.computerPlayer
                            : this.gameController.humanPlayer;
                        this.gameController.endGame(winner);
                    } else {
                        // En modo AI, gana la computadora
                        this.gameController.endGame(this.gameController.computerPlayer);
                    }
                },
                () => {
                    // Play confirm sound when canceling
                    this.audioService?.playSFX('confirm');
                }
            );
        } else {
            // Si está en setup, actuar como reinicio normal
            this.showConfirmModal(
                '¿Estás seguro de que quieres reiniciar el juego?',
                'Perderás toda la configuración actual.',
                () => {
                    this.audioService?.playSFX('confirm');
                    this.gameController.reset();
                },
                () => {
                    this.audioService?.playSFX('confirm');
                }
            );
        }
    }

    handleRandomize() {
        try {
            // Play place_ship sound for random placement
            this.audioService?.playSFX('place_ship');
            this.gameController.placeShipsRandomly();
        } catch (error) {
            this.audioService?.playSFX('error');
            this.showToast(error.message, 'error');
        }
    }

    handlePlayAgain() {
        this.audioService?.playSFX('confirm');
        this.hideModal();
        this.gameController.reset();
    }

    handleKeyPress(e) {
        const key = e.key.toLowerCase();

        if (key === 'h' && this.gameController.getGameState() === 'setup') {
            this.handleOrientationChange(ORIENTATIONS.HORIZONTAL);
        } else if (key === 'v' && this.gameController.getGameState() === 'setup') {
            this.handleOrientationChange(ORIENTATIONS.VERTICAL);
        } else if (key === 'escape') {
            if (this.elements.gameOverModal?.classList.contains(CSS_CLASSES.MODAL_ACTIVE)) {
                this.hideModal();
            }
        }
    }

    // Event Handlers

    onShipPlaced(data) {
        this.showToast(MESSAGES.SETUP.SHIP_PLACED, 'success');
    }

    onAllShipsPlaced(data) {
        const phase = data?.phase;
        const mode = this.gameController?.gameMode;
        
        if (mode === 'local' && phase === 1) {
            this.showToast('¡Barcos del Jugador 1 listos!', 'success');
            this.updatePlacementHint('Presiona Siguiente para que el Jugador 2 coloque sus barcos');
            this.elements.btnStart.disabled = false;
            this.elements.btnStart.textContent = 'Siguiente';
        } else if (mode === 'local' && phase === 2) {
            this.showToast('¡Barcos del Jugador 2 listos!', 'success');
            this.updatePlacementHint('¡Listo! Presiona Iniciar Juego');
            this.elements.btnStart.disabled = false;
            this.elements.btnStart.textContent = 'Iniciar Juego';
        } else {
            this.showToast(MESSAGES.SETUP.ALL_PLACED, 'success');
            this.updatePlacementHint('¡Listo! Presiona Iniciar Juego');
            this.elements.btnStart.disabled = false;
        }
    }

    onShipsPlacedRandomly() {
        const phase = this.gameController?.localSetupPhase;
        const mode = this.gameController?.gameMode;
        
        if (mode === 'local' && phase === 2) {
            // Renderizar tablero del jugador 2
            this.computerBoardView.hideShips = false; // visible en colocación
            this.computerBoardView.render(this.gameController.computerPlayer.board);
        } else {
            // Renderizar tablero del jugador 1 (modo AI o fase 1)
            this.playerBoardView.hideShips = false; // visible en colocación
            this.playerBoardView.render(this.gameController.humanPlayer.board);
        }
        
        this.renderShipsPanel();
        this.showToast('Barcos colocados aleatoriamente', 'success');
    }

    onPlayer2SetupStarted() {
        // Ocultar tablero del jugador 1 y mostrar el del jugador 2
        const playerWrapper = this.elements.playerBoard?.closest('.board-wrapper');
        const computerWrapper = this.elements.computerBoard?.closest('.board-wrapper');
        
        if (playerWrapper) {
            playerWrapper.style.display = 'none';
        }
        if (computerWrapper) {
            computerWrapper.style.display = '';
        }
        
        // Limpiar y renderizar tablero del jugador 2
        // Asegurar que los barcos se vean durante la colocación del Jugador 2
        this.computerBoardView.hideShips = false;
        // Agregar clase especial para permitir color de barcos (#computerBoard.board--local-placement)
        if (this.elements.computerBoard) {
            this.elements.computerBoard.classList.add('board--local-placement');
            // Remover cualquier clase de revelado final si existiera
            this.elements.computerBoard.classList.remove('board--reveal-ships');
        }
        this.computerBoardView.clearPreview();
        this.computerBoardView.render(this.gameController.computerPlayer.board);
        this.computerBoardView.enable();
        
        // Habilitar botones de colocación para Jugador 2
        if (this.elements.btnRandomize) {
            this.elements.btnRandomize.disabled = false;
            this.elements.btnRandomize.style.display = 'block';
        }
        if (this.elements.btnHorizontal) {
            this.elements.btnHorizontal.disabled = false;
        }
        if (this.elements.btnVertical) {
            this.elements.btnVertical.disabled = false;
        }
        
        // Re-renderizar panel de barcos para Jugador 2
        this.renderShipsPanel();
        
        // Actualizar hint y deshabilitar botón hasta que coloque barcos
        this.updatePlacementHint('Jugador 2: Coloca tus barcos');
        this.elements.btnStart.disabled = true;
        this.elements.btnStart.textContent = 'Iniciar Juego';
        
        this.showToast('Turno del Jugador 2', 'success');
    }

    onGameStarted(data) {
        // Hide the 'A jugar' button when the game starts
        if (this.elements.btnStart) {
            this.elements.btnStart.style.display = 'none';
        }
        
        this.elements.btnRandomize.disabled = true;
        this.elements.btnRandomize.style.display = 'none';
        this.elements.btnHorizontal.disabled = true;
        this.elements.btnVertical.disabled = true;
        
        // Hide back button when the game starts
        if (this.elements.btnBackToMenu) {
            this.elements.btnBackToMenu.style.display = 'none';
        }
        
        // Change Reset button to "Rendirse" during the game
        if (this.elements.btnReset) {
            this.elements.btnReset.textContent = 'Rendirse';
            this.elements.btnReset.style.display = 'block';
        }

        // Mostrar ambos tableros
        const playerWrapper = this.elements.playerBoard?.closest('.board-wrapper');
        const computerWrapper = this.elements.computerBoard?.closest('.board-wrapper');
        if (playerWrapper) {
            playerWrapper.style.display = '';
        }
        if (computerWrapper) {
            computerWrapper.style.display = '';
        }

        const boardsContainer = document.querySelector('.boards-container');
        if (boardsContainer) {
            boardsContainer.classList.remove('single-board');
        }

        // Quitar layout lateral si estaba activo
        const appContainer = document.querySelector('.game-container');
        if (appContainer) {
            appContainer.classList.remove('placement-side');
        }

        this.computerBoardView.enable();
        
        // En modo local, ocultar barcos en ambos tableros y re-renderizar ambos
        const mode = this.gameController?.gameMode;
        if (mode === 'local') {
            this.playerBoardView.hideShipsMarkers();
            this.computerBoardView.hideShipsMarkers();
            // Re-render para aplicar ocultamiento inmediatamente
            this.playerBoardView.render(this.gameController.humanPlayer.board);
            this.computerBoardView.render(this.gameController.computerPlayer.board);
            // Eliminar la clase de colocación local para ocultar barcos del Jugador 2
            if (this.elements.computerBoard) {
                this.elements.computerBoard.classList.remove('board--local-placement');
            }
        } else {
            // Modo IA conserva comportamiento previo
            this.computerBoardView.render(this.gameController.computerPlayer.board);
        }

        this.updateGameStatus(MESSAGES.GAME.YOUR_TURN);
        this.showToast('¡Juego iniciado!', 'success');

        if (this.elements.shipsGrid?.parentElement) {
            this.elements.shipsGrid.parentElement.style.display = 'none';
        }

        // Ensure turn indicator visible (timer shown when game realmente inicia via ¡A jugar!)
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.style.display = 'flex';
        }

        // Inicializar títulos de tableros para el primer turno
        this.updateBoardTitles('player');
    }

    onTurnStarted(data) {
        const current = this.gameController.currentPlayer;

        // Actualizar títulos y colores según el turno
        if (current === this.gameController.humanPlayer) {
            this.updateBoardTitles('player');
        } else {
            this.updateBoardTitles('computer');
        }

        // Update timer initial display
        if (this.elements.turnTimer) {
            this.elements.turnTimer.textContent = this.gameController.turnDuration || '20';
        }

        // Enable/disable boards depending on whose turn it is
        if (current === this.gameController.humanPlayer) {
            // Human's turn: enable attacking the enemy board
            this.playerBoardView.disable();
            this.computerBoardView.enable();
        } else {
            // Opponent's turn
            if (this.gameController.computerPlayer.isAI) {
                // AI's turn: disable both boards (AI will act programmatically)
                this.computerBoardView.disable();
                this.playerBoardView.disable();
            } else {
                // Local second player (human): enable attacking player's board
                this.computerBoardView.disable();
                this.playerBoardView.enable();
            }
        }
    }

    onTurnChanging(data) {
        // During the short turn-change pause, disable both boards to prevent attacks
        if (this.playerBoardView) this.playerBoardView.disable();
        if (this.computerBoardView) this.computerBoardView.disable();

        // Update titles to the incoming player's turn
        const toName = data?.to || '';
        if (toName === this.gameController.computerPlayer.name) {
            this.updateBoardTitles('computer');
        } else {
            this.updateBoardTitles('player');
        }

        // Update status to indicate transition
        this.updateGameStatus('Cambio de turno...');
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.classList.add('turn-changing');
        }
    }

    onAiTurnStart(data) {
        // AI is about to (or has started) attacking — ensure player's board is blocked
        if (this.playerBoardView) this.playerBoardView.disable();
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.classList.add('turn-changing');
        }
        this.updateGameStatus('Enemigo atacando...');
        // Actualizar títulos para mostrar que es turno de la computadora
        this.updateBoardTitles('computer');
    }

    onAiTurnEnd(data) {
        // AI finished attacking — remove blocking spinner. The following events (turnChanged/turnStarted)
        // will re-enable boards appropriately, but we'll ensure spinner is removed.
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.classList.remove('turn-changing');
        }
        // Clear status; next turnStarted will set correct status
        this.updateGameStatus('');
        // Restaurar títulos y colores a turno del jugador
        this.updateBoardTitles('player');
    }

    onTurnTick(data) {
        if (this.elements.turnTimer) {
            this.elements.turnTimer.textContent = String(data.remaining);
        }
    }

    onTurnChanged(data) {
        // turn changed - update UI accordingly (will also be followed by turnStarted)
        // remove any temporary 'changing' visual
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.classList.remove('turn-changing');
        }
    }

    onTurnTimeout(data) {
        this.showToast(`${data.player} se ha quedado sin tiempo. Turno concedido.`, 'error');
    }

    onCellAttacked(data) {
        // Determine attacker by comparing with the actual human player's name
        const isHuman = data.player === this.gameController.humanPlayer.name;
        const boardView = isHuman ? this.computerBoardView : this.playerBoardView;

        if (data.hit) {
            boardView.updateCell(data.row, data.col, 'hit');
            // efecto de sonido para acierto
            console.log('🎯 Hit detected, audioService:', !!this.audioService);
            if (this.audioService) this.audioService.playSFX('hit');
        } else if (data.miss) {
            boardView.updateCell(data.row, data.col, 'miss');
            console.log('💦 Miss detected, audioService:', !!this.audioService);
            if (this.audioService) this.audioService.playSFX('miss');
        }
    }

    onShipHit(data) {
        // suppressed toast to avoid spam during gameplay; the board shows the hit
    }

    onShipSunk(data) {
        const isPlayer = data.player === this.gameController.humanPlayer.name;
        this.showToast(`¡${data.ship.name} hundido!`, isPlayer ? 'success' : 'error');
        // Visualizar barco hundido en el tablero correspondiente
        if (isPlayer) {
            // Player sank enemy ship -> mark on computer board
            if (this.computerBoardView && data.ship) {
                this.computerBoardView.markShipSunk(data.ship);
            }
        } else {
            // Enemy sank player's ship -> mark on player board
            if (this.playerBoardView && data.ship) {
                this.playerBoardView.markShipSunk(data.ship);
            }
        }
        if (this.audioService) this.audioService.playSFX('sink');
    }

      onGameOver(data) {
        const isPlayerWinner = data.winner === this.gameController.humanPlayer.name;
    
        this.computerBoardView.disable();
        this.playerBoardView.disable();

        // Revelar barcos al finalizar
        if (this.gameController?.gameMode === 'ai') {
            // En AI, revelar sólo los barcos del enemigo
            this.computerBoardView.revealShips(this.gameController.computerPlayer.board);
        } else {
            // En local, revelar ambos tableros
            this.playerBoardView.revealShips(this.gameController.humanPlayer.board);
            this.computerBoardView.revealShips(this.gameController.computerPlayer.board);
        }

        // Actualizar indicador de progreso después del juego
        this.updateProgressIndicator();

        this.updateGameStatus(isPlayerWinner ? MESSAGES.GAME.YOU_WIN : MESSAGES.GAME.YOU_LOSE);

        setTimeout(() => {
            this.showGameOverModal(data);
        }, 400);

        // SFX al finalizar
        if (this.audioService) {
            if (this.gameController?.gameMode === 'local') {
                // En modo local, siempre reproducir sonido de victoria para ambos jugadores
                this.audioService.playSFX('victory');
            } else {
                // En modo AI, usar victoria/derrota según corresponda
                this.audioService.playSFX(isPlayerWinner ? 'victory' : 'defeat');
            }
        }
    }

    onGameReset() {
        // Show the 'A jugar' button when resetting the game
        if (this.elements.btnStart) {
            this.elements.btnStart.style.display = 'block';
            this.elements.btnStart.disabled = true; // Will be enabled when all ships are placed
        }
        
        this.elements.btnRandomize.disabled = false;
        this.elements.btnRandomize.style.display = 'block';
        this.elements.btnHorizontal.disabled = false;
        this.elements.btnVertical.disabled = false;
        
        // Show back to menu button during placement phase
        if (this.elements.btnBackToMenu) {
            this.elements.btnBackToMenu.style.display = 'block';
        }
        
        // Hide turn indicator and clear any visual state
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.style.display = 'none';
            this.elements.turnIndicator.classList.remove('turn-changing');
        }
        if (this.elements.turnTimer) {
            this.elements.turnTimer.textContent = this.gameController.turnDuration || '20';
        }
        
        // Restaurar texto del botón Reset a "Reiniciar" en fase de colocación
        if (this.elements.btnReset) {
            this.elements.btnReset.textContent = 'Reiniciar';
            this.elements.btnReset.style.display = 'none'; // Ocultar durante colocación
        }

        this.playerBoardView.enable();
        this.playerBoardView.render(this.gameController.humanPlayer.board);
        
        // Restaurar estado de ocultamiento tablero enemigo y quitar clase local-placement
        if (this.computerBoardView && typeof this.computerBoardView.hideShipsMarkers === 'function') {
            this.computerBoardView.hideShipsMarkers();
        }
        if (this.elements.computerBoard) {
            this.elements.computerBoard.classList.remove('board--local-placement');
            this.elements.computerBoard.classList.remove('board--reveal-ships');
        }
        
        this.computerBoardView.clear();
        this.computerBoardView.disable();

        this.updateGameStatus('Prepara tus barcos');
        this.updatePlacementHint('Selecciona un barco para comenzar');
        this.renderShipsPanel();
        this.handleOrientationChange(ORIENTATIONS.HORIZONTAL);

        if (this.elements.shipsGrid?.parentElement) {
            this.elements.shipsGrid.parentElement.style.display = 'block';
        }

        // Ajustar visibilidad del tablero enemigo según el modo de juego
        const computerWrapper = this.elements.computerBoard?.closest('.board-wrapper');
        const boardsContainer = document.querySelector('.boards-container');
        const appContainer = document.querySelector('.game-container');
        // En fase de colocación (tras reiniciar), tanto en AI como en Local
        // se debe mostrar solo un tablero (el del jugador actual que coloca)
        if (computerWrapper) computerWrapper.style.display = 'none';
        if (boardsContainer) boardsContainer.classList.add('single-board');
        if (appContainer) appContainer.classList.add('placement-side');

        this.showToast('Juego reiniciado', 'success');
    }

    // UI Updates

    updateGameStatus(status) {
        if (this.elements.gameStatus) {
            this.elements.gameStatus.textContent = status;
        }
    }

    updatePlacementHint(hint) {
        if (this.elements.placementHint) {
            this.elements.placementHint.textContent = hint;
        }
    }

    // Modal

    showGameOverModal(data) {
        if (!this.elements.gameOverModal) return;

        const mode = this.gameController?.gameMode;
        const isWinner = data.winner === this.gameController.humanPlayer.name;
        
        if (this.elements.modalTitle) {
            // En modo local, siempre mostrar "Victoria" porque ambos jugadores comparten la pantalla
            if (mode === 'local') {
                this.elements.modalTitle.textContent = '🎉 ¡Victoria!';
                this.elements.modalTitle.style.color = 'var(--color-success)';
            } else {
                // En modo AI, mostrar Victoria o Derrota según el resultado
                this.elements.modalTitle.textContent = isWinner ? '🎉 ¡Victoria!' : '💀 Derrota';
                this.elements.modalTitle.style.color = isWinner ? 'var(--color-success)' : 'var(--color-danger)';
            }
        }

        if (this.elements.finalStats) {
            const p1 = data.p1 || { name: 'Jugador 1', hits: 0, misses: 0, total: data.playerShots || 0 };
            const p2 = data.p2 || { name: 'Jugador 2', hits: 0, misses: 0, total: data.computerShots || 0 };
            
            let statsHTML = `
                <div style="display: grid; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: rgba(255,255,255,0.04); border-radius: 8px;">
                        <span style="font-weight: bold; color: #e5e7eb;">Ganador:</span>
                        <span style="color: var(--color-primary);">${data.winner}</span>
                    </div>`;

            // Mostrar progresión solo en modo AI si existe
            if (mode === 'ai' && data.progression) {
                const prog = data.progression;
                const isVictory = prog.pointsEarned !== undefined;
                
                statsHTML += `
                    <div style="padding: 15px; background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); color: white; border-radius: 8px; margin-bottom: 10px;">
                        <div style="font-size: 1.1rem; font-weight: bold; margin-bottom: 8px; text-align: center;">
                            ${isVictory ? '📈 Progresión' : '📉 Progresión'}
                        </div>
                        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; font-size: 0.95rem;">
                            <div style="text-align: center;">
                                <div style="opacity: 0.9;">Puntos ${isVictory ? 'ganados' : 'perdidos'}</div>
                                <div style="font-size: 1.4rem; font-weight: bold;">
                                    ${isVictory ? '+' : '-'}${isVictory ? prog.pointsEarned : prog.pointsLost}
                                </div>
                            </div>
                            <div style="text-align: center;">
                                <div style="opacity: 0.9;">Racha</div>
                                <div style="font-size: 1.4rem; font-weight: bold;">
                                    🔥 ${prog.winStreak}
                                </div>
                            </div>
                        </div>
                        <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.3);">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                <span>Nivel ${prog.level}</span>
                                <span>${prog.currentLevelPoints} / ${prog.pointsForNextLevel} pts</span>
                            </div>
                            <div style="background: rgba(255,255,255,0.3); border-radius: 10px; height: 8px; overflow: hidden;">
                                <div style="background: white; height: 100%; width: ${Math.floor((prog.currentLevelPoints / prog.pointsForNextLevel) * 100)}%; transition: width 0.3s;"></div>
                            </div>
                            ${prog.leveledUp ? '<div style="margin-top: 8px; text-align: center; font-weight: bold; font-size: 1.1rem;">🎉 ¡Subiste de nivel!</div>' : ''}
                            ${prog.leveledDown ? '<div style="margin-top: 8px; text-align: center; font-weight: bold;">⚠️ Bajaste de nivel</div>' : ''}
                        </div>
                    </div>`;
            }

            statsHTML += `
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                        <div style="padding: 10px; background: rgba(255,255,255,0.04); border-radius: 8px;">
                            <div style="font-weight: bold; margin-bottom: 6px; color: #e5e7eb;">${p1.name}</div>
                            <div style="color: #9ca3af;">Aciertos: <strong style="color: #e5e7eb;">${p1.hits}</strong></div>
                            <div style="color: #9ca3af;">Fallos: <strong style="color: #e5e7eb;">${p1.misses}</strong></div>
                            <div style="color: #9ca3af;">Total: <strong style="color: #e5e7eb;">${p1.total}</strong></div>
                        </div>
                        <div style="padding: 10px; background: rgba(255,255,255,0.04); border-radius: 8px;">
                            <div style="font-weight: bold; margin-bottom: 6px; color: #e5e7eb;">${p2.name}</div>
                            <div style="color: #9ca3af;">Aciertos: <strong style="color: #e5e7eb;">${p2.hits}</strong></div>
                            <div style="color: #9ca3af;">Fallos: <strong style="color: #e5e7eb;">${p2.misses}</strong></div>
                            <div style="color: #9ca3af;">Total: <strong style="color: #e5e7eb;">${p2.total}</strong></div>
                        </div>
                    </div>
                </div>
            `;
            
            this.elements.finalStats.innerHTML = statsHTML;
        }

        this.elements.gameOverModal.classList.add(CSS_CLASSES.MODAL_ACTIVE);
    }

    hideModal() {
        if (this.elements.gameOverModal) {
            this.elements.gameOverModal.classList.remove(CSS_CLASSES.MODAL_ACTIVE);
        }
    }

    showConfirmModal(title, message, onConfirm) {
        // Crear modal si no existe
        let confirmModal = document.getElementById('confirmModal');
        if (!confirmModal) {
            confirmModal = document.createElement('div');
            confirmModal.id = 'confirmModal';
            confirmModal.className = 'modal';
            confirmModal.innerHTML = `
                <div class="modal-content confirm-modal">
                    <div class="confirm-icon">⚠️</div>
                    <h2 id="confirmTitle" class="confirm-title"></h2>
                    <p id="confirmMessage" class="confirm-message"></p>
                    <div class="confirm-buttons">
                        <button id="confirmCancel" class="btn btn-secondary">Cancelar</button>
                        <button id="confirmAccept" class="btn btn-danger">Aceptar</button>
                    </div>
                </div>
            `;
            document.body.appendChild(confirmModal);

            // Event listeners para los botones
            document.getElementById('confirmCancel').addEventListener('click', () => {
                this.audioService?.playSFX('confirm');
                confirmModal.classList.remove('modal--active');
            });

            document.getElementById('confirmAccept').addEventListener('click', () => {
                this.audioService?.playSFX('confirm');
                confirmModal.classList.remove('modal--active');
                if (confirmModal.confirmCallback) {
                    confirmModal.confirmCallback();
                }
            });
        }

        // Actualizar contenido
        document.getElementById('confirmTitle').textContent = title;
        document.getElementById('confirmMessage').textContent = message;
        confirmModal.confirmCallback = onConfirm;

        // Mostrar modal
        confirmModal.classList.add('modal--active');
    }

    updateProgressIndicator() {
        if (!this.elements.progressIndicator) return;

        const progressionService = this.gameController?.progressionService;
        const mode = this.gameController?.gameMode;

        // Solo mostrar en modo AI y si hay un servicio de progresión
        if (mode !== 'ai' || !progressionService) {
            this.elements.progressIndicator.style.display = 'none';
            return;
        }

        const progress = progressionService.getProgress();
        
        if (!progress) {
            this.elements.progressIndicator.style.display = 'none';
            return;
        }

        this.elements.progressIndicator.innerHTML = `
            <div class="progress-indicator__level">
                <span>⭐ Nivel ${progress.level}</span>
            </div>
            <div class="progress-indicator__bar">
                <div class="progress-bar-mini">
                    <div class="progress-bar-mini-fill" style="width: ${progress.progressPercentage}%"></div>
                </div>
                <span class="progress-bar-text">${progress.currentLevelPoints}/${progress.pointsForNextLevel}</span>
            </div>
            <div class="progress-indicator__victories">
                <span>🏆 ${progress.totalVictories}</span>
            </div>
            <div class="progress-indicator__streak">
                <span>🔥 ${progress.winStreak}</span>
            </div>
        `;
        
        this.elements.progressIndicator.style.display = 'flex';
    }

    // Toast

    showToast(message, type = 'success') {
        if (!this.elements.toastContainer) return;

        const toast = document.createElement('div');
        toast.className = `toast${type === 'error' ? ' toast--error' : ''}`;
        toast.textContent = message;

        this.elements.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // User Display

    // updateUserDisplay() eliminado: el usuario solo se muestra en el título del tablero
}