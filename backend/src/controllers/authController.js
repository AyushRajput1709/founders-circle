const jwt = require("jsonwebtoken");
const User = require("../models/User");

const createToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const register = async (req, res) => {
  try {
    const { name, email, password, company } = req.body;

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required." });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already in use." });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      company: company || "",
    });

    const token = createToken(user._id);

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to register user." });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials." });
    }

    const token = createToken(user._id);

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        verified: user.verified,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Unable to login." });
  }
};

const me = async (req, res) => res.status(200).json({ user: req.user });

module.exports = { register, login, me };
