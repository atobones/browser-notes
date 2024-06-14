class Note {
    constructor(id, title, text, category, tags, date, important = false) {
        this.id = id;
        this.title = title;
        this.text = text;
        this.category = category;
        this.tags = tags;
        this.date = date;
        this.important = important;
    }

    toggleImportant() {
        this.important = !this.important;
    }

    update(title, text) {
        this.title = title;
        this.text = text;
        this.date = new Date().toLocaleString();
    }
}

class NoteManager {
    constructor() {
        this.notes = JSON.parse(localStorage.getItem('notes')) || [];
    }

    addNote(title, text, category, tags) {
        const newNote = new Note(
            Date.now(),
            title,
            text,
            category,
            tags,
            new Date().toLocaleString()
        );
        this.notes.push(newNote);
        this.saveNotes();
    }

    updateNote(id, title, text) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            note.update(title, text);
            this.saveNotes();
        }
    }

    deleteNote(id) {
        this.notes = this.notes.filter(note => note.id !== id);
        this.saveNotes();
    }

    toggleImportant(id) {
        const note = this.notes.find(note => note.id === id);
        if (note) {
            note.toggleImportant();
            this.saveNotes();
        }
    }

    searchNotes(query) {
        return this.notes.filter(note => 
            note.title.toLowerCase().includes(query.toLowerCase()) || 
            note.text.toLowerCase().includes(query.toLowerCase())
        );
    }

    sortNotesByDate() {
        this.notes.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    sortNotesByTitle() {
        this.notes.sort((a, b) => a.title.localeCompare(b.title));
    }

    sortNotesByImportant() {
        this.notes.sort((a, b) => b.important - a.important);
    }

    importNotes(importedNotes) {
        this.notes = importedNotes.map(note => new Note(
            note.id,
            note.title,
            note.text,
            note.category,
            note.tags,
            note.date,
            note.important
        ));
        this.saveNotes();
    }

    saveNotes() {
        localStorage.setItem('notes', JSON.stringify(this.notes));
    }

    getNotes() {
        return this.notes;
    }
}

class NoteApp {
    constructor() {
        this.noteManager = new NoteManager();
        this.notesList = document.querySelector('.notes-list');
        this.addNoteButton = document.getElementById('add-note');
        this.noteTitleInput = document.getElementById('note-title');
        this.noteTextInput = document.getElementById('note-text');
        this.noteCategoryInput = document.getElementById('note-category');
        this.noteTagsInput = document.getElementById('note-tags');
        this.searchInput = document.getElementById('search-notes');
        this.sortByDateButton = document.getElementById('sort-date');
        this.sortByTitleButton = document.getElementById('sort-title');
        this.sortByImportantButton = document.getElementById('sort-important');
        this.exportNotesButton = document.getElementById('export-notes');
        this.importNotesInput = document.getElementById('import-notes');
        this.toggleThemeButton = document.getElementById('toggle-theme');
        this.notification = document.getElementById('notification');
        this.draggedNote = null;

        this.addEventListeners();
        this.renderNotes();
    }

    addEventListeners() {
        this.addNoteButton.addEventListener('click', () => this.addNote());
        this.searchInput.addEventListener('input', () => this.searchNotes());
        this.sortByDateButton.addEventListener('click', () => this.sortNotesByDate());
        this.sortByTitleButton.addEventListener('click', () => this.sortNotesByTitle());
        this.sortByImportantButton.addEventListener('click', () => this.sortNotesByImportant());
        this.exportNotesButton.addEventListener('click', () => this.exportNotes());
        this.importNotesInput.addEventListener('change', (event) => this.importNotes(event));
        this.toggleThemeButton.addEventListener('click', () => this.toggleTheme());
        document.addEventListener('dragstart', (event) => this.handleDragStart(event));
        document.addEventListener('dragend', (event) => this.handleDragEnd(event));
        document.addEventListener('dragover', (event) => this.handleDragOver(event));
    }

