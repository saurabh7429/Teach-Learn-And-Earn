# Stream Chat Integration Plan
## Project context

**Existing stack**
- Frontend: React
- Backend: existing backend/API
- Database: MongoDB Atlas
- Authentication: existing app auth/JWT/session
- Goal: add production-ready chat without building the messaging backend from scratch
- Preferred approach: use **GetStream / Stream Chat** for chat infrastructure and keep MongoDB for normal application data.

---

# 1. Recommended architecture

Use Stream only for chat-specific infrastructure.

```text
                    YOUR APPLICATION
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  React Frontend                                             │
│  ├── Login / app UI                                         │
│  ├── User/Profile UI                                        │
│  └── Chat UI (stream-chat-react)                            │
│                         │                                   │
│                         │ request Stream token              │
│                         ▼                                   │
│  Existing Backend                                             │
│  ├── Existing auth/JWT middleware                           │
│  ├── GET /api/chat/token                                    │
│  ├── Stream server SDK                                      │
│  └── Stream API secret (SERVER ONLY)                        │
│                         │                                   │
│                         └──────────────► Stream Chat         │
│                                          ├── users           │
│                                          ├── channels        │
│                                          ├── messages        │
│                                          ├── realtime        │
│                                          ├── typing          │
│                                          ├── reactions       │
│                                          ├── read state      │
│                                          ├── threads         │
│                                          └── attachments     │
│                                                             │
│  MongoDB Atlas                                              │
│  ├── application users                                      │
│  ├── profiles                                               │
│  ├── posts/projects/orders/etc.                             │
│  └── optional Stream user/channel mapping                   │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Important:** Do not duplicate every chat message into MongoDB unless there is a specific business requirement. Stream should be the source of truth for chat messages.

Stream's current React integration provides the UI layer through `stream-chat-react`, while `stream-chat` handles the client connection/state/API calls. The backend is responsible for signing user tokens and server-side configuration.  
Official docs: https://getstream.io/chat/docs/react/  
https://getstream.io/chat/docs/node/

---

# 2. What Stream should handle

Let Stream handle:

- Chat messages
- Real-time delivery
- WebSocket connection
- Conversations/channels
- Message history
- Typing indicators
- Reactions
- Threads/replies
- Read state / unread state
- Presence/online state where needed
- Image/file attachments
- Channel membership
- Chat-related permissions
- Chat UI components

Do NOT rebuild these in MongoDB unless there is a clear product requirement.

---

# 3. What our existing backend should handle

The existing backend remains responsible for:

- User login/signup
- JWT/session authentication
- User authorization
- Checking whether a user is allowed to access chat
- Issuing Stream user tokens
- Syncing/upserting user information to Stream
- Creating/restricting channels when server-side control is required
- Adding/removing channel members when business rules require server control
- Any app-specific moderation/business rules
- Webhooks from Stream if needed later

According to Stream's current backend docs, generating user tokens and syncing users are server-side responsibilities. Channel/member/message operations can also be kept server-side when the application needs stronger business-rule control.

Official backend docs:
https://getstream.io/chat/docs/node/

---

# 4. Stream account setup

1. Create a Stream account.
2. Create a **Chat** application.
3. Copy:
   - Stream API Key
   - Stream API Secret
4. Keep the API Secret ONLY on the backend.
5. Never expose the Stream API Secret in React/browser code.
6. Verify the current free/student entitlement in the Stream dashboard before production usage.

Environment variables:

### Backend

```env
STREAM_API_KEY=your_stream_api_key
STREAM_API_SECRET=your_stream_api_secret
```

### React

```env
VITE_STREAM_API_KEY=your_stream_api_key
```

Only the API key may be present in frontend code. The secret must never be shipped to the browser.

---

# 5. Packages

## Backend

For Node.js backend:

```bash
npm install stream-chat
```

## React

```bash
npm install stream-chat stream-chat-react
```

Then import the Stream Chat CSS required by the current installed SDK version.

Example:

```js
import "stream-chat-react/dist/css/v2/index.css";
```

Check the installed SDK version if the CSS path differs.

Official React docs:
https://getstream.io/chat/docs/react/

---

# 6. User identity mapping

Use the existing application's user ID as the Stream user ID.

Example:

```text
MongoDB user:
_id = 665abc123...

