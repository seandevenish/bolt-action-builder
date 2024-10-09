import { Injectable } from '@angular/core';
import { FirestoreBaseService } from '../app/services/firestore-base-service.service';
import { Platoon } from './platoon.class';
import { AuthService } from '../user/auth.service';
import { collection, getDocs } from '@angular/fire/firestore';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlatoonService extends FirestoreBaseService<Platoon> {
  constructor(authService: AuthService) {
    super('platoons'); // We'll handle the sub-collection logic in the methods.
  }

  // Method to get all platoons for a specific army
  async getPlatoonsByArmyId(armyId: string): Promise<Platoon[]> {
    try {
      const user = await firstValueFrom(this.authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }
      const platoonsCollectionRef = collection(this.firestore, `users/${user.uid}/armies/${armyId}/platoons`);
      const snapshot = await getDocs(platoonsCollectionRef);
      return snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as Platoon);
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }
}
