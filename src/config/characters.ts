import { readFileSync } from 'fs';
import { load } from 'js-yaml';
import { join } from 'path';

export interface Character {
  name: string;
  characterPath: string;
  description: string;
  personality: string[];
  expertise: string[];
  communicationRules: {
    rules: string[];
    wordsToAvoid: string[];
    allowedTopics: string[];
    bannedTopics: string[];
    moderationLevel: string;
    languagePreference: string;
  };
  twitterProfile: {
    username: string;
    trendFocus: string[];
    contentFocus: string[];
    engagementCriteria: string[];
    replyStyle: string[];
    contentTypes: {
      text: boolean;
      polls: boolean;
      threads: boolean;
      spaces: boolean;
    };
    postFrequency: string;
    tone: string;
  };
  tokenomics: {
    isMintable: boolean;
    isBurnable: boolean;
    isPausable: boolean;
    totalSupply: string;
    circulatingSupply?: string;
    marketCap?: string;
    price?: string;
  };
  metadata: {
    website: string;
    telegram: string;
    discord: string;
    chain: string;
    contractAddress: string;
  };
  team: Array<{
    name: string;
    role: string;
    socials: Record<string, string>;
  }>;
  roadmap: Array<{
    title: string;
    description: string;
    date: string;
    completed: boolean;
  }>;
}

interface RawCharacterConfig {
  name: string;
  description: string;
  personality: string[];
  expertise: string[];
  communication_rules: {
    rules: string[];
    words_to_avoid: string[];
    allowed_topics: string[];
    banned_topics: string[];
    moderation_level: string;
    language_preference: string;
  };
  twitter_profile: {
    username: string;
    trend_focus: string[];
    content_focus: string[];
    engagement_criteria: string[];
    reply_style: string[];
    content_types: {
      text: boolean;
      polls: boolean;
      threads: boolean;
      spaces: boolean;
    };
    post_frequency: string;
    tone: string;
  };
  tokenomics: {
    isMintable: boolean;
    isBurnable: boolean;
    isPausable: boolean;
    totalSupply: string;
    circulatingSupply?: string;
    marketCap?: string;
    price?: string;
  };
  metadata: {
    website: string;
    telegram: string;
    discord: string;
    chain: string;
    contractAddress: string;
  };
  team: Array<{
    name: string;
    role: string;
    socials: Record<string, string>;
  }>;
  roadmap: Array<{
    title: string;
    description: string;
    date: string;
    completed: boolean;
  }>;
}

export const loadCharacter = (characterName: string): Character => {
  const characterPath = join(process.cwd(), 'characters', `${characterName}`);
  const configPath = join(characterPath, 'config', `${characterName}.yaml`);
  try {
    const yamlContent = readFileSync(configPath, 'utf8');
    const rawConfig = load(yamlContent) as RawCharacterConfig;
    console.warn('Raw config:', rawConfig);

    // First verify the required properties exist
    if (!rawConfig.communication_rules) {
      throw new Error('Missing communication_rules in character config');
    }
    if (!rawConfig.twitter_profile) {
      throw new Error('Missing twitter_profile in character config');
    }

    return {
      name: rawConfig.name,
      description: rawConfig.description,
      characterPath,
      personality: rawConfig.personality || [],
      expertise: rawConfig.expertise || [],
      communicationRules: {
        rules: rawConfig.communication_rules.rules || [],
        wordsToAvoid: rawConfig.communication_rules.words_to_avoid || [],
        allowedTopics: rawConfig.communication_rules.allowed_topics || [],
        bannedTopics: rawConfig.communication_rules.banned_topics || [],
        moderationLevel: rawConfig.communication_rules.moderation_level || 'medium',
        languagePreference: rawConfig.communication_rules.language_preference || 'english',
      },
      twitterProfile: {
        username: rawConfig.twitter_profile.username,
        trendFocus: rawConfig.twitter_profile.trend_focus || [],
        contentFocus: rawConfig.twitter_profile.content_focus || [],
        engagementCriteria: rawConfig.twitter_profile.engagement_criteria || [],
        replyStyle: rawConfig.twitter_profile.reply_style || [],
        contentTypes: rawConfig.twitter_profile.content_types || {
          text: true,
          polls: false,
          threads: true,
          spaces: false,
        },
        postFrequency: rawConfig.twitter_profile.post_frequency || 'regular',
        tone: rawConfig.twitter_profile.tone || 'positive',
      },
      tokenomics: rawConfig.tokenomics || {
        isMintable: false,
        isBurnable: false,
        isPausable: false,
        totalSupply: '0',
      },
      metadata: rawConfig.metadata || {
        website: '',
        telegram: '',
        discord: '',
        chain: '',
        contractAddress: '',
      },
      team: rawConfig.team || [],
      roadmap: rawConfig.roadmap || [],
    };
  } catch (error: any) {
    console.error('Error loading character config:', error);
    throw new Error(`Failed to load character config for '${characterName}': ${error.message}`);
  }
};
