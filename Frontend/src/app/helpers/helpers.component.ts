import { Component, Inject, inject, Input, NgModule, OnChanges, SimpleChanges, ChangeDetectionStrategy, ViewChild, ElementRef, HostListener } from '@angular/core';
import { RouterLink, RouterOutlet } from "@angular/router";
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIcon, MatIconModule } from "@angular/material/icon";
import { MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule, NgIf } from "@angular/common";
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { MatFormField, MatFormFieldModule, MatLabel } from "@angular/material/form-field";
import { FormsModule } from '@angular/forms';
import { MatSelect } from '@angular/material/select';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MAT_SNACK_BAR_DATA, MatSnackBar } from '@angular/material/snack-bar';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatInputModule } from '@angular/material/input';
import { MatNativeDateModule, MatOption } from '@angular/material/core';
import { EmployeeIdDialogComponent } from '../employee-id-dialog/employee-id-dialog.component';
import { MatCardModule } from '@angular/material/card'
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ApiService } from '../api.service';

import { MatBadgeModule } from '@angular/material/badge';

import * as XLSX from 'xlsx';

import { InfiniteScrollDirective } from 'ngx-infinite-scroll';
import { NgxSkeletonLoaderModule } from 'ngx-skeleton-loader';

export interface Helper {
  _id?: string,
  name: string;
  email: string;
  profilePic: string;
  gender: string;
  phone: string;
  languages: string[];
  service: string;
  households: number
  organization: string;
  vehicleType: string;
  kycDocx: { base64File: string, mimeType: string, fileName: string };
  additionalDocx: { base64File: string, mimeType: string, fileName: string };
  employeeID: number;
  employeeId_QR: string;
  dateJoined: Date;
}

@Component({
  selector: 'app-helpers',
  standalone: true,

  imports: [RouterLink, RouterOutlet
    , MatToolbarModule, MatIcon, MatSidenavModule,
    NgIf, CommonModule, MatButtonModule,
    MatMenuModule, MatLabel, MatFormField,
    FormsModule, MatOption, MatSelect,
    MatFormFieldModule, MatInputModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatNativeDateModule, FormsModule, MatProgressSpinnerModule,
    InfiniteScrollDirective, MatBadgeModule, NgxSkeletonLoaderModule],
  templateUrl: './helpers.component.html',
  styleUrl: './helpers.component.scss'
})


export class HelpersComponent {

  inputOptions = {
    services: [
      'Nurse',
      'Driver',
      'Cook',
      'Maid'
    ],
    orgs: [
      'Springs helpers',
      'ASBL'
    ]
  }
  openFilter = false;


  toggleFilterPopup() {
    this.openFilter = !this.openFilter;
  }

  constructor(private dialog: MatDialog, private api: ApiService) { }
  private _snackBar = inject(MatSnackBar);

  loadingHelpers = false

  helpers: Helper[] = []
  filteredHelpers: Helper[] = []
  selectedHelper = this.helpers?.[0]
  totalHelpersCount: number | string = '-'
  filteredHelpersCount: number | string = '-'

  ngOnInit() {
    this.getNextHelpers()
  }

  loadMoreHelpers() {
    console.log("scrolled");
  }

  //////// Filtering & Sorting \\\\\\\\

  sortFilter: string = 'name';
  selectedDate = {
    start: '',
    end: ''
  }
  serviceFilter: string[] = []
  organizationFilter: string[] = []
  searchVal: string = '';

  pageNo = 0

  filterChanged = false

  applyDates() {
    if (!this.selectedDate.end) {
      this.selectedDate.start = ''
      return
    }
    this.filterChanged = true

    this.filteredHelpers = []
    this.pageNo = 0
    this.filteredHelpersCount = '-'
    this.selectedHelper = this.filteredHelpers[0]

    this.getNextHelpers()
  }

  resetDates() {
    this.selectedDate.start = ''
    this.selectedDate.end = ''
    this.filterChanged = true

    this.filteredHelpers = []
    this.pageNo = 0
    this.filteredHelpersCount = '-'
    this.selectedHelper = this.filteredHelpers[0]

    this.getNextHelpers()
  }

  timeOut: any
  handleSearchChange() {
    clearTimeout(this.timeOut)
    this.timeOut = setTimeout(() => {

      this.filterChanged = true

      this.filteredHelpers = []
      this.pageNo = 0
      this.filteredHelpersCount = '-'
    this.selectedHelper = this.filteredHelpers[0]

      this.getNextHelpers()

    }, 500);
  }

  hideFilterBatch = true
  applyFilter() {
    this.hideFilterBatch = false
    this.filterChanged = true

    this.filteredHelpers = []
    this.pageNo = 0
    this.filteredHelpersCount = '-'
    this.selectedHelper = this.filteredHelpers[0]

    this.getNextHelpers()

    this.openFilter = false

  }

  resetFilter() {
    this.hideFilterBatch = true
    this.serviceFilter = []
    this.organizationFilter = []
    this.filterChanged = true

    this.filteredHelpers = []
    this.pageNo = 0
    this.filteredHelpersCount = '-'
    this.selectedHelper = this.filteredHelpers[0]

    this.getNextHelpers()

    this.openFilter = false

  }

