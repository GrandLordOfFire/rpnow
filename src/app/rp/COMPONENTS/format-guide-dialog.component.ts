
import { Component, ChangeDetectionStrategy } from '@angular/core';
import * as marked from 'marked';
import { MatDialogRef } from '@angular/material/dialog';

const template = marked(`
Here's how to do bold, italics, and other things.

*   Use \`_underscores_\` or \`/slashes/\` to *italicize text.*
*   Use \`__two underscores__\` to **bold text.**
*   Use \`___three underscores___\` to ***do both.***
*   Use \`~~two tildes~~\` to <del>strike out text</del>.
*   \`*Asterisks*\` denote an action done by a character.
*   Pressing \`Enter\` will send your message. To disable this, uncheck the "Press enter to send" option in the menu.
    *   \`Shift + Enter\` will always start a new paragraph, regardless of this setting.
    *   On the other hand, \`Ctrl +  Enter\` will always send the message.

#### Shortcuts

Use these shortcuts to RP faster.

*   Quickly write an OOC message by using one of these methods:
    *   \`(( inside two parentheses ))\`
    *   \`{ inside one or more braces }\`
    *   \`// following two slashes\`

`);

@Component({
  template: `
    <div fxLayout="row" fxLayoutAlign="center center">

      <h3 mat-dialog-title fxFlex>Formatting Guide</h3>

      <button mat-icon-button mat-dialog-title (click)="close()">
        <mat-icon aria-label="Close dialog" matTooltip="Close">close</mat-icon>
      </button>

    </div>

    <mat-dialog-content class="generated-links" [innerHtml]="innerHtml"></mat-dialog-content>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class FormatGuideDialog {

  innerHtml: string = template;

  constructor(
    private dialogRef: MatDialogRef<FormatGuideDialog>
  ) {}

  close() {
    this.dialogRef.close();
  }
}