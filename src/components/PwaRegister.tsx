'use client';
import { useEffect } from 'react';

export default function PwaRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').then(
                    function(registration) {
                        console.log('PWA Service Worker registration successful with scope: ', registration.scope);
                    },
                    function(err) {
                        console.log('PWA Service Worker registration failed: ', err);
                    }
                );
            });
        }
    }, []);
    return null;
}
