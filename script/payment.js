import { Modify } from "./modify.js";
const addBtn = document.querySelector('#add-btn');
const allBtn = document.querySelector('#all-payments');
const paymentList = document.querySelector('.payment-list-section');
const paymentForm = document.querySelector('.payment-form-section');

Modify(addBtn, allBtn, paymentList, paymentForm);