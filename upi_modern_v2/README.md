# UPI Modern - React Application

This project was converted from HTML/JS/CSS to a modern React.js application using Vite, Tailwind CSS, and React Router.

## Technologies Used
- **React 18** (Functional components with hooks)
- **Vite** (Next-generation frontend tooling for fast builds and hot reloading)
- **Tailwind CSS** (Utility-first CSS framework for rapid and modern UI development)
- **React Router v6** (For seamless client-side routing and protected routes)
- **Lucide React** (Modern, consistent, and clean SVG icons)

## How to Run the Project Locally

1. **Install Node.js**: Ensure you have Node.js installed on your machine.
2. **Install Dependencies**: Open your terminal in this directory and run:
   ```bash
   npm install
   ```
3. **Start the Development Server**: Run the following command:
   ```bash
   npm run dev
   ```
4. **Open in Browser**: The terminal will display a local URL (e.g., `http://localhost:5173`). Open this link in your browser to view the application.

## Key Improvements
- **Componentized Structure**: Separated Navbar, Footer, and pages into their own reusable `.jsx` modules.
- **Modern Styling**: Replaced traditional vanilla CSS styling with Tailwind styling, glassmorphism, responsive grid layouts, and modern typography (`Inter` font).
- **Protected Routing**: Implemented `ProtectedRoute` that seamlessly handles unauthenticated redirects, matching your original login check logic perfectly but in a React-native way!
- **State Management**: Form inputs, auth, and logic are fully converted into concise React hooks (`useState`, `useEffect`).
- **Clean API Separation**: The original mock API has been decoupled into `src/utils/api.js` and `src/utils/mockAuth.js` which perfectly preserves your logic while separating concerns.
