const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://vinh:abc123456@cluster0.kdazost.mongodb.net/vinh_midterm', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((err) => {
    console.log('Error connecting to MongoDB:', err);
});

module.exports = mongoose;