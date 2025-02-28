// export interface TwitterCookie {
//   name: string;
//   value: string;
//   domain: string;
//   path: string;
// }

// export const parseBrowserCookies = (cookieString: string): TwitterCookie[] => {
//   return cookieString.split(';')
//     .map(cookie => cookie.trim().split('='))
//     .filter(([name]) => name) // Filter out empty cookies
//     .map(([name, value]) => ({
//       name,
//       value,
//       domain: '.twitter.com',
//       path: '/'
//     }));
// };

// export const formatCookiesForScraper = (cookies: TwitterCookie[]): string[] => {
//   return cookies.map(cookie =>
//     `${cookie.name}=${cookie.value}; Domain=${cookie.domain}; Path=${cookie.path}`
//   );
// };
