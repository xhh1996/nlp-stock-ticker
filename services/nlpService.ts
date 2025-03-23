import axios, { AxiosError } from "axios";
import { GeographyOption, LanguageOption, ExtractedTicker } from "@/types";
import { getTickerFromFMP, getExchangeCodesByGeography } from "./fmpService";

const DEEPSEEK_API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY;
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY;

// 使用DeepSeek API提取股票代码
export const extractTickersWithDeepSeek = async (
  query: string,
  geography: GeographyOption,
  // language参数在系统提示中使用，以便未来扩展多语言支持
  language: LanguageOption
): Promise<ExtractedTicker[]> => {
  try {
    // 添加语言相关的提示，方便未来扩展
    const languageHint =
      language !== "English" ? `The query is in ${language}. ` : "";

    // 获取当前地区支持的交易所代码
    const exchangeCodes = getExchangeCodesByGeography(geography);
    const exchangeInfo =
      exchangeCodes.length > 0
        ? `For ${geography}, prioritize these exchanges: ${exchangeCodes.join(
            ", "
          )}.`
        : "";

    const response = await axios.post(
      "https://api.deepseek.com/v1/chat/completions",
      {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: `${languageHint}You are a financial NLP processor. Extract stock tickers from the query. 
            If company names are mentioned, convert them to their ticker symbols.
            For companies listed in multiple exchanges, prioritize the ticker based on the specified geography (${geography}).
            ${exchangeInfo}
            US: NYSE, NASDAQ (Example: AAPL for Apple Inc.)
            HK: HKEX (Example: 9988.HK for Alibaba)
            China: SSE (Example: 600519.SS for Kweichow Moutai), SZSE (Example: 000858.SZ for Wuliangye)
            Global: Any exchange, prioritize by market cap
            
            Return ONLY a JSON array of objects with the format: [{"symbol": "TICKER"}]
            Do not include any explanations, just the JSON array.
            If no tickers are found, return an empty array: []`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
        response_format: { type: "json_object" },
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    try {
      const parsedResult = JSON.parse(result.trim());
      return parsedResult;
    } catch (error) {
      console.error("[DeepSeek] Error parsing JSON response:", error);
      return [];
    }
  } catch (error: unknown) {
    console.error("[DeepSeek] Error calling API:", error);
    if (error instanceof AxiosError && error.response) {
      console.error("[DeepSeek] Error details:", error.response.data);
    }
    return [];
  }
};

// 使用OpenAI API提取股票代码
export const extractTickersWithOpenAI = async (
  query: string,
  geography: GeographyOption,
  // language参数在系统提示中使用，以便未来扩展多语言支持
  language: LanguageOption
): Promise<ExtractedTicker[]> => {
  try {
    // 添加语言相关的提示，方便未来扩展
    const languageHint =
      language !== "English" ? `The query is in ${language}. ` : "";

    // 获取当前地区支持的交易所代码
    const exchangeCodes = getExchangeCodesByGeography(geography);
    const exchangeInfo =
      exchangeCodes.length > 0
        ? `For ${geography}, prioritize these exchanges: ${exchangeCodes.join(
            ", "
          )}.`
        : "";

    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `${languageHint}You are a financial NLP processor. Extract stock tickers from the query. 
            If company names are mentioned, convert them to their ticker symbols.
            For companies listed in multiple exchanges, prioritize the ticker based on the specified geography (${geography}).
            ${exchangeInfo}
            US: NYSE, NASDAQ (Example: AAPL for Apple Inc.)
            HK: HKEX (Example: 9988.HK for Alibaba)
            China: SSE (Example: 600519.SS for Kweichow Moutai), SZSE (Example: 000858.SZ for Wuliangye)
            Global: Any exchange, prioritize by market cap
            
            Return ONLY a JSON array of objects with the format: [{"symbol": "TICKER"}]
            Do not include any explanations, just the JSON array.
            If no tickers are found, return an empty array: []`,
          },
          {
            role: "user",
            content: query,
          },
        ],
        temperature: 0.1,
        max_tokens: 500,
      },
      {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENAI_API_KEY}`,
        },
      }
    );

    const result = response.data.choices[0].message.content;
    try {
      const parsedResult = JSON.parse(result.trim());
      return parsedResult;
    } catch (error) {
      console.error("[OpenAI] Error parsing JSON response:", error);
      return [];
    }
  } catch (error) {
    console.error("[OpenAI] Error calling API:", error);
    return [];
  }
};

// 直接从查询中提取股票代码格式(如AAPL, 9988.HK, 600519)
export const findDirectTickerMatches = (query: string): ExtractedTicker[] => {
  console.log(`[DIRECT] Analyzing query: "${query}"`);

  // 1. 提取美股股票代码格式 (如AAPL)
  const usTickerRegex = /\b[A-Z]{1,5}\b/g;
  const usMatches = query.match(usTickerRegex) || [];

  // 2. 提取港股/中国股票代码格式 (如9988.HK, 600519.SS)
  const hkCnTickerRegex = /\b\d{1,6}(\.[A-Z]{1,3})?\b/g;
  const hkCnMatches = query.match(hkCnTickerRegex) || [];

  // 合并结果
  const allMatches = [...new Set([...usMatches, ...hkCnMatches])];

  console.log(
    `[DIRECT] Found potential tickers: ${allMatches.join(", ") || "none"}`
  );

  // 将潜在股票代码转换为结果格式
  return allMatches.map((symbol) => ({ symbol }));
};

// 组合使用多种方法提取股票代码
export const extractTickers = async (
  query: string,
  geography: GeographyOption,
  language: LanguageOption
): Promise<ExtractedTicker[]> => {
  console.log(
    `[FLOW] Processing query: "${query}", region: ${geography}, language: ${language}`
  );

  // 检查是否是比较查询（包含多个股票/公司）
  const isComparisonQuery = /compare|vs|versus|对比|比较|and/i.test(query);
  console.log(
    `[FLOW] Query type: ${isComparisonQuery ? "Comparison" : "Single"}`
  );

  // 优先使用OpenAI API - 特别适合处理自然语言和复杂查询
  try {
    console.log("[FLOW] First trying OpenAI API for best results...");
    const openaiMatches = await extractTickersWithOpenAI(
      query,
      geography,
      language
    );

    if (
      openaiMatches &&
      Array.isArray(openaiMatches) &&
      openaiMatches.length > 0
    ) {
      console.log(
        `[FLOW] OpenAI API found ${openaiMatches.length} results:`,
        openaiMatches
      );

      // 直接使用OpenAI结果，不进行验证
      console.log(
        "[FLOW] Using OpenAI results directly without FMP validation"
      );
      return openaiMatches;
    } else {
      console.log(
        "[FLOW] OpenAI API found no results, trying alternative methods"
      );
    }
  } catch (error) {
    console.error("[FLOW] OpenAI API failed:", error);
    console.log("[FLOW] Falling back to other methods...");
  }

  // 尝试从FMP API获取股票代码
  try {
    console.log("[FLOW] Trying FMP direct search...");
    // 尝试直接匹配
    const fmpMatches = await getTickerFromFMP(query, geography);

    if (fmpMatches.length > 0) {
      console.log(
        `[FLOW] FMP API found ${fmpMatches.length} results:`,
        fmpMatches
      );
      // 直接返回FMP结果
      return fmpMatches;
    } else {
      console.log("[FLOW] FMP API found no results");
    }
  } catch (error) {
    console.error("[FLOW] FMP API search failed:", error);
  }

  // 如果FMP也没找到，尝试使用DeepSeek
  try {
    console.log("[FLOW] As last resort, trying DeepSeek API...");
    const deepseekMatches = await extractTickersWithDeepSeek(
      query,
      geography,
      language
    );

    if (
      deepseekMatches &&
      Array.isArray(deepseekMatches) &&
      deepseekMatches.length > 0
    ) {
      console.log(
        `[FLOW] DeepSeek API found ${deepseekMatches.length} results:`,
        deepseekMatches
      );
      // 直接返回DeepSeek结果
      return deepseekMatches;
    } else {
      console.log("[FLOW] DeepSeek API found no results");
    }
  } catch (error) {
    console.error("[FLOW] DeepSeek API failed:", error);
  }

  // 所有方法都失败，返回空数组
  console.log("[FLOW] All methods failed to find tickers");
  return [];
};