Stream user:
id = "665abc123..."
```

Do NOT generate a different random ID if there is no reason to.

The ID should be stable.

Recommended Stream user fields:

```js
{
  id: user.id.toString(),
  name: user.name,
  image: user.avatarUrl
}
```

Only send data required by the chat UI.

Do not put sensitive personal/application data into the Stream user object.

Stream docs:
https://getstream.io/chat/docs/javascript/update-users/

---

# 7. Backend token endpoint

Create a protected route such as:

```text
GET /api/chat/token
```

Flow:

```text
React
  ↓
GET /api/chat/token
  ↓
Existing auth middleware
  ↓
Identify current user
  ↓
Create Stream token using STREAM_API_SECRET
  ↓
Return token + Stream API key + user data
```

Example backend logic:

```js
import { StreamChat } from "stream-chat";

const streamServerClient = StreamChat.getInstance(
  process.env.STREAM_API_KEY,
  process.env.STREAM_API_SECRET
);

app.get("/api/chat/token", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id.toString();

    await streamServerClient.upsertUser({
      id: userId,
      name: req.user.name,
      image: req.user.avatarUrl,
    });

    const token = streamServerClient.createToken(userId);

    res.json({
      apiKey: process.env.STREAM_API_KEY,
      token,
      user: {
        id: userId,
        name: req.user.name,
        image: req.user.avatarUrl,
      },
    });
  } catch (error) {
    console.error("Stream token error:", error);
    res.status(500).json({
      message: "Unable to initialize chat",
    });
  }
});
```

Notes:
- Replace `authMiddleware` with the project's existing auth middleware.
- Replace `req.user.*` with the project's actual user fields.
- Do not accept arbitrary `userId` from the browser for token generation.
- The backend must derive the current user from trusted authentication.

Stream authentication docs:
https://getstream.io/chat/docs/react/tokens-and-authentication/

---

# 8. React Stream client

Create ONE Stream Chat client for the application/session.

Do not create a new Stream client on every render.

Recommended current approach:

```jsx
import { Chat, useCreateChatClient } from "stream-chat-react";

function ChatProvider({ user }) {
  const client = useCreateChatClient({
    apiKey: user.streamApiKey,
    tokenOrProvider: user.streamToken,
    userData: {
      id: user.id,
      name: user.name,
      image: user.image,
    },
  });

  if (!client) {
    return <div>Connecting to chat...</div>;
  }

  return (
    <Chat client={client}>
      {/* chat UI */}
    </Chat>
  );
}
```

Use `useCreateChatClient` for connection lifecycle rather than manually creating/connecting/disconnecting in multiple components.

Official docs:
https://getstream.io/chat/docs/sdk/react/basics/getting-started/

---

# 9. Better frontend token flow

Prefer a token provider / protected backend endpoint instead of hardcoding a long-lived token.

Preferred flow:

```text
User already logged into app
        ↓
React requests /api/chat/token
        ↓
Backend verifies current user
        ↓
Backend creates/signs Stream token
        ↓
React receives token
        ↓
useCreateChatClient(...)
        ↓
Stream WebSocket connection
```

Stream tokens are JWTs signed with the API secret and therefore must be created server-side.

---

# 10. Chat UI strategy

Do NOT recreate the entire chat UI from scratch.

Start with Stream's default components.

Typical structure:

```jsx
<Chat client={client}>
  <ChannelList />
  <Channel>
    <Window>
      <ChannelHeader />
      <MessageList />
      <MessageInput />
    </Window>
    <Thread />
  </Channel>
