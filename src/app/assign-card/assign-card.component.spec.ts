import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignCardComponent } from './assign-card.component';

describe('AssignCardComponent', () => {
  let component: AssignCardComponent;
  let fixture: ComponentFixture<AssignCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignCardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
