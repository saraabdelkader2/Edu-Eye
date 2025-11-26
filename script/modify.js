// Modify 
export function Modify(addBtn, allBtn, studentList, studentForm) {
    // if add student is clicked
    addBtn.addEventListener('click', () => {
        studentList.style.display = 'none';
        studentForm.style.display = 'flex';

        addBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
        allBtn.style.backgroundColor = 'transparent';
    });

    // if all student is clicked
    allBtn.addEventListener('click', () => {
        studentList.style.display = 'block';
        studentForm.style.display = 'none';

        allBtn.style.backgroundColor = 'rgba(244, 244, 244, 1)';
        addBtn.style.backgroundColor = 'transparent';
    });
}