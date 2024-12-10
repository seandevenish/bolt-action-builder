import { Injectable } from '@angular/core';
import { collection, doc, getDocs, writeBatch } from 'firebase/firestore';
import { Army, IArmyModel } from './army.class';
import { firstValueFrom } from 'rxjs';
import { IPlatoonModel, Platoon } from '../platoons/platoon.class';
import { FirestoreBaseService } from '../../app/services/firestore-base-service.service';
import { AuthService } from '../../user/auth.service';
import { factionLibrary } from '../faction';
import { generateGuid } from '../../app/utilities/guid';
import { Experience } from '../units/experience.enum';
import { IUnitModel } from '../units/unit.class';
import { IVehicleUnitModel } from '../units/vehicle-unit.class';

@Injectable({
  providedIn: 'root'
})
export class ArmyService extends FirestoreBaseService<IArmyModel> {

  private readonly debug = true;

  constructor(
    private readonly _authService: AuthService
  ) {
    super('armies');
  }

  async get(id: string): Promise<Army> {
    if (this.debug) {
      return new Army({
        id: generateGuid(),
        name: 'Test Army',
        createdDate: new Date(),
        modifiedDate: new Date(),
        factionId: 'US'
      }, factionLibrary);
    }

    const user = await firstValueFrom(this._authService.state$);
    if (!user) {
      throw new Error('User is not authenticated');
    }

    const army = await super.getModel(id);
    return new Army(army, factionLibrary);
  }

  async getAll(): Promise<Army[]> {
    if (this.debug) {
      return [
        await this.get('test-id')
      ];
    }

    const armies = await super.getAllModels();
    return armies.map(a => new Army(a, factionLibrary));
  }

  public async getPlatoonsForArmy(armyId: string): Promise<IPlatoonModel[]> {
    if (this.debug) {
      return [
        {
          id: generateGuid(),
          selectorId: 'RIFL',
          units: [
            {
              selectorId: 'US_PLT_COM',
              slotId: 'Officer',
              men: 1,
              cost: 30,
              experience: Experience.Regular,
              options: []
            }
          ] as any as IUnitModel[],
          order: 0
        },
        {
          id: generateGuid(),
          selectorId: 'ARMR',
          units: [
            {
              selectorId: 'US_M5_M5A1',
              slotId: 'Vehicles',
              cost: 155,
              experience: Experience.Regular
            }
          ] as IVehicleUnitModel[],
          order: 1
        }
      ] as IPlatoonModel[];
    }

    try {
      const user = await firstValueFrom(this._authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }

      const platoonsCollectionPath = `users/${user.uid}/armies/${armyId}/platoons`;
      const platoonsCollectionRef = collection(this.firestore, platoonsCollectionPath);
      const snapshot = await getDocs(platoonsCollectionRef);

      // Map and sort by the order field
      return snapshot.docs
        .map((doc) => {
          const platoonData = doc.data() as IPlatoonModel;
          return { ...platoonData, id: doc.id };
        })
        .sort((a, b) => a.order - b.order); // Ensure correct order
    } catch (error) {
      throw this.getFirestoreError(error);
    }
  }

  public async updateArmyAndPlatoons(army: Army, platoons: Platoon[]): Promise<void> {
    try {
      const user = await firstValueFrom(this._authService.state$);
      if (!user) {
        throw new Error('User is not authenticated');
      }

      const batch = writeBatch(this.firestore);
      const armyDocRef = doc(this.firestore, `users/${user.uid}/armies/${army.id}`);
      const platoonsCollectionPath = `users/${user.uid}/armies/${army.id}/platoons`;

      // Update the army document
      batch.set(armyDocRef, army.toStoredObject(), { merge: true });

      // Delete all existing platoons
      const platoonsCollectionRef = collection(this.firestore, platoonsCollectionPath);
      const existingPlatoonsSnapshot = await getDocs(platoonsCollectionRef);
      existingPlatoonsSnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });

      // Add each platoon with an order
      platoons.forEach((platoon, index) => {
        const platoonDocRef = doc(this.firestore, `${platoonsCollectionPath}/${platoon.id}`);
        batch.set(platoonDocRef, { ...platoon.toStoredObject(), order: index });
      });

      await batch.commit();
    } catch (error) {
      console.error('Error saving platoons', platoons.map(p => p.toStoredObject()));
      throw this.getFirestoreError(error);
    }
  }

}
