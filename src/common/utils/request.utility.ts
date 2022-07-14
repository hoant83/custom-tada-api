import { Request } from 'express';
import * as bcrypt from 'bcrypt';
export const getTokenFromRequest = (req: Request): string => {
  const authHeaders = req.headers;
  const tokenString =
    authHeaders.authorization?.split(' ').length > 1
      ? authHeaders.authorization.split(' ')[1]
      : '';
  return tokenString;
};

export const createSession = async (id: number): Promise<string> => {
  const sessionString = `${new Date().toString()}${id}`;
  const session = await bcrypt.hash(sessionString, 10);
  return session;
};
