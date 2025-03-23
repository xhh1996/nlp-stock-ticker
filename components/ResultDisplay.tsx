import React from "react";
import { ExtractedTicker } from "@/types";

interface ResultDisplayProps {
  tickers: ExtractedTicker[];
  loading: boolean;
}

const ResultDisplay: React.FC<ResultDisplayProps> = ({ tickers, loading }) => {
  if (loading) {
    return (
      <div className="p-4 mt-4 border rounded-md bg-gray-50">
        <div className="flex items-center justify-center space-x-2">
          <div className="w-4 h-4 border-2 border-t-transparent border-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-600">Processing...</p>
        </div>
      </div>
    );
  }

  if (tickers.length === 0) {
    return (
      <div className="p-4 mt-4 border rounded-md bg-gray-50">
        <p className="text-gray-600">No stock tickers found</p>
      </div>
    );
  }

  return (
    <div className="p-4 mt-4 border rounded-md bg-gray-50">
      <h3 className="mb-2 text-lg font-medium">Identified Tickers:</h3>
      <div className="space-y-2">
        {tickers.map((ticker, index) => (
          <div key={index} className="p-3 border rounded-md bg-white shadow-sm">
            <div className="text-lg font-semibold text-blue-600">
              {ticker.symbol}
            </div>
            {ticker.name && (
              <div className="text-sm text-gray-600">{ticker.name}</div>
            )}
            {ticker.exchange && (
              <div className="text-sm text-gray-500">{ticker.exchange}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ResultDisplay;
