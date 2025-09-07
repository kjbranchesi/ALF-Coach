# ALF Coach - Active Learning Framework Assistant

An intelligent coaching platform that guides educators through creating comprehensive Active Learning Framework projects using the 3-stage process: Ideation → Journey → Deliverables.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn
- A Google Gemini API key

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/ALF-Coach.git
   cd ALF-Coach
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   # Copy the example environment file
   cp .env.example .env
   
   # Edit .env and add your Gemini API key
   # Get your key at: https://makersuite.google.com/app/apikey
   ```

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:5173`

## 🔑 API Key Setup

The app requires a Google Gemini API key to function. Here's how to get one:

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Click "Create API Key"
3. Copy your API key
4. Add it to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_actual_api_key_here
   ```
5. Restart the dev server

**Important**: Never commit your `.env` file to version control!

## 🎯 Features

- **Conversational AI Guidance**: Intelligent branching conversations that adapt to educator needs
- **3-Stage Framework**: 
  - **Ideation**: Develop Big Ideas, Essential Questions, and Challenges
  - **Journey**: Design learning experiences and milestones
  - **Deliverables**: Create rubrics, syllabi, and assignments
- **Age-Aware Adaptation**: Content and complexity adjusts based on student age groups
- **Debug Console**: Built-in debugging tools for transparency
- **Progress Tracking**: Visual indicators for each stage of development

## 🛠️ Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm test` - Run Jest tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:e2e` - Run Playwright E2E tests

### Project Structure

```
src/
├── features/          # Feature-specific components
│   ├── ideation/     # Ideation stage components
│   ├── journey/      # Journey stage components
│   └── deliverables/ # Deliverables stage components
├── components/       # Shared components
├── services/         # API and external services
├── ai/              # AI prompt templates
├── utils/           # Utility functions
└── hooks/           # Custom React hooks
```

## 🐛 Troubleshooting

### Chat not working?
- Check the debug console (click "</> Debug" button)
- Verify your API key is correctly set in `.env`
- Check browser console for errors
- Ensure you've restarted the dev server after adding the API key

### API Key Issues
- Make sure your API key starts with "AIza..."
- Verify you have API access enabled in Google AI Studio
- Check that your `.env` file is in the project root

## 📝 License

[Your License Here]

## 🤝 Contributing

[Contributing guidelines]
### Downloads & Exports

- All file downloads are disabled for the prototype (online‑only experience).
- Flags (both default to `false`):
  - `VITE_PDF_EXPORT_ENABLED`: PDF export toggle (disabled)
  - `VITE_ENABLE_DOWNLOADS`: All downloads toggle (disabled)
- Where to set:
  - Local: `.env.local`
  - Netlify: `netlify.toml` or Site Settings → Environment variables
- Effects when disabled:
  - Export buttons are hidden; lazy export functions throw if called.
  - E2E PDF test auto‑skips unless explicitly enabled.
