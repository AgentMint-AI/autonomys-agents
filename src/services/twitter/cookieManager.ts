// import { writeFileSync, readFileSync, existsSync } from 'fs';
// import { TwitterCookie, parseBrowserCookies, formatCookiesForScraper } from './cookies';
// import { createLogger } from '../../utils/logger.js';

// const logger = createLogger('twitter-cookie-manager');

// export class TwitterCookieManager {
//   private cookiesPath: string;

//   constructor(cookiesPath: string = 'twitter_cookies.json') {
//     this.cookiesPath = cookiesPath;
//   }

//   saveCookies(cookieString: string): void {
//     try {
//       const cookies = parseBrowserCookies(cookieString);
//       writeFileSync(this.cookiesPath, JSON.stringify(cookies, null, 2));
//       logger.info('Cookies saved successfully');
//     } catch (error) {
//       logger.error('Failed to save cookies:', error);
//       throw error;
//     }
//   }

//   loadCookies(): string[] | null {
//     try {
//       if (!existsSync(this.cookiesPath)) {
//         return null;
//       }
//       const cookiesJson = readFileSync(this.cookiesPath, 'utf8');
//       const cookies: TwitterCookie[] = JSON.parse(cookiesJson);
//       return formatCookiesForScraper(cookies);
//     } catch (error) {
//       logger.error('Failed to load cookies:', error);
//       return null;
//     }
//   }
// }
