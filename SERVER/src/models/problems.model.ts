import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IProblems extends Document {
  name: string;
  link:string; 
  contestId : number;
  problemIndex : string;
  tags: string[];
  difficulty: string;
  date:string;
}

const ProblemScheme = new Schema<IProblems>({
  name: { type: String, required: true,unique:true},
  link : {type: String , reqired: true},
  contestId : {type:Number , required : true} ,
  problemIndex : {type:String , required : true},
  tags: { type: [String],required:true  }, 
  difficulty: {type: String, default:'easy'} ,
  date: { type: String , required: true },
});

const ProblemsModel: Model<IProblems> = mongoose.model<IProblems>('Problems', ProblemScheme);

export default ProblemsModel;
