/**
 * Utility class to manage UI sound effects consistently across the application
 */

export class UISoundManager {
    static playButtonClick(audioService) {
        if (audioService) {
            audioService.playSFX('click');
        }
    }

    static playConfirm(audioService) {
        if (audioService) {
            audioService.playSFX('confirm');
        }
    }

    static playPlaceShip(audioService) {
        if (audioService) {
            audioService.playSFX('place_ship');
        }
    }

    // Add more sound methods as needed
}

// Add sound to all buttons with the 'btn' class
export function addButtonSounds(audioService) {
    document.addEventListener('click', (event) => {
        const button = event.target.closest('button, [role="button"], .btn');
        if (!button) return;

        // Skip if the button is disabled
        if (button.disabled) return;

        // Skip if the click is on an input inside a button
        if (event.target.tagName === 'INPUT' && button.contains(event.target)) {
            return;
        }

        // Special case for randomize button
        if (button.id === 'btnRandomize' || button.classList.contains('randomize-btn')) {
            UISoundManager.playPlaceShip(audioService);
        } else {
            // Default to confirm sound for all other buttons
            UISoundManager.playConfirm(audioService);
        }
    });

    // Also add to keyboard navigation for accessibility
    document.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
            const activeElement = document.activeElement;
            if (activeElement && (activeElement.tagName === 'BUTTON' || 
                                 activeElement.getAttribute('role') === 'button' ||
                                 activeElement.classList.contains('btn'))) {
                if (activeElement.id === 'btnRandomize' || activeElement.classList.contains('randomize-btn')) {
                    UISoundManager.playPlaceShip(audioService);
                } else {
                    UISoundManager.playConfirm(audioService);
                }
            }
        }
    });
}
