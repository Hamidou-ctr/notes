import { Injectable, inject } from '@angular/core';
import { Note } from '../interfaces/note.interface';
import { Firestore, addDoc, collection, collectionData, deleteDoc, doc, limit, onSnapshot, orderBy, query, updateDoc, where, } from '@angular/fire/firestore';

@Injectable({
  providedIn: 'root'
})
export class NoteListService {

  trashNotes: Note[] = [];
  normalNotes: Note[] = [];
  normalMarkedNotes: Note[] = [];
  

  unsubNotes;
  unsubMarkedNotes;
  unsubTrash;

  firestore: Firestore = inject(Firestore);

  constructor() {
    this.unsubNotes = this.subNotesList();
    this.unsubMarkedNotes = this.subMarkedNotesList();
    this.unsubTrash = this.subTrashList();
  }

  async deleteNote(colId: "notes" | "trash", docId: string) {
    await deleteDoc(this.getSingleDocRef(colId, docId)).catch((err) => {
      console.log('Fehler beim Löschen des Dokuments: ', err);
    });
  }

  async updateNote(note: Note) {
    if(note.id){
      let docRef = this.getSingleDocRef(this.getColIdFromNote(note), note.id);
      await updateDoc(docRef, this.getCleanJson(note)).catch((err) => {
        console.log('Fehler beim Aktualisieren des Dokuments: ', err);
      });
    }
  }

  getCleanJson(note: Note): {} {
    return {
      type: note.type,
      title: note.title,
      content: note.content,
      marked: note.marked,
    };
  }

  getColIdFromNote(note: Note): string {
    if(note.type == 'note'){
      return 'notes';
    } else {
      return 'trash';
    }
  }

  async addNote(item: Note, colId: "notes" | "trash") {
    const collectionRef = this.getCollectionRef(colId);
    await addDoc(collectionRef, item).catch((err) => {
      console.log(err);
    }).then((docRef) => {
      console.log('Dokument geschrieben mit ID: ', docRef?.id);
    });
  }

  getCollectionRef(colId: "notes" | "trash") {
    return collection(this.firestore, colId);
  }

  ngOnDestroy() {
    this.unsubNotes();
    this.unsubMarkedNotes();
    this.unsubTrash();
  }

  subNotesList() {
    //  wie man auf eine untercollection zugreift
    //let ref = collection(this.firestore, 'trash/27I9mFTqUBKK1q6HrYqH/noteExtra');   
    //const q = query(ref, limit(100));


    const q = query(this.getNotesRef(), limit(100));
    return onSnapshot(q, (list) => {
      this.normalNotes = [];
      list.forEach(element => {
        this.normalNotes.push(this.setNoteObject(element.data(), element.id));
      });


      list.docChanges().forEach((change) => {
        if (change.type === "added") {
          console.log("New note: ", change.doc.data());
        }
        if (change.type === "modified") {
          console.log("Modified note: ", change.doc.data());
        }
        if (change.type === "removed") {
          console.log("Removed note: ", change.doc.data());
        }
      });
    });
  }

  subMarkedNotesList() {
    const q = query(this.getNotesRef(), where("marked", "==", true),  limit(100));
    return onSnapshot(q, (list) => {
      this.normalMarkedNotes = [];
      list.forEach(element => {
        this.normalMarkedNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  subTrashList() {
    return onSnapshot(this.getTrashRef(), (list) => {
      this.trashNotes = [];
      list.forEach(element => {
        this.trashNotes.push(this.setNoteObject(element.data(), element.id));
      });
    });
  }

  setNoteObject(obj: any, id: string): Note {
    return {
      id: id,
      type: obj.type || 'note',
      title: obj.title || '',
      content: obj.content || '',
      marked: obj.marked || false,
    };
  }

  getNotesRef() {
    return collection(this.firestore, 'notes');
  }

  getTrashRef() {
    return collection(this.firestore, 'trash');
  }

  getSingleDocRef(colId: string, docId: string) {
    return doc(collection(this.firestore, colId), docId);
  }
}