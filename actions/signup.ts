'use server';

import { mongoDBConnection } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';

export const registerUser = async (values: any) => {
  const {
    email,
    password,
    agency,
    uen,
    address,
    poc_name,
    poc_phone,
    halal_certification,
    hygiene_certification,
    role,
  } = values;

  try {
    await mongoDBConnection();

    const isUserFound = await User.findOne({ email });

    if (isUserFound) {
      return {
        error: 'Email already exists',
      };
    }

    const hashed = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashed,
      agency,
      uen,
      address,
      poc_name,
      poc_phone,
      halal_certification,
      hygiene_certification,
      role,
    });

    await user.save();
  } catch (error: any) {
    return {
      error: error.toString(),
    };
  }
};
