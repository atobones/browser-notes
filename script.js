document.addEventListener('DOMContentLoaded', function() {
    const notesList = document.querySelector('.notes-list');
    const addNoteButton = document.getElementById('add-note');
    const noteTitleInput = document.getElementById('note-title');
    const noteTextInput = document.getElementById('note-text');
    const noteCategoryInput = document.getElementById('note-category');
    const noteTagsInput = document.getElementById('note-tags');
    const searchInput = document.getElementById('search-notes');
    const sortByDateButton = document.getElementById('sort-date');
    const sortByTitleButton = document.getElementById('sort-title');
    const sortByImportantButton = document.getElementById('sort-important');
    const exportNotesButton = document.getElementById('export-notes');
    const importNotesInput = document.getElementById('import-notes');
    const toggleThemeButton = document.getElementById('toggle-theme');
    const notification = document.getElementById('notification');

    let notes = JSON.parse(localStorage.getItem('notes')) || [];
    let draggedNote = null;

    function renderNotes(filteredNotes = notes) {
        notesList.innerHTML = '';
        filteredNotes.forEach(note => {
            const noteElement = document.createElement('div');
            noteElement.classList.add('note');
            noteElement.setAttribute('draggable', true);
            noteElement.setAttribute('data-id', note.id);
            if (note.important) noteElement.classList.add('important');
            noteElement.innerHTML = `
                <h3>${note.title}</h3>
                <p>${note.text}</p>
                <div class="note-category">Category: ${note.category}</div>
                <div class="note-tags">Tags: ${note.tags.join(', ')}</div>
                <div class="note-date">${note.date}</div>
                <div class="note-actions">
                    <button class="delete">Delete</button>
                    <button class="edit">Edit</button>
                    <button class="toggle-important">${note.important ? 'Unmark' : 'Mark as Important'}</button>
                </div>
            `;

            noteElement.querySelector('.delete').addEventListener('click', () => {
                deleteNote(note.id);
            });

            noteElement.querySelector('.edit').addEventListener('click', () => {
                editNote(note.id);
            });

            noteElement.querySelector('.toggle-important').addEventListener('click', () => {
                toggleImportant(note.id);
            });

            notesList.appendChild(noteElement);
        });
    }

    function addNote() {
        const title = noteTitleInput.value.trim();
        const text = noteTextInput.value.trim();
        const category = noteCategoryInput.value.trim();
        const tags = noteTagsInput.value.trim().split(',').map(tag => tag.trim());
        if (title && text) {
            const newNote = {
                id: Date.now(),
                title,
                text,
                category,
                tags,
                date: new Date().toLocaleString(),
                important: false
            };
            notes.push(newNote);
            saveNotes();
            renderNotes();
            noteTitleInput.value = '';
            noteTextInput.value = '';
            noteCategoryInput.value = '';
            noteTagsInput.value = '';
            showNotification('Note added successfully!');
        }
    }

    function editNote(id) {
        const note = notes.find(note => note.id === id);
        if (note) {
            noteTitleInput.value = note.title;
            noteTextInput.value = note.text;
            addNoteButton.textContent = 'Update Note';
            addNoteButton.onclick = () => updateNote(id);
        }
    }

    function updateNote(id) {
        const title = noteTitleInput.value.trim();
        const text = noteTextInput.value.trim();
        if (title && text) {
            notes = notes.map(note => {
                if (note.id === id) {
                    note.title = title;
                    note.text = text;
                    note.date = new Date().toLocaleString();
                }
                return note;
            });
            saveNotes();
            renderNotes();
            noteTitleInput.value = '';
            noteTextInput.value = '';
            addNoteButton.textContent = 'Add Note';
            addNoteButton.onclick = addNote;
            showNotification('Note updated successfully!');
        }
    }

    function deleteNote(id) {
        notes = notes.filter(note => note.id !== id);
        saveNotes();
        renderNotes();
        showNotification('Note deleted successfully!');
    }

    function toggleImportant(id) {
        notes = notes.map(note => {
            if (note.id === id) {
                note.important = !note.important;
            }
            return note;
        });
        saveNotes();
        renderNotes();
        showNotification('Note importance toggled!');
    }

    function saveNotes() {
        localStorage.setItem('notes', JSON.stringify(notes));
    }

    function showNotification(message) {
        notification.textContent = message;
        notification.style.display = 'block';
        setTimeout(() => {
            notification.style.display = 'none';
        }, 3000);
    }

    function getDragAfterElement(container, y) {
        const draggableElements = [...container.querySelectorAll('.note:not(.dragging)')];

        return draggableElements.reduce((closest, child) => {
            const box = child.getBoundingClientRect();
            const offset = y - box.top - box.height / 2;
            if (offset < 0 && offset > closest.offset) {
                return { offset: offset, element: child };
            } else {
                return closest;
            }
        }, { offset: Number.NEGATIVE_INFINITY }).element;
    }

    function saveOrder() {
        const orderedNotes = [...notesList.querySelectorAll('.note')].map(noteElement => {
            const id = parseInt(noteElement.dataset.id, 10);
            return notes.find(note => note.id === id);
        });
        notes = orderedNotes;
        saveNotes();
    }

    notesList.addEventListener('drop', saveOrder);

    document.addEventListener('dragstart', (event) => {
        if (event.target.classList.contains('note')) {
            draggedNote = event.target;
            event.target.classList.add('dragging');
        }
    });

    document.addEventListener('dragend', (event) => {
        if (event.target.classList.contains('note')) {
            event.target.classList.remove('dragging');
            draggedNote = null;
        }
    });

    document.addEventListener('dragover', (event) => {
        event.preventDefault();
        const draggingElement = document.querySelector('.note.dragging');
        const afterElement = getDragAfterElement(notesList, event.clientY);
        if (afterElement == null) {
            notesList.appendChild(draggingElement);
        } else {
            notesList.insertBefore(draggingElement, afterElement);
        }
    });

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.toLowerCase();
        const filteredNotes = notes.filter(note => 
            note.title.toLowerCase().includes(query) || 
            note.text.toLowerCase().includes(query)
        );
        renderNotes(filteredNotes);
    });

    sortByDateButton.addEventListener('click', () => {
        notes.sort((a, b) => new Date(b.date) - new Date(a.date));
        renderNotes();
    });

    sortByTitleButton.addEventListener('click', () => {
        notes.sort((a, b) => a.title.localeCompare(b.title));
        renderNotes();
    });

    sortByImportantButton.addEventListener('click', () => {
        notes.sort((a, b) => b.important - a.important);
        renderNotes();
    });

    exportNotesButton.addEventListener('click', () => {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(notes));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "notes.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
    });

    importNotesInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedNotes = JSON.parse(e.target.result);
                notes = importedNotes;
                saveNotes();
                renderNotes();
                showNotification('Notes imported successfully!');
            };
            reader.readAsText(file);
        }
    });

    toggleThemeButton.addEventListener('click', () => {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    });

    document.addEventListener('DOMContentLoaded', () => {
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            document.body.classList.add(savedTheme);
        }
    });

    addNoteButton.addEventListener('click', addNote);
    renderNotes();
});
