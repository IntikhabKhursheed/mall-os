const apiResponse = require("../utils/apiResponse");

const normalizeType = (value) => {
  if (value === "trend" || value === "anomaly" || value === "recommendation") {
    return value;
  }

  return "recommendation";
};

const buildPrompt = ({ searchTerm = "", insightType = "all", mallContext = {} }) => {
  return [
    "You are MallOS AI for a retail mall management dashboard.",
    "Return strict JSON only.",
    "Generate 1 to 3 insights as an array of objects with title, description, type, and timestamp.",
    "Type must be one of: trend, anomaly, recommendation.",
    `Search term: ${searchTerm || "none"}.`,
    `Requested insight type: ${insightType || "all"}.`,
    `Mall context: ${JSON.stringify(mallContext)}.`
  ].join("\n");
};

const extractText = (responseJson) => {
  const candidate = responseJson?.candidates?.[0];
  const parts = candidate?.content?.parts || [];
  return parts.map((part) => part.text || "").join("\n").trim();
};

const parseInsights = (text, insightType) => {
  if (!text) {
    return [];
  }

  const match = text.match(/\[[\s\S]*\]/) || text.match(/\{[\s\S]*\}/);
  const candidate = match ? match[0] : text;

  try {
    const parsed = JSON.parse(candidate);
    const rawItems = Array.isArray(parsed) ? parsed : parsed.insights || parsed.data || [parsed];

    return rawItems
      .filter(Boolean)
      .map((item, index) => ({
        title: String(item.title || `Insight ${index + 1}`).trim(),
        description: String(item.description || "").trim(),
        type: normalizeType(item.type || insightType),
        timestamp: item.timestamp ? new Date(item.timestamp).toISOString() : new Date().toISOString()
      }))
      .filter((item) => item.title && item.description);
  } catch {
    return [];
  }
};

const buildFallbackInsights = ({ searchTerm = "", insightType = "all", mallContext = {} }) => {
  const insights = [
    {
      title: "Sales trend is steady",
      description: `Current mall activity shows ${mallContext?.salesToday ?? 0} sales with ${mallContext?.revenueToday ?? 0} revenue tracked.`,
      type: "trend",
      timestamp: new Date().toISOString()
    },
    {
      title: "Inventory anomaly requires attention",
      description: `There are ${mallContext?.lowStockCount ?? 0} low-stock signals across the mall.`,
      type: "anomaly",
      timestamp: new Date().toISOString()
    },
    {
      title: "Staffing recommendation",
      description: `Review department coverage for ${mallContext?.activeEmployees ?? 0} active employees and optimize peak shifts.`,
      type: "recommendation",
      timestamp: new Date().toISOString()
    }
  ];

  const normalizedType = insightType === "all" ? null : insightType;
  const query = searchTerm.trim().toLowerCase();

  return insights.filter((item) => {
    const matchesType = !normalizedType || item.type === normalizedType;
    const matchesQuery =
      !query ||
      item.title.toLowerCase().includes(query) ||
      item.description.toLowerCase().includes(query);
    return matchesType && matchesQuery;
  });
};

const fetchInsights = async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const { searchTerm = "", insightType = "all", mallContext = {} } = req.body || {};

    if (!apiKey) {
      return apiResponse(res, 200, true, "Insights loaded", {
        insights: buildFallbackInsights({ searchTerm, insightType, mallContext }),
        source: "mock",
        generatedAt: new Date().toISOString()
      });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [
              {
                text: "You are MallOS AI. Return only valid JSON. No markdown."
              }
            ]
          },
          contents: [
            {
              role: "user",
              parts: [
                {
                  text: buildPrompt({ searchTerm, insightType, mallContext })
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.4,
            responseMimeType: "application/json"
          }
        })
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini request failed: ${errorText}`);
    }

    const json = await response.json();
    const text = extractText(json);
    const insights = parseInsights(text, insightType);

    return apiResponse(res, 200, true, "Insights loaded", {
      insights: insights.length ? insights : buildFallbackInsights({ searchTerm, insightType, mallContext }),
      source: "gemini",
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    return apiResponse(res, 200, true, "Insights loaded", {
      insights: buildFallbackInsights({
        searchTerm: req.body?.searchTerm || "",
        insightType: req.body?.insightType || "all",
        mallContext: req.body?.mallContext || {}
      }),
      source: "mock",
      generatedAt: new Date().toISOString()
    });
  }
};

module.exports = {
  fetchInsights
};
