import blind75Data from "../data/blind75.json";

/**
 * computeBlind75Stats
 *
 * Dataset: flat blind75.json — { category, title, slug, difficulty }
 * Solved detection: SLUG-ONLY, case-insensitive (never title comparison).
 *
 * @param {string[]} solvedSlugs — slugs from LeetCode API (may be mixed-case)
 * @returns {{ totalProblems: number, totalSolved: number, categories: object }}
 */
export function computeBlind75Stats(solvedSlugs = []) {
    // 1. Normalize all incoming slugs to lowercase and deduplicate via Set
    const solvedSet = new Set(
        (Array.isArray(solvedSlugs) ? solvedSlugs : [])
            .map((s) => (typeof s === "string" ? s.toLowerCase().trim() : ""))
            .filter(Boolean)
    );

    console.log("[Blind75] solvedSlugs received:", solvedSlugs?.length ?? 0);
    console.log("[Blind75] unique normalized slugs in Set:", solvedSet.size);

    // 2. Group flat list dynamically by category
    const categories = {};

    blind75Data.forEach((problem) => {
        const cat = problem.category;

        if (!categories[cat]) {
            categories[cat] = { solved: 0, total: 0, problems: [] };
        }

        categories[cat].total++;

        // 3. Slug comparison — always lowercase on both sides
        const isSolved = solvedSet.has(problem.slug.toLowerCase());

        if (isSolved) {
            categories[cat].solved++;
        }

        // Keep problem detail for SolvedModal UI (not part of count logic)
        categories[cat].problems.push({
            title: problem.title,
            name: problem.title,       // backward-compat alias for UI components
            slug: problem.slug,
            difficulty: problem.difficulty,
            category: cat,
            isSolved,
        });
    });

    // 4. totalSolved = sum of per-category solved counts (never independently tracked)
    const totalSolved = Object.values(categories).reduce(
        (sum, cat) => sum + cat.solved,
        0
    );

    console.log("[Blind75] totalSolved:", totalSolved, "/ totalProblems:", blind75Data.length);

    return {
        totalProblems: blind75Data.length, // always 75
        totalSolved,
        categories,
    };
}
