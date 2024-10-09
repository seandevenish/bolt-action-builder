import { inject, Injectable } from '@angular/core';
import { collection, doc, Firestore, getDocs, writeBatch } from 'firebase/firestore';
import { Army } from './army.class';
import { AuthService } from '../user/auth.service';
import { FirestoreBaseService } from '../app/services/firestore-base-service.service';
import { factionLibrary } from './faction';
import { firstValueFrom } from 'rxjs';
import { Platoon } from '../platoons/platoon.class';

@Injectable({
  providedIn: 'root'
})
export class ArmyService extends FirestoreBaseService<Army> {
  constructor(authService: AuthService) {
    super('armies');
  }

  override async getAll(): Promise<Army[]> {
    const armies = await super.getAll();
    return armies.map(a => new Army(a, factionLibrary));
  }

  async updateArmyAndPlatoons(army: Army, platoons: Platoon[]): Promise<void> {
    try {
      const user = await firstValueFrom(this.authService.state$);
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
