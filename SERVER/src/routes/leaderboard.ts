import express ,{Router} from "express"
import { addUser, increaseflaguser, updateActivity , getuserlist,insertDemoData , deleteUser } from "../controllers/leaderboard";

const router:Router = express.Router();
 
router.put('/adduser' , addUser);
router.patch('/addflaguser', increaseflaguser);
router.patch('/updateActivity' , updateActivity)
router.get('/getuserlist' , getuserlist)
router.get('/insertDummy' , insertDemoData)
router.delete('/deleteUser/:userId' , deleteUser)

export default router;