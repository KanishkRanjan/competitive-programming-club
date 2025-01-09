import { NextFunction, Request, Response } from "express";

import CustomError from "../utils/error/custom.error";
import UserValidator from "../utils/validators/user.validator";
import UserModel, { IDailyUserActivity, IUser } from "../models/user.model";
import CustomResponse from "../utils/responder";

const platforms = ["codechef", "codeforces", "leetcode", "cses"];

export const addUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const body = req.body;
  if (!body.name) {
    const error = new CustomError("Name was not provided", 400);
    console.log("hi");

    next(error);
    return;
  }
  if (!body.post) {
    const error = new CustomError("Post was not provided", 400);
    next(error);
    return;
  }
  console.log(body.ProgressMatrixes.codeforces.aggregatedSolveCounts);

  const { error } = UserValidator.validate(body);
  console.log(error);

  for (const key in body.ProgressMatrixes) {
    if (body.ProgressMatrixes[key].aggregatedSolveCounts.total == undefined) {
      next(
        new CustomError(`Total aggregated count was not provide in ${key}`, 400)
      );
      return;
    }
  }
  if (error) {
    const err = new CustomError("Validation failed", 400);
    next(err);
    return;
  }

  const newUser = new UserModel(req.body);
  await newUser.save().then(() => {
    const msg = new CustomResponse("User created succesfuly!", 201);
    next(msg);
  });
};

export const increaseflaguser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.body.userid) {
    const err = new CustomError("User ID was not provided", 400);
    next(err);
  } else {
    await UserModel.findByIdAndUpdate(req.body.userid, { $inc: { flag: 1 } })
      .then(() => {
        const msg = new CustomResponse(
          "User's flag value was increased by one",
          201
        );
        next(msg);
      })
      .catch(() => {
        const err = new CustomError("Something went wrong while updating", 400);
        next(err);
      });
  }
};

const getFormatedDate = (date: Date) => date.toISOString().split("T")[0];

export const updateActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  // if(lastUpdatedDate ==  getFormatedDate(new Date())){
  //   return next(new CustomError('You can only call update function ones a day', 401));
  // }
  const {
    userid,
    platformname,
    score,
    date,
    questionType,
    solved,
  }: {
    userid: string;
    platformname: string;
    date?: string;
    questionType: string;
    solved: number;
    score: number;
  } = req.body;
  if (
    !userid ||
    !platformname ||
    !questionType ||
    solved === undefined ||
    !score
  ) {
    next(
      new CustomError(
        "All fields (userid, platformname, questionType, solved) are required.",
        400
      )
    );
    return;
  }
  const platformKey = platformname.toLowerCase();
  const updateDate = date || getFormatedDate(new Date());
  try {
    const user = await UserModel.findById(userid);
    if (!user) {
      next(new CustomError("User not found.", 404));
      return;
    }
    if (!user.ProgressMatrixes || !user.ProgressMatrixes.has(platformKey)) {
      next(
        new CustomError(
          `Platform '${platformname}' does not exist for this user.`,
          400
        )
      );
      return;
    }
    const platform = user.ProgressMatrixes.get(platformKey);
    //Improve this
    if (!platform) throw "Didn't find that platform";
    platform.DailyUserActivity = platform.DailyUserActivity || new Map();
    if (!platform.DailyUserActivity.has(updateDate)) {
      platform.DailyUserActivity.set(updateDate, {
        easy: 0,
        medium: 0,
        hard: 0,
        total: 0,
      });
    }
    const activity: IDailyUserActivity | undefined =
      platform.DailyUserActivity.get(updateDate);
    console.log(activity);

    if (activity) {
      if (!["easy", "medium", "hard", "total"].includes(questionType)) {
        next(new CustomError("Invalid question type.", 400));
        return;
      }

      //verify this
      // const previousActivity = Array.from(platform.DailyUserActivity.entries())
      //   .filter(([activityDate]) => activityDate < updateDate)
      //   .sort(([a], [b]) => (a > b ? -1 : 1))[0]?.[1] || { easy: 0, medium: 0, hard: 0, total: 0 };

      // const previousSolved = previousActivity[questionType as keyof IDailyUserActivity] || 0;
      const currentSolveCount =
        platform.aggregatedSolveCounts.get(questionType) || 0;
      const difference =
        solved -
        currentSolveCount +
        (activity[questionType as keyof IDailyUserActivity] || 0);
      if (difference < 0) {
        next(new CustomError("Incorrect question type.", 400));
        return;
      }

      console.log(
        currentSolveCount,
        difference,
        activity[questionType as keyof IDailyUserActivity]
      );

      platform.aggregatedSolveCounts.set(questionType, solved);

      activity[questionType as keyof IDailyUserActivity] = difference;

      activity.total =
        (activity.easy || 0) + (activity.medium || 0) + (activity.hard || 0);
      platform.score = score;
      await user.save();

      next(new CustomResponse("Activity updated successfully.", 200));
    } else {
      next(
        new CustomError(
          "Failed to initialize or update the DailyUserActivity.",
          500
        )
      );
      return;
    }
  } catch (error) {
    next(new CustomError("An error occurred while updating activity.", 500));
  }
};

