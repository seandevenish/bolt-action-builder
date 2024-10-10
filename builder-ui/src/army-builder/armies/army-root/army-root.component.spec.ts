import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmyRootComponent } from './army-root.component';

describe('ArmyRootComponent', () => {
  let component: ArmyRootComponent;
  let fixture: ComponentFixture<ArmyRootComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmyRootComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmyRootComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
