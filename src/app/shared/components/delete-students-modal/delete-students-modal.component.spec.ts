import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DeleteStudentsModalComponent } from './delete-students-modal.component';

describe('DeleteStudentsModalComponent', () => {
  let component: DeleteStudentsModalComponent;
  let fixture: ComponentFixture<DeleteStudentsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DeleteStudentsModalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DeleteStudentsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
