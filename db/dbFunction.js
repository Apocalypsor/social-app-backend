// this is a node app, we must use commonJS modules/ require

// import the mongodb driver
const { MongoClient } = require('mongodb');

// import ObjectID
const { ObjectId } = require('mongodb');

// the mongodb server URL
const dbURL = ``;
    // 'mongodb+srv://test:0gcb1NPERFKJYTZj@cluster0.r0pf1cv.mongodb.net/LectureExample?retryWrites=true&w=majority';

// connection to the db
const connect = async () => {
  // always use try/catch to handle any exception
  try {
    const con = (await MongoClient.connect(
      dbURL,
      { useNewUrlParser: true, useUnifiedTopology: true },
    )).db();
    // check that we are connected to the db
    console.log(`connected to db: ${con.databaseName}`);
    return con;
  } catch (err) {
    console.log(err.message);
  }
};

// CREATE a new student
// takes a db connector and a student object
// and add the user to the DB
const addUser = (db, newUser) => {
  // callback version
  db.collection('users').insertOne(
    newUser,
    (err, result) => {
      // if there was an error
      if (err) {
        console.log(`error: ${err.message}`);       
      }
      // print the id of the student
      console.log(`New user created with id: ${result.insertedId}`);
      // return the result
      return result.insertedId;
    },
  );
};

// READ all students
// await/async syntax
const getAllUsers = async (db) => {
  try {
    const result = await db.collection('users').find({}).toArray();
    // print the results
    console.log(`Users: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
  }
};

// READ a student given their ID
const getAUser = async (db, studentID) => {
  try {
    const result = await db.collection('users').findOne({ _id: studentID });
    // print the result
    console.log(`User: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
  }
};

// UPDATE a user
const updateUser = async (db, studentID, newUser) => {
  try {
    const result = await db.collection('users').updateOne(
      { _id: studentID },
      { $set: { major: newMajor } },
        {},
    );
      // print the result
    console.log(`Student: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
  }
};

// DELETE a student given their ID
const deleteStudent = async (db, studentID) => {
  try {
    const result = await db.collection('students').deleteOne(
      { _id: ObjectId(studentID) },
    );
    // print the result
    console.log(`Student: ${JSON.stringify(result)}`);
    return result;
  } catch (err) {
    console.log(`error: ${err.message}`);
  }
};
/**
 *
// main function to execute our code
const main = async () => {
  const conn = await connect();
  // addStudent(conn, { name: 'Rachel', major: 'history', email: 'rara@upenn.edu' });
  // await getAllStudents(conn);
  await getAStudent(conn, '635ad18f799a7c5d0c89d320');
  await updateStudent(conn, '635ad18f799a7c5d0c89d320', 'CIS');
  await deleteStudent(conn, '635ad18f799a7c5d0c89d320');
};
 */
// execute main
// main();

// export the functions
module.exports = {
  connect, addStudent, getAllStudents, getAStudent, updateStudent, deleteStudent,
};