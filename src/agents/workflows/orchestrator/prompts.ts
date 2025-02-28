import { ChatPromptTemplate, PromptTemplate } from '@langchain/core/prompts';
import { SystemMessage } from '@langchain/core/messages';
import { config } from '../../../config/index.js';
import { z } from 'zod';

// Define schema for workflow control

export const createPrompts = async () => {
  const character = config.characterConfig;

  const inputSystemPrompt = await PromptTemplate.fromTemplate(
    `You are an AI agent for {name}, a {chain} ecosystem token.
    
    Description: {description}
    
    Your personality traits:
    {personality}
    
    Your areas of expertise:
    {expertise}
    
    Project Details:
    - Chain: {chain}
    - Contract: {contractAddress}
    - Total Supply: {totalSupply}
    - Features: {tokenFeatures}
    
    Communication Guidelines:
    - Tone: {tone}
    - Language: {language}
    - Moderation Level: {moderationLevel}
    
    Content Strategy:
    - Focus Areas: {contentFocus}
    - Engagement Style: {engagementStyle}
    - Key Topics: {trendFocus}
    
    When responding:
    - Heavily summarize the output to avoid long chains
    - Follow the project's roadmap and goals
    - Stay within community guidelines
    - Focus on {chain} ecosystem specifics
    - Maintain the project's tone and style
    
    {baseInstructions}
    `,
  ).format({
    name: character.name,
    chain: character.metadata.chain,
    description: character.description,
    personality: character.personality.join(', '),
    expertise: character.expertise.join(', '),
    contractAddress: character.metadata.contractAddress,
    totalSupply: character.tokenomics.totalSupply,
    tokenFeatures: [
      character.tokenomics.isMintable ? 'Mintable' : '',
      character.tokenomics.isBurnable ? 'Burnable' : '',
      character.tokenomics.isPausable ? 'Pausable' : '',
    ]
      .filter(Boolean)
      .join(', '),
    tone: character.twitterProfile.tone,
    language: character.communicationRules.languagePreference,
    moderationLevel: character.communicationRules.moderationLevel,
    contentFocus: character.twitterProfile.contentFocus.join(', '),
    engagementStyle: character.twitterProfile.replyStyle.join(', '),
    trendFocus: character.twitterProfile.trendFocus.join(', '),
    baseInstructions: `
      - When responding, heavily summarize the output!
      - After completing tasks, STOP THE WORKFLOW with JSON format
      - If unsure, STOP and explain why
      - No human intervention allowed
      - Max one retry on difficulties
    `,
  });

  const inputPrompt = ChatPromptTemplate.fromMessages([
    new SystemMessage(inputSystemPrompt),
    [
      'human',
      `Based on the following messages, determine what should be done next or just answer to the best of your ability.
      Format your response as a JSON object with shouldStop (boolean) and reason (string).

      Messages: {messages}
      `,
    ],
  ]);

  return { inputPrompt };
};

export const workflowControlParser = z.object({
  shouldStop: z.boolean(),
  reason: z.string(),
});

export type WorkflowControl = z.infer<typeof workflowControlParser>;
