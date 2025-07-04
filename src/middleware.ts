import {NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { JWT_PASSWORD } from "./config"
import { UserModel, ContentModel } from "./db";

function validatepass(str: string) {
  const hasSpecialChar = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(str);
  const hasUpperCase = /[A-Z]/.test(str);
  const hasLowerCase = /[a-z]/.test(str);
  const hasNumber = /[0-9]/.test(str);

  return hasSpecialChar && hasUpperCase && hasLowerCase && hasNumber
}

export const userSignupMiddleware = async (req: Request, res: Response,
  next: NextFunction) => {
  
  const username = req.body.username;
  const password = req.body.password;

  const existingUser = await UserModel.findOne({
    userrname: username
  });

  if (existingUser) {
    res.status(403).json({
      message: "User already exists!"
    })
  } else if (username.length < 3 || username.length > 10) {
    res.status(411).json({
      message: "Invalid Username! Username myst be between 3 to 10 characters long."
    })
  } else if (password.length < 8 || password.length > 20) {
    res.status(411).json({
      message: "Invalid Password! Password must be 8 to 20 characters long."
    })
  }
  else if (!validatepass(password)) {
    res.status(411).json({
      message: "Invalid Password! Password should have atleast one uppercase, one lowercase, one special character, one number"
    })
  }

  next()
}

export const userMiddleware = (req: Request, res: Response,
  next: NextFunction) => {
  
  const header = req.headers["authorization"];
  const decoded = jwt.verify(header as string, JWT_PASSWORD);

  if (decoded) {
    //@ts-ignore
    req.userId = decoded.id;
    next()
  } else {
    res.status(403).json({
      message: "You are not logged in"
    })
  }
}
