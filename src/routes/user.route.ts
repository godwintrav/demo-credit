import { Router } from 'express';
import { UserController } from '../modules/user/user.controller';
import { UserService } from '../modules/user/user.service';
import db from '../config/db';
import { UserModel } from '../modules/user/user.model';

const userRouter = Router();

//dependency injection
const userModel: UserModel = new UserModel(db);
const userService: UserService = new UserService(userModel);
const userController: UserController = new UserController(userService);

userRouter.post('/register', (req, res) => userController.register(req, res));
userRouter.post('/login', (req, res) => userController.login(req, res));

export default userRouter;
