# GitLaber AI Code Reviewer

A NestJS application that automatically reviews GitLab merge requests using Claude 3.7 Sonnet AI.

## Features

- 🔄 Listens to GitLab webhook events for merge requests
- 🧠 Uses Anthropic's Claude 3.7 Sonnet to review code changes
- 💬 Posts review comments directly on GitLab merge requests
- 🧪 Provides an API endpoint for manual testing

## Requirements

- Node.js 18+
- Anthropic API key (for Claude AI)
- GitLab account with API access

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   yarn install
   ```
3. Create a `.env` file based on `.env.example`:
   ```
   # GitLab Configuration
   GITLAB_API_URL=https://gitlab.com
   GITLAB_API_TOKEN=your_gitlab_personal_access_token
   GITLAB_WEBHOOK_SECRET=your_webhook_secret_token

   # Anthropic API Configuration
   ANTHROPIC_API_KEY=your_anthropic_api_key
   ```

4. Start the application:
   ```bash
   yarn start:dev
   ```

## Setting up the GitLab Webhook

1. Go to your GitLab project → Settings → Webhooks
2. Add a new webhook with the following settings:
   - URL: `https://your-domain.com/api/webhooks/gitlab`
   - Secret Token: The same value as `GITLAB_WEBHOOK_SECRET` in your `.env` file
   - Trigger: Check "Merge request events"
3. Click "Add webhook"

## Usage

### Automatic Code Reviews

Once the webhook is configured, the system will automatically:
1. Receive notifications when merge requests are created or updated
2. Extract the code changes
3. Send them to Claude 3.7 Sonnet for analysis
4. Post the AI review as a comment on the merge request

### Manual Testing

You can manually trigger a code review using the API:

```bash
curl -X POST http://localhost:3000/api/reviews/merge-request \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": 12345,
    "mergeRequestIid": 67,
    "postComment": false
  }'
```

- `projectId`: The GitLab project ID
- `mergeRequestIid`: The IID of the merge request (shown in the MR URL)
- `postComment`: Set to `true` to automatically post the review as a comment, or `false` to just return it

## Development

- Build: `yarn build`
- Test: `yarn test`
- Lint: `yarn lint`
- Format: `yarn format`

## License

MIT
