class Item {
    constructor(id, title, date) {
        this.id = id;
        this.title = title;
        this.date = date;
    }

    updateTitle(title) {
        this.title = title;
        this.date = new Date().toLocaleString();
    }
}
