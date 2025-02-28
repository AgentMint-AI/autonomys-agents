import { Request, Response } from 'express';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { loadCharacter } from '../../config/characters.js';
import dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../../');

interface CreateCharacterRequest {
  name: string;
  config: {
    name: string;
    description: string;
    personality: string[];
    expertise: string[];
    communication_rules?: {
      rules?: string[];
      words_to_avoid?: string[];
    };
    twitter: {
      username: string;
      password: string;
      NUM_TIMELINE_TWEETS?: number;
      NUM_FOLLOWING_RECENT_TWEETS?: number;
      NUM_RANDOM_FOLLOWINGS?: number;
      MAX_MENTIONS?: number;
      MAX_THREAD_LENGTH?: number;
      MAX_MY_RECENT_TWEETS?: number;
      MAX_MY_RECENT_REPLIES?: number;
      RESPONSE_INTERVAL_MINUTES?: number;
      POST_INTERVAL_MINUTES?: number;
      POST_TWEETS?: boolean;
      trend_focus?: string[];
      content_focus?: string[];
      engagement_criteria?: string[];
      reply_style?: string[];
    };
    llm?: {
      configuration?: {
        large?: {
          provider?: string;
          model?: string;
        };
        small?: {
          provider?: string;
          model?: string;
        };
      };
      nodes?: {
        decision?: {
          size?: string;
          temperature?: number;
        };
        analyze?: {
          size?: string;
          temperature?: number;
        };
        generation?: {
          size?: string;
          temperature?: number;
        };
        response?: {
          size?: string;
          temperature?: number;
        };
        orchestrator?: {
          size?: string;
          temperature?: number;
        };
      };
    };
    auto_drive?: {
      upload: boolean;
    };
    memory?: {
      MAX_PROCESSED_IDS?: number;
    };
    contentStrategy?: {
      style?: string[];
      tags?: string[];
      topics?: string[];
      engagement?: {
        replyStyle?: string;
      };
      tone?: string;
      contentTypes?: {
        text?: boolean;
        polls?: boolean;
        threads?: boolean;
        spaces?: boolean;
      };
    };
    chain: string;
    communityGuidelines?: {
      allowedTopics?: string[];
      bannedTopics?: string[];
      moderationLevel?: string;
      languagePreference?: string;
    };
    tokenomics?: {
      isMintable?: boolean;
      isBurnable?: boolean;
      isPausable?: boolean;
      totalSupply?: string;
      circulatingSupply?: string;
      marketCap?: string;
      price?: string;
    };
    metadata?: {
      website?: string;
      telegram?: string;
      discord?: string;
      chain?: string;
      contractAddress?: string;
    };
    team?: {
      name: string;
      role: string;
      socials: Record<string, string>;
    }[];
    roadmap?: {
      title: string;
      description: string;
      date: string;
      completed: boolean;
    }[];
  };
}

interface TwitterSchedule {
  POST_TWEETS: boolean;
  POST_INTERVAL_MINUTES: number;
  content_focus: string[];
  trend_focus: string[];
  engagement_criteria: string[];
  reply_style: string[];
}

interface ScheduleUpdateRequest {
  twitter: Partial<TwitterSchedule>;
}

interface CharacterProfileUpdate {
  name?: string;
  description?: string;
  personality?: string[];
  expertise?: string[];
  communication_rules?: {
    rules?: string[];
    words_to_avoid?: string[];
  };
}

interface CharacterStatus {
  name: string;
  isRunning: boolean;
  uptime?: number;
  lastActivity?: string;
  stats?: {
    tweets?: number;
    replies?: number;
    errors?: number;
  };
}

const runningProcesses = new Map<string, any>();
const processStartTimes = new Map<string, number>();
const processStats = new Map<
  string,
  {
    tweets: number;
    replies: number;
    errors: number;
  }
>();

