![Autonomys Agents Banner_1](https://github.com/user-attachments/assets/340c2a09-ddc6-49c1-83af-ec9cdd30ac01)

# Autonomys Agents: A framework for building autonomous AI agents

Autonomys Agents is an experimental framework for building AI agents with a REST API for management. The framework supports agents that can interact with social networks and maintain permanent memory through the Autonomys Network.

## Features

- 🤖 Autonomous social media engagement
- 🧠 Permanent agent memory storage via Autonomys Network
- 🔄 Built-in workflow system
- 🐦 Twitter integration
- 🎭 Customizable agent personalities
- 🛠️ Extensible tool system
- 🚀 REST API for agent management
- 📊 Real-time agent status monitoring
- ⚙️ Dynamic configuration updates

## API Endpoints

### Character Management
```bash
# Create a new character
POST /api/characters

# Start a character
POST /api/characters/:name/start

# Stop a character
POST /api/characters/:name/stop

# Update character schedule
PUT /api/characters/:name/schedule

# Get character schedule
GET /api/characters/:name/schedule

# Update character profile
PUT /api/characters/:name/profile

# Get character profile
GET /api/characters/:name/profile

# Get all characters status
GET /api/characters/status

# Get specific character status
GET /api/characters/:name/status
```

## Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Start the API server:
```bash
yarn dev
```

3. Create a character via API:
```bash
curl -X POST http://localhost:3000/api/characters \
  -H "Content-Type: application/json" \
  -d '{
    "name": "your_character",
    "config": {
      "name": "Agent Name",
      "description": "Agent description",
      "personality": ["trait1", "trait2"],
      "expertise": ["area1", "area2"],
      "twitter": {
        "username": "twitter_handle",
        "password": "twitter_password"
      }
    }
  }'
```

## Character Configuration

Each character is configured using a YAML structure:

```yaml
name: 'Agent Name'
description: 'Core personality description'

personality:
  - Key behavioral trait 1
  - Key behavioral trait 2

expertise:
  - Area of knowledge 1
  - Area of knowledge 2

twitter_profile:
  username: 'twitter_handle'
  trend_focus:
    - Topic to monitor 1
  content_focus:
    - Content guideline 1
  reply_style:
    - Engagement approach 1
```

## Monitoring

Monitor your agents through the API:
```bash
# Get all agents status
curl http://localhost:3000/api/characters/status

# Get specific agent status
curl http://localhost:3000/api/characters/your_character/status
```

## Development

- Built with TypeScript and Express
- Uses middleware for request logging and error handling
- Supports CORS for frontend integration
- Real-time agent status tracking

## Testing

```bash
yarn test
```

## License

MIT
