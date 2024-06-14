class Note extends Item {
    constructor(id, title, text, category, tags, date, important = false) {
        super(id, title, date);
        this.text = text;
        this.category = category;
        this.tags = tags;
        this.important = important;
    }

    toggleImportant() {
        this.important = !this.important;
    }

    update(text) {
        this.text = text;
        this.date = new Date().toLocaleString();
    }
}
