const api_url: string = `${process.env.HOST_LINK}/api`;

type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH";

interface FetchResponse {
    error?: string;
    url?: string;
    [key: string]: any;
}

const sendFetchRequest = async (endpoint: string, method: HttpMethod = "GET", body?: any): Promise<FetchResponse> => {
    if (!endpoint) {
        console.error("URL was not provided!");
        return { error: "URL must be passed" };
    }
    try {
        const url = api_url + endpoint;
        const response = await fetch(url, {
            method,
            headers: { "Content-Type": "application/json" },
            body: body ? JSON.stringify(body) : undefined
        });
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
        }
        return await response.json();
    } catch (error: any) {
        console.error("Error during fetch request:", error);
        return { error: error.message, url: endpoint };
    }
};

const getFormattedDate = (date: Date): string => date.toISOString().split("T")[0];

const platformNames: string[] = ["codeforces", "leetcode", "codechef", "cses"];

export { sendFetchRequest, getFormattedDate, platformNames };
