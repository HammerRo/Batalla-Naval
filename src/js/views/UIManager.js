import { BoardView } from './BoardView.js';
import { ORIENTATIONS, CSS_CLASSES, MESSAGES } from '../config/constants.js';

export class UIManager {
    constructor(gameController, currentUser = null) {
        this.gameController = gameController;
        this.currentUser = currentUser;
        this.handlers = {}; // referencias para poder desuscribir listeners
        
        this.initializeElements();
        this.initializeViews();
        this.attachEventListeners();
        this.subscribeToGameEvents();
        this.renderShipsPanel();
        this.configureForMode();
        // Usuario solo se muestra en el título del tablero
    }

    configureForMode() {
        const mode = this.gameController?.gameMode || 'local';

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
            gameHeader: document.querySelector('.game-header')
        };

        // Turn indicator elements (timer only)
        this.elements.turnIndicator = document.querySelector('#turnIndicator');
        this.elements.turnTimer = document.querySelector('#turnTimer');

        // Ensure Reset/Rendirse button is hidden on first load (before any game)
        if (this.elements.btnReset) {
            this.elements.btnReset.style.display = 'none';
            this.elements.btnReset.textContent = 'Reiniciar';
        }
    }

    initializeViews() {
        this.playerBoardView = new BoardView(this.elements.playerBoard, 'player');
        this.computerBoardView = new BoardView(this.elements.computerBoard, 'computer');

        this.playerBoardView.setCellClickHandler((e) => this.handlePlayerBoardClick(e));
        this.playerBoardView.setCellHoverHandler((e) => this.handlePlayerBoardHover(e));
        this.computerBoardView.setCellClickHandler((e) => this.handleComputerBoardClick(e));

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

        // Usuario actual
        let username = 'Invitado';
        if (this.currentUser && this.currentUser.username) {
            username = this.currentUser.username;
        }

        // Cambiar texto del tablero del jugador
        if (playerTitle) {
            playerTitle.textContent = `Tablero de ${username}`;
            playerTitle.classList.remove('turn-active', 'turn-inactive');
            playerTitle.classList.add(currentTurn === 'player' ? 'turn-active' : 'turn-inactive');
        }
        // Cambiar texto del tablero enemigo
        if (computerTitle) {
            computerTitle.textContent = 'Tablero Enemigo';
            computerTitle.classList.remove('turn-active', 'turn-inactive');
            computerTitle.classList.add(currentTurn === 'computer' ? 'turn-active' : 'turn-inactive');
        }
    }

    attachEventListeners() {
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
    }

    handleBackToMenu() {
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
        this.gameController.on('allShipsPlaced', () => this.onAllShipsPlaced());
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

        if (state === 'setup') {
            const success = this.gameController.placeSelectedShip(row, col);

            if (success) {
                this.playerBoardView.render(this.gameController.humanPlayer.board);
                this.renderShipsPanel();
                this.playerBoardView.clearPreview();
            }
            return;
        }

        // Playing state - in local mode player2 attacks player's board
        if (state === 'playing' && this.gameController.gameMode === 'local') {
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

        // If still in setup, ignore - computer board shouldn't be clickable until placement complete
        if (state === 'setup') return;

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
            this.gameController.startGame();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    handleReset() {
        const state = this.gameController.getGameState();
        
        // Si el juego está en progreso, cambiar a "Rendirse"
        if (state === 'playing') {
            if (confirm('¿Estás seguro de que quieres rendirte?')) {
                // El jugador se rinde, la computadora gana
                this.gameController.endGame(this.gameController.computerPlayer);
            }
        } else {
            // Si está en setup, actuar como reinicio normal
            if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
                this.gameController.reset();
            }
        }
    }

    handleRandomize() {
        try {
            this.gameController.placeShipsRandomly();
        } catch (error) {
            this.showToast(error.message, 'error');
        }
    }

    handlePlayAgain() {
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

    onAllShipsPlaced() {
        this.showToast(MESSAGES.SETUP.ALL_PLACED, 'success');
        this.updatePlacementHint('¡Listo! Presiona Iniciar Juego');
        this.elements.btnStart.disabled = false;
    }

    onShipsPlacedRandomly() {
        this.playerBoardView.render(this.gameController.humanPlayer.board);
        this.renderShipsPanel();
        this.showToast('Barcos colocados aleatoriamente', 'success');
    }

    onGameStarted(data) {
        this.elements.btnStart.disabled = true;
        this.elements.btnRandomize.disabled = true;
        this.elements.btnRandomize.style.display = 'none';
        this.elements.btnHorizontal.disabled = true;
        this.elements.btnVertical.disabled = true;
        
        // Cambiar texto del botón Reset a "Rendirse" durante el juego
        if (this.elements.btnReset) {
            this.elements.btnReset.textContent = 'Rendirse';
            this.elements.btnReset.style.display = 'block';
        }

        // Si venimos de modo AI, mostrar también el tablero del enemigo ahora
        const computerWrapper = this.elements.computerBoard?.closest('.board-wrapper');
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
        this.computerBoardView.render(this.gameController.computerPlayer.board);

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
    }

    onAiTurnEnd(data) {

        // Restaurar títulos y colores a estado inicial
        this.updateBoardTitles('player');
        // AI finished attacking — remove blocking spinner. The following events (turnChanged/turnStarted)
        // will re-enable boards appropriately, but we'll ensure spinner is removed.
        if (this.elements.turnIndicator) {
            this.elements.turnIndicator.classList.remove('turn-changing');
        }
        // Clear status; next turnStarted will set correct status
        this.updateGameStatus('');
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
        const isHuman = data.player === 'Jugador';
        const boardView = isHuman ? this.computerBoardView : this.playerBoardView;

        if (data.hit) {
            boardView.updateCell(data.row, data.col, 'hit');
        } else if (data.miss) {
            boardView.updateCell(data.row, data.col, 'miss');
        }
    }

    onShipHit(data) {
        // suppressed toast to avoid spam during gameplay; the board shows the hit
    }

    onShipSunk(data) {
        const isPlayer = data.player === 'Jugador';
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
    }

  onGameOver(data) {
    const isPlayerWinner = data.winner === 'Jugador';
    
    this.computerBoardView.disable();
    this.playerBoardView.disable();

    this.computerBoardView.revealShips(this.gameController.computerPlayer.board);

    this.updateGameStatus(isPlayerWinner ? MESSAGES.GAME.YOU_WIN : MESSAGES.GAME.YOU_LOSE);

    setTimeout(() => {
        this.showGameOverModal(data);
    }, 1000);
}

    onGameReset() {
        this.elements.btnStart.disabled = true;
        this.elements.btnRandomize.disabled = false;
        this.elements.btnRandomize.style.display = 'block';
        this.elements.btnHorizontal.disabled = false;
        this.elements.btnVertical.disabled = false;
        
        // Ocultar indicador de turno y limpiar cualquier estado visual de cambio
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
        
        // Ensure computer board ships are hidden again (removes board--reveal-ships class)
        if (this.computerBoardView && typeof this.computerBoardView.hideShipsMarkers === 'function') {
            this.computerBoardView.hideShipsMarkers();
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
        if (this.gameController?.gameMode === 'ai') {
            if (computerWrapper) computerWrapper.style.display = 'none';
            if (boardsContainer) boardsContainer.classList.add('single-board');
            const appContainer = document.querySelector('.game-container');
            if (appContainer) appContainer.classList.add('placement-side');
        } else {
            if (computerWrapper) computerWrapper.style.display = '';
            if (boardsContainer) boardsContainer.classList.remove('single-board');
            const appContainer = document.querySelector('.game-container');
            if (appContainer) appContainer.classList.remove('placement-side');
        }

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

        const isWinner = data.winner === 'Jugador';
        
        if (this.elements.modalTitle) {
            this.elements.modalTitle.textContent = isWinner ? '🎉 ¡Victoria!' : '💀 Derrota';
            this.elements.modalTitle.style.color = isWinner ? 'var(--color-success)' : 'var(--color-danger)';
        }

        if (this.elements.finalStats) {
            this.elements.finalStats.innerHTML = `
                <div style="display: grid; gap: 10px;">
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                        <span style="font-weight: bold;">Ganador:</span>
                        <span style="color: var(--color-primary);">${data.winner}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                        <span style="font-weight: bold;">Tus disparos:</span>
                        <span style="color: var(--color-primary);">${data.playerShots}</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; padding: 10px; background: #f5f5f5; border-radius: 8px;">
                        <span style="font-weight: bold;">Disparos enemigos:</span>
                        <span style="color: var(--color-primary);">${data.computerShots}</span>
                    </div>
                </div>
            `;
        }

        this.elements.gameOverModal.classList.add(CSS_CLASSES.MODAL_ACTIVE);
    }

    hideModal() {
        if (this.elements.gameOverModal) {
            this.elements.gameOverModal.classList.remove(CSS_CLASSES.MODAL_ACTIVE);
        }
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