  selectOrDeselectAll(field: string) {
    if (field == 'service') {
      if (this.serviceFilter.length - 1 === this.inputOptions.services.length) this.serviceFilter = []
      else this.serviceFilter = this.inputOptions.services
    }
    else {
      if (this.organizationFilter.length - 1 === this.inputOptions.orgs.length) this.organizationFilter = []
      else this.organizationFilter = this.inputOptions.orgs
    }
  }

  async getNextHelpers() {
    if (this.loadingHelpers) return
    if (!this.filterChanged) {
      if (this.totalHelpersCount === this.filteredHelpers.length) return
    }

    this.filterChanged = false

    const filter = {
      services: this.serviceFilter, orgs: this.organizationFilter,
      searchVal: this.searchVal, sortField: this.sortFilter,
      joinedDateRange: this.selectedDate, pageNo: this.pageNo
    }

    this.loadingHelpers = true

    setTimeout(() => {
      try {
        this.api.getHelpers(filter).subscribe((response) => {
          this.pageNo++
          this.helpers = response.helpers
          this.totalHelpersCount = response.totalHelperCount
          this.filteredHelpersCount = response.filteredHelpersCount
          this.filteredHelpers = [...this.filteredHelpers, ...this.helpers]
          this.selectedHelper = this.filteredHelpers?.[0]
        })
      } catch (error) {
        console.log(error);
      }
      this.loadingHelpers = false
    }, 500);
  }

  sortHelpersBy(key: 'name' | 'employeeID') {
    console.log(key);
    this.sortFilter = key;
    this.filteredHelpers = this.filteredHelpers.sort((a, b) => {
      if (key === 'name') {
        const valA = a.name?.toString().toLowerCase() || '';
        const valB = b.name?.toString().toLowerCase() || '';
        return valA.localeCompare(valB);
      }
      const valA = a.employeeID ?? 0;
      const valB = b.employeeID ?? 0;
      return valA - valB;
    })
  }

  /// Delete Helper
  deleteHelper() {
    const dialogRef = this.dialog.open(DeleteHelperDialog, { data: { name: this.selectedHelper.name, service: this.selectedHelper.service } })
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.delete()
        this.helpers = this.helpers.filter((h) => {
          return h._id != this.selectedHelper._id
        })
        this.filteredHelpers = this.filteredHelpers.filter((h) => {
          return h._id != this.selectedHelper._id
        })

        this.openSnackBar(`Deleted ${this.selectedHelper.name}`);
        this.selectedHelper = this.filteredHelpers?.[0]
      }
    })
  }

  delete = async () => {
    try {
      this.api.deleteHelper(this.selectedHelper._id as string).subscribe((response) => { })
    } catch (error) {
      console.log(error);
    }
  }

  /// Snackbars
  openSnackBar(message: string) {
    this._snackBar.openFromComponent(CustomSnackBarComponent,
      { data: message, duration: 3000, verticalPosition: 'bottom', horizontalPosition: 'end', panelClass: ['no-default-style'] });
  }

  /// Dialogs
  openEmployeeIdDialog() {
    const data = this.selectedHelper
    this.dialog.open(EmployeeIdDialogComponent, { data })
  }

  viewDocx(docx: string) {
    let value = null
    if (docx == 'kycDocx') value = this.selectedHelper.kycDocx
    else value = this.selectedHelper.additionalDocx
    const { base64File, mimeType, fileName } = value
    const file = { base64File, mimeType, fileName }
    const blob = this.base64ToBlob(file.base64File, file.mimeType);
    const url = URL.createObjectURL(blob);
    window.open(url);
  }

  base64ToBlob(base64: string, mime: string): Blob {
    const byteCharacters = atob(base64);
    const byteNumbers = Array.from(byteCharacters, c => c.charCodeAt(0));
    const byteArray = new Uint8Array(byteNumbers);
    return new Blob([byteArray], { type: mime });
  }

  saveAsExcel(): void {
    try {
      this.api.downloadHelpers(this.filteredHelpers)
    } catch (error) {
      console.log(error);
    }
  }
}

@Component({
  selector: 'delete-helper-dialog',
  standalone: true,
  imports: [MatIcon],
  templateUrl: './deleteHelperDialog.html',
})

class DeleteHelperDialog {
  constructor(private dialogRef: MatDialogRef<DeleteHelperDialog>) { }
  readonly data = inject<{ name: string, service: string }>(MAT_DIALOG_DATA)

  closeDialog() {
    this.dialogRef.close()
  }

  deleteAndClose() {
    this.dialogRef.close(true);
  }
}


///////  Custom SnakBar

@Component({
  selector: 'app-custom-snack-bar',
  standalone: true,
  imports: [MatIconModule],
  template: `
    <span class="custom-snackbar">
    <span class="message">
      <mat-icon>warning</mat-icon>
      {{ message }}
    </span>
      <mat-icon class="close">close</mat-icon>
      
    </span>
  `,
  styles: [`
    .custom-snackbar {
      background-color: white;
      color: red;
      display: flex;
      align-items: center;
      justify-content:space-between;
      padding: 8px 16px;
      border-radius: 4px;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
    }
    .message{
      display: flex;
      align-items: center;
    }
    .close{
      color:black;
    }
  `],
})
export class CustomSnackBarComponent {
  constructor(@Inject(MAT_SNACK_BAR_DATA) public message: string) { }
}
