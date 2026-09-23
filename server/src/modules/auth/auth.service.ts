import { prisma } from "../../lib/prisma.js";
import type { RegisterInput, LoginInput } from "./auth.type.js";
import bcrypt from "bcryptjs";
import {issueTokens} from "./token.service.js"

export const register = async (userData: RegisterInput) => {
  const hashedPass = await bcrypt.hash(userData.password, 12);
  const result = await prisma.$transaction(async (tx) => {
    const email = userData.email.toLowerCase().trim();

    const existingUser = await tx.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new Error("User already exists");
    }

    const newUser = await tx.user.create({
      data: {
        ...userData,
        email: email,
        password: hashedPass,
      },
      omit: {
        password: true,
      },
    });

    await tx.profile.create({
      data: {
        userId: newUser.id,
        learningGoals: [],
      },
    });
    return newUser;
  });

  const tokens = await issueTokens(result.id,result.email)
  return {
    data: result,
    ...tokens
  };
};

export const login = async (userData: LoginInput) => {
  const email = userData.email.toLowerCase().trim();

  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  const invalidCredentials = new Error("Invalid email or password");

  if (!user || !user.password) {
    throw invalidCredentials;
  }

  const isPasswordValid = await bcrypt.compare(
    userData.password,
    user.password,
  );

  if (!isPasswordValid) {
    throw invalidCredentials;
  }

  const { password, ...userWithoutPassword } = user;

  const tokens = await issueTokens(userWithoutPassword.id,userWithoutPassword.email)

  return {data : userWithoutPassword,...tokens};
};
