import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditStudentsModalComponent } from './edit-students-modal.component';

describe('EditStudentsModalComponent', () => {
  let component: EditStudentsModalComponent;
  let fixture: ComponentFixture<EditStudentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditStudentsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditStudentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
