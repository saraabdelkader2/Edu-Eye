import { Modify } from "./modify.js";
const addBtn = document.querySelector('#add-btn');
const allBtn = document.querySelector('#all-teachers');
const teacherList = document.querySelector('.teacher-list-section');
const teacherForm = document.querySelector('.teacher-form-section');

Modify(addBtn, allBtn, teacherList, teacherForm);