import { describe, expect, test } from "vitest";
import { parseQuery, rankByRelevance, tokenize } from "../../convex/retrieval";

// Characterization tests: these lock in the scoring behaviour that was inlined in
// knowledge.ts before task #18 extracted it, so the move stays observably neutral.

describe("tokenize", () => {
  test("drops stop words and single characters", () => {
    expect(tokenize("What is the refund policy?")).toEqual([
      "refund",
      "policy",
    ]);
  });
});

describe("parseQuery", () => {
  test("expands terms through the synonym map", () => {
    expect(parseQuery("refund").expandedTerms).toEqual([
      "refund",
      "return",
      "reimburse",
      "reimbursement",
      "money",
      "back",
    ]);
  });

  test("builds bigrams and trigrams from base terms", () => {
    expect(parseQuery("cancel an order today").phrases).toEqual([
      "cancel order",
      "order today",
      "cancel order today",
    ]);
  });
});

describe("rankByRelevance", () => {
  const refundPolicy = {
    title: "Refund Policy",
    category: "Company Policy",
    content: "Customers may request a refund within 30 days.",
  };

  test("returns nothing for a blank question", () => {
    expect(rankByRelevance([refundPolicy], "   ")).toEqual([]);
  });

  test("scores a full title match with complete term coverage", () => {
    const [result] = rankByRelevance([refundPolicy], "refund policy");

    // 18 exact title + 9 phrase title + 6 refund term + 8 policy term
    // + 6 full coverage + 6 multi-term coverage bonus
    expect(result.score).toBe(53);
    expect(result.confidence).toBe("High");
    expect(result.matchedFields).toEqual(["title", "content", "category"]);
    expect(result.matchSummary).toBe("Matched in title, content, category");
  });

  test("matches through synonyms the item never literally uses", () => {
    const [result] = rankByRelevance([refundPolicy], "money back");

    expect(result.score).toBeGreaterThan(0);
    expect(result.matchedTerms).toContain("refund");
  });

  test("excludes items that score zero and sorts the rest descending", () => {
    const unrelated = {
      title: "Office WiFi",
      category: "Facilities",
      content: "The guest network password rotates weekly.",
    };

    const results = rankByRelevance([unrelated, refundPolicy], "refund policy");

    expect(results).toHaveLength(1);
    expect(results[0].title).toBe("Refund Policy");
  });

  test("caps the result set at the requested limit", () => {
    const items = Array.from({ length: 15 }, (_, index) => ({
      title: `Refund Policy ${index}`,
      category: "Company Policy",
      content: "Refund details.",
    }));

    expect(rankByRelevance(items, "refund policy")).toHaveLength(10);
    expect(rankByRelevance(items, "refund policy", 3)).toHaveLength(3);
  });
});
