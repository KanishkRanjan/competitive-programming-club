import express ,{Router} from "express"
import { addProblem , getProblems , getSolveCount , deleteProblem } from "../controllers/problems";

const router:Router = express.Router();

router.post('/addproblem' ,addProblem );
router.get('/getproblems/:limit' , getProblems)
router.get('/getsolvecount' , getSolveCount)
router.delete('/delete/:problemId',deleteProblem)

export default router;