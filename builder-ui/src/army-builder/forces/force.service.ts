import { Injectable } from '@angular/core';
import { ArmyService } from '../armies/army.service';
import { PlatoonSelectorRepositoryService } from '../platoons/platoon-selector-repository.service';
import { UnitSelectorRepositoryService } from '../units/unit-selector-repository.service';
import { WeaponRepositoryService } from '../weapons/weapon-repository.service';
import { Army } from '../armies/army.class';
import { firstValueFrom } from 'rxjs';
import { Library } from '../units/library.interface';
import { Force } from './force.class';
import { Platoon } from '../platoons/platoon.class';
import { ForceSelectorRepositoryService } from './force-selector-repository.service';

@Injectable({
  providedIn: 'root'
})
export class ForceService {

  constructor(
    private readonly _armyService: ArmyService,
    private readonly _platoonSelectorService: PlatoonSelectorRepositoryService,
    private readonly _unitSelectorService: UnitSelectorRepositoryService,
    private readonly _weaponService: WeaponRepositoryService,
    private readonly _forceSelectorService: ForceSelectorRepositoryService
  ) {  }

  async getForce(army: Army): Promise<Force> {
    const armyId = army.id;
    const library = await this.getLibrary(army);

    const platoonModels = await this._armyService.getPlatoonsForArmy(armyId);
    const platoons = platoonModels.map(p => new Platoon(p, library));
    const forceSelector = await firstValueFrom(this._forceSelectorService.getForceSelector(army.forceSelectorId));

    return new Force(army, forceSelector, library, platoons);
  }

  public async getLibrary(army: Army) {
    const library = {
      platoonSelectors: await firstValueFrom(this._platoonSelectorService.getPlatoonsForForceSelector(army.factionId, army.forceSelectorId)),
      unitSelectors: await firstValueFrom(this._unitSelectorService.getUnitsForFaction(army.factionId, army.forceSelectorId)),
      weapons: await firstValueFrom(this._weaponService.getWeapons()),
      specialRules: []
    } as Library;
    library.unitSelectors.forEach(u => u.enrich(library));
    return library;
  }
}
