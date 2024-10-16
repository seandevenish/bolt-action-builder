import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationModalComponent } from '../components/confirmation-modal/confirmation-modal.component';

@Injectable({
  providedIn: 'root'
})
export class ConfirmationService {

  constructor(private dialog: MatDialog) { }

  confirm(message?: string, actionText?: string, action?: () => void, danger: boolean = false, passPhrase?: string): void {
    const dialogRef = this.dialog.open(ConfirmationModalComponent, {
      width: '50%',
      panelClass: 'app-dialog-container',
      data: {
        text: message ?? 'Are you sure you want to do this action?',
        actionText: actionText,
        passPhrase: passPhrase,
        danger: danger
      }
    });

    dialogRef
      .afterClosed()
      .subscribe((result: any|undefined) => {
        if (!!result && action) action();
      });
  }
}
