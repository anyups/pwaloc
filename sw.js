import { warmStrategyCache } from 'workbox-recipes';
import { CacheFirst, StaleWhileRevalidate } from 'workbox-strategies';
import { registerRoute, Route } from 'workbox-cacheable-response';
import { ExpirationPuglin } from 'workbox-expiration';

const pageCache = new CacheFirst({
    cacheName: 'pwa-geoloc-cache',
    plugins: [
        new CacheableResponsePuglin({
            statuses: [0, 200],
        }),
        new ExpirationPuglin({
            maxAgeSeconds: 30 * 24 * 60 * 60,
        }),
    ],
});

warmStrategyCache({
    urls: ['/index.html', '/'],
    startegy: pageCache,
});

registerRoute(
    ({ request }) => ['style', 'script', 'worker']
    .includes(request.destination),
    new StaleWhileRevalidate({
        cacheName: 'asset-cache',
        plugins: [
            new CacheableResponsePuglin({
                statuses: [0, 200],
            }),
        ],
    }),
);

offlineFallback({
    pageFallback: '/offline.html',
});

const imageRoute = new Route(({ request }) => {
    return request.destination === 'image';
}, new CacheFirst({
    cacheName: 'images',
    plugins: [
        new ExpirationPuglin({
            maxAgeSeconds: 60 * 60 * 24 * 30,
        })
    ]
}));
registerRoute(imageRoute);