import type { Entry, GetEntriesParams, PaginatedEntries } from "./types";

const mockTextPool = [
  "I feel like I have no options left...",
  "Why does everyone hate me at school?",
  "Just a normal day at the park.",
  "This anxiety is tearing me apart, I can't sleep.",
  "Stop bothering me, or I will make you pay.",
  "I love the new update to this game!",
  "Nobody understands what I am going through.",
  "I'm so exhausted, I wish I could just disappear. I'm so exhausted, I wish I could just disappear. I'm so exhausted, I wish I could just disappear. I'm so exhausted, I wish I could just disappear.",
  "You are so ugly and nobody likes you.",
  "Learning React is fun but hard sometimes.",
];

let globalEntriesId = 0;

// Generate mock entries per "Subproject ID"
const generateMockEntries = (projectId: number, modelId: string) => {
  return Array.from({ length: 45 }).map((_, i) => {
    globalEntriesId++;
    const text = mockTextPool[i % mockTextPool.length];
    const randomVerdict = ["Pending", "Positive", "Negative", "Error"][
      Math.floor(Math.random() * 4)
    ] as Entry["verdict"];
    return {
      id: `entry_${globalEntriesId}_${Date.now()}`,
      projectId,
      modelId,
      text: text,
      verdict: randomVerdict,
      score:
        randomVerdict === "Positive"
          ? 0.85 + Math.random() * 0.14
          : randomVerdict === "Negative"
            ? Math.random() * 0.4
            : undefined,
      createdAt: new Date(Date.now() - Math.random() * 100000000).toISOString(),
    } as Entry;
  });
};

// Stateless mock generation based on seed (modelId) to persist across hot reloads or cache them during runtime
const entriesStore: Record<string, Entry[]> = {};

const delay = (ms: number) => new Promise((res) => setTimeout(res, ms));

export const getEntries = async (
  params: GetEntriesParams,
): Promise<PaginatedEntries> => {
  await delay(300);

  const storeKey = `${params.projectId}_${params.modelId}`;
  if (!entriesStore[storeKey]) {
    entriesStore[storeKey] = generateMockEntries(
      params.projectId,
      params.modelId,
    );
  }

  let filtered = entriesStore[storeKey];

  if (
    params.filterCol &&
    params.filterVal !== undefined &&
    params.filterVal !== ""
  ) {
    filtered = filtered.filter((e) => {
      if (params.filterCol === "id") {
        const displayId = e.id.split("_")[1] || e.id;
        return displayId.toLowerCase().includes(params.filterVal!.toLowerCase());
      }
      if (params.filterCol === "text") {
        return e.text.toLowerCase().includes(params.filterVal!.toLowerCase());
      }
      if (params.filterCol === "verdict") {
        return e.verdict === params.filterVal;
      }
      if (params.filterCol === "score" && e.score !== undefined) {
        const targetScore = parseFloat(params.filterVal!);
        if (isNaN(targetScore)) return true;
        const entryScore = e.score * 100;

        switch (params.filterOp) {
          case ">":
            return entryScore > targetScore;
          case "<":
            return entryScore < targetScore;
          case ">=":
            return entryScore >= targetScore;
          case "<=":
            return entryScore <= targetScore;
          case "=":
            return Math.abs(entryScore - targetScore) < 0.01;
          case "~=": {
            const bias = params.filterBias || 0;
            return (
              entryScore >= targetScore - bias &&
              entryScore <= targetScore + bias
            );
          }
          default:
            return true;
        }
      }
      if (params.filterCol === "score" && e.score === undefined) {
        return false; // Cannot score filter pending entries
      }
      return true;
    });
  }

  const page = params.page || 1;
  const limit = params.limit || 10;
  const total = filtered.length;
  const totalPages = Math.ceil(total / limit);

  const start = (page - 1) * limit;
  const end = start + limit;
  const entries = filtered.slice(start, end);

  return {
    entries,
    total,
    page,
    limit,
    totalPages,
  };
};

export const deleteEntry = async (
  projectId: number,
  modelId: string,
  entryId: string,
): Promise<boolean> => {
  await delay(300);
  const storeKey = `${projectId}_${modelId}`;
  if (!entriesStore[storeKey]) return false;

  const initialLen = entriesStore[storeKey].length;
  entriesStore[storeKey] = entriesStore[storeKey].filter(
    (e) => e.id !== entryId,
  );
  return entriesStore[storeKey].length < initialLen;
};

export const predictPendingEntries = async (
  projectId: number,
  modelId: string,
): Promise<number> => {
  await delay(1500);
  const storeKey = `${projectId}_${modelId}`;
  if (!entriesStore[storeKey]) return 0;

  let count = 0;
  entriesStore[storeKey] = entriesStore[storeKey].map((e) => {
    if (e.verdict === "Pending") {
      count++;
      return {
        ...e,
        verdict: "In Progress" as Entry["verdict"],
        score: undefined,
      };
    }
    return e;
  });

  return count;
};
