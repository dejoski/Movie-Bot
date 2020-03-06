import { Component, OnInit, Inject, Injectable } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA} from '@angular/material';
// import { ModalData } from '../model-data';
@Injectable({
  providedIn: "root"
})
@Component({
  selector: 'app-my-modal',
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.css']
})

export class ModalComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<ModalComponent>)
  { }

  onNoClick(): void {
    this.dialogRef.close();
  }

  ngOnInit() {
  }

}
