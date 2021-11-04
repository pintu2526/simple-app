var express = require('express');
var router = express.Router();
const userService = require('../services/user');
const bcrypt = require('bcrypt');
const saltRounds = 10;

let msgMap = {
  "email_not_verified": "Please verify your email",
  "login_failied": "Email or password incorrect",
  "user_logged_in": "User loggged in successfully",
  "very_short_password": "Password cannot be blank and should be atleast 6 characters long",
  "duplicate_key": "Email already exist",
  "unable_to_save_user": "Unable to save user",
  "user_created": "User created successfully",
  "invalid_email_address": "Invalid email address",
  "invalid_dob": "Invalid dob",
  "not_old_enough": "Not old enough to log in",
  "dob_required": "dob is a required field and please provide valid date",
  "name_required": "name is required",
  "email_required": "email is required",
  "password_required": "password is required",
  "token_expired": "Token expired",
  "verification_failed": "Token verification failed",
  "token_not_found": "Token not found",
  "delete_token_failed": "Unable to delete token",
  "error_occured_email_verification": "Error occured in email verification. please try agian",
  "email_verified": "Email verified"
};

router.get('/', async function (req, res, next) {
  return res.status(200).json({ 'success': true, 'user': 'welcome to user route' });
});

/* GET home page. */
router.post('/', async function (req, res, next) {
  let name = req.body.name;
  let email = req.body.email.trim().toLowerCase();
  let password = req.body.password;
  let hash = await bcrypt.hash(password, saltRounds);
  let response = await userService.registerUser(name, email, hash);
  console.log(response)
  if (response.success) {
    return res.status(200).json({ 'success': true, 'msg': 'Signed up successfully' });
  }
  return res.status(400).json({ 'success': false, 'error': msgMap[response.msg] });
});

//Read user
router.get('/:id', async function (req, res, next) {
  let userId = req.params.id;
  let response = await userService.getUserById(userId);
  if (response.success) {
    return res.status(200).json({ 'success': true, 'user': response.user });
  }
  return res.status(400).json({ 'success': false, 'error': msgMap[response.msg] });
});

//Update user
router.put('/:id', async function (req, res, next) {
  let userId = req.params.id;
  let response = await userService.updateUser(userId, req.body);
  if (response.success) {
    return res.status(200).json({ 'success': true, 'msg': msgMap[response.msg] });
  }
  return res.status(400).json({ 'success': false, 'error': msgMap[response.msg] });
});

module.exports = router;
