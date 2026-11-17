
export class User {
  private readonly id: number;
  public name: string;
  public email: string;
  private password: string;
  protected phone: string;
  private _age: number = 18;
  private notebooks: NoteBook[] = [];

  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    this.id = id;
    this.name = name;
    this.email = email;
    this.password = password;
    this.phone = phone;
    this.age = age; // goes through the setter -> validated
  }
  public get age(): number {
    return this._age;
  }

  public set age(value: number) {
    if (value < 18 || value > 60) {
      throw new Error(`Invalid age (${value}). Age must be between 18 and 60.`);
    }
    this._age = value;
  }

  public getId(): number {
    return this.id;
  }

  public checkPassword(password: string): boolean {
    return this.password === password;
  }

  public changePassword(oldPassword: string, newPassword: string): void {
    if (!this.checkPassword(oldPassword)) {
      throw new Error("Old password is incorrect.");
    }
    this.password = newPassword;
  }
  public addNotebook(notebook: NoteBook): void {
    if (!this.notebooks.includes(notebook)) {
      this.notebooks.push(notebook);
    }
  }

  public removeNotebook(notebookId: number): void {
    this.notebooks = this.notebooks.filter((nb) => nb.id !== notebookId);
  }

  public getNotebooks(): NoteBook[] {
    return [...this.notebooks];
  }

  public displayInfo(): void {
    console.log(`ID: ${this.id}`);
    console.log(`Name: ${this.name}`);
    console.log(`Email: ${this.email}`);
    console.log(`Phone: ${this.phone}`);
    console.log(`Age: ${this.age}`);
    console.log(`Notebooks: ${this.notebooks.length}`);
  }
}
export class Admin extends User {
  constructor(
    id: number,
    name: string,
    email: string,
    password: string,
    phone: string,
    age: number
  ) {
    super(id, name, email, password, phone, age);
  }
  public manageNotes(
    notebook: NoteBook,
    action: "delete" | "edit",
    noteId: number,
    newContent?: string
  ): void {
    if (action === "delete") {
      notebook.removeNote(noteId);
      console.log(`Admin ${this.name} deleted note #${noteId}.`);
    } else if (action === "edit") {
      const note = notebook.getNoteById(noteId);
      if (!note) {
        console.log(`Note #${noteId} not found.`);
        return;
      }
      note.content = newContent ?? note.content;
      console.log(`Admin ${this.name} edited note #${noteId}.`);
    }
  }
  public override displayInfo(): void {
    console.log("Role: Admin");
    super.displayInfo();
  }
}
export class Note {
  public readonly id: number;
  public title: string;
  public content: string;
  public readonly author: User;

  constructor(id: number, title: string, content: string, author: User) {
    this.id = id;
    this.title = title;
    this.content = content;
    this.author = author;
  }
  public get userId(): number {
    return this.author.getId();
  }
  public preview(length: number = 30): string {
    return this.content.length > length
      ? this.content.substring(0, length) + "..."
      : this.content;
  }
}
export class NoteBook {
  public readonly id: number;
  public name: string;
  private notes: Note[] = [];
  private nextNoteId: number = 1;

  constructor(id: number, name: string) {
    this.id = id;
    this.name = name;
  }
  public addNote(title: string, content: string, author: User): Note {
    const note = new Note(this.nextNoteId++, title, content, author);
    this.notes.push(note);
    return note;
  }

  public removeNote(noteId: number): boolean {
    const before = this.notes.length;
    this.notes = this.notes.filter((n) => n.id !== noteId);
    return this.notes.length < before;
  }

  public getNoteById(noteId: number): Note | undefined {
    return this.notes.find((n) => n.id === noteId);
  }

  public getNotes(): Note[] {
    return [...this.notes];
  }

  public clear(): void {
    this.notes = [];
  }
}
export class Storage<T> {
  private items: T[] = [];

  public addItem(item: T): void {
    this.items.push(item);
  }

  public removeItem(item: T): boolean {
    const index = this.items.indexOf(item);
    if (index === -1) return false;
    this.items.splice(index, 1);
    return true;
  }

  public getAllItems(): T[] {
    return [...this.items];
  }
}
const user1 = new User(1, "Ahmed", "ahmed@mail.com", "123456", "01011111111", 25);
const admin = new Admin(2, "Sara", "sara@mail.com", "admin123", "01022222222", 30);

const workNotebook = new NoteBook(1, "Work");
const studyNotebook = new NoteBook(2, "Study");
user1.addNotebook(workNotebook);
user1.addNotebook(studyNotebook);

workNotebook.addNote("Meeting", "Team meeting on Sunday at 10 AM in the main hall.", user1);
workNotebook.addNote("Tasks", "Finish the dashboard design.", user1);
studyNotebook.addNote("TypeScript", "Review classes, interfaces and generics before the exam.", user1);

console.log("===== User Info =====");
user1.displayInfo();

console.log("\n===== Admin Info =====");
admin.displayInfo();

console.log("\n===== Notes Preview =====");
for (const nb of user1.getNotebooks()) {
  console.log(`Notebook: ${nb.name}`);
  for (const note of nb.getNotes()) {
    console.log(`  #${note.id} ${note.title} (by ${note.author.name}, userId=${note.userId}): ${note.preview()}`);
  }
}

console.log("\n===== Admin Manages Notes =====");
admin.manageNotes(workNotebook, "edit", 2, "Finish the dashboard design and send it to the client.");
admin.manageNotes(workNotebook, "delete", 1);
workNotebook.getNotes().forEach((n) => console.log(`  #${n.id} ${n.title}: ${n.preview()}`));

console.log("\n===== Age Validation =====");
try {
  new User(3, "Omar", "omar@mail.com", "pass", "01033333333", 15);
} catch (e) {
  console.log((e as Error).message);
}

console.log("\n===== Generic Storage =====");
const numberStorage = new Storage<number>();
numberStorage.addItem(10);
numberStorage.addItem(20);
numberStorage.addItem(30);
numberStorage.removeItem(20);
console.log("Numbers:", numberStorage.getAllItems());

const userStorage = new Storage<User>();
userStorage.addItem(user1);
userStorage.addItem(admin);
console.log("Users:", userStorage.getAllItems().map((u) => u.name));