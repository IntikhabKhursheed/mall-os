const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const apiResponse = require("../utils/apiResponse");

const buildUserPayload = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  department: user.department,
  status: user.status,
  lastLogin: user.lastLogin
});

const register = async (req, res, next) => {
  try {
    const { name, email, password, role, department, status } = req.body;

    const exists = await User.findOne({ email });
    if (exists) {
      return apiResponse(res, 400, false, "User already exists");
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      status
    });

    const token = generateToken({ id: user._id, role: user.role });

    return apiResponse(res, 201, true, "User registered", {
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return apiResponse(res, 400, false, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    if (!user || !(await user.matchPassword(password))) {
      return apiResponse(res, 401, false, "Invalid credentials");
    }

    if (user.status !== "active") {
      return apiResponse(res, 403, false, "Account is inactive");
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken({ id: user._id, role: user.role });

    return apiResponse(res, 200, true, "Login successful", {
      token,
      user: buildUserPayload(user)
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res) => {
  return apiResponse(res, 200, true, "Current user", {
    user: buildUserPayload(req.user)
  });
};

module.exports = {
  register,
  login,
  me
};
