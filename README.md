# Video Analysis Application

A modern web application that performs intelligent video content analysis, providing topic identification, key points extraction, and comprehensive summaries.

## Features

- Video content analysis
- Topic identification
- Key points extraction
- Detailed summaries
- Dark mode support
- Multilingual interface
- Analysis result saving

## Tech Stack

- Next.js
- React
- TypeScript
- Tailwind CSS

## Prerequisites

Before you begin, ensure you have the following installed:

- Node.js (v14 or higher)
- npm or yarn
- Git

## Installation

1. Clone the repository:
   ```bash
   git clone [repository-url]
   cd vid-analysis
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

3. Create a `.env` file in the root directory with the following environment variables:
   ```env
   # LLM Provider Configuration
   GEMINI_API_KEY=your_gemini_api_key    # Your Google Gemini API key
   OPENROUTER_API_KEY=your_openrouter_key # Your OpenRouter API key
   LLM_PROVIDER=openrouter               # LLM provider selection (openrouter or gemini)

   # Site Configuration
   SITE_URL=localhost                    # Your site URL (e.g., localhost for development)
   SITE_NAME=your_site_name              # Your site name
   ```

   Note: Never commit your `.env` file to version control. Add it to your `.gitignore` file to keep your API keys secure.

## Development

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

To start the production server:

```bash
npm start
# or
yarn start
```

## Usage

1. Navigate to the application's main page
2. Upload or provide a video URL for analysis
3. Wait for the analysis to complete
4. View the generated results including:
   - Main topic
   - Key points
   - Detailed summary
5. Save the analysis results if needed

## Project Structure

```
vid-analysis/
├── app/
│   ├── components/     # React components
│   ├── context/        # Context providers
│   ├── api/           # API routes
│   └── ...
├── public/            # Static files
├── styles/            # Global styles
└── ...
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
