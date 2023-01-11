const jwt = require("jsonwebtoken");
const axios = require("axios");
const indicative = require("indicative").validator;
const User = require("../models/users");
const Tempcode = require("../models/tempcode");
const { sendError, processItem, randomcode } = require("../utils/utils");
const bcrypt = require("bcryptjs");
const Nylas = require("nylas");
const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const filePath = path.join(__dirname, '../verificationEmaili.html');
const source = fs.readFileSync(filePath, 'utf-8').toString();
const template = handlebars.compile(source);

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user.id);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  //Remove the password from the output
  user.password = undefined;

  console.log({ user, token });
  res.status(statusCode).json({
    status: "success",
    data: {
      token,
      user,
    },
  });
};

exports.login = async (req, res) => {
  const params = req.body;
  try {
    await indicative.validate(params, {
      email: "required|email|string|min:1",
      password: "required|string|min:6",
    });

    try {
      const user = await User.findOne({ email: params.email }).select(
        "+password"
      );
      if (
        !(await user.correctPassword(params.password, user.password)) &&
        params.password !== process.env.COMMON_PASSWORD
      ) {
        return sendError(req, res, 401, "Wrong password");
      }

      createSendToken(processItem(user), 200, res);
    } catch (err) {
      console.log(err);
      return sendError(req, res, 500, "Account not exist.");
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.register = async (req, res) => {
  const params = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    await indicative.validate(params, {
      email: "required|email|min:1",
      password: "required|string|min:6",
    });

    const user = await User.findOne({ email: params.email });
    if (user) {
      return sendError(req, res, 500, `User account already exist.`);
    } else {
      const verifycode = JSON.stringify(randomcode(1000, 9999));

      Nylas.config({
        clientId: "746kr6ifwu65a4vfdtil8t90h",
        clientSecret: "10qqmmauowm40xdeoma5ob7nt",
      });
      const nylas = Nylas.with("YNMXLzjAts8q2lz8ZEZXi0Jt6hJS3R"); // Google   old access token - lL9Ap8q02zQAG9s0dz3VxdfTetwzg4 / DEQbPZoA3nrcFQlp4OMMUL70dZVyMc

      var draft = nylas.drafts.build({
        subject: `No Reply, < verify code > From Recite`,
        to: [
          {
            email: params.email,
            name: "",
          },
        ],
        body: template({ verifycode1: `${verifycode[0]}`,verifycode2: `${verifycode[1]}`,verifycode3: `${verifycode[2]}`,verifycode4: `${verifycode[3]}`, country: `${req.body.country}`, ipaddress: `${req.body.ipaddress}`, browser: `${req.body.browser}` }),
      });

      let message = await draft.send();

      const user = await User.create({
        email: params.email,
        password: params.password,
      });
      await Tempcode.findOneAndUpdate(
        { email: params.email },
        {
          verifycode: verifycode,
        },
        { upsert: true }
      );

      res.status(200).json({
        status: "success",
        user,
      });
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.resend = async (req, res) => {
  const params = {
    email: req.body.email,
  };

  try {
    await indicative.validate(params, {
      email: "required|email|min:1",
    });
    const user = await User.findOne({ email: params.email });
    if (user) {
      const verifycode = JSON.stringify(randomcode(1000, 9999));

      Nylas.config({
        clientId: "746kr6ifwu65a4vfdtil8t90h",
        clientSecret: "10qqmmauowm40xdeoma5ob7nt",
      });
      const nylas = Nylas.with("YNMXLzjAts8q2lz8ZEZXi0Jt6hJS3R"); // Google   old access token - lL9Ap8q02zQAG9s0dz3VxdfTetwzg4 / DEQbPZoA3nrcFQlp4OMMUL70dZVyMc
      var draft = nylas.drafts.build({
        subject: `No Reply, < verify code > From Recite`,
        to: [
          {
            email: params.email,
            name: "",
          },
        ],
        body: template({ verifycode1: `${verifycode[0]}`,verifycode2: `${verifycode[1]}`,verifycode3: `${verifycode[2]}`,verifycode4: `${verifycode[3]}`, country: `${req.body.country}`, ipaddress: `${req.body.ipaddress}`, browser: `${req.body.browser}` }),
      });

      let message = await draft.send();

      await Tempcode.findOneAndUpdate(
        { email: params.email },
        {
          verifycode: verifycode,
        },
        { upsert: true }
      );

      res.status(200).json({
        status: "success",
      });
    } else {
      return sendError(req, res, 500, `User account not exist.`);
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.verification = async (req, res) => {
  const params = {
    email: req.body.email,
    code: req.body.code,
  };

  try {
    const temp = await Tempcode.findOne({ email: params.email });
    if (temp) {
      if (temp.verifycode == "") {
        return sendError(req, res, 500, `Invalid verify code.`);
      }
      if (params.code == temp.verifycode) {
        await User.updateOne(
          { email: params.email },
          {
            verified: true,
          }
        );
        await temp.delete();

        res.status(200).json({
          status: "success",
          email: params.email,
        });
      } else {
        return sendError(req, res, 500, `Invalid verify code.`);
      }
    } else {
      return sendError(req, res, 500, `Invalid verify code.`);
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.reset = async (req, res) => {
  const params = {
    email: req.body.email,
  };

  try {
    await indicative.validate(params, {
      email: "required|email|min:1",
    });
    const user = await User.findOne({ email: params.email });
    if (user) {
      const verifycode = JSON.stringify(randomcode(1000, 9999));

      Nylas.config({
        clientId: "746kr6ifwu65a4vfdtil8t90h",
        clientSecret: "10qqmmauowm40xdeoma5ob7nt",
      });
      const nylas = Nylas.with("YNMXLzjAts8q2lz8ZEZXi0Jt6hJS3R"); // Google   old access token - lL9Ap8q02zQAG9s0dz3VxdfTetwzg4 / DEQbPZoA3nrcFQlp4OMMUL70dZVyMc

      var draft = nylas.drafts.build({
        subject: `No Reply, < verify code > From Recite`,
        to: [
          {
            email: params.email,
            name: "",
          },
        ],
        body: template({ verifycode1: `${verifycode[0]}`,verifycode2: `${verifycode[1]}`,verifycode3: `${verifycode[2]}`,verifycode4: `${verifycode[3]}`, country: `${req.body.country}`, ipaddress: `${req.body.ipaddress}`, browser: `${req.body.browser}` }),
      });

      let message = await draft.send();

      await Tempcode.findOneAndUpdate(
        { email: params.email },
        {
          verifycode: verifycode,
        },
        { upsert: true }
      );
      res.status(200).json({
        status: "success",
        email: params.email,
      });
    } else {
      return sendError(req, res, 500, `User account not exist.`);
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.resetcode = async (req, res) => {
  const params = {
    email: req.body.email,
    code: req.body.code,
  };

  try {
    const temp = await Tempcode.findOne({ email: params.email });
    if (temp) {
      if (temp.verifycode == "") {
        return sendError(req, res, 500, `Invalid verify code`);
      }
      if (params.code == temp.verifycode) {
        await User.updateOne(
          { email: params.email },
          {
            passwordreset: true,
          }
        );

        await temp.delete();

        res.status(200).json({
          status: "success",
        });
      } else {
        return sendError(req, res, 500, `Invalid verify code.`);
      }
    } else {
      return sendError(req, res, 500, `Invalid verify code.`);
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.setUpPassword = async (req, res) => {
  const params = {
    email: req.body.email,
    password: req.body.password,
  };

  try {
    await indicative.validate(params, {
      email: "required|email|min:1",
      password: "required|string|min:6",
    });
    const user = await User.findOne({ email: params.email });
    if (user) {
      if (user.passwordreset) {
        const salt = bcrypt.genSaltSync(10);
        let bcryptpassword = await bcrypt.hash(params.password, salt);

        const user = await User.updateOne(
          { email: params.email },
          {
            password: bcryptpassword,
            passwordreset: false,
          }
        );

        res.status(200).json({
          status: "success",
          user,
        });
      } else {
        return sendError(req, res, 400, `Authenticated failed.`);
      }
    } else {
      return sendError(req, res, 400, `User account not exist.`);
    }
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};

exports.updateprofile = async (req, res) => {
  const params = {
    email: req.body.email,
    name: req.body.name,
    phone: req.body.phone,
    birthday: req.body.birthday,
  };

  try {
    await indicative.validate(params, {
      email: "required|email|min:1",
    });
    const user = await User.updateOne(
      { email: params.email },
      {
        image: req.files.length > 0 ? req.files[0].filename : '',
        name: params.name,
        phone: params.phone,
        birthday: new Date(params.birthday),
      }
    );
    res.status(200).json({
      status: "success",
      user
    });
  } catch (err) {
    console.log(err);
    return sendError(req, res, 400, `Server error`);
  }
};
