// import { createTwitterApi } from './services/twitter/client';
// import { TwitterCookieManager } from './services/twitter/cookieManager';

// // In your application:
// async function initializeTwitterApi(username: string, browserCookies?: string) {
//   const cookieManager = new TwitterCookieManager();

//   if (browserCookies) {
//     // Save new cookies if provided
//     cookieManager.saveCookies(browserCookies);
//   }

//   // Load cookies
//   const cookies = cookieManager.loadCookies();

//   if (!cookies) {
//     throw new Error('No valid cookies found. Please provide Twitter cookies from your browser.');
//   }

//   // Initialize API with cookies
//   const api = await createTwitterApi({
//     username,
//     cookiesString: cookies.join('; ')
//   });

//   return api;
// }

// // Usage example:
// try {
//   const browserCookies = 'auth_token=xyz; ct0=abc; ...'; // Get from browser
//   const api = await initializeTwitterApi('username', browserCookies);
//   // Use API...
// } catch (error) {
//   console.error('Failed to initialize Twitter API:', error);
// }
