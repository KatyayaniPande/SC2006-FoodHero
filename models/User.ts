import mongoose, { Schema, model } from 'mongoose';

export interface UserDocument {
  _id: string;
  email: string;
  password: string;
  agency: string;
  uen: string;
  address: string;
  poc_name: string;
  poc_phone: string;
  halal_certification: boolean;
  hygiene_certification: string;
  role: string;
  createdAt: Date;
  updatedAt: Date;
}

const UserScheme = new Schema<UserDocument>(
  {
    email: {
      type: String,
      unique: true,
      required: [true, 'Email is required'],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Email is invalid',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
    },
    agency: {
      type: String,
    },
    uen: {
      type: String,
    },
    address: {
      type: String,
    },
    poc_name: {
      type: String,
    },
    poc_phone: {
      type: String,
    },
    halal_certification: {
      type: Boolean,
      default: false,
    },
    hygiene_certification: {
      type: String,
      match: /^[A-D]{1}$/,
    },
    role: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.models?.User || model<UserDocument>('User', UserScheme);
export default User;
