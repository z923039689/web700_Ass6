/*********************************************************************************
* WEB700 – Assignment 06
* I declare that this assignment is my own work in accordance with Seneca Academic Policy. No part
* of this assignment has been copied manually or electronically from any other source
* (including 3rd party web sites) or distributed to other students.
*
* Name: Hanbo Zhang Student ID: 138092234 Date: 12/3/2024
*
********************************************************************************/

// server.js

var express = require("express");
var path = require("path");
var collegeData = require("./modules/collegeData");

var app = express();
app.use(express.static('public'));
app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
var HTTP_PORT = process.env.PORT || 8082;

app.use(function (req, res, next) {
    let route = req.path.substring(1);
    app.locals.activeRoute =
        "/" +
        (isNaN(route.split("/")[1])
            ? route.replace(/\/(?!.*)/, "")
            : route.replace(/\/(.*)/, ""));
    next();
});

app.locals.navLink = function (url, options) {
    return (
        '<li' +
        (url == app.locals.activeRoute ? ' class="nav-item active" ' : ' class="nav-item" ') +
        '><a class="nav-link" href="' +
        url +
        '">' +
        options.fn(this) +
        "</a></li>"
    );
};

app.locals.equal = function (lvalue, rvalue, options) {
    if (arguments.length < 3)
        throw new Error("EJS Helper 'equal' needs 2 parameters");
    if (lvalue != rvalue) {
        return options.inverse(this);
    } else {
        return options.fn(this);
    }
};

collegeData.initialize()
    .then(() => {
        //server start
        app.listen(HTTP_PORT, () => {
            console.log("Server listening on port: " + HTTP_PORT);
        });
    })
    .catch((err) => {
        console.error("Failed to initialize data:", err);
    });


//
app.get("/students", (req, res) => {
    const course = req.query.course;

    if (course) {
        collegeData.getStudentsByCourse(course)
            .then(students => {
                if (students.length > 0) {
                    res.render("layouts/main", { body: "../students", students });
                } else {
                    res.render("layouts/main", { body: "../students", students: [], message: "No students found" });
                }
            })
            .catch(err => {
                console.error("Error fetching students by course:", err);
                res.render("layouts/main", { body: "../students", students: [], message: "Error loading students" });
            });
    } else {
        collegeData.getAllStudents()
            .then(students => {
                if (students.length > 0) {
                    res.render("layouts/main", { body: "../students", students });
                } else {
                    res.render("layouts/main", { body: "../students", students: [], message: "No students found" });
                }
            })
            .catch(err => {
                console.error("Error fetching all students:", err);
                res.render("layouts/main", { body: "../students", students: [], message: "Error loading students" });
            });
    }
});

    app.get("/courses", (req, res) => {
        collegeData.getCourses()
            .then(courses => {
                if (courses.length > 0) {
                    res.render("layouts/main", { body: "../courses", courses });
                } else {
                    res.render("layouts/main", { body: "../courses", courses: [], message: "no results" });
                }
            })
            .catch(() => {
                res.render("layouts/main", { body: "../courses", courses: [], message: "no results" });
            });
    });
    
    
//

// app.get("/student/:num", (req, res) => {
//     collegeData.getStudentsByNum(req.params.num)
//         .then(student => res.render("layouts/main", { body: "../student", student }))
//         .catch(() => res.render("layouts/main", { body: "../student", message: "Student not found" }));
// });

app.get("/student/:studentNum", (req, res) => {

    let viewData = {};

    collegeData.getStudentByNum(req.params.studentNum)
        .then((data) => {
            if (data) {
                viewData.student = data; 
            } else {
                viewData.student = null; 
            }
        })
        .catch(() => {
            viewData.student = null;
        })
        .then(collegeData.getCourses)
        .then((data) => {
            viewData.courses = data; 

            if (viewData.student) {
                for (let i = 0; i < viewData.courses.length; i++) {
                    if (viewData.courses[i].courseId == viewData.student.course) {
                        viewData.courses[i].selected = true;
                    }
                }
            }
        })
        .catch(() => {
            viewData.courses = [];
        })
        .then(() => {
            if (viewData.student == null) {
                res.status(404).send("Student Not Found");
            } else {
                res.render("layouts/main", { body: "../student", viewData: viewData });
            }
        });
});



app.get("/courses/add", (req, res) => {
    res.render("layouts/main", { body: "../addCourse" }); 
});


app.post("/courses/add", (req, res) => {
    collegeData.addCourse(req.body)
        .then(() => {
            res.redirect("/courses");
        })
        .catch((err) => {
            console.error("Error adding course:", err);
            res.status(500).send("Unable to add course");
        });
});


app.post("/course/update", (req, res) => {
    collegeData.updateCourse(req.body)
        .then(() => {
            res.redirect("/courses"); 
        })
        .catch((err) => {
            console.error("Error updating course:", err);
            res.status(500).send("Unable to update course");
        });
});


app.get("/course/:id", (req, res) => {
    collegeData.getCourseById(req.params.id)
        .then((course) => {
            if (course) {
                res.render("layouts/main", { body: "../course", course });
            } else {
                res.status(404).send("Course Not Found");
            }
        })
        .catch(() => {
            res.status(404).send("Course Not Found");
        });
});



app.get("/course/delete/:id", (req, res) => {
    collegeData.deleteCourseById(req.params.id)
        .then(() => {
            res.redirect("/courses"); 
        })
        .catch((err) => {
            console.error("Error deleting course:", err);
            res.status(500).send("Unable to Remove Course / Course not found");
        });
});


app.get("/", (req, res) => {
    res.render("layouts/main", { body: "../home" }); 
});


app.get("/about", (req, res) => {
    res.render("layouts/main", { body: "../about" }); 
});

app.get("/htmlDemo", (req, res) => {
    res.render("layouts/main", { body: "../htmlDemo" }); 
});


app.get("/students/add", (req, res) => {
    collegeData.getCourses()
        .then((courses) => {
            res.render("layouts/main", { body: "../addStudent", courses }); 
        })
        .catch(() => {
            res.render("layouts/main", { body: "../addStudent", courses: [] }); 
        });
});

app.post('/students/add', (req, res) => {
    collegeData.addStudent(req.body)
        .then(() => {
            res.redirect('/students'); 
        })
        .catch(err => {
            console.error("Error adding student:", err);
            res.status(500).send("Internal Server Error");
        });
});



app.post("/student/update", (req, res) => {
    collegeData.updateStudent(req.body) 
        .then(() => {
            console.log("Student updated successfully.");
            res.redirect("/students"); 
        })
        .catch((err) => {
            console.error("Error updating student:", err);
            res.status(500).send("Internal Server Error"); 
        });
});

app.get("/student/delete/:studentNum", (req, res) => {
    collegeData.deleteStudentByNum(req.params.studentNum)
        .then(() => {
            res.redirect("/students"); 
        })
        .catch((err) => {
            console.error("Error deleting student:", err);
            res.status(500).send("Unable to Remove Student / Student not found");
        });
});


app.use((req, res) => {
    res.status(404).send("<h1>Page Not Found</h1><a href='/'>Go to Home</a>");
});

