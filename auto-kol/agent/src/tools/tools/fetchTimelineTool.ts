import { DynamicStructuredTool } from '@langchain/core/tools';
import { z } from 'zod';
import { createLogger } from '../../utils/logger.js';
import { getTimeLine } from '../../utils/twitter.js';
import { ExtendedScraper } from '../../services/twitter/api.js';

const logger = createLogger('fetch-timeline-tool');

<<<<<<< HEAD
export const createFetchTimelineTool = (twitterScraper: ExtendedScraper) =>
=======
export const createFetchTimelineTool = () =>
>>>>>>> main
  new DynamicStructuredTool({
    name: 'fetch_timeline',
    description: 'Fetch the timeline regularly to get new tweets',
    schema: z.object({}),
    func: async () => {
      try {
<<<<<<< HEAD
        const tweets = await getTimeLine(twitterScraper);
=======
        const tweets = await getTimeLine();
>>>>>>> main
        tweets.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        return {
          tweets: tweets,
          lastProcessedId: tweets[tweets.length - 1]?.id || null,
        };
      } catch (error) {
        logger.error('Error in fetchTimelineTool:', error);
        return {
          tweets: [],
          lastProcessedId: null,
        };
      }
    },
  });
