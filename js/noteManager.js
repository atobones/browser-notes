class NoteManager {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('notes')) || [];
    }

    addItem(item) {
        this.items.push(item);
        this.saveItems();
    }

    updateItem(id, title, text) {
        const item = this.items.find(item => item.id === id);
        if (item) {
            item.updateTitle(title);
            if (item instanceof Note) {
                item.update(text);
            }
            this.saveItems();
        }
    }

    deleteItem(id) {
        this.items = this.items.filter(item => item.id !== id);
        this.saveItems();
    }

    toggleImportant(id) {
        const item = this.items.find(item => item.id === id);
        if (item && item instanceof Note) {
            item.toggleImportant();
            this.saveItems();
        }
    }

    searchItems(query) {
        return this.items.filter(item => 
            item.title.toLowerCase().includes(query.toLowerCase()) || 
            (item instanceof Note && item.text.toLowerCase().includes(query.toLowerCase()))
        );
    }

    sortItemsByDate() {
        this.items.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    sortItemsByTitle() {
        this.items.sort((a, b) => a.title.localeCompare(b.title));
    }

    sortItemsByImportant() {
        this.items.sort((a, b) => {
            if (a instanceof Note && b instanceof Note) {
                return b.important - a.important;
            }
            return 0;
        });
    }

    importItems(importedItems) {
        this.items = importedItems.map(item => {
            if (item.hasOwnProperty('text')) {
                return new Note(
                    item.id,
                    item.title,
                    item.text,
                    item.category,
                    item.tags,
                    item.date,
                    item.important
                );
            }
            return new Item(item.id, item.title, item.date);
        });
        this.saveItems();
    }

    saveItems() {
        localStorage.setItem('notes', JSON.stringify(this.items));
    }

    getItems() {
        return this.items;
    }
}
