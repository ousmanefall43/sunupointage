import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprenantsComponent } from './apprenants.component';

describe('ApprenantsComponent', () => {
  let component: ApprenantsComponent;
  let fixture: ComponentFixture<ApprenantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApprenantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprenantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