export const createCharacter = async (req: Request, res: Response) => {
  try {
    const { name, config } = req.body as CreateCharacterRequest;
    const targetDir = path.join(rootDir, 'characters', name, 'config');
    console.warn('response', req.body);
    await fs.mkdir(targetDir, { recursive: true });

    const characterConfig = {
      name: config.name,
      description: config.description,
      personality: [
        ...config.personality,
        ...(config.contentStrategy?.style || []),
        `${config.chain} ecosystem expert`,
      ],
      expertise: [
        ...config.expertise,
        'Cryptocurrency',
        'Blockchain Technology',
        config.chain,
        'Smart Contracts',
        'Community Management',
        'Social Media Marketing',
      ].filter(Boolean),
      communication_rules: {
        rules: [
          ...(config.communication_rules?.rules || []),
          ...(config.communityGuidelines?.allowedTopics || []),
        ],
        words_to_avoid: [
          ...(config.communication_rules?.words_to_avoid || []),
          ...(config.communityGuidelines?.bannedTopics || []),
        ],
        allowed_topics: config.communityGuidelines?.allowedTopics || [
          'Cryptocurrency',
          'Blockchain',
          'Technology',
        ],
        banned_topics: config.communityGuidelines?.bannedTopics || ['NSFW content', 'Hate speech'],
        moderation_level: config.communityGuidelines?.moderationLevel || 'medium',
        language_preference: config.communityGuidelines?.languagePreference || 'english',
      },
      twitter_profile: {
        username: config.twitter.username,
        trend_focus: [
          ...(config.contentStrategy?.tags || []),
          `#${config.chain}`,
          '#crypto',
          '#blockchain',
        ],
        content_focus: [
          ...(config.contentStrategy?.topics || []),
          'Project Updates',
          'Community Engagement',
          'Market Analysis',
          `${config.chain} Ecosystem`,
        ],
        engagement_criteria: [
          'Community Growth',
          'Token Utility',
          'Technical Development',
          `${config.chain} Integration`,
        ],
        reply_style: [
          config.contentStrategy?.engagement?.replyStyle || 'friendly',
          config.contentStrategy?.tone || 'positive',
        ],
        content_types: {
          text: config.contentStrategy?.contentTypes?.text ?? true,
          polls: config.contentStrategy?.contentTypes?.polls ?? false,
          threads: config.contentStrategy?.contentTypes?.threads ?? true,
          spaces: config.contentStrategy?.contentTypes?.spaces ?? false,
        },
        post_frequency: 'regular',
        tone: config.contentStrategy?.tone || 'positive',
      },
      tokenomics: config.tokenomics,
      metadata: {
        website: config.metadata?.website || '',
        telegram: config.metadata?.telegram || '',
        discord: config.metadata?.discord || '',
        chain: config.metadata?.chain,
        contractAddress: config.metadata?.contractAddress || '',
      },
      team:
        config.team?.map(member => ({
          name: member.name,
          role: member.role,
          socials: member.socials || {},
        })) || [],
      roadmap:
        config.roadmap?.map(item => ({
          title: item.title,
          description: item.description,
          date: `"${item.date.toString()}"`,
          completed: item.completed,
        })) || [],
    };

    // Create config.yaml
    const configYaml = {
      twitter: {
        NUM_TIMELINE_TWEETS: config.twitter.NUM_TIMELINE_TWEETS ?? 10,
        NUM_FOLLOWING_RECENT_TWEETS: config.twitter.NUM_FOLLOWING_RECENT_TWEETS ?? 10,
        NUM_RANDOM_FOLLOWINGS: config.twitter.NUM_RANDOM_FOLLOWINGS ?? 5,
        MAX_MENTIONS: config.twitter.MAX_MENTIONS ?? 20,
        MAX_THREAD_LENGTH: config.twitter.MAX_THREAD_LENGTH ?? 20,
        MAX_MY_RECENT_TWEETS: config.twitter.MAX_MY_RECENT_TWEETS ?? 10,
        MAX_MY_RECENT_REPLIES: config.twitter.MAX_MY_RECENT_REPLIES ?? 10,
        RESPONSE_INTERVAL_MINUTES: config.twitter.RESPONSE_INTERVAL_MINUTES ?? 60,
        POST_INTERVAL_MINUTES: config.twitter.POST_INTERVAL_MINUTES ?? 90,
        POST_TWEETS: config.twitter.POST_TWEETS ?? false,
      },
      auto_drive: {
        upload: config.auto_drive?.upload ?? false,
      },
      llm: {
        configuration: {
          large: {
            provider: config.llm?.configuration?.large?.provider ?? 'anthropic',
            model: config.llm?.configuration?.large?.model ?? 'claude-3-5-sonnet-latest',
          },
          small: {
            provider: config.llm?.configuration?.small?.provider ?? 'anthropic',
            model: config.llm?.configuration?.small?.model ?? 'claude-3-5-haiku-20241022',
          },
        },
        nodes: {
          decision: {
            size: config.llm?.nodes?.decision?.size ?? 'small',
            temperature: config.llm?.nodes?.decision?.temperature ?? 0.2,
          },
          analyze: {
            size: config.llm?.nodes?.analyze?.size ?? 'large',
            temperature: config.llm?.nodes?.analyze?.temperature ?? 0.5,
          },
          generation: {
            size: config.llm?.nodes?.generation?.size ?? 'large',
            temperature: config.llm?.nodes?.generation?.temperature ?? 0.8,
          },
          response: {
            size: config.llm?.nodes?.response?.size ?? 'small',
            temperature: config.llm?.nodes?.response?.temperature ?? 0.8,
          },
          orchestrator: {
            size: config.llm?.nodes?.orchestrator?.size ?? 'large',
            temperature: config.llm?.nodes?.orchestrator?.temperature ?? 0.5,
          },
        },
      },
      memory: {
        MAX_PROCESSED_IDS: config.memory?.MAX_PROCESSED_IDS ?? 5000,
      },
    };

    // Write files
    await fs.writeFile(path.join(targetDir, `${name}.yaml`), yaml.stringify(characterConfig));

    await fs.writeFile(path.join(targetDir, 'config.yaml'), yaml.stringify(configYaml));

    // Write environment config with actual values from process.env
    const envContent = `
TWITTER_USERNAME="${config.twitter.username}"
TWITTER_PASSWORD="${config.twitter.password}"
OPENAI_API_KEY=${process.env.OPENAI_API_KEY || ''}
ANTHROPIC_API_KEY=${process.env.ANTHROPIC_API_KEY || ''}
LLAMA_API_URL=${process.env.LLAMA_API_URL || ''}
DEEPSEEK_URL=${process.env.DEEPSEEK_URL || ''}
DEEPSEEK_API_KEY=${process.env.DEEPSEEK_API_KEY || ''}
AUTO_DRIVE_API_KEY=${process.env.AUTO_DRIVE_API_KEY || ''}
AUTO_DRIVE_ENCRYPTION_PASSWORD=${process.env.AUTO_DRIVE_ENCRYPTION_PASSWORD || ''}
RPC_URL="https://auto-evm.taurus.autonomys.xyz/ws"
CONTRACT_ADDRESS=${process.env.CONTRACT_ADDRESS || ''}
PRIVATE_KEY=${process.env.PRIVATE_KEY || ''}
NODE_ENV=development
AGENT_VERSION=2.0.0
    `.trim();

    await fs.writeFile(path.join(targetDir, '.env'), envContent);

    res.status(201).json({ message: 'Character created successfully' });
  } catch (error) {
    console.error('Error creating character:', error);
    res.status(500).json({ error: 'Failed to create character' });
  }
};

