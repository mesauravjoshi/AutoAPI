import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true
  },
  fullname: {
    type: String,
    // required: true
  },
  firstname: {
    type: String,
    // required: true
  },
  lastname: {
    type: String,
    // required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate fullname before saving
userSchema.pre("save", function (next) {
  this.fullname = [this.firstname, this.lastname]
    .filter(Boolean)
    .join(" ")
    .trim();
  next();
});

// userSchema.set("toJSON", { virtuals: true });
// userSchema.set("toObject", { virtuals: true });

const User = mongoose.model('User', userSchema);

export default User;