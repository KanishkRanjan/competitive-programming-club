import Joi from 'joi';

const DailyUserActivityValidator = Joi.object({
  easy: Joi.number().optional(),
  medium: Joi.number().optional(),
  hard: Joi.number().optional(),
  total: Joi.number().required(),
});

const ProgressMatrixValidator = Joi.object({
  name: Joi.string().required(),
  username: Joi.string().required(),
  score: Joi.number().required(),
  aggregatedSolveCounts: Joi.object()
    .pattern(Joi.string(), Joi.number().required())
    .required(),
  DailyUserActivity: Joi.object()
    .pattern(Joi.string(), DailyUserActivityValidator.required())
    .required(),
});

export const UserValidator = Joi.object({
  name: Joi.string().required(),
  post: Joi.string().default('Member'),
  flag: Joi.number().default(0),
  score: Joi.number().required(),
  ProgressMatrixes: Joi.object()
    .pattern(Joi.string(), ProgressMatrixValidator.required())
    .optional(),
});

// Export the validator
export default UserValidator;




