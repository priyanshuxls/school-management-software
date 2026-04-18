/**
 * Universal Ripple Effect for Buttons
 * Adds smooth click ripple animation to all buttons and interactive elements
 */

(function() {
    'use strict';

    // Create ripple effect on click
    function createRipple(event) {
        const button = event.currentTarget;
        
        // Remove any existing ripples
        const existingRipple = button.querySelector('.ripple');
        if (existingRipple) {
            existingRipple.remove();
        }

        // Create ripple element
        const ripple = document.createElement('span');
        ripple.classList.add('ripple');

        // Get button dimensions and click position
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;

        // Set ripple position and size
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';

        // Add ripple to button
        button.appendChild(ripple);

        // Remove ripple after animation
        setTimeout(() => {
            ripple.remove();
        }, 600);
    }

    // Initialize ripple effect on page load
    function initRippleEffect() {
        // Select all interactive elements
        const selectors = [
            '.btn',
            '.btn-outline',
            '.btn-sm',
            '.tab-btn',
            '.topper-mode-btn',
            '.admin-card:not([style*="cursor:not-allowed"])',
            '.glass-card[onclick]',
            '.notice-item',
            '.resource-card',
            '.event-card',
            '.contact-info-card',
            '.social-btn',
            'button:not(.hamburger):not(.modal-close):not(.image-viewer-close)'
        ];

        const elements = document.querySelectorAll(selectors.join(', '));

        elements.forEach(element => {
            // Avoid duplicate listeners
            if (!element.hasAttribute('data-ripple-init')) {
                element.addEventListener('click', createRipple);
                element.setAttribute('data-ripple-init', 'true');
                
                // Ensure element has position relative for ripple positioning
                const position = window.getComputedStyle(element).position;
                if (position === 'static') {
                    element.style.position = 'relative';
                }
            }
        });
    }

    // Add ripple styles dynamically
    function addRippleStyles() {
        if (document.getElementById('ripple-styles')) return;

        const style = document.createElement('style');
        style.id = 'ripple-styles';
        style.textContent = `
            .ripple {
                position: absolute;
                border-radius: 50%;
                background: rgba(255, 255, 255, 0.5);
                transform: scale(0);
                animation: ripple-animation 0.6s ease-out;
                pointer-events: none;
                z-index: 1;
            }

            @keyframes ripple-animation {
                to {
                    transform: scale(2.5);
                    opacity: 0;
                }
            }

            /* Ensure buttons have overflow hidden for ripple containment */
            .btn,
            .btn-outline,
            .tab-btn,
            .topper-mode-btn {
                overflow: hidden;
            }
        `;
        document.head.appendChild(style);
    }

    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            addRippleStyles();
            initRippleEffect();
        });
    } else {
        addRippleStyles();
        initRippleEffect();
    }

    // Re-initialize for dynamically added elements
    const observer = new MutationObserver(() => {
        initRippleEffect();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });

})();