export const deleteUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const userId = req.params.userId;
    const deletedUser = await UserModel.findByIdAndDelete(userId);
    if (!deletedUser) {
      return next(new CustomError("User was not found in Database", 400));
    }
    return next(new CustomResponse("User deleted successfully", 200));
  } catch (error) {
    console.error("Error during user deletion:", error);
    return next(new CustomError("User was not found in Database", 500));
  }
};

export const getuserlist = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const limit: number = parseInt(req.query.limit as string) || 1000;
    const skip: number = parseInt(req.query.skip as string) || 0;
    const sortBy: string = req.query.sortBy as string;

    let sortProperty: string;
    if (!sortBy) {
      sortProperty = `score`;
    } else if (platforms.includes(sortBy)) {
      sortProperty = `ProgressMatrixes.${sortBy}.score`;
    } else {
      next(new CustomError("Platform doesn't exist in db", 401));
      return;
    }

    const sortedUsers = await UserModel.aggregate([
      {
        $sort: {
          [sortProperty]: -1,
        },
      },
      // {
      //   $project: {
      //     name: 1,
      //     "ProgressMatrixes.codechef.aggregatedSolveCounts.total": 1,
      //   },
      // },
    ]);

    res.status(200).json(sortedUsers);
  } catch (error) {
    console.log(error);
    next(new CustomError("Error fetching users", 500));
  }
};

export const insertDemoData = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  next(new CustomResponse("This Feature is shut due to safety", 401));
  return;
  function generateRandomObject() {
    const platforms = [
      "codechef",
      "codeforces",
      "leetcode",
      "hackerrank",
      "atcoder",
    ];
    const names = [
      "John",
      "Emma",
      "Oliver",
      "Ava",
      "William",
      "Sophia",
      "James",
      "Mia",
    ];
    const usernames = [
      "CodeMaster",
      "TechWizard",
      "ProgPro",
      "CodeQueen",
      "DevDude",
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomUsername =
      usernames[Math.floor(Math.random() * usernames.length)];

    const progressMatrixes: any = {};
    for (const platform of platforms) {
      const aggregatedSolveCounts: any = {};
      const dailyUserActivity: any = {};
      const randomDate = new Date(
        Math.floor(Math.random() * 365 * 24 * 60 * 60 * 1000)
      );
      const year = randomDate.getFullYear();
      const month = String(randomDate.getMonth() + 1).padStart(2, "0");
      const day = String(randomDate.getDate()).padStart(2, "0");
      const formattedDate = `${year}-${month}-${day}`;

      aggregatedSolveCounts.total = Math.floor(Math.random() * 100);
      aggregatedSolveCounts.easy = Math.floor(Math.random() * 50);
      aggregatedSolveCounts.medium = Math.floor(Math.random() * 30);
      aggregatedSolveCounts.hard = Math.floor(Math.random() * 20);

      dailyUserActivity[formattedDate] = {
        total: Math.floor(Math.random() * 20),
        easy: Math.floor(Math.random() * 10),
        medium: Math.floor(Math.random() * 5),
        hard: Math.floor(Math.random() * 3),
      };

      progressMatrixes[platform] = {
        name: platform,
        username: `${randomUsername}_${platform}`,
        aggregatedSolveCounts,
        DailyUserActivity: dailyUserActivity,
        score: Math.floor(Math.random() * 200),
      };
    }

    return {
      name: randomName,
      post: "Moderator",
      flag: 1,
      ProgressMatrixes: progressMatrixes,
      score: Math.floor(Math.random() * 500),
    };
  }

  // Example usage:

  // await obje.forEach(async (sobj) => {
  for (let i = 0; i < 20; i++) {
    const randomData = generateRandomObject();
    const { error } = UserValidator.validate(randomData);

    console.log(error);

    const newUser = new UserModel(randomData);

    await newUser.save().then(() => {
      const msg = new CustomResponse("Demo data inserted", 201);
      next(msg);
    });
    console.log(randomData);
  }
  // })
};

// ProgressMatrixSchema.virtual('score').get(function (this: IProgressMatrix){
//     // console.log(this);
//     let score : number = 0 ;

//     if(this.name == 'codechef' ){
//       score += codechefCalculation(this.aggregatedSolveCounts);
//     }
//     else if(this.name == 'codeforces' ){
//       score += codeforcesCalculation(this.aggregatedSolveCounts);
//     }
//     else if(this.name == 'leetcode' ){
//       score += leetcodeCalculation(this.aggregatedSolveCounts);
//     }
//     else {
//       score += this.aggregatedSolveCounts.get('total')||0 ;
//     }
//     return score;
//   })

//   ProgressMatrixSchema.set('toJSON', { virtuals: true });
//   ProgressMatrixSchema.set('toObject', { virtuals: true });

//   UserSchema.virtual('score').get(function (this: IUser) {
//     let totalScore : number = 0;

//     if (this.ProgressMatrixes) {
//       this.ProgressMatrixes.forEach((progressMatrix) => totalScore += progressMatrix.score || 0 );
//     }

//     return totalScore;
//   });

//   UserSchema.set('toJSON', { virtuals: true });
//   UserSchema.set('toObject', { virtuals: true });


// https://github.com/nst-sdc/testBackEnd/tree/main