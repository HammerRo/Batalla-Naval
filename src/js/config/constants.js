export const GAME_CONFIG = Object.freeze({
    BOARD_SIZE: 10,
    MAX_ATTEMPTS: 1000
});

export const SHIP_TYPES = Object.freeze([
    { id: 'carrier', name: 'Portaviones', size: 5, quantity: 1, icon: '🚢' },
    { id: 'battleship', name: 'Acorazado', size: 4, quantity: 1, icon: '⛴️' },
    { id: 'submarine', name: 'Submarino', size: 3, quantity: 1, icon: '🛥️' },
    { id: 'destroyer', name: 'Destructor', size: 2, quantity: 1, icon: '⛵' }
]);

export const CELL_STATES = Object.freeze({
    EMPTY: 'empty',
    SHIP: 'ship',
    HIT: 'hit',
    MISS: 'miss'
});

export const ORIENTATIONS = Object.freeze({
    HORIZONTAL: 'horizontal',
    VERTICAL: 'vertical'
});

export const GAME_STATES = Object.freeze({
    SETUP: 'setup',
    PLAYING: 'playing',
    GAME_OVER: 'gameOver'
});

export const CSS_CLASSES = Object.freeze({
    CELL: 'board__cell',
    CELL_SHIP: 'board__cell--ship',
    CELL_HIT: 'board__cell--hit',
    CELL_MISS: 'board__cell--miss',
    CELL_SUNK: 'board__cell--sunk',
    CELL_PREVIEW: 'board__cell--preview',
    CELL_INVALID: 'board__cell--invalid',
    BOARD_DISABLED: 'board--disabled',
    SHIP_CARD_SELECTED: 'ship-card--selected',
    SHIP_CARD_DISABLED: 'ship-card--disabled',
    BTN_ACTIVE: 'btn-orientation--active',
    MODAL_ACTIVE: 'modal--active'
});

export const MESSAGES = Object.freeze({
    SETUP: {
        SELECT_SHIP: 'Selecciona un barco',
        SHIP_PLACED: 'Barco colocado',
        INVALID_POSITION: 'Posición inválida',
        ALL_PLACED: 'Todos los barcos colocados'
    },
    GAME: {
        YOUR_TURN: 'Tu turno',
        HIT: '¡Impacto!',
        MISS: 'Agua',
        YOU_WIN: '¡Ganaste!',
        YOU_LOSE: 'Perdiste'
    }
});