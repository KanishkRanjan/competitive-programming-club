
const axios = require('axios');

const LEETCODE_GRAPHQL_URL = 'https://leetcode.com/graphql';

// Function to fetch user data from LeetCode
async function getLeetCodeData(username:string) {
    const query = `
    query userProfile($username: String!) {
      matchedUser(username: $username) {
        submitStatsGlobal {
          acSubmissionNum {
            difficulty
            count
          }
        }
      }
    }`;

    try {
        const response = await axios.post(LEETCODE_GRAPHQL_URL, {
            query,
            variables: { username }
        });

        const stats = response.data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;

        if (!stats) {
            return { error: 'User not found or data unavailable' };
        }

        return {
            easy: stats[1]?.count || 0,
            medium: stats[2]?.count || 0,
            hard: stats[3]?.count || 0,
            total: stats[0]?.count || 0
        };
    } catch (error:any) {
        console.error('Error fetching data:', error.message);
        return { success: false };
    }
}

export default  getLeetCodeData;