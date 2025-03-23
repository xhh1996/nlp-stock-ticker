# NLP Stock Ticker Recognition Tool

This is a web application built with Next.js, TypeScript, and Tailwind CSS that extracts stock tickers from natural language queries and optimizes results based on user's geographic location and language preferences.

## Features

- Multi-language support: Handles queries in English, Simplified Chinese, and Traditional Chinese
- Geolocation awareness: Optimizes results based on user's selected market (US, Hong Kong, China, or Global)
- Real-time stock ticker extraction: Quickly identifies stock tickers from user queries
- Handles dual-listed stocks: Selects the appropriate exchange based on user preferences
- Supports fuzzy matching: Recognizes stock tickers even when company names are entered or there are spelling errors

## Tech Stack

- **Frontend Framework**: Next.js
- **Programming Language**: TypeScript
- **Styling**: Tailwind CSS
- **API Calls**: Axios
- **NLP Processing**: DeepSeek API and OpenAI API
- **UI Components**: React Select

## Local Development

To run this project locally:

1. Clone the project

   ```bash
   git clone <repository-url>
   cd nlp-stock-ticker
   ```

2. Install dependencies

   ```bash
   npm install
   ```

3. Create a `.env.local` file and add API keys

   ```
   NEXT_PUBLIC_FMP_API_KEY=your_fmp_api_key
   NEXT_PUBLIC_DEEPSEEK_API_KEY=your_deepseek_api_key
   NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key
   ```

4. Start the development server

   ```bash
   npm run dev
   ```

5. Open your browser and visit [http://localhost:3000](http://localhost:3000)

## API Usage

The application uses the following APIs:

1. **Financial Modeling Prep (FMP) API**: To obtain stock lists and detailed information
2. **DeepSeek API**: As the primary NLP processing engine to extract stock tickers from queries
3. **OpenAI API**: As a backup NLP processing engine

## Development Assumptions

- Assumes the FMP API can provide stock data for major global markets
- Prioritizes stock tickers directly entered by users
- For dual-listed companies, selects the appropriate exchange based on the user's market preference
- For fuzzy queries, prioritizes stocks with higher market capitalization

## Deployment

This project can be easily deployed to Vercel:

1. Create a new project on [Vercel](https://vercel.com)
2. Link to your GitHub repository
3. Add environment variables (API keys)
4. Deploy

## Future Improvements

- Cache frequently used stock data to improve performance
- Provide more market and exchange options
- Enhance local matching algorithms to reduce API calls
- Add display of basic stock information
