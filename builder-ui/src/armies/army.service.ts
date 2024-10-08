import { inject, Injectable } from '@angular/core';
import { Firestore } from 'firebase/firestore';
import { Army } from './army.class';
import { AuthService } from '../user/auth.service';
import { FirestoreBaseService } from '../app/services/firestore-base-service.service';
import { factionLibrary } from './faction';

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
}
