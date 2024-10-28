import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc, getDoc, Timestamp } from '@angular/fire/firestore';
import { AuthService } from '../../user/auth.service';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';

export interface IFirestoreStorable {
}

export interface IFirestoreError {
  message: string;
  code: string;
  details?: any;
}

export abstract class FirestoreBaseService<T extends IFirestoreStorable> {
  protected collectionPath: string;
  protected firestore: Firestore;
  protected authService: AuthService;

  constructor(
    collectionPath: string
  ) {
    this.collectionPath = collectionPath;
    this.firestore = inject(Firestore);
    this.authService = inject(AuthService);
  }

  private async getUserCollection() {
    const user = await firstValueFrom(this.authService.state$);
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return collection(this.firestore, `users/${user.uid}/${this.collectionPath}`);
  }

  protected async getPath(id: string) {
    const user = await firstValueFrom(this.authService.state$);
    if (!user) {
      throw new Error('User is not authenticated');
    }
    return `users/${user.uid}/${this.collectionPath}/${id}`;
  }

  protected getFirestoreError(error: any): IFirestoreError {
    console.error('Database operation failed:', error);
    return {
      message: error.message || 'An unexpected error occurred while communicating with the database.',
      code: error.code || 'unknown_error',
      details: error.details || null,
    };
  }

  async getAllModels(): Promise<T[]> {
    try {
      const userCollection = await this.getUserCollection();
      const snapshot = await getDocs(userCollection);
      return snapshot.docs.map((doc) => {
        const data = this.convertTimestampsToDate(doc.data());
        return { ...data, id: doc.id } as T;
      });
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  async getModel(id: string): Promise<T> {
    try {
      const path = await this.getPath(id);
      const documentRef = doc(this.firestore, path);
      const documentSnapshot = await getDoc(documentRef);

      if (!documentSnapshot.exists()) {
        throw new Error(`Document with ID ${id} does not exist`);
      }

      // Return the document data with the ID
      const data = this.convertTimestampsToDate(documentSnapshot.data());
      return { ...data, id: documentSnapshot.id } as T;
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  async add(data: T): Promise<void> {
    try {
      const userCollection = await this.getUserCollection();
      await addDoc(userCollection, data);
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  async update(documentId: string, data: T): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const documentRef = doc(this.firestore, `users/${user.uid}/${this.collectionPath}/${documentId}`);
      await updateDoc(documentRef, data);
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  async delete(documentId: string): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const documentRef = doc(this.firestore, `users/${user.uid}/${this.collectionPath}/${documentId}`);
      await deleteDoc(documentRef);
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  private convertTimestampsToDate(data: any): any {
    if (data instanceof Timestamp) {
      return data.toDate();
    } else if (Array.isArray(data)) {
      return data.map(item => this.convertTimestampsToDate(item));
    } else if (data && typeof data === 'object') {
      return Object.keys(data).reduce((acc, key) => {
        acc[key] = this.convertTimestampsToDate(data[key]);
        return acc;
      }, {} as Record<string, any>);
    }
    return data;
  }
}
