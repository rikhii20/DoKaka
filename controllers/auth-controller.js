const Joi = require("joi");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const errorHandler = require("../utils/errorHandler");
const { User } = require("../models");

module.exports = {
  register: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        name: Joi.string().required(),
        username: Joi.string().min(5).required(),
        password: Joi.string()
          .min(5)
          .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])/)
          .message(
            '"password" should contain a mix of uppercase and lowercase letters, numbers, and special characters ',
          )
          .required(),
      });
      const { error } = schema.validate({ ...body });
      if (error) {
        return res.status(400).json({
          status: "Bad Request",
          message: error.message,
          result: {},
        });
      }
      const check = await User.findOne({
        where: {
          username: body.username,
        },
      });
      if (check) {
        return res.status(400).json({
          status: "Bad Request",
          message: "Username has already exists",
          result: {},
        });
      }
      const hashedPassword = await bcrypt.hash(body.password, 10);
      const user = await User.create({
        name: body.name,
        username: body.username,
        password: hashedPassword,
      });
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.SECRET_TOKEN,
        { expiresIn: "24h" },
      );
      res.status(201).json({
        status: "Success",
        message: "Successfully to register",
        result: {
          token,
          user: {
            name: user.name,
            username: user.username,
          },
        },
      });
    } catch (error) {
      errorHandler(res, error);
    }
  },
  login: async (req, res) => {
    const body = req.body;
    try {
      const schema = Joi.object({
        username: Joi.string().min(5),
        password: Joi.string()
          .min(5)
          .regex(/^(?=.*[0-9])(?=.*[!@#$%^&*])(?=.*[A-Z])(?=.*[a-z])/)
          .message(
            '"password" should contain a mix of uppercase and lowercase letters, numbers, and special characters ',
          ),
      });
      const { error } = schema.validate({ ...body });
      if (error) {
        return res.status(400).json({
          status: "Bad Request",
          message: error.message,
          result: {},
        });
      }
      const user = await User.findOne({
        where: {
          username: body.username,
        },
      });
      if (!user) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "Invalid username and password combination",
          result: {},
        });
      }
      const valid = await bcrypt.compare(body.password, user.password);
      if (!valid) {
        return res.status(401).json({
          status: "Unauthorized",
          message: "Invalid username and password combination",
          result: {},
        });
      }
      const token = jwt.sign(
        {
          id: user.id,
          username: user.username,
        },
        process.env.SECRET_TOKEN,
        { expiresIn: "24h" },
      );
      res.status(200).json({
        status: "Success",
        message: "Logged in successfully",
        result: {
          token,
          user: {
            name: user.name,
            username: user.username,
          },
        },
      });
    } catch (error) {
      errorHandler(res, error);
    }
  },
};