</Chat>
```

Depending on the installed SDK version and desired UI, use the current component names from the docs.

Recommended strategy:

1. Get default UI working.
2. Verify messages/realtime.
3. Verify channels and auth.
4. Then customize spacing, colors, fonts, borders, avatar styles, etc.
5. Only replace individual components when necessary.

Do not build a custom message renderer unless the product actually needs it.

Official React docs:
https://getstream.io/chat/docs/react/

---

# 11. One-to-one chat

For a 1-to-1 chat:

```text
User A
User B
```

Create a `messaging` channel with both users as members.

Example:

```js
const channel = client.channel("messaging", {
  members: [currentUserId, otherUserId].sort(),
});

await channel.watch();
```

For a server-controlled flow, create/manage the channel from the backend instead.

Important:
- Use stable user IDs.
- Keep the member order deterministic if constructing your own channel ID.
- Do not let arbitrary frontend input bypass application authorization.

Stream channels are the core conversation primitive.

Official channel docs:
https://getstream.io/chat/docs/node/creating-channels/

---

# 12. Channel list

For the main chat screen, show channels that the current user belongs to.

Typical concept:

```js
const filters = {
  type: "messaging",
  members: { $in: [currentUserId] },
};

const sort = {
  last_message_at: -1,
};
```

Use Stream's `ChannelList` component for the ready-made list.

The user should see:
- Other user's name
- Avatar
- Last message
- Last message time
- Unread count
- Online/presence state where enabled

---

# 13. Realtime behavior

Do not implement your own Socket.IO server for the basic chat feature if Stream already covers the required realtime functionality.

Expected Stream flow:

```text
User A sends message
      ↓
Stream
      ↓
WebSocket event
      ↓
User B UI updates automatically
```

`channel.watch()` subscribes the client to real-time updates for that channel.

---

# 14. MongoDB vs Stream — exact responsibility

## MongoDB Atlas

Keep:

```text
users
profiles
projects
posts
orders
friendships
follows
subscriptions
app-specific permissions
etc.
```

## Stream

Keep:

```text
chat users
channels
messages
reactions
threads
typing
read state
realtime events
attachments
presence
```

Optional MongoDB mapping:

```js
{
  userId: "...",
  streamUserId: "..."
}
```

Usually `streamUserId === MongoDB user ID`, so even this mapping may be unnecessary.

---

# 15. Authentication and authorization

VERY IMPORTANT:

The user being logged into the React app does not automatically mean they are allowed to chat with every other user.

Application rules must remain in the existing backend.

Examples:

```text
Can user A message user B?
Can blocked users message each other?
Can a user access this group?
Can a deleted account still chat?
Can only project members access this project chat?
```

These rules should be enforced through the backend / Stream permissions and channel membership design.

Do not trust frontend-only checks.

---

# 16. Security rules

Never:

```text
❌ expose STREAM_API_SECRET
❌ generate Stream tokens in React
❌ accept arbitrary userId from browser and sign for it
❌ trust frontend-only authorization
❌ store secret in VITE_* frontend environment variables
❌ copy every message into MongoDB without a reason
```

Do:

```text
✅ validate existing login/session
✅ derive user ID from authenticated request
✅ create Stream tokens server-side
✅ keep API secret server-side
✅ restrict channel membership
✅ validate block/permission rules
✅ sanitize custom chat metadata
✅ keep Stream user data minimal
```

---

# 17. Logout handling

When a user logs out:

1. React should stop using the active Stream client/session.
2. Clear application chat state.
3. Clear auth state.
4. On next login, initialize a new/current Stream session.

Avoid having multiple active Stream clients for the same application session.

---

# 18. Refresh / reconnect behavior

Test these cases:

```text
- Browser refresh
- Network disconnected
- Network restored
- Backend temporarily unavailable
- Stream temporarily unavailable
- Logout/login
- Switch account
- Open same account in another tab
```

The app should not create duplicate clients or duplicate channel subscriptions.

---

# 19. Attachments

If chat needs:
- images
- PDFs
- documents
- videos

Start with Stream's built-in attachment support.

Do NOT immediately build a separate upload system just for chat.

Only introduce S3/Cloudinary/etc. if there is a specific product requirement.

---

# 20. Notifications

Keep these as a second phase.

Phase 1:
- realtime in-app messages
- unread count
- channel list
- typing
- basic reactions
- message history

Phase 2:
- browser push notifications
- mobile push notifications
- email notifications
- notification preferences

Do not over-engineer notifications before basic chat works.

---

# 21. Suggested project structure

Adapt to the existing project instead of forcing an entire new architecture.

Example frontend:

```text
src/
  features/
    chat/
      components/
        ChatPage.jsx
        ChatLayout.jsx
        ChatSidebar.jsx
        ChatWindow.jsx
      hooks/
        useStreamChat.js
      api/
        chatApi.js
      ChatProvider.jsx
      chatConfig.js
