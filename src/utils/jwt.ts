import jwt from "jsonwebtoken";

type UserPayLoad = {
  id: string;
}

export const generateJWT = (payload: UserPayLoad) : string => {
  const token = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "7d"
  })
  return token
};