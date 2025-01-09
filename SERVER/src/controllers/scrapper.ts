import { NextFunction , Request , Response} from "express";
import getLeetcodeData from "../utils/scrapper/leetcode.scrapper"
import getCodechefData from "../utils/scrapper/codechef.scrapper"
import getCodeforcesData from "../utils/scrapper/codeforces.scrapper"
import getCsesData from '../utils/scrapper/cses.scrapper'
import CustomError from "../utils/error/custom.error";


export const leetcodedata =  async (req:Request, res:Response , next : NextFunction) => {
    const  username  = req.params?.username;
    const result = await getLeetcodeData(username);
    if(result.success) return next(new CustomError('No User found with that username', 404));
    res.json(result)
};
 
export const codechefdata = async (req: Request , res :Response , next:NextFunction) =>{
    const username = req.params?.username;
    const result = await getCodechefData(username);
    if(result.success) return next(new CustomError('No User found with that username', 404));
    res.json(result)
}
export const codeforcesdata = async (req: Request , res :Response , next:NextFunction) =>{
    const username = req.params?.username;
    const result = await getCodeforcesData(username);
    if(result.success) return next(new CustomError('No User found with that username', 404));
    res.json(result)
}

export const csessdata = async (req: Request , res :Response , next:NextFunction) =>{
    const username = req.params?.username;
    const result = await getCsesData(username);
    if(result.success) return next(new CustomError('No User found with that username', 404));
    res.json(result)
}