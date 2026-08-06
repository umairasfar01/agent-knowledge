// Pure scoring engine for agent knowledge retrieval. Kept free of Convex ctx so it
// can be unit-tested directly and later moved behind an index or an action without
// touching call sites.

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "as",
  "at",
  "be",
  "by",
  "can",
  "do",
  "does",
  "for",
  "from",
  "get",
  "how",
  "i",
  "in",
  "is",
  "it",
  "of",
  "on",
  "or",
  "our",
  "the",
  "to",
  "we",
  "what",
  "when",
  "where",
  "who",
  "why",
  "with",
]);

const SYNONYMS: Record<string, string[]> = {
  refund: ["refund", "return", "reimburse", "reimbursement", "money", "back"],
  return: ["return", "refund", "money", "back"],
  money: ["money", "refund", "reimburse", "back"],
  cancel: ["cancel", "cancellation", "stop"],
  order: ["order", "purchase", "transaction"],
  customer: ["customer", "client", "user"],
  email: ["email", "message", "mail"],
  support: ["support", "help", "service"],
  policy: ["policy", "rule", "rules", "guideline"],
};

export type ScorableItem = {
  title: string;
  category: string;
  content: string;
};

export type RetrievalScore = {
  score: number;
  confidence: "High" | "Medium" | "Low";
  matchedFields: string[];
  matchedTerms: string[];
  matchSummary: string;
};

type ParsedQuery = {
  question: string;
  baseTerms: string[];
  expandedTerms: string[];
  phrases: string[];
};

export function tokenize(value: string) {
  return value
    .toLowerCase()
    .split(/[^a-z0-9]+/i)
    .map((term) => term.trim())
    .filter((term) => term.length >= 2 && !STOP_WORDS.has(term));
}

function getPhrases(tokens: string[]) {
  const phrases: string[] = [];

  for (let index = 0; index < tokens.length - 1; index += 1) {
    phrases.push(`${tokens[index]} ${tokens[index + 1]}`);
  }

  for (let index = 0; index < tokens.length - 2; index += 1) {
    phrases.push(`${tokens[index]} ${tokens[index + 1]} ${tokens[index + 2]}`);
  }

  return phrases;
}

export function parseQuery(rawQuestion: string): ParsedQuery {
  const question = rawQuestion.trim().toLowerCase();
  const baseTerms = Array.from(new Set(tokenize(question)));

  return {
    question,
    baseTerms,
    expandedTerms: Array.from(
      new Set(baseTerms.flatMap((term) => SYNONYMS[term] ?? [term]))
    ),
    phrases: getPhrases(baseTerms),
  };
}

export function scoreItem(
  item: ScorableItem,
  query: ParsedQuery
): RetrievalScore {
  const title = item.title.toLowerCase();
  const category = item.category.toLowerCase();
  const content = item.content.toLowerCase();

  const matchedFields = new Set<string>();
  const matchedTerms = new Set<string>();

  let score = 0;

  if (title.includes(query.question)) {
    score += 18;
    matchedFields.add("title");
  }

  if (category.includes(query.question)) {
    score += 10;
    matchedFields.add("category");
  }

  if (content.includes(query.question)) {
    score += 7;
    matchedFields.add("content");
  }

  for (const phrase of query.phrases) {
    if (title.includes(phrase)) {
      score += 9;
      matchedFields.add("title");
    }

    if (category.includes(phrase)) {
      score += 5;
      matchedFields.add("category");
    }

    if (content.includes(phrase)) {
      score += 3;
      matchedFields.add("content");
    }
  }

  for (const term of query.expandedTerms) {
    if (title.includes(term)) {
      score += 5;
      matchedFields.add("title");
      matchedTerms.add(term);
    }

    if (category.includes(term)) {
      score += 3;
      matchedFields.add("category");
      matchedTerms.add(term);
    }

    if (content.includes(term)) {
      score += 1;
      matchedFields.add("content");
      matchedTerms.add(term);
    }
  }

  const matchedBaseTerms = query.baseTerms.filter((term) =>
    (SYNONYMS[term] ?? [term]).some(
      (relatedTerm) =>
        title.includes(relatedTerm) ||
        category.includes(relatedTerm) ||
        content.includes(relatedTerm)
    )
  );

  const coverage =
    query.baseTerms.length > 0
      ? matchedBaseTerms.length / query.baseTerms.length
      : 0;

  score += Math.round(coverage * 6);

  if (coverage === 1 && query.baseTerms.length >= 2) {
    score += 6;
  }

  const matchedFieldList = Array.from(matchedFields);

  return {
    score,
    confidence: score >= 16 ? "High" : score >= 8 ? "Medium" : "Low",
    matchedFields: matchedFieldList,
    matchedTerms: Array.from(matchedTerms).slice(0, 5),
    matchSummary:
      matchedFieldList.length > 0
        ? `Matched in ${matchedFieldList.join(", ")}`
        : "No match",
  };
}

export function rankByRelevance<T extends ScorableItem>(
  items: T[],
  rawQuestion: string,
  limit = 10
): (T & RetrievalScore)[] {
  const query = parseQuery(rawQuestion);

  if (!query.question) {
    return [];
  }

  return items
    .map((item) => ({ ...item, ...scoreItem(item, query) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
