import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  name: string;
  email: string;
  password?: string; // Password is not required for OAuth users
  avatar?: string;
  provider?: 'google' | 'facebook' | 'discord' | 'credentials';
  providerAccountId?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  lastLogin?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    avatar: { type: String },
    provider: { type: String, default: 'credentials' },
    providerAccountId: { type: String },
    passwordResetToken: { type: String },
    passwordResetExpires: { type: Date },
    lastLogin: { type: Date },
  },
  { timestamps: true } 
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
