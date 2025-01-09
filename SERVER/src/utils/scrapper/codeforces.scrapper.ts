import fetch from 'node-fetch';

async function getSolvedProblemsByCategory(username: string): Promise<any> {
    const url = `https://codeforces.com/api/user.status?handle=${username}`;

    try {
        const response:any = await fetch(url);
        const data:any = await response.json();

        if (data.status !== 'OK') {
            throw new Error(`Codeforces API Error: ${data.comment}`);
        }

        const categories = {
            Easy: new Set([800, 900, 1000, 1100, 1200]),
            Medium: new Set([1300, 1400, 1500, 1600, 1700, 1800]),
            Hard: new Set([1900, 2000, 2100, 2200, 2300, 2400]),
        };

        const categoryCount = {
            easy: 0,
            medium: 0,
            hard: 0,
        };

        const solvedProblemsSet = new Set();
        
        data.result.forEach((submission: any) => {
            if (submission.verdict === 'OK' && submission.problem) {
                const { problem } = submission;
                const rating = problem.rating;
                const problemId = `${problem.contestId}-${problem.index}`;

                if (!rating || solvedProblemsSet.has(problemId)) return;

                if (categories.Easy.has(rating)) {
                    categoryCount.easy++;
                } else if (categories.Medium.has(rating)) {
                    categoryCount.medium++;
                } else if (categories.Hard.has(rating)) {
                    categoryCount.hard++;
                }

                solvedProblemsSet.add(problemId);
            }
        });

        const total = solvedProblemsSet.size;
        
        return {
            total,
            easy: categoryCount.easy,
            medium: categoryCount.medium,
            hard: categoryCount.hard,
        };
    } catch (error: any) {
        console.error(`Error fetching data for user "${username}":`, error.message);
        return { success : false };

    }
}

export default getSolvedProblemsByCategory;
