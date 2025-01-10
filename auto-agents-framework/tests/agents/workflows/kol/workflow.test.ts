import { createWorkflow, getWorkflowConfig, State } from '../../../../src/agents/workflows/kol/workflow';
import { createNodes } from '../../../../src/agents/workflows/kol/nodes';
import { WorkflowConfig } from '../../../../src/agents/workflows/kol/types';
import { createMockState } from './__fixtures__/mockState';

// Mock the config module (already done in setup.js)
// Mock the Twitter API client
jest.mock('../../../../src/services/twitter/client', () => ({
  createTwitterApi: jest.fn().mockResolvedValue({
    username: 'test-user',
    scraper: {
      login: jest.fn(),
      setCookies: jest.fn(),
      getCookies: jest.fn(),
    },
  }),
}));

// Mock the LLM Factory
jest.mock('../../../../src/services/llm/factory', () => ({
  LLMFactory: {
    createModel: jest.fn().mockReturnValue({
      invoke: jest.fn().mockResolvedValue({ content: 'mocked response' }),
    }),
  },
}));

describe('KOL Workflow', () => {
  let workflowConfig: WorkflowConfig;

  beforeEach(async () => {
    jest.clearAllMocks();
    workflowConfig = await getWorkflowConfig('character.example');
  });

  it('should create workflow config with correct structure', async () => {
    expect(workflowConfig).toHaveProperty('twitterApi');
    expect(workflowConfig).toHaveProperty('toolNode');
    expect(workflowConfig).toHaveProperty('prompts');
    expect(workflowConfig).toHaveProperty('llms');
    
    // Check LLM instances
    expect(workflowConfig.llms).toHaveProperty('decision');
    expect(workflowConfig.llms).toHaveProperty('analyze');
    expect(workflowConfig.llms).toHaveProperty('generation');
    expect(workflowConfig.llms).toHaveProperty('response');
  });

  it('should create workflow with all required nodes', async () => {
    const nodes = await createNodes(workflowConfig);
    const workflow = await createWorkflow(nodes);

    // Check if workflow is created with correct structure
    expect(workflow).toBeDefined();
    // You can add more specific checks for the workflow structure
  });

  it('should maintain workflow config singleton per character', async () => {
    const config1 = await getWorkflowConfig('character.example');
    const config2 = await getWorkflowConfig('character.example');
    const config3 = await getWorkflowConfig('different-character');

    expect(config1).toBe(config2); // Same character should return same instance
    expect(config1).not.toBe(config3); // Different character should return new instance
  });

  // Test State annotations
  it('should properly handle state annotations', () => {
    const state = createMockState();
    
    expect(state.messages).toEqual([]);
    expect(state.timelineTweets).toBeInstanceOf(Set);
    expect(state.mentionsTweets).toBeInstanceOf(Set);
    expect(state.processedTweetIds).toBeInstanceOf(Set);
  });
}); 