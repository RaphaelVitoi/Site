/**
 * Raphael Vitoi | Poker & Mindset
 * Analytics Module v1.0 (State of the Art)
 * 
 * Design Philosophy:
 * - Privacy by Default (Respects DNT)
 * - Performance Optimized (Deferred Loading)
 * - Zero Dependencies (Vanilla JS)
 */

const Analytics = (() => {
    // Configuration
    const CONFIG = {
        enabled: true,
        debug: true, // Set to false in production
        provider: 'custom', // 'ga4', 'plausible', 'custom'
        trackingId: 'UA-XXXXX-Y'
    };

    /**
     * Internal Logger (Respects aesthetics even in console)
     */
    const log = (msg, data = '') => {
        if (CONFIG.debug) {
            console.log(`%c[Analytics] %c${msg}`, 'color: #3b82f6; font-weight: bold;', 'color: inherit;', data);
        }
    };

    /**
     * Privacy Check (Ethical Standard)
     */
    const canTrack = () => {
        const dnt = navigator.doNotTrack || window.doNotTrack || navigator.msDoNotTrack;
        if (dnt === '1' || dnt === 'yes') {
            log('Tracking blocked by Do Not Track (DNT). Respecting user privacy.');
            return false;
        }
        return CONFIG.enabled;
    };

    /**
     * Initialization
     */
    const init = () => {
        if (!canTrack()) return;

        log('Module Initialized. Monitoring interactions...');
        
        // 1. Track Page View
        trackEvent('page_view', {
            path: window.location.pathname,
            title: document.title
        });

        // 2. Attach Listeners
        document.addEventListener('click', handleClick);
    };

    /**
     * Event Handler
     */
    const handleClick = (event) => {
        const link = event.target.closest('a');
        if (!link) return;

        const url = new URL(link.href);
        const isExternal = url.origin !== window.location.origin;

        trackEvent('click', {
            type: isExternal ? 'outbound' : 'internal',
            url: link.href,
            text: link.innerText.trim()
        });
    };

    /**
     * Core Tracking Logic
     */
    const trackEvent = (eventName, props = {}) => {
        const payload = {
            event: eventName,
            timestamp: new Date().toISOString(),
            ...props
        };

        log(`Event Detected: ${eventName}`, payload);

        //  @rvi: Inject transport layer here (Beacon API or fetch)
        // if (CONFIG.provider === 'ga4') { ... }
    };

    return { init, trackEvent, log };
})();

window.Analytics = Analytics;

// Auto-start on load com proteção contra Race Condition
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', Analytics.init);
} else {
    Analytics.init();
}