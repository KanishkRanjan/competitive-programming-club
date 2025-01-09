import backfetcher from "./backfetcher";
import calculate from "./calculate";


const getFormatedDate = (date: Date) => date.toISOString().split('T')[0] ;

const updateAll = async ()=>{

    const allusers = await backfetcher("/leaderboard/getuserlist");
    if(!allusers) return;
    allusers.forEach(async (alluser:any) =>{
        for(let key in alluser.ProgressMatrixes){
            const info =  await backfetcher(`/scrapper/${alluser.ProgressMatrixes?.[key]?.name}/${alluser.ProgressMatrixes?.[key]?.username}`) ;
            console.log("THis is info: ",info);
            
            for(let pKey in info){
                const {error} = await backfetcher('/leaderboard/updateActivity',"PATCH",{
                            userid:alluser?._id,
                            platformname:alluser.ProgressMatrixes?.[key]?.name,
                            questionType : pKey,
                            solved : info[pKey],
                            date : getFormatedDate(new Date()) ,
                            score: calculate(alluser.ProgressMatrixes?.[key]?.name,info) 
                    }) ;
                console.log(error);

                // if(error){
                //     return error ;
                // }
                
            }
        }
       
    })
    
    
}

export default updateAll ;