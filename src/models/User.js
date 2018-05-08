const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const { BaseModel } = require('./BaseModel');

const roleSchema = new mongoose.Schema({
   name: { type: String, required: true }
}, { _id: false });

// Define our model
const userSchema = new mongoose.Schema({
   email: { type: String, required: true, unique: true, lowercase: true },
   password: { type: String, required: true },
   firstName: { type: String, required: true },
   lastName: { type: String, required: true },
   roles: { type: [roleSchema], required: false },
   isDeleted: { type: Boolean, required: true, default: () => false },

   createDate: { type: Date, required: true, default: () => Date.now() },
   createdBy: { type: String, required: true },
   updateDate: { type: Date, required: true, default: () => Date.now() },
   updatedBy: { type: String, required: true }
}, {
   collection: 'Users',
   versionKey: false
});
userSchema.index({ email: 1 }, { unique: true });



/**
 * On-save Hook: encrypt password
 */
userSchema.pre('save', async (next: any) => {
   // const user = this;

   try {
      // generate a salt and then run callback
      const salt = await bcrypt.genSalt(10);

      // hash (encrypt) our password using the salt
      const hash = await bcrypt.hash(this.password, salt, null);

      this.password = hash;
      this.updateDate = Date.now();

      next();
   } catch(err) {
      return next(err);
   }
});

userSchema.methods.comparePasswordAsync = async function(candidatePassword) {
   return await bcrypt.compare(candidatePassword, this.password);
};

// Create the model class
module.exports = mongoose.model('User', userSchema);


export interface User extends BaseModel {
   _id: string;
   email: string;
   password: string;
   firstName: string;
   lastName: string;
   roles: string[];
   isDeleted: boolean;
};
