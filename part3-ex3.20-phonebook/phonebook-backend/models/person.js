const mongoose = require('mongoose');

mongoose.set('strictQuery', false)

const url = process.env.MONGODB_URI;


console.log('connecting to', url)
mongoose.connect(url)
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch((error) => {
    console.log('Error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 2,
    requiered: true
  },
  
  number: {
    type: String,
    required: [true, 'User phone number required'],
    validate: {
      validator: function(phoneNumber) {
        return /^(\d{2,3})-(\d+)$/.test(phoneNumber);
      },
      message: props => `${props.value} is not a valid phone number! Phone number should have 2-3 digits before the dash and digits after the dash.`
    },
    minLength: [9, 'Phone number must be at least 8 characters long']
  }
});

personSchema.set('toJSON', {
    transform: (document, returnedObject) => {
      returnedObject.id = returnedObject._id.toString();
      delete returnedObject._id;
      delete returnedObject.__v;
    }
  })

  const Person = mongoose.model('Person', personSchema);

  module.exports = Person;