    addNote() {
        const title = this.noteTitleInput.value.trim();
        const text = this.noteTextInput.value.trim();
        const category = this.noteCategoryInput.value.trim();
        const tags = this.noteTagsInput.value.trim().split(',').map(tag => tag.trim());
        if (title && text) {
            this.noteManager.addNote(title, text, category, tags);
            this.renderNotes();
            this.clearInputs();
            this.showNotification('Note added successfully!');
        }
    }

    editNote(id) {
        const note = this.noteManager.getNotes().find(note => note.id === id);
        if (note) {
            this.noteTitleInput.value = note.title;
            this.noteTextInput.value = note.text;
            this.addNoteButton.textContent = 'Update Note';
            this.addNoteButton.onclick = () => this.updateNote(id);
        }
    }

    updateNote(id) {
        const title = this.noteTitleInput.value.trim();
        const text = this.noteTextInput.value.trim();
        if (title && text) {
            this.noteManager.updateNote(id, title, text);
            this.renderNotes();
            this.clearInputs();
            this.addNoteButton.textContent = 'Add Note';
            this.addNoteButton.onclick = () => this.addNote();
            this.showNotification('Note updated successfully!');
        }
    }

    deleteNote(id) {
        this.noteManager.deleteNote(id);
        this.renderNotes();
        this.showNotification('Note deleted successfully!');
    }

    toggleImportant(id) {
        this.noteManager.toggleImportant(id);
        this.renderNotes();
        this.showNotification('Note importance toggled!');
    }

    searchNotes() {
        const query = this.searchInput.value.toLowerCase();
        const filteredNotes = this.noteManager.searchNotes(query);
        this.renderNotes(filteredNotes);
    }

    sortNotesByDate() {
        this.noteManager.sortNotesByDate();
        this.renderNotes();
    }

    sortNotesByTitle() {
        this.noteManager.sortNotesByTitle();
        this.renderNotes();
    }

    sortNotesByImportant() {
        this.noteManager.sortNotesByImportant();
        this.renderNotes();
    }

    exportNotes() {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.noteManager.getNotes()));
        const downloadAnchorNode = document.createElement('a');
        downloadAnchorNode.setAttribute("href", dataStr);
        downloadAnchorNode.setAttribute("download", "notes.json");
        document.body.appendChild(downloadAnchorNode);
        downloadAnchorNode.click();
        downloadAnchorNode.remove();
        this.showNotification('Notes exported successfully!');
    }

    importNotes(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const importedNotes = JSON.parse(e.target.result);
                this.noteManager.importNotes(importedNotes);
                this.renderNotes();
                this.showNotification('Notes imported successfully!');
            };
            reader.readAsText(file);
        }
    }

    toggleTheme() {
        document.body.classList.toggle('dark');
        localStorage.setItem('theme', document.body.classList.contains('dark') ? 'dark' : 'light');
    }

    handleDragStart(event) {
        if (event.target.classList.contains('note')) {
            this.draggedNote = event.target;
            event.target.classList.add('dragging');
        }
    }

    handleDragEnd(event) {
        if (event.target.classList.contains('note')) {
            event.target.classList.remove('dragging');
            this.draggedNote = null;
            this.noteManager.saveNotes();
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        const draggingElement = document.querySelector('.note.dragging');
        const afterElement = this.getDragAfterElement(this.notesList, event.clientY);
        if (afterElement == null) {
            this.notesList.appendChild(draggingElement);
        } else {
            this.notesList.insertBefore(draggingElement, afterElement);
        }
    }

    getDragAfterElement(container, y) {
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

    renderNotes(filteredNotes = this.noteManager.getNotes()) {
        this.notesList.innerHTML = '';
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
                this.deleteNote(note.id);
            });

            noteElement.querySelector('.edit').addEventListener('click', () => {
                this.editNote(note.id);
            });

            noteElement.querySelector('.toggle-important').addEventListener('click', () => {
                this.toggleImportant(note.id);
            });

            this.notesList.appendChild(noteElement);
        });
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NoteApp();
});
