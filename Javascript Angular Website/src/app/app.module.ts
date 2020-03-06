import { HttpClientModule } from '@angular/common/http';
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { ScrollComponent } from './Scroll/Scroll.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';
import { HttpService } from './shared/http.service';
import { ReactiveFormsModule } from '@angular/forms';
import { ResultsComponent } from './Results/results.component';
import { AppRoutingModule } from '../app-routing.module';
import { InstructionsComponent } from './Instructions/Instructions.component';

import { NgSelectModule } from '@ng-select/ng-select';
import { ModalComponent } from './Modal/Modal.component';
import { AngularMaterialModule } from './material.module';
import { CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';


@NgModule({





 declarations: [
    ModalComponent,
    InstructionsComponent,
    ResultsComponent,
    ScrollComponent,
    AppComponent,


  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    AppRoutingModule,
    NgSelectModule,
    AngularMaterialModule,

  ],
  exports:[
    ModalComponent,
    AngularMaterialModule
  ],

  providers: [
    HttpService,
  ],

  schemas: [CUSTOM_ELEMENTS_SCHEMA],
  bootstrap: [AppComponent],

  entryComponents: [ModalComponent]
})
export class AppModule { }
