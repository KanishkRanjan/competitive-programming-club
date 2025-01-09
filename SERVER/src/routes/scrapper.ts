import express ,{Router} from "express"
import { leetcodedata , codechefdata , codeforcesdata , csessdata } from "../controllers/scrapper"

const router:Router = express.Router();

router.get('/leetcode/:username' , leetcodedata)
router.get('/codechef/:username' , codechefdata)
router.get('/codeforces/:username' , codeforcesdata)
router.get('/cses/:username' , csessdata)

export default router;