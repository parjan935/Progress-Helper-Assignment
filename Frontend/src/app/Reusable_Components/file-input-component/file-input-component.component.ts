import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { FileInputDialogComponent } from '../../file-input-dialog/file-input-dialog.component';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';


@Component({
  selector: 'app-file-input-component',
  standalone: true,
  imports: [NgIf, MatButtonModule, MatIcon, NgFor],
  templateUrl: './file-input-component.component.html',
  styleUrl: './file-input-component.component.scss'
})
export class FileInputComponentComponent {

  constructor(private dialog: MatDialog) { }

  @Input() type: string = ''
  @Input() file!: { base64File: string, mimeType: string, fileName: string };
  @Output() fileSelected = new EventEmitter<any>();
  @Output() removeFile = new EventEmitter<number>();

  DocName = ''

  ngOnInit() {
    this.DocName = this.file?.fileName
  }

  opeDocxInputDialog(): void {
    const dialogRef = this.dialog.open(FileInputDialogComponent, {});
    dialogRef.afterClosed().subscribe(result => {
      if (result !== undefined) {
        this.DocName = result?.file?.name
        const fileData = {
          file: result?.file,
          fileType: result?.fileType
        }
        this.fileSelected.emit(fileData)
      }
    });
  }

  removeKycDocx() {
    this.DocName = ''
    this.removeFile.emit()
  }

  openPdf() {
    const { base64File, mimeType, fileName } = this.file
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
}
