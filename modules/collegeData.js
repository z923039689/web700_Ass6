// Hanbo Zhang
// 138092234

const Sequelize = require('sequelize');
const sequelize = new Sequelize('SenecaDB', 'neondb_owner', 'LJeduAIg7wX1', {
    host: 'ep-super-thunder-a5r65ub7.us-east-2.aws.neon.tech',
    dialect: 'postgres',
    port: 5432,
    dialectOptions: {
        ssl: { rejectUnauthorized: false }
    },
    query: { raw: true }
});

// Define Models
const Student = sequelize.define('Student', {
    studentNum: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    firstName: Sequelize.STRING,
    lastName: Sequelize.STRING,
    email: Sequelize.STRING,
    addressStreet: Sequelize.STRING,
    addressCity: Sequelize.STRING,
    addressProvince: Sequelize.STRING,
    TA: Sequelize.BOOLEAN,
    status: Sequelize.STRING
});

const Course = sequelize.define('Course', {
    courseId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    courseCode: Sequelize.STRING,
    courseDescription: Sequelize.STRING
});

// Define Relationships
Course.hasMany(Student, { foreignKey: 'course' });

// Module Functions
module.exports = {
    initialize() {
        return new Promise((resolve, reject) => {
            sequelize.authenticate()
                .then(() => {
                    console.log('Connection established successfully.');
                    return sequelize.sync();
                })
                .then(() => {
                    console.log('Database synchronized successfully.');
                    resolve();
                })
                .catch((err) => {
                    console.error('Unable to connect to the database or sync models:', err);
                    reject('Unable to sync the database');
                });
        });
    },
    
    
    
    getAllStudents() {
        return new Promise((resolve, reject) => {
            Student.findAll()
                .then(data => resolve(data))
                .catch(() => reject("no results returned"));
        });
    },

    getStudentsByCourse(course) {
        return new Promise((resolve, reject) => {
            Student.findAll({
                where: { course: course }
            })
                .then(data => resolve(data))
                .catch(() => reject("no results returned"));
        });
    },

    getStudentByNum(num) {
        return new Promise((resolve, reject) => {
            Student.findAll({
                where: { studentNum: num }
            })
                .then(data => resolve(data[0]))
                .catch(() => reject("no results returned"));
        });
    },

    getCourses() {
        return new Promise((resolve, reject) => {
            Course.findAll()
                .then(data => resolve(data))
                .catch(() => reject("no results returned"));
        });
    },

    getCourseById(id) {
        return new Promise((resolve, reject) => {
            Course.findAll({
                where: { courseId: id }
            })
                .then(data => resolve(data[0]))
                .catch(() => reject("no results returned"));
        });
    },

    addStudent(studentData) {
        return new Promise((resolve, reject) => {
            studentData.TA = (studentData.TA) ? true : false;

            for (let key in studentData) {
                if (studentData[key] === "") {
                    studentData[key] = null;
                }
            }

            Student.create(studentData)
                .then(() => resolve())
                .catch(() => reject("unable to create student"));
        });
    },

    updateStudent(studentData) {
        return new Promise((resolve, reject) => {
            studentData.TA = (studentData.TA) ? true : false;

            for (let key in studentData) {
                if (studentData[key] === "") {
                    studentData[key] = null;
                }
            }

            Student.update(studentData, {
                where: { studentNum: studentData.studentNum }
            })
                .then(() => resolve())
                .catch(() => reject("unable to update student"));
        });
    },

    addCourse(courseData) {
        return new Promise((resolve, reject) => {
            for (let key in courseData) {
                if (courseData[key] === "") {
                    courseData[key] = null;
                }
            }

            Course.create(courseData)
                .then(() => resolve())
                .catch(() => reject("unable to create course"));
        });
    },

    updateCourse(courseData) {
        return new Promise((resolve, reject) => {
            for (let key in courseData) {
                if (courseData[key] === "") {
                    courseData[key] = null;
                }
            }

            Course.update(courseData, {
                where: { courseId: courseData.courseId }
            })
                .then(() => resolve())
                .catch(() => reject("unable to update course"));
        });
    },

    deleteCourseById(id) {
        return new Promise((resolve, reject) => {
            Course.destroy({
                where: { courseId: id }
            })
                .then(() => resolve())
                .catch(() => reject("unable to delete course"));
        });
    },

    deleteStudentByNum(studentNum) {
        return new Promise((resolve, reject) => {
            Student.destroy({
                where: { studentNum: studentNum }
            })
            .then((rowsDeleted) => {
                if (rowsDeleted === 0) {
                    reject("No student found with the given number");
                } else {
                    resolve();
                }
            })
            .catch(() => {
                reject("Unable to remove student");
            });
        });
    }
    

};
