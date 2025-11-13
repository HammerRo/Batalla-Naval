import { BoardView } from './BoardView.js';
import { ORIENTATIONS, CSS_CLASSES, MESSAGES } from '../config/constants.js';

export class UIManager {
    constructor(gameController, currentUser = null) {
        this.gameController = gameController;
        this.currentUser = currentUser;
        
        this.initializeElements();
        this.initializeViews();
        this.attachEventListeners();
        this.subscribeToGameEvents();
        this.renderShipsPanel();
        this.configureForMode();
        this.updateUserDisplay();
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
            toastContainer: document.querySelector('#toastContainer'),
            gameHeader: document.querySelector('.game-header')
        };
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
    }

    attachEventListeners() {
        this.elements.btnStart?.addEventListener('click', () => this.handleStartGame());
        this.elements.btnBackToMenu?.addEventListener('click', () => this.handleBackToMenu());
        this.elements.btnReset?.addEventListener('click', () => this.handleReset());
        this.elements.btnRandomize?.addEventListener('click', () => this.handleRandomize());
        
        this.elements.btnHorizontal?.addEventListener('click', () => 
            this.handleOrientationChange(ORIENTATIONS.HORIZONTAL)
        );
        this.elements.btnVertical?.addEventListener('click', () => 
            this.handleOrientationChange(ORIENTATIONS.VERTICAL)
        );

        this.elements.btnPlayAgain?.addEventListener('click', () => this.handlePlayAgain());

        document.addEventListener('keydown', (e) => this.handleKeyPress(e));
    }

    handleBackToMenu() {
        // Si la app principal está expuesta, llamar al método que vuelve al menú
        try {
            if (window.__battleshipApp && typeof window.__battleshipApp.backToMenuFromGameMode === 'function') {
                window.__battleshipApp.backToMenuFromGameMode();
                return;
            }
        } catch (err) {
            console.warn('No se pudo usar backToMenuFromGameMode:', err);
        }

        // Fallback: recargar la página para reiniciar la app
        window.location.reload();
    }

    subscribeToGameEvents() {
        this.gameController.on('shipPlaced', (data) => this.onShipPlaced(data));
        this.gameController.on('allShipsPlaced', () => this.onAllShipsPlaced());
        this.gameController.on('gameStarted', (data) => this.onGameStarted(data));
        this.gameController.on('cellAttacked', (data) => this.onCellAttacked(data));
        this.gameController.on('shipHit', (data) => this.onShipHit(data));
        this.gameController.on('shipSunk', (data) => this.onShipSunk(data));
        this.gameController.on('gameOver', (data) => this.onGameOver(data));
        this.gameController.on('gameReset', () => this.onGameReset());
        this.gameController.on('error', (data) => this.showToast(data.message, 'error'));
        this.gameController.on('shipsPlacedRandomly', () => this.onShipsPlacedRandomly());
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

        const success = this.gameController.placeSelectedShip(row, col);

        if (success) {
            this.playerBoardView.render(this.gameController.humanPlayer.board);
            this.renderShipsPanel();
            this.playerBoardView.clearPreview();
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

        try {
            this.gameController.handlePlayerAttack(row, col);
        } catch (error) {
            console.error('Error en ataque:', error);
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
        if (confirm('¿Estás seguro de que quieres reiniciar el juego?')) {
            this.gameController.reset();
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
        this.elements.btnHorizontal.disabled = true;
        this.elements.btnVertical.disabled = true;

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
        this.showToast(MESSAGES.GAME.HIT, 'success');
    }

    onShipSunk(data) {
        const isPlayer = data.player === 'Jugador';
        this.showToast(`¡${data.ship.name} hundido!`, isPlayer ? 'success' : 'error');
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
        this.elements.btnHorizontal.disabled = false;
        this.elements.btnVertical.disabled = false;

        this.playerBoardView.enable();
        this.playerBoardView.render(this.gameController.humanPlayer.board);
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

    updateUserDisplay() {
        if (!this.currentUser || !this.elements.gameHeader) return;

        let userDisplay = this.elements.gameHeader.querySelector('.user-display');
        
        if (!userDisplay) {
            userDisplay = document.createElement('div');
            userDisplay.className = 'user-display';
            this.elements.gameHeader.appendChild(userDisplay);
        }

        const guestBadge = this.currentUser.isGuest ? ' 👤 (Invitado)' : '';
        userDisplay.innerHTML = `
            <div class="user-info">
                <span class="user-name">👤 ${this.currentUser.username}${guestBadge}</span>
                ${!this.currentUser.isGuest ? `
                    <span class="user-stats">
                        📊 V: ${this.currentUser.gamesWon}/${this.currentUser.gamesPlayed}
                    </span>
                ` : ''}
            </div>
        `;
    }
}