export const startCharacter = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    // Validate character exists
    loadCharacter(name);

    const process = spawn('yarn', ['dev', name], {
      cwd: rootDir,
      stdio: 'pipe',
    });

    runningProcesses.set(name, process);
    processStartTimes.set(name, Date.now());
    processStats.set(name, { tweets: 0, replies: 0, errors: 0 });

    process.stdout.on('data', data => {
      const output = data.toString();
      console.warn(`[${name}] ${output}`);

      // Track basic stats from output
      if (output.includes('Tweet posted')) {
        const stats = processStats.get(name);
        if (stats) stats.tweets++;
      }
      if (output.includes('Reply posted')) {
        const stats = processStats.get(name);
        if (stats) stats.replies++;
      }
    });

    process.stderr.on('data', data => {
      console.error(`[${name}] Error: ${data}`);
      const stats = processStats.get(name);
      if (stats) stats.errors++;
    });

    res.json({ message: 'Character started successfully' });
  } catch (error) {
    console.error('Error starting character:', error);
    res.status(500).json({ error: 'Failed to start character' });
  }
};

export const stopCharacter = async (req: Request, res: Response) => {
  const { name } = req.params;

  const process = runningProcesses.get(name);
  if (!process) {
    return res.status(404).json({ error: 'Character is not running' });
  }

  try {
    process.kill();
    runningProcesses.delete(name);
    processStartTimes.delete(name);
    processStats.delete(name);
    res.json({ message: 'Character stopped successfully' });
  } catch (error) {
    console.error('Error stopping character:', error);
    res.status(500).json({ error: 'Failed to stop character' });
  }
};

