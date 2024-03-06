const userModel = require("../models/userModel");
const adminModel = require("../models/adminModel");
const verificationController = require("./verificationController");
const bcrypt = require("bcrypt");
const flash = require("connect-flash");
const jwt = require("jsonwebtoken");

module.exports = {
  // get user login page.
  getUserLogin: (req, res) => {
    res.render("auth/userLogin", {
      title: "User login",
      error: req.flash("error"),
      passError: req.flash("passError"),
    });
  },

  doUserlogin: async (req, res) => {
    try {
      const data = req.body;
      // console.log(data);
      const user = await userModel.findOne({ email: data.email });
      // console.log(user);
      if (user) {
        if (user.is_blocked === true) {
          req.flash("error", "This user is currently blocked");
          res.redirect("/login");
        } else {
          const compare = await bcrypt.compare(data.password, user.password);
          // console.log(compare);
          if (compare) {
            //setting the token
            const payload = {
              email: data.email,
            };
            const token = jwt.sign(payload, "secretKeyUser", {
              expiresIn: "24h",
            });
            res.cookie("UserToken", token, {
              httpOnly: true,
              secure: true,
              sameSite: "strict",
            }); //adding to the cookie
            //finished setting the token
            req.session.user = user;
            res.redirect("/home");
          } else {
            req.flash(
              "passError",
              `Incorrect Password or Password Doesn't Match`
            );
            res.redirect("/login");
          }
        }
      } else {
        req.flash("error", "No User Found");
        res.redirect("/login");
      }
    } catch (error) {
      console.error(error);
    }
  },

  //get user signup page.
  getUserSignup: (req, res) => {
    res.render("auth/userSignup", {
      title: "User signup",
      error: req.session.isExists,
    });
  },

  //get admin login page.
  getAdminLogin: (req, res) => {
    res.render("auth/adminLogin", {
      title: "Admin login",
      error: req.session.error,
    });
    req.session.error = "";
  },

  //post admin login.

  doAdminLogin: async (req, res) => {
    try {
      const { email, password } = req.body;
      console.log(req.body);
      const isAdmin = await adminModel.collection.findOne({ email: email });

      if (isAdmin.email === email && isAdmin.password === password) {
        console.log(isAdmin.password, isAdmin.email);

        const payload = {
          email: isAdmin.email,
        };
        const token = jwt.sign(payload, "secretKey", { expiresIn: "24h" });
        // console.log(token);
        res.cookie("token", token, {
          httpOnly: true,
          secure: true,
          sameSite: "strict",
        });
        res.redirect("/adminProduct");
      } else {
        req.session.error = "Invalid Email or Password";
        res.redirect("/admin");
      }
    } catch (error) {
      console.log(error);
    }
  },

  //get forgotPassword page.
  getForgotPassword: (req, res) => {
    res.render("auth/forgotPassword", {
      title: "Forgot Password",
      error: req.flash("error"),
    });
  },

  //get signupOtp page.
  getSignupOtp: (req, res) => {
    res.render("auth/signupOtp", {
      title: "OTP verification",
      warning: req.flash("error"),
    });
  },

  //registered email giving page.
  getOtpEmail: (req, res) => {
    res.render("auth/otpEmail", {
      title: "OTP email",
      warning: req.flash("error"),
    });
  },
  getNewPasswordOtp: (req, res) => {
    res.render("auth/forgotPassword", { title: "Enter OTP" });
  },

  getNewPassword: (req, res) => {
    res.render("auth/newPassword", { title: "Change password" });
  },

  //post signup page.
  doUserSignup: async (req, res) => {
    console.log(req.body);
    try {
      const userExists = await userModel.collection.findOne({
        email: req.body.email,
      });
      if (userExists) {
        req.session.isExists = "User Already Exists Please login";
        res.redirect("/signup");
      } else {
        req.session.userData = req.body;
        const otp = verificationController.sendEmail(req.body.email);
        req.session.otp = otp;
        res.redirect("/signupOtp");
      }
    } catch (error) {
      console.log(error);
    }
  },

  //post signup otp.
  doSignupOtp: async (req, res) => {
    try {
      const userEnteredOtp = req.body.otp;
      if (userEnteredOtp === req.session.otp) {
        const { email, password, lastname, firstname, phone } =
          req.session.userData;
        //hashing password
        const hashedPassword = await bcrypt.hash(password, 10);
        //adding to database
        await userModel.collection.insertOne({
          firstname: firstname,
          lastname: lastname,
          email: email,
          password: hashedPassword,
          phone: phone,
          is_blocked: false,
        });
        res.redirect("/login");
      } else {
        req.flash("error", "Inavlid  OTP");
        res.redirect("/signupOtp");
      }
    } catch (error) {
      console.log(error);
    }
  },

  //resend otp.
  resendOtp: (req, res) => {
    const email = req.session.userData.email;
    const otp = verificationController.sendEmail(email);
    req.session.message = "otp has resend to the registered email";
    req.session.otp = otp;
    res.redirect("/signupOtp");
  },

  //post otp.
  doOtpEmail: async (req, res) => {
    const email = req.body.email;
    const isUser = await userModel.collection.findOne({ email: email });
    if (isUser) {
      req.session.forgotPass = email;
      const otp = verificationController.sendEmail(email);
      req.session.otp = otp;
      res.redirect("/forgotPass");
    } else {
      req.flash("error", "No Email or User Found");
      res.redirect("/otpEmail");
    }
  },

  //post new password.
  doNewPasswordOtp: async (req, res) => {
    console.log(req.body);
    if (req.body.otp === req.session.otp) {
      res.redirect("/newPass");
    } else {
      req.flash("error", "Invalid OTP");
      res.redirect("/forgotPass");
    }
  },

  //
  doNewPassword: async (req, res) => {
    try {
      console.log(req.body);
      const password = req.body.password;
      const hashedPassword = await bcrypt.hash(password, 10);
      const email = req.session.forgotPass;
      await userModel.collection.updateOne(
        { email: email },
        { $set: { password: hashedPassword } }
      );
      res.redirect("/login");
    } catch (error) {
      console.log(error);
    }
  },

  logOut: (req, res) => {
    res.clearCookie("token");
    res.redirect("/admin");
  },
};
