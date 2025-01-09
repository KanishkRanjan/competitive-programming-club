import mongoose, { Schema, Document, Model } from 'mongoose';


export interface IDailyUserActivity {
  easy?: number;
  medium?: number;
  hard?: number;
  total: number; 
}

interface IProgressMatrix {
  name: string;
  username: string;
  score: number;
  aggregatedSolveCounts: Map<string, number>;
  DailyUserActivity: Map<string, IDailyUserActivity>;
}

export interface IUser extends Document {
  name: string;
  post: string;
  flag: number;
  score: number;
  ProgressMatrixes: Map<string, IProgressMatrix>;
}


const DailyUserActivitySchema = new Schema<IDailyUserActivity>(
  {
    easy: { type: Number, required: false },
    medium: { type: Number, required: false },
    hard: { type: Number, required: false },
    total: { type: Number, required: true },
  },
  { _id: false } // No _id for subdocuments
);

// Updated ProgressMatrixSchema
const ProgressMatrixSchema = new Schema<IProgressMatrix>(
  {
    name: { type: String, required: true },
    username: { type: String, required: true },
    score: { type: Number, required: true },
    aggregatedSolveCounts: {
      type: Map,
      of: Number,
      required: true,
    },
    DailyUserActivity: {
      type: Map,
      of: DailyUserActivitySchema,
      required: true,
    },
  },
  { _id: false }
);

// Updated UserSchema
const UserSchema = new Schema<IUser>({
  name: { type: String, required: true },
  post: { type: String, default: 'Member', required: false },
  flag: { type: Number, default: 0 }, 
  ProgressMatrixes: {
    type: Map,
    of: ProgressMatrixSchema,
    required: true,
  },
  score: { type: Number, required: true },
});

// Export the model
const UserModel: Model<IUser> = mongoose.model<IUser>('User', UserSchema);

export default UserModel;
