import { SpecialRulesRepositoryService } from './../special-rules/special-rules-repository.service';
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
import { IGeneralOptionSelector } from '../units/unit-selector.class';

@Injectable({
  providedIn: 'root'
})
export class ForceService {

  constructor(
    private readonly _armyService: ArmyService,
    private readonly _platoonSelectorService: PlatoonSelectorRepositoryService,
    private readonly _unitSelectorService: UnitSelectorRepositoryService,
    private readonly _weaponService: WeaponRepositoryService,
    private readonly _forceSelectorService: ForceSelectorRepositoryService,
    private readonly _specialRuleService: SpecialRulesRepositoryService
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
      weapons: await firstValueFrom(this._weaponService.getWeapons(army.factionId)),
      specialRules: this._specialRuleService.getRules()
    } as Library;
    library.platoonSelectors.flatMap(s => s.unitRequirements.flatMap(r => r.options)).filter(o => !!o?.specialRuleId).map(o => o as IGeneralOptionSelector).forEach(o => o.specialRule = library.specialRules.find(r => r.id == o?.specialRuleId));
    library.unitSelectors.forEach(u => u.enrich(library));
    library.weapons.filter(w => w.specialRuleIds?.length).forEach(w => w.specialRules = w.specialRuleIds.map(i => library.specialRules.find(r => r.id == i)).filter(i => i !== undefined));
    return library;
  }
}
