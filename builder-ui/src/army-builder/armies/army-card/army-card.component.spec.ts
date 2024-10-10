import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmyCardComponent } from './army-card.component';

describe('ArmyCardComponent', () => {
  let component: ArmyCardComponent;
  let fixture: ComponentFixture<ArmyCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmyCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmyCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
