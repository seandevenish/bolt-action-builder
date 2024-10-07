import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ArmyFormComponent } from './army-form.component';

describe('ArmyFormComponent', () => {
  let component: ArmyFormComponent;
  let fixture: ComponentFixture<ArmyFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ArmyFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ArmyFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
