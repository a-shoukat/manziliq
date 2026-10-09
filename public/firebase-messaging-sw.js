/* Firebase Cloud Messaging service worker — receives background push notifications. */
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.2/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'AIzaSyAGfv8qyY_aOPd0eKLltQF79NN6xL4DxQw',
  authDomain: 'manziliq.firebaseapp.com',
  projectId: 'manziliq',
  messagingSenderId: '680694315850',
  appId: '1:680694315850:web:c72f77abcd43bbc5511fb3',
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = (payload.notification && payload.notification.title) || 'ManzilIQ';
  const options = {
    body: (payload.notification && payload.notification.body) || '',
    icon: '/favicon.ico',
  };
  self.registration.showNotification(title, options);
});
