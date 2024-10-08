import { UnitSubType, UnitType } from "../units/unit-type.enum";
import { PlatoonSelector } from "./platoon-selector.class";
import { PlatoonType } from "./platoon-type.enum";

export class PlatoonSelectorFactory {

  static createPlatoonSelector(platoonType: PlatoonType): PlatoonSelector {
    switch (platoonType) {
      case PlatoonType.Rifle:
        return new PlatoonSelector(
          'RIFL',
          PlatoonType.Rifle,
          [
            { types: [UnitType.Headquarters], subTypes: [UnitSubType.PlatoonCommander], min: 1, max: 1 },
            { types: [UnitType.InfantrySquad], min: 2, max: 4 },
            { types: [UnitType.Medic], min: 0, max: 1 },
            { types: [UnitType.ForwardObserver], min: 0, max: 1 },
            { types: [UnitType.SniperTeam], min: 0, max: 1 },
            { types: [UnitType.AntiTankTeam], min: 0, max: 1 },
            { types: [UnitType.MortarTeam], subTypes: [UnitSubType.LightMortar], min: 0, max: 1 },
            { types: [UnitType.TransportVehicle], min: 0, maxPerUnit: 1 },
          ]
        );
      case PlatoonType.HeavyWeapons:
        return new PlatoonSelector(
          'HVWP',
          PlatoonType.HeavyWeapons,
          [
            { types: [UnitType.Headquarters], subTypes: [UnitSubType.PlatoonCommander], min: 1, max: 1 },
            { types: [UnitType.MachineGunTeam, UnitType.MortarTeam], min: 2, max: 2 },
            { types: [UnitType.MortarTeam], min: 0, max: 3 },
            { types: [UnitType.MachineGunTeam], min: 0, max: 3 },
            { types: [UnitType.AntiTankTeam], min: 0, max: 3 },
            { types: [UnitType.TransportVehicle], min: 0, maxPerUnit: 1 }
          ]
        );
      case PlatoonType.Engineer:
        return new PlatoonSelector(
          'ENGR',
          PlatoonType.Engineer,
          [
            { types: [UnitType.Headquarters], subTypes: [UnitSubType.PlatoonCommander], min: 1, max: 1 },
            { types: [UnitType.EngineerSquad], min: 2, max: 4 },
            { types: [UnitType.FlamethrowerTeam], min: 0, max: 3 },
            { types: [UnitType.TransportVehicle], min: 0, maxPerUnit: 1 }
          ]
        );
      case PlatoonType.Armoured:
        return new PlatoonSelector(
          'ARMR',
          PlatoonType.Armoured,
          [
            { types: [UnitType.Vehicle], min: 1, max: 1 },
            { types: [UnitType.Vehicle], min: 1, max: 4 },
          ]
        );
      case PlatoonType.Artillery:
        return new PlatoonSelector(
          'ARTL',
          PlatoonType.Artillery,
          [
            { types: [UnitType.Headquarters], subTypes: [UnitSubType.PlatoonCommander], min: 1, max: 1 },
            { types: [UnitType.FieldArtillery], min: 1, max: 4 },
            { types: [UnitType.TransportVehicle], min: 0, maxPerUnit: 1 },
        ]
        );
      case PlatoonType.RecceInfantry:
        return new PlatoonSelector(
          'RECE',
          PlatoonType.RecceInfantry,
          [
            { types: [UnitType.Headquarters], subTypes: [UnitSubType.PlatoonCommander], min: 1, max: 1 },
            { types: [UnitType.InfantrySquad], min: 1, max: 4 },
            { types: [UnitType.ForwardObserver], min: 0, max: 1 },
            { types: [UnitType.TransportVehicle], min: 0, minPerUnit: 1, maxPerUnit: 1 }
          ]
        );
      default:
        throw new Error(`Unknown platoon type: ${platoonType}`);
    }
  }
}