```

Example backend:

```text
src/
  modules/
    chat/
      chat.routes.js
      chat.controller.js
      chat.service.js
      stream.client.js
```

If the existing project has a different architecture, follow the project's established conventions instead of creating unnecessary duplication.

---

# 22. Implementation order

Implement in exactly this order:

## Phase 1 — Stream setup

- Create Stream app
- Get API key + secret
- Add backend environment variables
- Add frontend API key variable
- Install SDKs

## Phase 2 — Authentication

- Reuse existing app authentication
- Add protected `/api/chat/token`
- Generate Stream token on server
- Upsert current user to Stream

## Phase 3 — React connection

- Create one `useCreateChatClient` integration
- Connect current user
- Render `<Chat>`

## Phase 4 — Basic UI

- Channel list
- Channel
- Header
- Message list
- Message input
- Thread support if desired

## Phase 5 — 1-to-1 chat

- User list/search
- Start conversation
- Create/get messaging channel
- Open channel
- Send message
- Receive realtime message

## Phase 6 — Product rules

- Blocked users
- Permissions
- Member restrictions
- Deleted users
- Application-specific access

## Phase 7 — Polish

- Loading states
- Empty states
- Error states
- Mobile responsiveness
- Styling
- Unread badges
- Typing indicator
- Reactions
- Attachments

## Phase 8 — Testing

Test:
- login
- token creation
- chat connection
- message send
- message receive
- refresh persistence
- multiple users
- unauthorized access
- blocked users
- logout
- reconnect
- mobile layout

---

# 23. Do NOT do these things

```text
❌ Do not replace MongoDB with Stream
❌ Do not build your own WebSocket layer first
❌ Do not create your own message tables just to mirror Stream
❌ Do not expose Stream secret
❌ Do not create Stream clients repeatedly
❌ Do not customize every UI component before the base integration works
❌ Do not copy a random old GitHub chat repo and mix two chat architectures
❌ Do not put business authorization only in React
```

---

# 24. AI / Vibe Coding instructions

Give the coding AI this context before asking it to implement.

```text
PROJECT STACK
- Frontend: React
- Backend: existing backend
- Database: MongoDB Atlas
- Existing authentication must be reused
- Chat provider: GetStream / Stream Chat
- Goal: add chat without building a custom messaging backend

IMPORTANT ARCHITECTURE
- MongoDB remains the source of truth for normal application data.
- Stream is the source of truth for chat messages/conversations/realtime chat state.
- Do not create a duplicate messages collection unless explicitly required.
- Stream API secret must stay on the backend.
- Stream token must be generated on the backend after verifying the existing user.
- React may use the Stream API key, but NEVER the API secret.
- Use the current Stream React SDK.
- Prefer useCreateChatClient.
- Use Stream's built-in UI components first.
- Customize only after the default flow works.

