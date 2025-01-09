import axios from 'axios';
import * as cheerio from 'cheerio'; 

const getCodechefData = async (username: string) => {
    const url = `https://www.codechef.com/users/${username}`;
    let totalQuestionSolved = 0;

    try {
        console.log(`Fetching data from ${url}...`);
        const response = await axios.get(url, {
            headers: {
                'User-Agent':
                    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            },
        });

        const $ = cheerio.load(response.data);
        const problemsSolvedText = $('.rating-data-section.problems-solved h3')
            .filter((_, element) => $(element).text().includes('Total Problems Solved'))
            .text();
        const match = problemsSolvedText.match(/\d+/);
        totalQuestionSolved = match ? parseInt(match[0], 10) : 0;
    } catch (error: any) {
        console.error('Error:', error.message);
        return { success : false };
    }
    return { total: totalQuestionSolved };
};

export default getCodechefData;
