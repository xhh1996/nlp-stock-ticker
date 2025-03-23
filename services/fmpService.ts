import axios from "axios";
import { Stock, ExtractedTicker } from "@/types";

const API_KEY = process.env.NEXT_PUBLIC_FMP_API_KEY;
const BASE_URL = "https://financialmodelingprep.com/api";

// 使用公司名称或股票代码进行搜索
export const searchStocks = async (query: string): Promise<Stock[]> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/v3/search?query=${encodeURIComponent(
        query
      )}&limit=10&apikey=${API_KEY}`
    );
    return response.data || [];
  } catch (error) {
    console.error("Error searching stocks:", error);
    return [];
  }
};

// 使用股票代码获取详细信息
export const getStockQuote = async (symbol: string): Promise<Stock | null> => {
  try {
    const response = await axios.get(
      `${BASE_URL}/v3/quote/${symbol}?apikey=${API_KEY}`
    );
    return response.data && response.data.length > 0 ? response.data[0] : null;
  } catch (error) {
    console.error(`Error getting details for stock ${symbol}:`, error);
    return null;
  }
};

// 搜索特定市场的股票
export const searchStocksByMarket = async (
  query: string,
  exchange: string
): Promise<Stock[]> => {
  try {
    // 使用股票筛选器API，可以根据交易所和其他条件筛选
    const response = await axios.get(
      `${BASE_URL}/v3/stock-screener?exchange=${exchange}&limit=10&apikey=${API_KEY}`
    );

    // 如果有查询词，在结果中进行过滤
    const results = response.data || [];
    if (query) {
      const lowerQuery = query.toLowerCase();
      return results.filter(
        (stock: Stock) =>
          stock.symbol.toLowerCase().includes(lowerQuery) ||
          (stock.name && stock.name.toLowerCase().includes(lowerQuery))
      );
    }

    return results;
  } catch (error) {
    console.error(`Error searching stocks by market:`, error);
    return [];
  }
};

// 获取特定地区的交易所代码
export const getExchangeCodesByGeography = (geography: string): string[] => {
  switch (geography) {
    case "US":
      return ["NYSE", "NASDAQ", "AMEX", "OTC", "CBOE"];
    case "HK":
      return ["HKSE", "HK", "HKEX"];
    case "China":
      return ["SSE", "SZSE", "SHG", "SHE", "SHA", "SS"];
    case "Global":
    default:
      return [];
  }
};

// 直接从FMP获取匹配的股票代码
export const getTickerFromFMP = async (
  query: string,
  geography: string
): Promise<ExtractedTicker[]> => {
  try {
    console.log(
      `[FMP] Starting search for query: "${query}", region: ${geography}`
    );

    // 智能分析查询，根据查询内容确定最终使用的地区
    const detectedGeography = detectGeographyFromQuery(query, geography);
    if (detectedGeography !== geography) {
      console.log(
        `[FMP] Geography override: ${geography} -> ${detectedGeography} based on query keywords`
      );
      geography = detectedGeography;
    }

    // 检查是否是比较查询
    const isComparisonQuery = /compare|vs|versus|对比|比较|and/i.test(query);

    if (isComparisonQuery) {
      console.log(`[FMP] Detected comparison query, trying to extract parts`);

      // 尝试分割查询以获取多个公司名称或代码
      const parts = extractQueryParts(query);
      console.log(`[FMP] Extracted ${parts.length} parts from query:`, parts);

      if (parts.length > 1) {
        // 对每个部分分别进行搜索
        const allResults: ExtractedTicker[] = [];

        for (const part of parts) {
          if (part.trim()) {
            console.log(`[FMP] Searching for part: "${part}"`);

            // 为每个部分单独检测地区关键词
            const partGeography = detectGeographyFromQuery(part, geography);
            console.log(
              `[FMP] Using geography ${partGeography} for part "${part}"`
            );

            const partResults = await searchStocks(part);

            if (partResults.length > 0) {
              // 应用地区过滤
              let filteredResults = partResults;

              if (partGeography !== "Global") {
                const exchangeCodes =
                  getExchangeCodesByGeography(partGeography);
                filteredResults = partResults.filter((stock) => {
                  if (!stock.exchange && !stock.exchangeShortName) {
                    return false;
                  }

                  return exchangeCodes.some(
                    (code) =>
                      (stock.exchangeShortName &&
                        stock.exchangeShortName === code) ||
                      (stock.exchange && stock.exchange.includes(code))
                  );
                });
              }

              // 如果找到结果，取第一个
              if (filteredResults.length > 0) {
                const mappedResult = {
                  symbol: filteredResults[0].symbol,
                  name: filteredResults[0].name,
                  exchange: filteredResults[0].exchange,
                };

                // 避免重复添加
                if (!allResults.some((r) => r.symbol === mappedResult.symbol)) {
                  allResults.push(mappedResult);
                }
              }
            }
          }
        }

        // 如果找到结果，返回所有部分的结果
        if (allResults.length > 0) {
          console.log(
            `[FMP] Found ${allResults.length} tickers from comparison query parts:`,
            allResults.map((r) => r.symbol).join(", ")
          );
          return allResults;
        }
      }
    }

    // 如果不是比较查询或者无法处理拆分后的结果，尝试直接搜索整个查询
    console.log(`[FMP] Trying standard search for the full query`);
    const searchResults = await searchStocks(query);
    console.log(`[FMP] Search results count: ${searchResults.length}`);

    if (searchResults.length > 0) {
      // 如果指定了地区，按地区筛选结果
      if (geography !== "Global") {
        const exchangeCodes = getExchangeCodesByGeography(geography);
        console.log(
          `[FMP] Using exchange filters: ${exchangeCodes.join(", ")}`
        );

        // 创建中间变量保存过滤前的结果，方便调试
        const intermediateResults = searchResults.filter((stock) => {
          // 确保stock.exchange存在才进行检查
          if (!stock.exchange && !stock.exchangeShortName) {
            return false;
          }

          return exchangeCodes.some(
            (code) =>
              (stock.exchangeShortName && stock.exchangeShortName === code) ||
              (stock.exchange && stock.exchange.includes(code))
          );
        });

        console.log(
          `[FMP] Number of filtered results: ${intermediateResults.length}`
        );

        if (intermediateResults.length > 0) {
          const mappedResults = intermediateResults.map((stock) => ({
            symbol: stock.symbol,
            name: stock.name,
            exchange: stock.exchange,
          }));

          console.log(
            `[FMP] Returning filtered results: ${JSON.stringify(mappedResults)}`
          );
          return mappedResults;
        }
      }

      // 如果没有地区筛选结果或地区是Global，返回所有结果
      const mappedResults = searchResults.map((stock) => ({
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
      }));

      console.log(
        `[FMP] Returning all results: ${JSON.stringify(mappedResults)}`
      );
      return mappedResults;
    }

    console.log(`[FMP] No matching stock tickers found`);
    return [];
  } catch (error) {
    console.error("[FMP] Error getting stock tickers from FMP:", error);
    return [];
  }
};

// 从查询文本中检测地区信息
function detectGeographyFromQuery(
  query: string,
  defaultGeography: string
): string {
  const lowerQuery = query.toLowerCase();

  // 检测香港市场关键词
  if (
    lowerQuery.includes("港股") ||
    lowerQuery.includes("hk股") ||
    lowerQuery.includes("香港") ||
    lowerQuery.includes("hong kong") ||
    lowerQuery.includes(".hk")
  ) {
    return "HK";
  }

  // 检测中国大陆市场关键词
  if (
    lowerQuery.includes("a股") ||
    lowerQuery.includes("沪市") ||
    lowerQuery.includes("深市") ||
    lowerQuery.includes("上证") ||
    lowerQuery.includes("深证") ||
    lowerQuery.includes("shanghai") ||
    lowerQuery.includes("shenzhen")
  ) {
    return "China";
  }

  // 检测美国市场关键词
  if (
    lowerQuery.includes("美股") ||
    lowerQuery.includes("纳斯达克") ||
    lowerQuery.includes("纽交所") ||
    lowerQuery.includes("nasdaq") ||
    lowerQuery.includes("nyse") ||
    lowerQuery.includes("us stock")
  ) {
    return "US";
  }

  // 如果没有特定的地区关键词，使用默认值（优先美股）
  return defaultGeography === "Global" ? "US" : defaultGeography;
}

// 从比较查询中提取各个部分
function extractQueryParts(query: string): string[] {
  // 替换比较关键词，简化查询
  const simplifiedQuery = query
    .replace(/compare|versus|vs|对比|比较/gi, "")
    .replace(/\s+and\s+/gi, " ")
    .replace(/港股/g, "HK");

  // 按空格分割，并过滤掉常见的连接词
  const parts = simplifiedQuery
    .split(/\s+/)
    .filter(
      (part) =>
        part.length > 1 &&
        !/^(to|with|the|a|an|in|on|at|of|for|by|as)$/i.test(part)
    );

  // 重新组合相邻的单词，尝试形成公司名称
  const combinedParts: string[] = [];
  let currentPhrase = "";

  for (const part of parts) {
    // 如果是潜在的股票代码（大写字母或数字+后缀），单独处理
    if (/^[A-Z]{1,5}$/.test(part) || /^\d{1,6}(\.[A-Z]{1,3})?$/.test(part)) {
      if (currentPhrase.trim()) {
        combinedParts.push(currentPhrase.trim());
        currentPhrase = "";
      }
      combinedParts.push(part);
    } else {
      // 否则累积到当前短语
      if (currentPhrase) currentPhrase += " ";
      currentPhrase += part;
    }
  }

  // 添加最后一个短语
  if (currentPhrase.trim()) {
    combinedParts.push(currentPhrase.trim());
  }

  return combinedParts;
}
