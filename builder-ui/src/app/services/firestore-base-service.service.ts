import { Firestore, collection, doc, getDocs, addDoc, updateDoc, deleteDoc } from '@angular/fire/firestore';
import { AuthService } from '../../user/auth.service';
import { firstValueFrom } from 'rxjs';
import { inject } from '@angular/core';

export interface IFirestoreStorable {
  id: string;
  toStoredObject(): Record<string, any>;
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

  private getFirestoreError(error: any): IFirestoreError {
    console.error('Database operation failed:', error);
    return {
      message: error.message || 'An unexpected error occurred while communicating with the database.',
      code: error.code || 'unknown_error',
      details: error.details || null,
    };
  }

  async getAll(): Promise<T[]> {
    try {
      const userCollection = await this.getUserCollection();
      const snapshot = await getDocs(userCollection);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as T);
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  async add(data: T): Promise<void> {
    try {
      const userCollection = await this.getUserCollection();
      await addDoc(userCollection, data.toStoredObject());
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
      await updateDoc(documentRef, data.toStoredObject());
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
}
