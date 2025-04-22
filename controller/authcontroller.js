const User = require('../models/user');
const bcrypt = require('bcryptjs');

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if the user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).send('Email is already registered');
    }

    // Hash the password
    const hashed = await bcrypt.hash(password, 10);

    // Create the new user
    await User.create({ email, password: hashed });
    
    res.redirect('/login'); // Redirect to login page after successful registration
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find the user by email
    const user = await User.findOne({ email });
    
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(400).send('Invalid credentials');
    }

    // Save the user to the session
    req.session.user = user;
    
    res.redirect('/dashboard'); // Redirect to a dashboard page after successful login
  } catch (error) {
    console.error(error);
    res.status(500).send('Server error');
  }
};
