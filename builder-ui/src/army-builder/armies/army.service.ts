import { Injectable } from '@angular/core';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Army } from './army.class';
import { firstValueFrom } from 'rxjs';
import { Platoon } from '../platoons/platoon.class';
import { FirestoreBaseService } from '../../app/services/firestore-base-service.service';
import { AuthService } from '../../user/auth.service';
import { factionLibrary } from '../faction';

@Injectable({
  providedIn: 'root'
})
export class ArmyService extends FirestoreBaseService<Army> {

  constructor(private readonly _authService: AuthService
  ) {
    super('armies');
  }

  override async get(id: string): Promise<Army> {
    const army = await super.get(id);
    return new Army(army, factionLibrary);
  }

  override async getAll(): Promise<Army[]> {
    const armies = await super.getAll();
    return armies.map(a => new Army(a, factionLibrary));
  }

  async getPlatoonsForArmy(armyId: string): Promise<Platoon[]> {
    try {
      const user = await firstValueFrom(this._authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }

      const platoonsCollectionPath = `users/${user.uid}/armies/${armyId}/platoons`;
      const platoonsCollectionRef = collection(this.firestore, platoonsCollectionPath);
      const snapshot = await getDocs(platoonsCollectionRef);

      // Map the Firestore documents to Platoon instances
      return snapshot.docs.map((doc) => {
        const platoonData = doc.data();
        return new Platoon({ ...platoonData, id: doc.id });
      });
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  async updateArmyAndPlatoons(army: Army, platoons: Platoon[]): Promise<void> {
    try {
      const user = await firstValueFrom(this._authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }

      const batch = writeBatch(this.firestore); // Create a new Firestore batch operation
      const armyDocRef = doc(this.firestore, `users/${user.uid}/armies/${army.id}`);
      const platoonsCollectionPath = `users/${user.uid}/armies/${army.id}/platoons`;

      // Update the army document as part of the batch
      batch.set(armyDocRef, army.toStoredObject(), { merge: true });

      // Delete all existing platoons for the army before writing the new set
      const platoonsCollectionRef = collection(this.firestore, platoonsCollectionPath);
      const existingPlatoonsSnapshot = await getDocs(platoonsCollectionRef);
      existingPlatoonsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add each platoon to the batch operation
      platoons.forEach((platoon) => {
        const platoonDocRef = doc(this.firestore, `${platoonsCollectionPath}/${platoon.id}`);
        batch.set(platoonDocRef, platoon.toStoredObject());
      });

      // Commit the batch operation to Firestore
      await batch.commit();
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }
}
