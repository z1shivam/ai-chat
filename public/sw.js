// Simple service worker for static PWA// Simple service worker for static PWAif(!self.define){let e,a={};const i=(i,t)=>(i=new URL(i+".js",t).href,a[i]||new Promise(a=>{if("document"in self){const e=document.createElement("script");e.src=i,e.onload=a,document.head.appendChild(e)}else e=i,importScripts(i),a()}).then(()=>{let e=a[i];if(!e)throw new Error(`Module ${i} didn’t register its module`);return e}));self.define=(t,s)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(a[c])return;let n={};const r=e=>i(e,c),f={module:{uri:c},exports:n,require:r};a[c]=Promise.all(t.map(e=>f[e]||r(e))).then(e=>(s(...e),n))}}define(["./workbox-e9849328"],function(e){"use strict";importScripts(),self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"/_next/app-build-manifest.json",revision:"0e713b7fb88c89a27b0ff281b3611032"},{url:"/_next/static/XIA-4GSZ0ERbzghqqmP4Y/_buildManifest.js",revision:"a611d278ff56b38cf9e896f7d59c0fb6"},{url:"/_next/static/XIA-4GSZ0ERbzghqqmP4Y/_ssgManifest.js",revision:"b6652df95db52feb4daf4eca35380933"},{url:"/_next/static/chunks/2-76f5448c52b886f6.js",revision:"76f5448c52b886f6"},{url:"/_next/static/chunks/220-ea0f05505ebc2e71.js",revision:"ea0f05505ebc2e71"},{url:"/_next/static/chunks/257-cb95508519cc4489.js",revision:"cb95508519cc4489"},{url:"/_next/static/chunks/292-af7cb8fa2a3dda8c.js",revision:"af7cb8fa2a3dda8c"},{url:"/_next/static/chunks/31.55c31c3fdc7f6437.js",revision:"55c31c3fdc7f6437"},{url:"/_next/static/chunks/320-5b8a9e70c2a27bca.js",revision:"5b8a9e70c2a27bca"},{url:"/_next/static/chunks/476-c8dd5c827c88bf6d.js",revision:"c8dd5c827c88bf6d"},{url:"/_next/static/chunks/477-c7f984b41d8e6036.js",revision:"c7f984b41d8e6036"},{url:"/_next/static/chunks/75146d7d-3d8e8c250c14df47.js",revision:"3d8e8c250c14df47"},{url:"/_next/static/chunks/762.f5c667edb48e736d.js",revision:"f5c667edb48e736d"},{url:"/_next/static/chunks/976-430259f91931e460.js",revision:"430259f91931e460"},{url:"/_next/static/chunks/app/_not-found/page-99ce7ff50876b672.js",revision:"99ce7ff50876b672"},{url:"/_next/static/chunks/app/layout-4f54dfccaafb7630.js",revision:"4f54dfccaafb7630"},{url:"/_next/static/chunks/app/page-4c3795d9737d3511.js",revision:"4c3795d9737d3511"},{url:"/_next/static/chunks/app/test/page-9a29ded5cdabdc57.js",revision:"9a29ded5cdabdc57"},{url:"/_next/static/chunks/d44bed6b-777072c1e9c6656e.js",revision:"777072c1e9c6656e"},{url:"/_next/static/chunks/framework-e4d0c34e5911cd31.js",revision:"e4d0c34e5911cd31"},{url:"/_next/static/chunks/main-app-2c6ced0b1bbe8d06.js",revision:"2c6ced0b1bbe8d06"},{url:"/_next/static/chunks/main-f4633b86566714a2.js",revision:"f4633b86566714a2"},{url:"/_next/static/chunks/pages/_app-b1e8a3ba5a502098.js",revision:"b1e8a3ba5a502098"},{url:"/_next/static/chunks/pages/_error-812bdf440c6bfd06.js",revision:"812bdf440c6bfd06"},{url:"/_next/static/chunks/polyfills-42372ed130431b0a.js",revision:"846118c33b2c0e922d7b3a7676f81f6f"},{url:"/_next/static/chunks/webpack-b890cd0c10d67f5b.js",revision:"b890cd0c10d67f5b"},{url:"/_next/static/css/09dfadb69bdaa005.css",revision:"09dfadb69bdaa005"},{url:"/_next/static/css/8bd0740d6cc1c541.css",revision:"8bd0740d6cc1c541"},{url:"/_next/static/media/4cf2300e9c8272f7-s.p.woff2",revision:"18bae71b1e1b2bb25321090a3b563103"},{url:"/_next/static/media/8d697b304b401681-s.woff2",revision:"cc728f6c0adb04da0dfcb0fc436a8ae5"},{url:"/_next/static/media/KaTeX_AMS-Regular.1608a09b.woff",revision:"1608a09b"},{url:"/_next/static/media/KaTeX_AMS-Regular.4aafdb68.ttf",revision:"4aafdb68"},{url:"/_next/static/media/KaTeX_AMS-Regular.a79f1c31.woff2",revision:"a79f1c31"},{url:"/_next/static/media/KaTeX_Caligraphic-Bold.b6770918.woff",revision:"b6770918"},{url:"/_next/static/media/KaTeX_Caligraphic-Bold.cce5b8ec.ttf",revision:"cce5b8ec"},{url:"/_next/static/media/KaTeX_Caligraphic-Bold.ec17d132.woff2",revision:"ec17d132"},{url:"/_next/static/media/KaTeX_Caligraphic-Regular.07ef19e7.ttf",revision:"07ef19e7"},{url:"/_next/static/media/KaTeX_Caligraphic-Regular.55fac258.woff2",revision:"55fac258"},{url:"/_next/static/media/KaTeX_Caligraphic-Regular.dad44a7f.woff",revision:"dad44a7f"},{url:"/_next/static/media/KaTeX_Fraktur-Bold.9f256b85.woff",revision:"9f256b85"},{url:"/_next/static/media/KaTeX_Fraktur-Bold.b18f59e1.ttf",revision:"b18f59e1"},{url:"/_next/static/media/KaTeX_Fraktur-Bold.d42a5579.woff2",revision:"d42a5579"},{url:"/_next/static/media/KaTeX_Fraktur-Regular.7c187121.woff",revision:"7c187121"},{url:"/_next/static/media/KaTeX_Fraktur-Regular.d3c882a6.woff2",revision:"d3c882a6"},{url:"/_next/static/media/KaTeX_Fraktur-Regular.ed38e79f.ttf",revision:"ed38e79f"},{url:"/_next/static/media/KaTeX_Main-Bold.b74a1a8b.ttf",revision:"b74a1a8b"},{url:"/_next/static/media/KaTeX_Main-Bold.c3fb5ac2.woff2",revision:"c3fb5ac2"},{url:"/_next/static/media/KaTeX_Main-Bold.d181c465.woff",revision:"d181c465"},{url:"/_next/static/media/KaTeX_Main-BoldItalic.6f2bb1df.woff2",revision:"6f2bb1df"},{url:"/_next/static/media/KaTeX_Main-BoldItalic.70d8b0a5.ttf",revision:"70d8b0a5"},{url:"/_next/static/media/KaTeX_Main-BoldItalic.e3f82f9d.woff",revision:"e3f82f9d"},{url:"/_next/static/media/KaTeX_Main-Italic.47373d1e.ttf",revision:"47373d1e"},{url:"/_next/static/media/KaTeX_Main-Italic.8916142b.woff2",revision:"8916142b"},{url:"/_next/static/media/KaTeX_Main-Italic.9024d815.woff",revision:"9024d815"},{url:"/_next/static/media/KaTeX_Main-Regular.0462f03b.woff2",revision:"0462f03b"},{url:"/_next/static/media/KaTeX_Main-Regular.7f51fe03.woff",revision:"7f51fe03"},{url:"/_next/static/media/KaTeX_Main-Regular.b7f8fe9b.ttf",revision:"b7f8fe9b"},{url:"/_next/static/media/KaTeX_Math-BoldItalic.572d331f.woff2",revision:"572d331f"},{url:"/_next/static/media/KaTeX_Math-BoldItalic.a879cf83.ttf",revision:"a879cf83"},{url:"/_next/static/media/KaTeX_Math-BoldItalic.f1035d8d.woff",revision:"f1035d8d"},{url:"/_next/static/media/KaTeX_Math-Italic.5295ba48.woff",revision:"5295ba48"},{url:"/_next/static/media/KaTeX_Math-Italic.939bc644.ttf",revision:"939bc644"},{url:"/_next/static/media/KaTeX_Math-Italic.f28c23ac.woff2",revision:"f28c23ac"},{url:"/_next/static/media/KaTeX_SansSerif-Bold.8c5b5494.woff2",revision:"8c5b5494"},{url:"/_next/static/media/KaTeX_SansSerif-Bold.94e1e8dc.ttf",revision:"94e1e8dc"},{url:"/_next/static/media/KaTeX_SansSerif-Bold.bf59d231.woff",revision:"bf59d231"},{url:"/_next/static/media/KaTeX_SansSerif-Italic.3b1e59b3.woff2",revision:"3b1e59b3"},{url:"/_next/static/media/KaTeX_SansSerif-Italic.7c9bc82b.woff",revision:"7c9bc82b"},{url:"/_next/static/media/KaTeX_SansSerif-Italic.b4c20c84.ttf",revision:"b4c20c84"},{url:"/_next/static/media/KaTeX_SansSerif-Regular.74048478.woff",revision:"74048478"},{url:"/_next/static/media/KaTeX_SansSerif-Regular.ba21ed5f.woff2",revision:"ba21ed5f"},{url:"/_next/static/media/KaTeX_SansSerif-Regular.d4d7ba48.ttf",revision:"d4d7ba48"},{url:"/_next/static/media/KaTeX_Script-Regular.03e9641d.woff2",revision:"03e9641d"},{url:"/_next/static/media/KaTeX_Script-Regular.07505710.woff",revision:"07505710"},{url:"/_next/static/media/KaTeX_Script-Regular.fe9cbbe1.ttf",revision:"fe9cbbe1"},{url:"/_next/static/media/KaTeX_Size1-Regular.e1e279cb.woff",revision:"e1e279cb"},{url:"/_next/static/media/KaTeX_Size1-Regular.eae34984.woff2",revision:"eae34984"},{url:"/_next/static/media/KaTeX_Size1-Regular.fabc004a.ttf",revision:"fabc004a"},{url:"/_next/static/media/KaTeX_Size2-Regular.57727022.woff",revision:"57727022"},{url:"/_next/static/media/KaTeX_Size2-Regular.5916a24f.woff2",revision:"5916a24f"},{url:"/_next/static/media/KaTeX_Size2-Regular.d6b476ec.ttf",revision:"d6b476ec"},{url:"/_next/static/media/KaTeX_Size3-Regular.9acaf01c.woff",revision:"9acaf01c"},{url:"/_next/static/media/KaTeX_Size3-Regular.a144ef58.ttf",revision:"a144ef58"},{url:"/_next/static/media/KaTeX_Size3-Regular.b4230e7e.woff2",revision:"b4230e7e"},{url:"/_next/static/media/KaTeX_Size4-Regular.10d95fd3.woff2",revision:"10d95fd3"},{url:"/_next/static/media/KaTeX_Size4-Regular.7a996c9d.woff",revision:"7a996c9d"},{url:"/_next/static/media/KaTeX_Size4-Regular.fbccdabe.ttf",revision:"fbccdabe"},{url:"/_next/static/media/KaTeX_Typewriter-Regular.6258592b.woff",revision:"6258592b"},{url:"/_next/static/media/KaTeX_Typewriter-Regular.a8709e36.woff2",revision:"a8709e36"},{url:"/_next/static/media/KaTeX_Typewriter-Regular.d97aaf4a.ttf",revision:"d97aaf4a"},{url:"/_next/static/media/ba015fad6dcf6784-s.woff2",revision:"8ea4f719af3312a055caf09f34c89a77"},{url:"/apple-touch-icon.svg",revision:"94b14e1975352a7fe9b2a3526b06fb03"},{url:"/favicon.ico",revision:"7f98bbc43ba0d1dbf3564adf0821a304"},{url:"/icon-192x192.svg",revision:"a1d18ebf6d1ae9ba5928dd9820d89dfe"},{url:"/icon-512x512.svg",revision:"52083edeb241926a117daf1807a55cf0"},{url:"/manifest.json",revision:"21139ac1e79267937d7d2c0c69847979"}],{ignoreURLParametersMatching:[]}),e.cleanupOutdatedCaches(),e.registerRoute("/",new e.NetworkFirst({cacheName:"start-url",plugins:[{cacheWillUpdate:async({request:e,response:a,event:i,state:t})=>a&&"opaqueredirect"===a.type?new Response(a.body,{status:200,statusText:"OK",headers:a.headers}):a}]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:gstatic)\.com\/.*/i,new e.CacheFirst({cacheName:"google-fonts-webfonts",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:31536e3})]}),"GET"),e.registerRoute(/^https:\/\/fonts\.(?:googleapis)\.com\/.*/i,new e.StaleWhileRevalidate({cacheName:"google-fonts-stylesheets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:eot|otf|ttc|ttf|woff|woff2|font.css)$/i,new e.StaleWhileRevalidate({cacheName:"static-font-assets",plugins:[new e.ExpirationPlugin({maxEntries:4,maxAgeSeconds:604800})]}),"GET"),e.registerRoute(/\.(?:jpg|jpeg|gif|png|svg|ico|webp)$/i,new e.StaleWhileRevalidate({cacheName:"static-image-assets",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/image\?url=.+$/i,new e.StaleWhileRevalidate({cacheName:"next-image",plugins:[new e.ExpirationPlugin({maxEntries:64,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp3|wav|ogg)$/i,new e.CacheFirst({cacheName:"static-audio-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:mp4)$/i,new e.CacheFirst({cacheName:"static-video-assets",plugins:[new e.RangeRequestsPlugin,new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:js)$/i,new e.StaleWhileRevalidate({cacheName:"static-js-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:css|less)$/i,new e.StaleWhileRevalidate({cacheName:"static-style-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\/_next\/data\/.+\/.+\.json$/i,new e.StaleWhileRevalidate({cacheName:"next-data",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(/\.(?:json|xml|csv)$/i,new e.NetworkFirst({cacheName:"static-data-assets",plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>{if(!(self.origin===e.origin))return!1;const a=e.pathname;return!a.startsWith("/api/auth/")&&!!a.startsWith("/api/")},new e.NetworkFirst({cacheName:"apis",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:16,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>{if(!(self.origin===e.origin))return!1;return!e.pathname.startsWith("/api/")},new e.NetworkFirst({cacheName:"others",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:86400})]}),"GET"),e.registerRoute(({url:e})=>!(self.origin===e.origin),new e.NetworkFirst({cacheName:"cross-origin",networkTimeoutSeconds:10,plugins:[new e.ExpirationPlugin({maxEntries:32,maxAgeSeconds:3600})]}),"GET")});

