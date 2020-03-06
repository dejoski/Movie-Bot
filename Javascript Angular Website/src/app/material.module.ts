import { NgModule } from '@angular/core';
import {
    MatDialogModule,
    MatFormFieldModule,
    MatButtonModule,
    MatInputModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatCardModule

} from '@angular/material';
import { ModalComponent } from './Modal/Modal.component';


@NgModule({
    imports: [
      MatDialogModule,
      MatFormFieldModule,
      MatButtonModule,
      MatInputModule,
      MatProgressBarModule,
      MatProgressSpinnerModule,
      MatCardModule],
    exports: [
      MatDialogModule,
      MatFormFieldModule,
      MatButtonModule,
      MatInputModule,
      MatProgressBarModule,
      MatProgressSpinnerModule,
      MatCardModule],
    entryComponents: [
        ModalComponent
      ]
})

export class AngularMaterialModule { }
