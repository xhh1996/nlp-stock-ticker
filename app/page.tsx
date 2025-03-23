"use client";

import { useState } from "react";
import { GeographyOption, LanguageOption, ExtractedTicker } from "@/types";
import { extractTickers } from "@/services/nlpService";
import InputField from "@/components/InputField";
import dynamic from "next/dynamic";

// 使用动态导入，避免SSR导致的hydration不匹配
const SelectField = dynamic(() => import("@/components/SelectField"), {
  ssr: false,
});
const ResultDisplay = dynamic(() => import("@/components/ResultDisplay"), {
  ssr: false,
});

const geographyOptions = [
  { value: "US", label: "United States" },
  { value: "HK", label: "Hong Kong" },
  { value: "China", label: "China" },
  { value: "Global", label: "Global" },
];

export default function Home() {
  const [query, setQuery] = useState("");
  const [geography, setGeography] = useState(geographyOptions[0]);
  const [tickers, setTickers] = useState<ExtractedTicker[]>([]);
  const [processing, setProcessing] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) return;

    setProcessing(true);
    setHasSearched(true);
    try {
      const result = await extractTickers(
        query,
        geography.value as GeographyOption,
        "English" as LanguageOption // 默认使用英语
      );
      setTickers(result);
    } catch (error) {
      console.error("Error extracting stock tickers:", error);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center p-6 sm:p-12 md:p-24">
      <h1 className="mb-8 text-3xl font-bold">Stock Ticker Identifier</h1>
      <div className="w-full max-w-3xl p-6 bg-white rounded-lg shadow-md">
        <div className="mb-6">
          <SelectField
            label="Market Region"
            options={geographyOptions}
            value={geography}
            onChange={setGeography}
          />
        </div>

        <InputField
          label="Enter your query"
          value={query}
          onChange={setQuery}
          onSubmit={handleSearch}
          placeholder="Example: Find me Apple stock price, 港股阿里巴巴上升趨勢"
          className="mb-6"
        />

        {hasSearched ? (
          <ResultDisplay tickers={tickers} loading={processing} />
        ) : (
          <div className="p-4 mt-4 border rounded-md bg-gray-50">
            <p className="text-gray-600 text-center">
              Enter your query and click search
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
