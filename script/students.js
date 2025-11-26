import { Modify } from "./modify.js";
const addBtn = document.querySelector('#add-btn');
const allBtn = document.querySelector('#all-students');
const studentList = document.querySelector('.student-list-section');
const studentForm = document.querySelector('.student-form-section');

Modify(addBtn, allBtn, studentList, studentForm);