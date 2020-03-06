import { InstructionsComponent } from './app/Instructions/Instructions.component';
import { ResultsComponent } from './app/Results/results.component';
import { ScrollComponent } from './app/Scroll/Scroll.component';
import { AppComponent } from './app/app.component';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [

  { path: '', component: InstructionsComponent},
  { path: 'angular', component: InstructionsComponent},
  { path: 'scroll', component: ScrollComponent },
  {path: 'results', component: ResultsComponent},
  { path: 'groups', component: ResultsComponent},
  { path: '**', component: InstructionsComponent},
];

@NgModule({
  declarations: [],
  imports: [RouterModule.forRoot(routes),
  CommonModule],
  exports: [RouterModule]
})
export class AppRoutingModule { }

