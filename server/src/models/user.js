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
    required: false,   // Google-only users legitimately have no password
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  picture: String,
  googleId: String,
  provider: {
    type: String,
    enum: ["local", "google"],
    default: "local"
  },
  // true only when a Google-signup user has explicitly created a local password
  hasLocalPassword: {
    type: Boolean,
    default: false,
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