AUTHENTICATION
- Reuse the existing auth middleware/JWT/session.
- Never trust a client-supplied userId when generating a token.
- Token endpoint should derive user ID from authenticated request.

USER SYNC
- Use the existing application user ID as the Stream user ID where possible.
- Sync only minimal chat fields: id, name, avatar/image.

CHAT
- Primary first feature: 1-to-1 messaging.
- Channel type: messaging.
- Members: current user + selected other user.
- Reuse stable IDs.
- Use Stream realtime.
- Use Stream MessageList, MessageInput, ChannelList, Thread, etc. before writing custom UI.

DO NOT
- Do not introduce Socket.IO for the basic chat.
- Do not introduce a second database for chat.
- Do not expose secrets.
- Do not rewrite unrelated project modules.
- Do not change existing authentication unless required.
- Do not change existing MongoDB schemas unless required.
- Do not install unnecessary libraries.

IMPLEMENTATION METHOD
1. Inspect the existing project structure first.
2. Identify existing authentication middleware and current-user model.
3. Identify React routing/layout patterns.
4. Identify backend module/controller/service conventions.
5. Implement the smallest working Stream integration.
6. Run/build/lint/test after each major step.
7. Reuse existing patterns instead of inventing new architecture.
8. Show all changed files and explain why each change is required.
9. Do not silently modify unrelated files.

ACCEPTANCE CRITERIA
- Logged-in user can open Chat.
- React receives a valid Stream token from backend.
- User connects successfully to Stream.
- Current user exists in Stream.
- User can start a 1-to-1 conversation.
- Message can be sent.
- Other user receives message in realtime.
- Refresh preserves chat history.
- Unauthorized users cannot generate tokens for another account.
- Stream secret is not present in frontend bundle.
- Existing MongoDB/auth/application features continue to work.
```

---

# 25. Recommended MVP

Do not build everything at once.

The first usable version should only contain:

```text
✅ Login
✅ User list / search
✅ Start 1-to-1 chat
✅ Channel list
✅ Message history
✅ Send message
✅ Realtime receiving
✅ Unread count
✅ Typing indicator
✅ Basic responsive UI
```

Then add:

```text
→ reactions
→ threads
→ attachments
→ block/report
→ push notifications
→ advanced moderation
```

---

# 26. Definition of done

The Stream integration is considered complete when:

```text
[ ] Stream app created
[ ] Environment variables configured
[ ] Stream SDK installed on backend
[ ] Stream React SDK installed
[ ] Protected token endpoint works
[ ] Stream secret exists only on backend
[ ] Existing auth is reused
[ ] User is synced/upserted
[ ] React creates one Stream client
[ ] Chat UI loads
[ ] Channel list works
[ ] 1-to-1 conversation works
[ ] Send message works
[ ] Receive message works in realtime
[ ] Refresh works
[ ] Logout works
[ ] Unauthorized access is rejected
[ ] Existing MongoDB features are unaffected
[ ] Production build succeeds
[ ] No secret is exposed in frontend bundle
```

---

# 27. Official references

Stream React:
https://getstream.io/chat/docs/react/

React getting started:
https://getstream.io/chat/docs/sdk/react/basics/getting-started/

Authentication:
https://getstream.io/chat/docs/react/tokens-and-authentication/

Node/backend:
https://getstream.io/chat/docs/node/

Channels:
https://getstream.io/chat/docs/node/creating-channels/

Users:
https://getstream.io/chat/docs/javascript/update-users/

---

# 28. Final recommendation

For this project, use:

```text
React
  +
Existing Backend/Auth
  +
MongoDB Atlas
  +
Stream Chat
```

Do NOT build the core chat backend yourself.

The main custom work should be:
- integrating Stream with existing auth
- generating secure Stream tokens
- mapping your existing users to Stream users
- enforcing your product's chat permissions
- integrating/customizing the React UI

Everything else should be delegated to Stream as much as practical.
