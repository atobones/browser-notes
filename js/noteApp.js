document.addEventListener('DOMContentLoaded', () => {
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
            this.renderItems();
        }

        addEventListeners() {
            this.addNoteButton.addEventListener('click', () => this.addNote());
            this.searchInput.addEventListener('input', () => this.searchItems());
            this.sortByDateButton.addEventListener('click', () => this.sortItemsByDate());
            this.sortByTitleButton.addEventListener('click', () => this.sortItemsByTitle());
            this.sortByImportantButton.addEventListener('click', () => this.sortItemsByImportant());
            this.exportNotesButton.addEventListener('click', () => this.exportItems());
            this.importNotesInput.addEventListener('change', (event) => this.importItems(event));
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
                const newNote = new Note(
                    Date.now(),
                    title,
                    text,
                    category,
                    tags,
                    new Date().toLocaleString()
                );
                this.noteManager.addItem(newNote);
                this.renderItems();
                this.clearInputs();
                this.showNotification('Note added successfully!');
            }
        }

        editNote(id) {
            const note = this.noteManager.getItems().find(item => item.id === id);
            if (note && note instanceof Note) {
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
                this.noteManager.updateItem(id, title, text);
                this.renderItems();
                this.clearInputs();
                this.addNoteButton.textContent = 'Add Note';
                this.addNoteButton.onclick = () => this.addNote();
                this.showNotification('Note updated successfully!');
            }
        }

        deleteItem(id) {
            this.noteManager.deleteItem(id);
            this.renderItems();
            this.showNotification('Item deleted successfully!');
        }

        toggleImportant(id) {
            this.noteManager.toggleImportant(id);
            this.renderItems();
            this.showNotification('Note importance toggled!');
        }

        searchItems() {
            const query = this.searchInput.value.toLowerCase();
            const filteredItems = this.noteManager.searchItems(query);
            this.renderItems(filteredItems);
        }

        sortItemsByDate() {
            this.noteManager.sortItemsByDate();
            this.renderItems();
        }

        sortItemsByTitle() {
            this.noteManager.sortItemsByTitle();
            this.renderItems();
        }

        sortItemsByImportant() {
            this.noteManager.sortItemsByImportant();
            this.renderItems();
        }

        exportItems() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.noteManager.getItems()));
            const downloadAnchorNode = document.createElement('a');
            downloadAnchorNode.setAttribute("href", dataStr);
            downloadAnchorNode.setAttribute("download", "notes.json");
            document.body.appendChild(downloadAnchorNode);
            downloadAnchorNode.click();
            downloadAnchorNode.remove();
            this.showNotification('Items exported successfully!');
        }

        importItems(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    const importedItems = JSON.parse(e.target.result);
                    this.noteManager.importItems(importedItems);
                    this.renderItems();
                    this.showNotification('Items imported successfully!');
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
                this.noteManager.saveItems();
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

        renderItems(filteredItems = this.noteManager.getItems()) {
            this.notesList.innerHTML = '';
            filteredItems.forEach(item => {
                const noteElement = document.createElement('div');
                noteElement.classList.add('note');
                noteElement.setAttribute('draggable', true);
                noteElement.setAttribute('data-id', item.id);
                if (item.important) noteElement.classList.add('important');
                noteElement.innerHTML = `
                    <h3>${item.title}</h3>
                    ${item instanceof Note ? `<p>${item.text}</p>` : ''}
                    ${item instanceof Note ? `<div class="note-category">Category: ${item.category}</div>` : ''}
                    ${item instanceof Note ? `<div class="note-tags">Tags: ${item.tags.join(', ')}</div>` : ''}
                    <div class="note-date">${item.date}</div>
                    <div class="note-actions">
                        <button class="delete">Delete</button>
                        ${item instanceof Note ? `<button class="edit">Edit</button>` : ''}
                        ${item instanceof Note ? `<button class="toggle-important">${item.important ? 'Unmark' : 'Mark as Important'}</button>` : ''}
                    </div>
                `;

                noteElement.querySelector('.delete').addEventListener('click', () => {
                    this.deleteItem(item.id);
                });

                if (item instanceof Note) {
                    noteElement.querySelector('.edit').addEventListener('click', () => {
                        this.editNote(item.id);
                    });

                    noteElement.querySelector('.toggle-important').addEventListener('click', () => {
                        this.toggleImportant(item.id);
                    });
                }

                this.notesList.appendChild(noteElement);
            });
        }
    }

    new NoteApp();
});
