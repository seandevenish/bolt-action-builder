import { IIconPack } from '.';
import { ICONPACK_CONFIG_TOKEN } from './icon.service';

export class IconRegistration {

  public static register(pack: IIconPack) {
    return ({
        provide: ICONPACK_CONFIG_TOKEN,
        useValue: pack,
        multi: true
      });
  }
}
