
# Project Management Dashboard UI

This is a code bundle for Project Management Dashboard UI. The original project is available at https://www.figma.com/design/u97etbtr5hN64f8CJsOVVY/Project-Management-Dashboard-UI.

## Running the code

Run `npm i` to install the dependencies.

Run `npm run dev` to start the development server.

## Switching to the Real Backend API

By default the app runs with mock data. To connect to the real REST API:

1. **Ensure the backend is running** at `http://localhost:3000` (Swagger docs at `http://localhost:3000/api/docs`).

2. **Create a `.env` file** in the project root and set:

   ```env
   VITE_USE_MOCK=false
   VITE_API_URL=http://localhost:3000/api/v1
   VITE_WS_URL=http://localhost:3000
   ```

3. **Restart the dev server:**

   ```bash
   npm run dev
   ```

The app will now send all requests to the real API and authenticate via JWT (access token stored in memory, refresh token as an httpOnly cookie).

To switch back to mock data, set `VITE_USE_MOCK=true` and restart the dev server.
