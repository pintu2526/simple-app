const mangoose = require('mongoose');
const User = mangoose.model('User');
const bcrypt = require('bcrypt');
var fs = require('fs');
const saltRounds = 10;

module.exports = {
  registerUser: async function (name, email, unhashedPassword, dob) {
    if (!unhashedPassword) {
      return { 'success': false, 'msg': 'password_required' };
    }
    if (unhashedPassword.length < 6) {
      return { 'success': false, 'msg': 'very_short_password' };
    }
    let password = await bcrypt.hash(unhashedPassword, saltRounds);
    let user = new User({ name, email, password, dob });
    try {
      await user.save();
    } catch (err) {
      if (err.errors && JSON.stringify(err.errors).includes('`email` is required')) {
        return { 'success': false, 'msg': 'email_required' };
      }
      if (err.errors && JSON.stringify(err.errors).includes('`name` is required')) {
        return { 'success': false, 'msg': 'name_required' };
      }
      if (err.errors && JSON.stringify(err.errors).includes('`dob` is required')) {
        return { 'success': false, 'msg': 'dob_required' };
      }

      if (err.errors && JSON.stringify(err.errors).includes('Invalid Date')) {
        return { 'success': false, 'msg': 'invalid_dob' };
      }

      if (err.errors && JSON.stringify(err.errors).includes('invalid date of birth')) {
        return { 'success': false, 'msg': 'not_old_enough' };
      }
      if (err.errors && JSON.stringify(err.errors).includes('invalid email address')) {
        return { 'success': false, 'msg': 'invalid_email_address' };
      }
      if (err.code == 11000)
        return { 'success': false, 'msg': 'duplicate_key' };
      return { 'success': false, 'msg': 'unable_to_save_user' };
    }

    return { 'success': true, 'msg': 'user_created' };
  },
  loginCredentialsVerification: async function (email, password) {
    try {
      let user = await User.findOne({ 'email': email });
      if (!user)
        return { 'success': false, 'msg': 'login_failied' };
      if (!user.isVerified)
        return { 'success': false, 'msg': 'email_not_verified' };
      if (user.password !== password) {
        return { 'success': false, 'msg': 'login_failied' };
      }

    } catch (err) {
      console.error(err);
      return { 'success': false, 'msg': 'login_failied' };
    }

    return { 'success': true, 'msg': 'user_logged_in' };
  },
  verifyEmail: async function (userId, token) {

    try {
      let tokenObj = await Token.findOne({ 'userId': userId });
      if (tokenObj == null)
        return { 'success': false, 'msg': 'verification_failied' };

      let validTill = new Date(tokenObj.validTill);
      let currDate = new Date();

      if (currDate - validTill > 0) {
        await Token.deleteOne({ 'userId': userId });
        await User.findByIdAndDelete(userId);
        return { 'success': false, 'msg': 'token_expired' };
      }

      if (tokenObj.token != token) {
        return { 'success': false, 'msg': 'token_not_found' };
      }
      // delete token form collection 
      // set isVerified to true as user is isVerified
      await Token.deleteOne({ 'userId': userId });
      const update = { 'isVerified': true };
      let doc = await User.findByIdAndUpdate(userId, update);
    } catch (err) {
      console.error(err);
      return { 'success': false, 'msg': 'error_occured_email_verification' }
    }
    return { 'success': true, 'msg': 'email_verified' }

  },
  getUserById: async function (userId) {
    try {
      let user = await User.findById(userId);
      return { 'success': true, 'user': user }
    } catch (err) {
      console.error('Unable to find user ', err);
      return { 'success': false, 'msg': 'user_not_found' }
    }
  },
  deleteUser: async function (userId) {
    try {
      await User.findByIdAndDelete(userId);
      return { 'success': true, 'msg': 'user_deleted' }
    } catch (err) {
      console.error('Unable to delete user ', err);
      return { 'success': false, 'msg': 'unable_delete_user' };
    }
  },
  getAllUsers: async function () {
    try {
      let users = await User.find({});
      return { 'success': 'true', 'users': users };
    } catch (err) {
      console.error('Unable to fetch all users ', err);
      return { 'success': false, 'msg': 'failed_fetch_all' };
    }
  },
  updateUser: async function (userId, reqBody) {
    try {
      let emailPasswordPresent = false;
      if (reqBody.email || reqBody.password) {
        emailPasswordPresent = true;
      }
      delete reqBody.email;
      delete reqBody.password;

      if (Object.keys(reqBody) === 0 && reqBody.constructor === Object) {
        return { 'success': false, 'msg': 'not_updated_other_fields_absent' };
      }

      await User.findByIdAndUpdate(userId, reqBody);
      if (emailPasswordPresent) {
        return { 'success': true, 'msg': 'not_updated_other_fields_present' };
      }

      return { 'success': true, 'msg': 'user_updated' };
    } catch (err) {
      console.error('Unable to update the user ', err);
      return { 'success': false, 'msg': 'user_update_failed' };
    }

  }
};