export const updateSchedule = async (req: Request, res: Response) => {
  const { name } = req.params;
  const updates = req.body as ScheduleUpdateRequest;

  try {
    const configPath = path.join(rootDir, 'characters', name, 'config', 'config.yaml');
    const characterPath = path.join(rootDir, 'characters', name, 'config', `${name}.yaml`);

    // Read existing configs
    const configFile = await fs.readFile(configPath, 'utf8');
    const characterFile = await fs.readFile(characterPath, 'utf8');

    const config = yaml.parse(configFile);
    const character = yaml.parse(characterFile);

    // Update twitter schedule settings
    if (updates.twitter) {
      // Update config.yaml settings
      if (updates.twitter.POST_TWEETS !== undefined) {
        config.twitter.POST_TWEETS = updates.twitter.POST_TWEETS;
      }
      if (updates.twitter.POST_INTERVAL_MINUTES !== undefined) {
        config.twitter.POST_INTERVAL_MINUTES = updates.twitter.POST_INTERVAL_MINUTES;
      }

      // Update character.yaml settings
      if (updates.twitter.content_focus) {
        character.twitter_profile.contentFocus = updates.twitter.content_focus;
      }
      if (updates.twitter.trend_focus) {
        character.twitter_profile.trendFocus = updates.twitter.trend_focus;
      }
      if (updates.twitter.engagement_criteria) {
        character.twitter_profile.engagementCriteria = updates.twitter.engagement_criteria;
      }
      if (updates.twitter.reply_style) {
        character.twitter_profile.replyStyle = updates.twitter.reply_style;
      }
    }

    // Write updated configs back to files
    await fs.writeFile(configPath, yaml.stringify(config));
    await fs.writeFile(characterPath, yaml.stringify(character));

    // Restart the character if it's running
    const process = runningProcesses.get(name);
    if (process) {
      process.kill();
      runningProcesses.delete(name);
      await startCharacter({ params: { name } } as Request, res);
    }

    res.json({ message: 'Schedule updated successfully' });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({ error: 'Failed to update schedule' });
  }
};

