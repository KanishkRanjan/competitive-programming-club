const axios = require('axios');
const cheerio = require('cheerio');

require('dotenv').config();



async function fetchCSESData(userId:string) {
    const cookies = {
        PHPSESSID: process.env.PHPSESSID || "0e23d626ace5d7aedfcf67437ec9ceff726f9500"
    };
    try {
        const response = await axios.get(`https://cses.fi/problemset/user/${userId}/`, {
            headers: {
                Cookie:  `PHPSESSID=${cookies.PHPSESSID}`,
            },
        });

        const $ = cheerio.load(response.data);

        const solvedFullCount = $('.task-score.icon.full').length;
        
        return {total : solvedFullCount}
    } catch (error) {
        console.error('Error fetching or processing CSES data:', error);
        return { success : false}
    }
}

// async function fetchCSESData() {
//     const cookies = {
//         PHPSESSID: process.env.PHPSESSID || "0e23d626ace5d7aedfcf67437ec9ceff726f9500"
//     };

//     const headers = {
//         'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
//         'Accept-Language': 'en-US,en;q=0.9',
//         'Cookie': `PHPSESSID=${cookies.PHPSESSID}`,
//         'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36'
//     };

//     const users = {};
//     try {
//         for (let page of [1, 2]) {
//             const response = await axios.get(`https://cses.fi/problemset/stats/friends/p/${page}`, {
//                 headers,
//                 timeout: 10000,
//                 validateStatus: (status:number) => status === 200
//             });
            
            

//             if (response.data) {
//                 const $ = cheerio.load(response.data);
//                 Object.assign(users, getUsers($));
//             }
//         }
        
//         return Object.keys(users).length > 0 ? users : null;
//     } catch (error) {
//         console.error('Error fetching CSES data:', (error as Error).message);
//         return null;
//     }

    
// }

export default fetchCSESData;
