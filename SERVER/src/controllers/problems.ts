import { NextFunction , Request , Response } from "express";
import CustomError from "../utils/error/custom.error";
import CustomResponse from "../utils/responder";
import ProblemsModel from "../models/problems.model"
import UserModel from "../models/user.model";
import delay from "../utils/delay";

const getFormatedDate = (date: Date) => date.toISOString().split('T')[0] ;

export const deleteProblem = async ( req:Request , res : Response , next : NextFunction) => {
    try {
        const {problemId} = req.params
        const deletedUser = await ProblemsModel.findByIdAndDelete(problemId);
        if (!deletedUser) {
            return next(new CustomError("Problem was not found in Database" , 400));
        }
        return next(new CustomResponse("Problem deleted successfully" , 200));
    } catch (error) {
      console.error("Error during problem deletion:", error);
      return next(new CustomError("Problem was not found in Database" , 500));
    }
};

export const addProblem =  async (req: Request, res: Response , next :NextFunction) => {
    try {
        console.log(req.body);
        
        let { name, problemIndex,contestId, tags,questionLink, difficulty, date }: any = req.body;
        
        if(date) date = getFormatedDate(new Date());
        if (!name || !problemIndex || !contestId || !tags || !date || !questionLink) {
            return next(new CustomError("Missing required fields" , 400));
        }
        const newProblem = new ProblemsModel({ name, contestId,problemIndex, tags,link: questionLink,difficulty, date });
        await newProblem.save(); 
        return next(new CustomResponse("Problem created successfully" , 201));
    } catch (error:any) {
        if (error.code === 11000) { 
            return next(new CustomError("Problem with the same name already exists" , 409));
    }
        return next(new CustomError("Internal server error" , 500));
    }
};

export const getProblems = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const limit = parseInt(req.query.limit as string, 10) || 11000; 
  
      const problems = await ProblemsModel.find()
        .sort({ date: 1 }) 
        .limit(limit);
  
      if (!problems.length) {
        return next(new CustomResponse('No problems found', 200));
      }
      res.json(problems);
      next()
    } catch (error: any) {
      return next(new CustomError('Internal server error', 500));
    }
  };

export const getSolveCount = async (req:Request , res:Response , next :NextFunction) =>{
    let totalSolve:number = 0 ;
    let participantSolve:number = 0 ;
    let { contestId , problemIndex } = req.query ; 

    try
    {
        const userData:any = await UserModel.find().select('ProgressMatrixes.codeforces post');

        for(let i = 0 ; i < userData.length ; i++){
            const extracted = userData[i].ProgressMatrixes.get('codeforces') ; 
            console.log(extracted);
            
            const apiUrl = `https://codeforces.com/api/user.status?handle=${extracted.username}`
            try{
                const response = await fetch(apiUrl);
                const data = await response.json();
                if (data.status !== "OK") {
                  throw new Error(data.comment || "Error fetching submissions");
                }
                const result = data.result ; 
                if(!data.result) continue;
                for(let j = 0; j < result.length ; j++){
                    if(result[j].contestId === parseInt(contestId as string) && result[j].problem.index === problemIndex && result[j].verdict =="OK"  )
                    {
                        if(userData[i].post == 'participant') participantSolve++;               
                        // console.log(result[j]);
                                 
                        totalSolve++;
                    } 
                    
                }

                
            } catch (error) {
                //   console.error("Error fetching API:", error.message);
                  throw error;
                }
            delay(1000);
        }
    }
    catch (error: any) {
        return next(new CustomError('Internal server error', 500));
    }

    // let totalSolve:number = 0 ;
    // let participantSolve:number = 0 ;
    console.log(contestId , problemIndex );
    
    console.log(totalSolve , participantSolve);
    

    res.status(200).send({totalSolve , participantSolve})
}