export const getSchedule = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    const configPath = path.join(rootDir, 'characters', name, 'config', 'config.yaml');
    const characterPath = path.join(rootDir, 'characters', name, 'config', `${name}.yaml`);

    const configFile = await fs.readFile(configPath, 'utf8');
    const characterFile = await fs.readFile(characterPath, 'utf8');

    const config = yaml.parse(configFile);
    const character = yaml.parse(characterFile);
    console.warn(character);
    const schedule = {
      twitter: {
        POST_TWEETS: config.twitter.POST_TWEETS,
        POST_INTERVAL_MINUTES: config.twitter.POST_INTERVAL_MINUTES,
        content_focus: character.twitter_profile.content_focus,
        trend_focus: character.twitter_profile.trend_focus,
        engagement_criteria: character.twitter_profile.engagement_criteria,
        reply_style: character.twitter_profile.reply_style,
      },
    };

    res.json(schedule);
  } catch (error) {
    console.error('Error getting schedule:', error);
    res.status(500).json({ error: 'Failed to get schedule' });
  }
};

export const updateCharacterProfile = async (req: Request, res: Response) => {
  const { name } = req.params;
  const updates = req.body as CharacterProfileUpdate;

  try {
    const characterPath = path.join(rootDir, 'characters', name, 'config', `${name}.yaml`);

    // Read existing character config
    const characterFile = await fs.readFile(characterPath, 'utf8');
    const character = yaml.parse(characterFile);

    // Update character profile
    if (updates.name) character.name = updates.name;
    if (updates.description) character.description = updates.description;
    if (updates.personality) character.personality = updates.personality;
    if (updates.expertise) character.expertise = updates.expertise;
    if (updates.communication_rules) {
      character.communicationRules = {
        ...character.communicationRules,
        ...updates.communication_rules,
      };
    }

    // Write updated config back to file
    await fs.writeFile(characterPath, yaml.stringify(character));

    // Restart the character if it's running
    const process = runningProcesses.get(name);
    if (process) {
      process.kill();
      runningProcesses.delete(name);
      await startCharacter({ params: { name } } as Request, res);
    }

    res.json({
      message: 'Character profile updated successfully',
      profile: character,
    });
  } catch (error) {
    console.error('Error updating character profile:', error);
    res.status(500).json({ error: 'Failed to update character profile' });
  }
};

export const getCharacterProfile = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    const characterPath = path.join(rootDir, 'characters', name, 'config', `${name}.yaml`);
    const characterFile = await fs.readFile(characterPath, 'utf8');
    const character = yaml.parse(characterFile);
    console.warn(character);
    const profile = {
      name: character.name,
      description: character.description,
      personality: character.personality,
      expertise: character.expertise,
      communication_rules: character.communication_rules,
    };

    res.json(profile);
  } catch (error) {
    console.error('Error getting character profile:', error);
    res.status(500).json({ error: 'Failed to get character profile' });
  }
};

export const getAllCharactersStatus = async (req: Request, res: Response) => {
  try {
    const charactersDir = path.join(rootDir, 'characters');
    const characters = await fs.readdir(charactersDir);
    console.warn(characters);
    const statuses: CharacterStatus[] = await Promise.all(
      characters.map(async name => {
        const isRunning = runningProcesses.has(name);
        const startTime = processStartTimes.get(name);
        const stats = processStats.get(name);

        return {
          name,
          isRunning,
          ...(isRunning &&
            startTime && {
              uptime: Date.now() - startTime,
              stats: stats || { tweets: 0, replies: 0, errors: 0 },
            }),
        };
      }),
    );

    res.json(statuses);
  } catch (error) {
    console.error('Error getting character statuses:', error);
    res.status(500).json({ error: 'Failed to get character statuses' });
  }
};

export const getCharacterStatus = async (req: Request, res: Response) => {
  const { name } = req.params;

  try {
    const isRunning = runningProcesses.has(name);
    const startTime = processStartTimes.get(name);
    const stats = processStats.get(name);
    console.warn(name);
    console.warn(stats);
    const status: CharacterStatus = {
      name,
      isRunning,
      ...(isRunning &&
        startTime && {
          uptime: Date.now() - startTime,
          stats: stats || { tweets: 0, replies: 0, errors: 0 },
        }),
    };

    res.json(status);
  } catch (error) {
    console.error('Error getting character status:', error);
    res.status(500).json({ error: 'Failed to get character status' });
  }
};
