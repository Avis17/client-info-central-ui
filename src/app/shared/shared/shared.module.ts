import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'
import { HttpClientModule } from '@angular/common/http'
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { SkipLocationChangeDirective } from 'src/app/directives/skip-location-change.directive';
import {MatRadioModule} from '@angular/material/radio';
import {MatFormFieldModule} from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {MatSelectModule} from '@angular/material/select';
import {MatStepperModule} from '@angular/material/stepper';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { ChipsModule } from 'primeng/chips';
import { ToolbarModule } from 'primeng/toolbar';
import { ChartModule } from 'primeng/chart';
import { ArrayDestructurePipe } from 'src/app/pipes/array-destructure.pipe';
import {MatDatepickerModule} from '@angular/material/datepicker';
import {MatNativeDateModule} from '@angular/material/core';
import { SearchPipe } from 'src/app/pipes/search.pipe';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { CustomLoaderComponent } from 'src/app/components/custom-loader/custom-loader.component';
import { NgxPaginationModule } from 'ngx-pagination';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { TitlecasePipe } from 'src/app/pipes/titlecase.pipe';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { DateformatPipe } from 'src/app/pipes/dateformat.pipe';

@NgModule({
  declarations: [
    ArrayDestructurePipe,
    SkipLocationChangeDirective,
    SearchPipe,
    TitlecasePipe,
    CustomLoaderComponent,
    FooterComponent,
    DateformatPipe
  ],
  imports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatStepperModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ChipsModule,
    ToolbarModule,
    ChartModule,
    MatDatepickerModule,
    MatNativeDateModule,
    ProgressSpinnerModule,
    NgxPaginationModule,
    MatAutocompleteModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    HttpClientModule,
    MatCardModule,
    MatDividerModule,
    MatProgressBarModule,
    MatButtonModule,
    MatToolbarModule,
    MatIconModule,
    MatRadioModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatStepperModule,
    TableModule,
    ButtonModule,
    InputTextModule,
    ChipsModule,
    ToolbarModule,
    ChartModule,
    ArrayDestructurePipe,
    MatDatepickerModule,
    SkipLocationChangeDirective,
    SearchPipe,
    TitlecasePipe,
    ProgressSpinnerModule, 
    MatNativeDateModule,
    CustomLoaderComponent,
    NgxPaginationModule,
    FooterComponent,
    MatAutocompleteModule,
    DateformatPipe
  ]
})
export class SharedModule { }