const CACHE_NAME = 'ai-chat-v1';

const urlsToCache = [const CACHE_NAME = 'ai-chat-v1';

  '/',const urlsToCache = [

  '/manifest.json',  '/',

  '/icon-192x192.svg',  '/manifest.json',

  '/icon-512x512.svg',  '/icon-192x192.svg',

  '/apple-touch-icon.svg',  '/icon-512x512.svg',

  '/favicon.ico'  '/apple-touch-icon.svg',

];  '/favicon.ico'

];

self.addEventListener('install', function(event) {

  event.waitUntil(self.addEventListener('install', function(event) {

    caches.open(CACHE_NAME)  event.waitUntil(

      .then(function(cache) {    caches.open(CACHE_NAME)

        return cache.addAll(urlsToCache);      .then(function(cache) {

      })        return cache.addAll(urlsToCache);

  );      })

});  );

});

self.addEventListener('fetch', function(event) {

  event.respondWith(self.addEventListener('fetch', function(event) {

    caches.match(event.request)  event.respondWith(

      .then(function(response) {    caches.match(event.request)

        // Return cached version or fetch from network      .then(function(response) {

        return response || fetch(event.request);        // Return cached version or fetch from network

      }        return response || fetch(event.request);

    )      }

  );    )

});  );

});

self.addEventListener('activate', function(event) {

  event.waitUntil(self.addEventListener('activate', function(event) {

    caches.keys().then(function(cacheNames) {  event.waitUntil(

      return Promise.all(    caches.keys().then(function(cacheNames) {

        cacheNames.map(function(cacheName) {      return Promise.all(

          if (cacheName !== CACHE_NAME) {        cacheNames.map(function(cacheName) {

            return caches.delete(cacheName);          if (cacheName !== CACHE_NAME) {

          }            return caches.delete(cacheName);

        })          }

      );        })

    })      );

  );    })

});  );
});